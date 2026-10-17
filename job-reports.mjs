import {randomUUID} from 'node:crypto';
export const reportReasons=['expired','broken-link','misleading','scam','fees','duplicate','inappropriate','other'];
export function createJobReports({readLocalDb,writeLocalDb}){
 let writes=Promise.resolve();
 return async(method,session,body={})=>{
  if(!session)return[401,{error:'Sign in to report a job.'}];
  const task=writes.then(async()=>{
   const db=await readLocalDb();const user=(db.users||[]).find(user=>String(user.id)===String(session.userId));
   if(!user||user.accountDeletionPending)return[403,{error:'An active account is required.'}];
   if(method==='GET')return String(user.role||'').toLowerCase()==='administrator'?[200,{reports:(db.jobReports||[]).slice().reverse().slice(0,500)}]:[403,{error:'Administrator access required.'}];
   if(method!=='POST')return[405,{error:'Method not allowed.'}];
   const jobId=Number(body.jobId),reason=String(body.reason||''),details=String(body.details||'').trim();
   let link;try{link=new URL(body.link);if(!['https:','http:'].includes(link.protocol))throw Error();}catch{return[400,{error:'A valid job link is required.'}];}
   if(!Number.isSafeInteger(jobId)||jobId<=0||!reportReasons.includes(reason)||details.length>1000||(reason==='other'&&details.length<5))return[400,{error:'Choose a reason and describe the issue if selecting Other.'}];
   db.jobReports||=[];
   const previous=db.jobReports.find(report=>String(report.userId)===String(user.id)&&report.jobId===jobId&&report.reason===reason&&Date.now()-report.createdAt<86400000);
   if(previous)return[200,{success:true,id:previous.id}];
   if(db.jobReports.filter(report=>String(report.userId)===String(user.id)&&Date.now()-report.createdAt<3600000).length>=10)return[429,{error:'Too many reports. Please try again later.'}];
   const report={id:randomUUID(),userId:user.id,jobId,reason,details,link:link.href.slice(0,2000),title:String(body.title||'').slice(0,200),company:String(body.company||'').slice(0,200),createdAt:Date.now(),status:'pending'};
   db.jobReports.push(report);await writeLocalDb(db,{skipMedia:true});return[201,{success:true,id:report.id}];
  });writes=task.catch(()=>{});return task;
 };
}
