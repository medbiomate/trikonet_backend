import crypto from 'node:crypto';
export function createRegistrationVerification({sendEmail,now=Date.now}){
 const challenges=new Map(),tokens=new Map(),limits=new Map();
 const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
 return {
 async handle(action,body,ip){
  const email=String(body.email||'').trim().toLowerCase(),time=now();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return [400,{error:'Enter a valid email.'}];
  for(const map of [challenges,tokens,limits])for(const [key,item] of map)if(item.expires<=time)map.delete(key);
  if(action==='request'){
   for(const key of [email,`ip:${ip}`]){const item=limits.get(key)||{count:0,expires:time+3600000};if(item.count>=5)return [429,{error:'Too many requests. Try again later.'}];item.count++;limits.set(key,item)}
   const challenge=crypto.randomBytes(32).toString('hex'),otp=String(crypto.randomInt(100000,1000000));
   await sendEmail(email,otp);challenges.set(challenge,{email,hash:hash(challenge+otp),attempts:0,expires:time+600000});
   return [200,{success:true,challenge,message:'Verification code sent. It expires in 10 minutes.'}];
  }
  const key=String(body.challenge||''),item=challenges.get(key);
  if(!item||item.email!==email||item.attempts++>=5||!crypto.timingSafeEqual(Buffer.from(item.hash),Buffer.from(hash(key+String(body.otp||'')))))return [400,{error:'Invalid or expired code. Request a new code.'}];
  challenges.delete(key);const verificationToken=crypto.randomBytes(32).toString('hex');tokens.set(verificationToken,{email,expires:time+600000});
  return [200,{success:true,verificationToken}];
 },
 consume(email,token){const item=tokens.get(token);if(!item||item.expires<=now()||item.email!==email)return false;tokens.delete(token);return true}
 };
}
