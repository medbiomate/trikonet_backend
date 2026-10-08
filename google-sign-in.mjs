import {OAuth2Client} from 'google-auth-library';
import crypto from 'node:crypto';
const verifier=new OAuth2Client();
export async function googleIdentity(credential,clientId){
 if(!clientId)throw new Error('Google sign-in is not configured.');
 if(typeof credential!=='string'||credential.length>12000)throw new Error('Invalid Google credential.');
 const ticket=await verifier.verifyIdToken({idToken:credential,audience:clientId});
 const identity=ticket.getPayload();
 if(!identity?.sub||!identity.email||!identity.email_verified)throw new Error('Google email must be verified.');
 return identity;
}
export async function googleAccount(identity,{readLocalDb,writeLocalDb}){
 const db=await readLocalDb();const email=identity.email.toLowerCase();
 let user=db.users.find(item=>item.googleSubject===identity.sub);
 if(!user){
  const existing=db.users.find(item=>String(item.email).toLowerCase()===email);
  // Only Google-managed addresses are safe to link by email alone.
  if(existing&&!(email.endsWith('@gmail.com')||identity.hd))throw new Error('Sign in with your password first to link this Google account.');
  if(existing&&existing.googleSubject&&existing.googleSubject!==identity.sub)throw new Error('Google account does not match.');
  user=existing||{id:crypto.randomUUID(),name:identity.name||email.split('@')[0],email,role:'Candidate',createdAt:new Date().toISOString()};
  user.googleSubject=identity.sub;if(!existing)db.users.push(user);await writeLocalDb(db);
 }
 if(user.role!=='Candidate')throw new Error('Use your existing sign-in method for this account.');
 return user;
}
