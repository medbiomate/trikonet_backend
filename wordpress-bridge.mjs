import {readWordPressConfig} from './wordpress-config.mjs';
import {createHmac,timingSafeEqual,randomUUID,createPublicKey,verify} from 'node:crypto';
export function validSignature(key,raw,timestamp,signature,now=Date.now()){
 if(!/^\d{13}$/.test(String(timestamp))||Math.abs(now-Number(timestamp))>300000)return false;
 const config=typeof key==='string'?{secret:key}:key;
 if(config?.publicKey){
  if(!/^ed25519=[a-f0-9]{128}$/.test(String(signature)))return false;
  try{const publicKey=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(config.publicKey,'hex')]),format:'der',type:'spki'});return verify(null,Buffer.concat([Buffer.from(timestamp+'.'),Buffer.from(raw)]),publicKey,Buffer.from(signature.slice(8),'hex'));}catch{return false;}
 }
 if(!config?.secret||!/^sha256=[a-f0-9]{64}$/.test(String(signature)))return false;
 const expected=createHmac('sha256',config.secret).update(`${timestamp}.`).update(raw).digest('hex');
 return timingSafeEqual(Buffer.from(expected),Buffer.from(signature.slice(7)));
}
export function validatePayload(body,config){
 if(!body||body.siteId!==config.siteId||!Number.isSafeInteger(body.postId)||body.postId<1||!Number.isSafeInteger(body.version)||body.version<1)throw Error('Invalid source identity.');
 if(!['publish','draft','pending','trash','expired'].includes(body.status))throw Error('Invalid publication status.');
 if(!body.job||typeof body.job.title!=='string'||!body.job.title.trim()||body.job.title.length>300||!/^[a-z0-9][a-z0-9-]{0,250}$/.test(body.job.slug||''))throw Error('A title and valid slug are required.');
 if(body.status==='publish'&&(!Array.isArray(body.job.categories)||!body.job.categories.length))throw Error('Published jobs require a category.');
 for(const field of ['categories','locations','types','tags'])if(body.job[field]!==undefined&&(!Array.isArray(body.job[field])||body.job[field].length>100||body.job[field].some(value=>typeof value!=='string'||value.length>300)))throw Error('Invalid job terms.');
 if(String(body.job.description||'').length>1000000)throw Error('Description is too large.');
 const logo=body.job.logo;
 if(logo){const u=new URL(logo);if(u.protocol!=='https:'||![new URL(config.origin).hostname,'www.trikonet.com','trikonet.com','api.trikonet.com','media.trikonet.com'].includes(u.hostname))throw Error('Logo must use a trusted host.');}
 return body;
}
export function createWordPressBridge({getConfig=()=>readWordPressConfig()}={}){
 return async function(req,res,url,ctx){
  if(url.pathname!=='/api/integrations/wordpress/jobs')return false;
  const reply=async(status,data)=>{await ctx.sendJson(req,res,status,data);return true;};
  if(req.method!=='POST')return reply(405,{error:'POST required.'});
  let release;
  try{
   const config=await getConfig();
   let chunks=[],size=0;for await(const part of req){size+=part.length;if(size>1200000)return reply(413,{error:'Payload too large.'});chunks.push(part);}const raw=Buffer.concat(chunks);
   if(!validSignature(config,raw,req.headers['x-trikonet-timestamp'],req.headers['x-trikonet-signature']))return reply(401,{error:'Invalid publisher signature.'});
   const body=validatePayload(JSON.parse(raw.toString('utf8')),config);
   release=await ctx.acquireJobSave();
   const db=await ctx.readLocalDb();db.jobs||=[];
   let index=db.jobs.findIndex(j=>j.wordpressSource?.siteId===body.siteId&&Number(j.wordpressSource.postId)===body.postId);
   if(index<0&&body.recordId)index=db.jobs.findIndex(j=>String(j.id)===String(body.recordId));
   if(index>=0&&db.jobs[index].wordpressSource&&db.jobs[index].wordpressSource.siteId!==body.siteId)throw Error('Job belongs to another publisher.');
   let existing=index>=0?db.jobs[index]:null;
   await ctx.loadMemoryStore();
   if(!existing&&body.recordId)existing=(ctx.memoryStore.jobs||[]).find(j=>String(j.id)===String(body.recordId))||null;
   if(existing?.wordpressSource?.siteId&&existing.wordpressSource.siteId!==body.siteId)throw Error('Job belongs to another publisher.');
   if(existing?.wordpressSource?.version>=body.version)return reply(200,{ok:true,id:existing.id,slug:existing.slug,duplicate:true});
   const incoming=body.job;
   let job={...(existing||{}),title:incoming.title.trim(),slug:existing?.slug||incoming.slug,description:String(incoming.description||''),company:String(incoming.company||''),logo:incoming.logo||'',employerSlug:incoming.employerSlug||'',employerUrl:incoming.employerSlug?`/employer/${incoming.employerSlug}`:'',categories:incoming.categories||[],locations:incoming.locations||[],types:incoming.types||[],tags:incoming.tags||[],address:incoming.address||'',experience:incoming.experience||'',qualification:incoming.qualification||'',minSalary:incoming.minSalary||'',maxSalary:incoming.maxSalary||'',salaryType:incoming.salaryType||'',applyType:incoming.applyType||'By Email',applyWhatsApp:incoming.applyWhatsApp||'',applyEmail:incoming.applyEmail||'',applyUrl:incoming.applyUrl||'',deadline:incoming.deadline||'',expiryDate:incoming.expiryDate||'',status:body.status,id:existing?.id||randomUUID(),createdAt:existing?.createdAt||incoming.createdAt||new Date().toISOString(),datePosted:incoming.datePosted||'',publishedDate:existing?.publishedDate||incoming.datePosted||new Date().toISOString().slice(0,10),date:incoming.datePosted||new Date().toISOString().slice(0,10),updatedAt:new Date().toISOString(),local:true,wordpressSource:{siteId:body.siteId,postId:body.postId,version:body.version,url:`${config.origin}/job/${incoming.slug}/`}};
   db.employers||=[];
   if(incoming.employerSlug&&incoming.company){
    const known=[...db.employers,...(ctx.memoryStore.employers||[])].find(e=>e.slug===incoming.employerSlug);
    if(!known)db.employers.push({id:randomUUID(),slug:incoming.employerSlug,title:String(incoming.company),logo:incoming.logo||'',description:String(incoming.employerDescription||''),locations:incoming.locations||[],categories:[],status:'publish',local:true,createdAt:new Date().toISOString(),wordpressSource:{siteId:body.siteId,employerSlug:incoming.employerSlug}});
   }
   job=ctx.bindJobEmployer(job,[...(db.employers||[]),...(ctx.memoryStore.employers||[])]);
   if(!existing){job=ctx.applyJobUrl(job,null,await ctx.numericJobId(job,[...db.jobs,...(ctx.memoryStore.jobs||[])]),true);job.slug=ctx.uniqueJobSlug(job.slug,[...db.jobs,...(ctx.memoryStore.jobs||[])],job.id);job.publicPath=`/jobs/${job.slug}`;}
   if(!existing?.createdBy&&body.creator&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.creator.email||'')))job.createdBy={id:`wordpress:${body.siteId}:${String(body.creator.id).slice(0,100)}`,name:String(body.creator.name||'WordPress staff').slice(0,200),email:String(body.creator.email).slice(0,254)};
   if(index>=0)db.jobs[index]=job;else db.jobs.push(job);
   await ctx.writeLocalDb(db,{skipMedia:true});
   if(ctx.afterSave)await ctx.afterSave(existing,job);
   return reply(200,{ok:true,id:job.id,slug:job.slug,publicPath:job.publicPath,status:job.status});
  }catch(error){return reply(error.code==='ENOENT'?503:400,{error:error.code==='ENOENT'?'Publisher connection is not configured.':error.message||'Unable to sync job.'});}
  finally{if(release)await release();}
 };
}
export const handleWordPressBridge=createWordPressBridge();
