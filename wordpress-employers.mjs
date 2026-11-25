import {randomUUID} from 'node:crypto';
import {readWordPressConfig} from './wordpress-config.mjs';
import {validSignature} from './wordpress-bridge.mjs';
export function createWordPressEmployers({getConfig=readWordPressConfig}={}){return async(req,res,url,ctx)=>{
 if(url.pathname!=='/api/integrations/wordpress/employers')return false;
 const reply=async(status,body)=>{await ctx.sendJson(req,res,status,body);return true;};
 if(req.method!=='POST')return reply(405,{error:'POST required.'});
 let release;
 try{
  const config=await getConfig();let size=0;const parts=[];
  for await(const part of req){size+=part.length;if(size>1200000)return reply(413,{error:'Payload too large.'});parts.push(part);}
  const raw=Buffer.concat(parts);
  if(!validSignature(config,raw,req.headers['x-trikonet-timestamp'],req.headers['x-trikonet-signature']))return reply(401,{error:'Invalid publisher signature.'});
  const body=JSON.parse(raw.toString('utf8')),company=body.employer;
  if(body.siteId!==config.siteId||!Number.isSafeInteger(body.postId)||body.postId<1||!Number.isSafeInteger(body.version)||body.version<1||!['publish','draft','pending','trash','private'].includes(body.status))throw Error('Invalid employer identity.');
  if(!company||typeof company.title!=='string'||!company.title.trim()||company.title.length>300||!/^[a-z0-9][a-z0-9-]{0,250}$/.test(company.slug||''))throw Error('A company name and slug are required.');
  if(company.logo){const logo=new URL(company.logo);if(logo.protocol!=='https:'||![new URL(config.origin).hostname,'api.trikonet.com','media.trikonet.com'].includes(logo.hostname))throw Error('Untrusted company logo.');}
  for(const field of ['locations','categories'])if(!Array.isArray(company[field])||company[field].some(value=>typeof value!=='string'||value.length>300))throw Error('Invalid company terms.');
  release=await ctx.acquireJobSave();const db=await ctx.readLocalDb();await ctx.loadMemoryStore();db.employers||=[];
  let index=db.employers.findIndex(e=>e.wordpressSource?.siteId===body.siteId&&e.wordpressSource?.postId===body.postId);
  if(index<0&&body.recordId)index=db.employers.findIndex(e=>String(e.id)===String(body.recordId));
  const existing=index>=0?db.employers[index]:(ctx.memoryStore.employers||[]).find(e=>body.recordId&&String(e.id)===String(body.recordId));
  if(existing?.wordpressSource?.siteId&&existing.wordpressSource.siteId!==body.siteId)throw Error('Company belongs to another publisher.');
  if(existing?.wordpressSource?.version>=body.version)return reply(200,{ok:true,id:existing.id,slug:existing.slug,duplicate:true});
  const record={...existing,...company,title:company.title.trim(),id:existing?.id||randomUUID(),slug:existing?.slug||company.slug,status:body.status,local:true,updatedAt:new Date().toISOString(),wordpressSource:{siteId:body.siteId,postId:body.postId,version:body.version}};
  if(!existing&&[...db.employers,...(ctx.memoryStore.employers||[])].some(e=>e.slug===record.slug))throw Error('Company slug already exists; map its existing record before importing.');
  if(index>=0)db.employers[index]=record;else db.employers.push(record);
  for(const job of db.jobs||[])if(job.employerSlug===record.slug){job.company=record.title;job.logo=record.logo||'';}
  await ctx.writeLocalDb(db,{skipMedia:true});return reply(200,{ok:true,id:record.id,slug:record.slug,status:record.status});
 }catch(error){return reply(error.code==='ENOENT'?503:400,{error:error.code==='ENOENT'?'Publisher connection is not configured.':error.message});}
 finally{if(release)await release();}
};}
export const handleWordPressEmployers=createWordPressEmployers();
