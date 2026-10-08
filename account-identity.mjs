import crypto from 'node:crypto';
export const accountView=user=>({id:user.id,userId:user.id,name:user.name||user.profile?.name||'User',email:user.email});
export function applyAccountProfile(user,body,update){
 const {id,userId,email,...fields}=body;
 user.profile={...update(user.profile||{},fields),email:user.email};
 if(Object.hasOwn(fields,'name')&&user.profile.name?.trim())user.name=user.profile.name.trim();
 return user.profile;
}
export function createEmailChange({readLocalDb,writeLocalDb,sendEmail,now=Date.now}){
 const challenges=new Map(),limits=new Map();const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
 return async(action,session,body)=>{
  if(!session)return[401,{error:'Sign in to change your email.'}];
  const db=await readLocalDb(),user=db.users.find(item=>String(item.id)===String(session.userId));if(!user)return[401,{error:'Account not found.'}];
  if(action==='request'){
   const email=String(body.email||'').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)||email===user.email)return[400,{error:'Enter a different valid email address.'}];
   if(db.users.some(item=>String(item.email).toLowerCase()===email))return[409,{error:'That email already belongs to an account.'}];
   const limit=limits.get(user.id);if(limit&&limit.expires>now()&&limit.count>=5)return[429,{error:'Too many requests. Try again later.'}];limits.set(user.id,{expires:limit?.expires>now()?limit.expires:now()+3600000,count:limit?.expires>now()?limit.count+1:1});
   const challenge=crypto.randomBytes(32).toString('hex'),code=String(crypto.randomInt(100000,1000000));await sendEmail(email,code);
   challenges.set(challenge,{userId:user.id,oldEmail:user.email,email,hash:hash(challenge+code),expires:now()+600000,attempts:0});return[200,{challenge,message:'Enter the code sent to your new email.'}];
  }
  const challenge=String(body.challenge||''),item=challenges.get(challenge);
  if(!item||item.userId!==user.id||item.oldEmail!==user.email||item.expires<=now()||item.attempts>=5)return[400,{error:'Code expired. Request a new code.'}];item.attempts++;
  if(!crypto.timingSafeEqual(Buffer.from(item.hash),Buffer.from(hash(challenge+String(body.code||'')))))return[400,{error:'Incorrect verification code.'}];
  challenges.delete(challenge);
  if(db.users.some(other=>other.id!==user.id&&String(other.email).toLowerCase()===item.email))return[409,{error:'That email already belongs to an account.'}];
  user.email=item.email;user.profile={...user.profile,email:item.email,profileUpdatedAt:now(),updatedAt:new Date(now()).toISOString()};await writeLocalDb(db);return[200,{user:accountView(user),profile:user.profile,message:'Email updated.'}];
 }
}
