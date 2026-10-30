import crypto from 'node:crypto';
import {isCandidateAccount} from './candidate-account.mjs';
const audience=()=>process.env.APPLE_CLIENT_ID||'com.secondtales.trikonet';
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
let keys,keysUntil=0;
async function appleKeys(){
 if(keys&&Date.now()<keysUntil)return keys;
 const response=await fetch('https://appleid.apple.com/auth/keys',{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Apple verification unavailable');
 keys=(await response.json()).keys;keysUntil=Date.now()+3600000;return keys;
}
export async function verifyAppleToken(token,nonce,{clientId=audience(),getKeys=appleKeys,now=Date.now}={}){
 if(typeof token!=='string'||token.length>16000||typeof nonce!=='string'||nonce.length<32)throw Error('Invalid Apple credential');
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid Apple token');
 const header=JSON.parse(Buffer.from(parts[0],'base64url'));const claims=JSON.parse(Buffer.from(parts[1],'base64url'));
 if(header.alg!=='RS256')throw Error('Invalid Apple algorithm');
 const key=(await getKeys()).find(key=>key.kid===header.kid&&key.kty==='RSA');
 if(!key||!crypto.verify('RSA-SHA256',Buffer.from(parts.slice(0,2).join('.')),crypto.createPublicKey({key,format:'jwk'}),Buffer.from(parts[2],'base64url')))throw Error('Invalid Apple signature');
 const time=now()/1000;
 if(claims.iss!=='https://appleid.apple.com'||claims.aud!==clientId||!Number.isFinite(claims.exp)||claims.exp<=time||!Number.isFinite(claims.iat)||claims.iat>time+60||claims.nonce!==nonce||typeof claims.sub!=='string'||!claims.sub)throw Error('Invalid Apple claims');
 if(!claims.email||![true,'true'].includes(claims.email_verified))throw Error('Apple email is not verified');
 return claims;
}
export function createAppleChallenges({now=Date.now}={}){
 const pending=new Map();
 return {issue(){for(const [key,expiry] of pending)if(expiry<=now())pending.delete(key);if(pending.size>=5000)throw Error('Please try again shortly');const nonce=crypto.randomBytes(32).toString('hex');pending.set(nonce,now()+300000);return nonce},consume(nonce){const expiry=pending.get(nonce);pending.delete(nonce);if(!expiry||expiry<=now())throw Error('Apple sign-in expired. Please try again.')}};
}
// Persist one-use challenges so any hosting worker can finish the exchange.
export function createPersistentAppleChallenges(pool,{now=Date.now}={}){
 let ready;
 const ensure=()=>ready ||=pool.query(`CREATE TABLE IF NOT EXISTS trikonet_apple_challenges (
 nonce_hash CHAR(64) PRIMARY KEY, expires_at BIGINT NOT NULL, INDEX expiry(expires_at)
 ) ENGINE=InnoDB`).catch(error=>{ready=undefined;throw error});
 const hash=nonce=>crypto.createHash('sha256').update(nonce).digest('hex');
 return {
  async issue(){await ensure();await pool.query('DELETE FROM trikonet_apple_challenges WHERE expires_at<=?',[now()]);const [rows]=await pool.query('SELECT COUNT(*) AS count FROM trikonet_apple_challenges');if(Number(rows[0].count)>=5000)throw Error('Please try again shortly');const nonce=crypto.randomBytes(32).toString('hex');await pool.query('INSERT INTO trikonet_apple_challenges (nonce_hash,expires_at) VALUES (?,?)',[hash(nonce),now()+300000]);return nonce},
  async consume(nonce){if(typeof nonce!=='string'||!/^[a-f0-9]{64}$/.test(nonce))throw Error('Invalid Apple challenge');await ensure();const [result]=await pool.query('DELETE FROM trikonet_apple_challenges WHERE nonce_hash=? AND expires_at>?',[hash(nonce),now()]);if(result.affectedRows!==1)throw Error('Apple sign-in expired. Please try again.')}
 };
}
function clientSecret(){
 const {APPLE_TEAM_ID,APPLE_KEY_ID}=process.env;
 const APPLE_PRIVATE_KEY=process.env.APPLE_PRIVATE_KEY||Buffer.from(process.env.APPLE_PRIVATE_KEY_B64||'','base64').toString();
 if(!APPLE_TEAM_ID||!APPLE_KEY_ID||!APPLE_PRIVATE_KEY)throw Error('Apple sign-in server configuration is missing');
 const iat=Math.floor(Date.now()/1000);const message=encode({alg:'ES256',kid:APPLE_KEY_ID})+'.'+encode({iss:APPLE_TEAM_ID,iat,exp:iat+300,aud:'https://appleid.apple.com',sub:audience()});
 return message+'.'+crypto.sign('sha256',Buffer.from(message),{key:APPLE_PRIVATE_KEY.replaceAll('\\n','\n'),dsaEncoding:'ieee-p1363'}).toString('base64url');
}
export const appleConfigured=()=>Boolean(process.env.APPLE_TEAM_ID&&process.env.APPLE_KEY_ID&&(process.env.APPLE_PRIVATE_KEY||process.env.APPLE_PRIVATE_KEY_B64)&&process.env.APPLE_TOKEN_ENCRYPTION_KEY);
function encryptionKey(){const key=Buffer.from(process.env.APPLE_TOKEN_ENCRYPTION_KEY||'','hex');if(key.length!==32)throw Error('Apple token encryption key missing');return key}
export function sealAppleToken(token){const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',encryptionKey(),iv);return [iv,Buffer.concat([cipher.update(token,'utf8'),cipher.final()]),cipher.getAuthTag()].map(value=>value.toString('base64url')).join('.')}
function openAppleToken(value){const [iv,data,tag]=value.split('.').map(value=>Buffer.from(value,'base64url'));const cipher=crypto.createDecipheriv('aes-256-gcm',encryptionKey(),iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(data),cipher.final()]).toString()}
export async function exchangeAppleCode(code){
 if(typeof code!=='string'||!code||code.length>4096)throw Error('Missing Apple authorization code');
 const response=await fetch('https://appleid.apple.com/auth/token',{method:'POST',body:new URLSearchParams({client_id:audience(),client_secret:clientSecret(),code,grant_type:'authorization_code'}),signal:AbortSignal.timeout(15000)});
 const result=await response.json();if(!response.ok||!result.refresh_token||!result.id_token)throw Error('Apple authorization failed');return result;
}
export async function revokeAppleAccount(user){
 if(!user.appleRefreshToken)return;
 const response=await fetch('https://appleid.apple.com/auth/revoke',{method:'POST',body:new URLSearchParams({client_id:audience(),client_secret:clientSecret(),token:openAppleToken(user.appleRefreshToken),token_type_hint:'refresh_token'}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Apple token revocation failed; deletion will retry');
}
export async function appleAccount(identity,{name,refreshToken,readLocalDb,writeLocalDb,onSignIn}){
 const db=await readLocalDb();const email=identity.email.toLowerCase();
 let user=db.users.find(user=>user.appleSubject===identity.sub);
 if(!user){
  if(db.users.some(user=>String(user.email).toLowerCase()===email))throw Error('An account already uses this email. Sign in with your existing method.');
  user={id:crypto.randomUUID(),name:typeof name==='string'&&name.trim()?name.trim().slice(0,120):'Trikonet User',email,role:'Candidate',appleSubject:identity.sub,createdAt:new Date().toISOString()};db.users.push(user);
 }
 if(!isCandidateAccount(user)||user.status==='inactive')throw Error('This account is unavailable.');
 user.appleRefreshToken=sealAppleToken(refreshToken);onSignIn?.(user);await writeLocalDb(db);return user;
}
