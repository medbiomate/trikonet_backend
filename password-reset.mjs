import crypto from 'node:crypto';
export function createPasswordReset({readLocalDb,writeLocalDb,passwordHash,sessions,sendEmail,now=Date.now}){
 const challenges=new Map();const limits=new Map();
 const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
 return async function(path,body,ip){
  const email=String(body.email||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email))return [400,{error:'Enter a valid email address.'}];
  if(path==='/api/auth/forgot-password'){
   const time=now();for(const [key,item] of challenges)if(item.expires<=time)challenges.delete(key);for(const [key,item] of limits)if(item.expires<=time)limits.delete(key);
   for(const key of [`email:${email}`,`ip:${ip}`]){const limit=limits.get(key)||{count:0,expires:time+3600000};if(limit.count>=5)return [429,{error:'Too many reset requests. Please try again later.'}];limit.count++;limits.set(key,limit)}
   const challenge=crypto.randomBytes(32).toString('hex');const otp=String(crypto.randomInt(100000,1000000));const db=await readLocalDb();const user=db.users.find(user=>String(user.email).toLowerCase()===email);
   if(user)await sendEmail(email,otp);
   challenges.set(challenge,{email,userId:user?.id,hash:digest(challenge+otp),expires:time+600000,attempts:0});
   return [200,{success:true,challenge,message:'If this email has an account, a reset code has been sent. The code expires in 10 minutes.'}];
  }
  const challenge=String(body.challenge||'');const item=challenges.get(challenge);
  if(!item||item.expires<=now()||item.email!==email||item.attempts>=5)return [400,{error:'This reset code has expired. Request a new code.'}];
  item.attempts++;
  const hash=digest(challenge+String(body.otp||''));
  if(!crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(item.hash))||!item.userId)return [400,{error:'Invalid reset code. Check the code and try again.'}];
  const password=String(body.new_password||'');if(password.length<8||password.length>256)return [400,{error:'Use a password between 8 and 256 characters.'}];
  // Consume before awaiting storage to prevent concurrent replay.
  challenges.delete(challenge);const db=await readLocalDb();const user=db.users.find(user=>user.id===item.userId);if(!user)return [400,{error:'Unable to reset this account.'}];
  const credentials=passwordHash(password);user.passwordSalt=credentials.salt;user.passwordHash=credentials.hash;await writeLocalDb(db);
  for(const [token,session] of sessions)if(session.userId===user.id)sessions.delete(token);
  for(const [key,value] of challenges)if(value.userId===user.id)challenges.delete(key);
  return [200,{success:true,message:'Your password has been updated. Sign in with your new password.'}];
 }
}
export async function sendPasswordResetEmail(email,otp){
 if(!process.env.RESEND_API_KEY||!process.env.PASSWORD_RESET_FROM)throw new Error('Password reset email delivery is not configured.');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.PASSWORD_RESET_FROM,to:[email],subject:'Your Trikonet password reset code',text:`Your Trikonet password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email. Never share this code.`}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Unable to send the reset email. Please try again later.');
}
