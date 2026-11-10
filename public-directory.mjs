import {publicJobPage} from './public-job-page.mjs';
import {uniqueJobs} from './job-list-identity.mjs';
import {isPublicRecord} from './public-record.mjs';
import {summarizeJob} from './job-summary.mjs';
const plain=value=>String(value?.rendered??value??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').toLowerCase().trim();
export async function publicDirectory(local, params, fetchRemote) {
 const q=plain(params.get('q')),words=q.split(/\s+/).filter(Boolean);
 const category=plain(params.get('category')),location=plain(params.get('location')),type=plain(params.get('job_type'));
 // Per-request caches are discarded after this page; edited records never go stale.
 const scoreCache=new Map(),timeCache=new Map();
 const text=job=>plain([job.title,job.company,job.description,job.content?.rendered,job.excerpt?.rendered||job.excerpt,...(job.categories||[]),...(job.locations||[]),...(job.types||[]),...(job.tags||[]),...(job.skills||[]),...Object.values(job.metas||{}).flatMap(v=>v&&typeof v==='object'?Object.values(v):[v])].filter(Boolean).join(' '));
 const score=(job,searchText)=>{if(scoreCache.has(job))return scoreCache.get(job);const title=plain(job.title),company=plain(job.company||job.metas?._job_employer_name);const value=title===q?100:title.startsWith(q)?90:title.includes(q)?80:company===q?75:company.includes(q)?65:(searchText??text(job)).includes(q)?40:20;scoreCache.set(job,value);return value;};
 const time=job=>{if(timeCache.has(job))return timeCache.get(job);const value=Date.parse(job.publishedDate||job.postedDate||job.datePosted||job.date||job.createdAt||'')||0;timeCache.set(job,value);return value;};
 const visible=local.filter(isPublicRecord);
 const filtered=uniqueJobs(visible.filter(job=>{
   // Check structured fields before normalizing the full job description.
   if (location && location !== 'country or city' && !(job.locations || []).some(value => plain(value) === location)) return false;
   if (category && category !== 'all categories' && !(job.categories || []).some(value => plain(value).includes(category))) return false;
   if (type && !(job.types || []).some(value => plain(value) === type)) return false;
   const searchText = q ? text(job) : '';
   if (q && !words.every(word => searchText.includes(word))) return false;
   score(job,searchText);
   return true;
 }))
 .sort((a,b)=>score(b)-score(a)||time(b)-time(a)||(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0));
 const page=Math.max(1,Math.floor(Number(params.get('page'))||1));
 const size=Math.min(30,Math.max(1,Math.floor(Number(params.get('per_page'))||10)));
 const jobs=await publicJobPage(filtered,page,size,fetchRemote,local.filter(job=>isPublicRecord(job)||['trash','deleted'].includes(job.status)).flatMap(job=>[job.slug,...(job.urlAliases || []).map(path=>path.split('/').pop())]));
 return jobs.map(job=>summarizeJob(job));
}
