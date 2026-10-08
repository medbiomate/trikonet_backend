import crypto from 'node:crypto';
import {readFile} from 'node:fs/promises';
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
  if(item.verified&&path==='/api/auth/verify-reset-code')return [400,{error:'Request a new code.'}];
  item.attempts++;
  const hash=digest(challenge+String(body.otp||''));
  if((!item.verified&&!crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(item.hash)))||!item.userId)return [400,{error:'Invalid reset code. Check the code and try again.'}];
  if(path==='/api/auth/verify-reset-code'){
   challenges.delete(challenge);const verifiedChallenge=crypto.randomBytes(32).toString('hex');
   challenges.set(verifiedChallenge,{...item,verified:true,attempts:0});
   return [200,{success:true,challenge:verifiedChallenge,message:'Code verified. Choose your new password.'}];
  }
  const password=String(body.new_password||'');if(password.length<8||password.length>256)return [400,{error:'Use a password between 8 and 256 characters.'}];
  // Consume before awaiting storage to prevent concurrent replay.
  challenges.delete(challenge);const db=await readLocalDb();const user=db.users.find(user=>user.id===item.userId);if(!user)return [400,{error:'Unable to reset this account.'}];
  const credentials=passwordHash(password);user.passwordSalt=credentials.salt;user.passwordHash=credentials.hash;await writeLocalDb(db);
  for(const [token,session] of sessions)if(session.userId===user.id)sessions.delete(token);
  for(const [key,value] of challenges)if(value.userId===user.id)challenges.delete(key);
  return [200,{success:true,message:'Your password has been updated. Sign in with your new password.'}];
 }
}
export function passwordResetEmailHtml(otp){
 if(!/^[0-9]{6}$/.test(String(otp)))throw new Error('Invalid reset code format.');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your Trikonet password</title></head><body style="margin:0;padding:0;background:#f7f4f2;font-family:Arial,Helvetica,sans-serif;color:#292525;">
 <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your verification code expires in 10 minutes.</div>
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4f2;"><tr><td align="center" style="padding:32px 16px;">
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #eadfda;border-radius:20px;overflow:hidden;">
 <tr><td align="center" style="padding:32px 24px 24px;border-top:4px solid #bd1708;"><a href="https://www.trikonet.com/" style="text-decoration:none;"><img src="cid:trikonet-logo" width="170" alt="Trikonet" style="display:block;width:170px;max-width:100%;height:auto;border:0;"></a></td></tr>
 <tr><td style="padding:0 28px 28px;">
 <p style="margin:0 0 12px;color:#bd1708;font-size:12px;font-weight:bold;letter-spacing:1px;text-align:center;">ACCOUNT SECURITY</p>
 <h1 style="margin:0 0 16px;font-size:26px;line-height:1.3;text-align:center;color:#292525;">Reset your password</h1>
 <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#655650;text-align:center;">Enter this verification code in Trikonet to continue resetting your password.</p>
 <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:22px 8px;background:#fff2ee;border:1px solid #f0d9d2;border-radius:12px;">
 <span style="font-family:Arial,Helvetica,sans-serif;font-size:32px;line-height:1.4;font-weight:bold;letter-spacing:6px;color:#bd1708;">${otp}</span></td></tr></table>
 <p style="margin:14px 0 24px;font-size:13px;line-height:1.6;text-align:center;color:#73645e;">This code expires in <strong>10 minutes</strong>.</p>
 <p style="margin:0;padding-top:22px;border-top:1px solid #eee5e0;font-size:13px;line-height:1.7;color:#73645e;">If you didn’t request a password reset, you can ignore this email. Your password will remain unchanged. Never share this code with anyone.</p>
 </td></tr></table>
 <p style="margin:20px 0 0;font-size:12px;line-height:1.7;color:#85756e;text-align:center;">Trikonet · Your career, all in one place.<br><a href="https://www.trikonet.com/" style="color:#bd1708;text-decoration:underline;">Visit Trikonet</a></p>
 </td></tr></table></body></html>`;
}
export async function sendPasswordResetEmail(email,otp){
 if(!process.env.RESEND_API_KEY||!process.env.PASSWORD_RESET_FROM)throw new Error('Password reset email delivery is not configured.');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.PASSWORD_RESET_FROM,to:[email],subject:'Your Trikonet password reset code',html:passwordResetEmailHtml(otp),attachments:[{filename:'trikonet-logo.png',content:(await readFile(new URL('./public/assets/logo-black.png',import.meta.url))).toString('base64'),content_id:'trikonet-logo',content_type:'image/png'}],text:`Your Trikonet password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email. Never share this code.`}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Unable to send the reset email. Please try again later.');
}

export async function sendEmailChangeCode(email,code){
 if(!process.env.RESEND_API_KEY||!process.env.PASSWORD_RESET_FROM)throw new Error('Email delivery is not configured.');
 const html=passwordResetEmailHtml(code).replaceAll('Reset your Trikonet password','Verify your Trikonet email').replaceAll('Reset your password','Verify your new email').replaceAll('continue resetting your password','confirm your new email address').replaceAll('password reset','email change').replaceAll('Your password will remain unchanged.','Your account email stays unchanged until you verify.');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.PASSWORD_RESET_FROM,to:[email],subject:'Verify your new Trikonet email',html,attachments:[{filename:'trikonet-logo.png',content:(await readFile(new URL('./public/assets/logo-black.png',import.meta.url))).toString('base64'),content_id:'trikonet-logo',content_type:'image/png'}],text:`Your Trikonet email verification code is ${code}. It expires in 10 minutes.`}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('Unable to send the verification email.');
}
