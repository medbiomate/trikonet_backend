import crypto from 'node:crypto';
const topics=new Set(['Account & sign-in','Jobs & applications','CV & resume tools','Points & rewards','Privacy & account deletion','Something else']);
export function createSupportContact({fetcher=fetch,now=Date.now,env=process.env}={}){
 const attempts=new Map();
 return async(session,body)=>{
  if(!session?.userId)return [401,{error:'Please sign in to contact support.'}];
  const email=String(body.email||'').trim(),message=String(body.message||'').trim(),topic=String(body.topic||'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!topics.has(topic)||message.length<10||message.length>4000)return [400,{error:'Enter a valid email, choose a topic, and write 10–4,000 characters.'}];
  if(!env.RESEND_API_KEY||!env.PASSWORD_RESET_FROM)return [503,{error:'Support delivery is temporarily unavailable. Please try again later.'}];
  for(const [key,value]of attempts)if(value.until<=now())attempts.delete(key);
  const key=String(session.userId),record=attempts.get(key)||{count:0,until:now()+3600000};
  if(record.count>=5)return [429,{error:'You have sent several requests. Please try again in an hour.'}];
  record.count++;attempts.set(key,record);
  const reference='TRI-'+crypto.randomUUID().slice(0,8).toUpperCase();
  try{
   const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.PASSWORD_RESET_FROM,to:['info@trikonet.com'],reply_to:email,subject:`[${reference}] ${topic}`,text:`Trikonet app support\nReference: ${reference}\nReply email: ${email}\nAccount ID: ${session.userId}\nTopic: ${topic}\n\n${message}`}),signal:AbortSignal.timeout(12000)});
   if(!response.ok)return [503,{error:'Your message could not be sent. Please try again.'}];
   return [200,{success:true,reference}];
  }catch{return [503,{error:'Your message could not be sent. Please try again.'}]}
 };
}
