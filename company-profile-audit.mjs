import {isPublicRecord} from './public-record.mjs';
import {isEmployerSnapshot,employerNameKey} from './employer-repair.mjs';
import {slugPart} from './job-urls.mjs';
const title=e=>String(e?.title?.rendered??e?.title??'');
const terms=value=>Array.isArray(value)?value.filter(Boolean):typeof value==='string'?value.split(',').map(s=>s.trim()).filter(Boolean):value&&typeof value==='object'?Object.values(value).filter(Boolean):[];
export function normalizedCompanyDraft(record){
 return {...record,categories:terms(record.categories).length?terms(record.categories):terms(record.employer_categories),locations:terms(record.locations).length?terms(record.locations):terms(record.employer_locations)};
}
export function auditCompanyProfiles(db,imported=[]){
 const locals=db.employers||[];
 const effective=new Map(imported.map(e=>[e.slug,e]));for(const e of locals)effective.set(e.slug,e);
 const companies=[...effective.values()];
 const groups=new Map();
 for(const job of (db.jobs||[]).filter(isPublicRecord)){
  const name=String(job.company||job.metas?._job_employer_name||'').trim();
  if(!name)continue;
  const key=employerNameKey(name);
  const raw=job.employerSlug||String(job.employerUrl||job.metas?._job_employer_url||'').split(/[?#]/)[0].replace(/\/$/,'').split('/').pop();
  const slug=raw&&!raw.startsWith('autosave-')?raw:slugPart(name);
  if(companies.some(e=>isPublicRecord(e)&&(e.slug===slug||(e.urlAliases||[]).includes(`/employer/${slug}`))))continue;
  if(!groups.has(key))groups.set(key,{key,name,slug,jobs:[]});groups.get(key).jobs.push(job);
 }
 return [...groups.values()].map(group=>{
  const matches=companies.filter(e=>isPublicRecord(e)&&employerNameKey(title(e))===group.key);
  if(matches.length===1)return {...group,action:'relink',target:matches[0],reason:''};
  if(matches.length>1)return {...group,action:'review',reason:'Multiple saved companies share this name.'};
  const drafts=locals.filter(e=>isEmployerSnapshot(e)&&employerNameKey(title(e))===group.key).sort((a,b)=>(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0));
  if(!drafts.length)return {...group,action:'review',reason:'No saved company or recovery profile found.'};
  const draft=normalizedCompanyDraft(drafts[0]);
  if(!String(draft.description||'').replace(/<[^>]*>/g,'').trim()) {
    const older=drafts.find(e=>String(e.autosaveOwner||'')===String(draft.autosaveOwner||'')&&String(e.description||'').replace(/<[^>]*>/g,'').trim());
    if(older)draft.description=older.description;
  }
  const missing=[];
  if(!String(draft.description||'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim())missing.push('description');
  if(!draft.logo)missing.push('logo');if(!draft.categories.length)missing.push('company category');if(!draft.locations.length)missing.push('company location');
  if(missing.length===1&&missing[0]==='description') {
    const safeName=title(draft).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    draft.description=`<p>Browse job opportunities at ${safeName} on Trikonet. View current vacancies and application details below.</p>`;
    draft.descriptionSource='recovery-listing-introduction';
    missing.length=0;
  }
  if(missing.length)return {...group,action:'review',draft,reason:`Recovery profile needs ${missing.join(', ')}.`};
  if(companies.some(e=>e.slug===group.slug&&e.slug!==draft.slug))return {...group,action:'review',draft,reason:'Requested URL is reserved by another saved company.'};
  return {...group,action:'recover',draft,reason:draft.descriptionSource==='recovery-listing-introduction'?'Saved description is empty; restore with a neutral vacancy-listing introduction.':''};
 });
}
export function repairCompanyProfiles(db,imported,admin,now,createId){
 const plan=auditCompanyProfiles(db,imported);let recovered=0,relinked=0;
 for(const issue of plan){
  if(issue.action==='review')continue;
  let company=issue.target;
  if(issue.action==='recover'){
   const index=db.employers.findIndex(e=>e.slug===issue.draft.slug);
   if(index<0)continue;
   const original=db.employers[index];
   db.employerRepairArchive ||= {};
   db.employerRepairArchive[original.slug] ||= {at:now,original:structuredClone(original),repairedBy:String(admin.userId)};
   company={...issue.draft,id:original.id||createId(),slug:issue.slug,status:'publish',local:true,updatedAt:now,createdAt:original.createdAt||now,updatedBy:{id:String(admin.userId),name:admin.name||'Administrator',at:now},urlAliases:[...new Set([...(original.urlAliases||[]),`/employer/${original.slug}`])]};
   for(const key of ['autosaved','autosaveOwner','sourceSlug','originalSlug','requestedSlug'])delete company[key];
   db.employers[index]=company;recovered++;
  }
  for(const job of issue.jobs){
   if(job.employerSlug!==company.slug||job.employerUrl!==`/employer/${company.slug}`){job.employerSlug=company.slug;job.employerUrl=`/employer/${company.slug}`;if(job.metas){job.metas._job_employer_url=`https://www.trikonet.com/employer/${company.slug}`;delete job.metas._job_employer_posted_by;}relinked++;}
  }
 }
 return {recovered,relinked,remaining:auditCompanyProfiles(db,imported).map(({name,slug,reason})=>({name,slug,reason}))};
}
export function resolvePublishedCompany(job,local,imported=[]){
 const effective=new Map(imported.map(e=>[e.slug,e]));for(const e of local)effective.set(e.slug,e);
 const companies=[...effective.values()].filter(isPublicRecord);
 const exact=companies.find(e=>e.slug===job.employerSlug||(e.urlAliases||[]).includes(`/employer/${job.employerSlug}`));
 if(exact)return exact;
 const matches=companies.filter(e=>employerNameKey(title(e))===employerNameKey(job.company));
 return matches.length===1?matches[0]:null;
}
