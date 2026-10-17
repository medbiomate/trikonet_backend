import {publicJobPage} from './public-job-page.mjs';
import {uniqueJobs} from './job-list-identity.mjs';
import {isPublicRecord} from './public-record.mjs';
import {summarizeJob} from './job-summary.mjs';
const plain=value=>String(value?.rendered??value??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').toLowerCase().trim();
export async function publicDirectory(local, params, fetchRemote) {
 const q=plain(params.get('q')),words=q.split(/\s+/).filter(Boolean);
 const category=plain(params.get('category')),location=plain(params.get('location')),type=plain(params.get('job_type'));
 const text=job=>plain([job.title,job.company,job.description,job.content?.rendered,job.excerpt?.rendered||job.excerpt,...(job.categories||[]),...(job.locations||[]),...(job.types||[]),...(job.tags||[]),...(job.skills||[]),...Object.values(job.metas||{}).flatMap(v=>v&&typeof v==='object'?Object.values(v):[v])].filter(Boolean).join(' '));
 const score=job=>{const title=plain(job.title),company=plain(job.company||job.metas?._job_employer_name);return title===q?100:title.startsWith(q)?90:title.includes(q)?80:company===q?75:company.includes(q)?65:text(job).includes(q)?40:20;};
 const time=job=>Date.parse(job.publishedDate||job.postedDate||job.datePosted||job.date||job.createdAt||'')||0;
 const visible=local.filter(isPublicRecord);
 const filtered=uniqueJobs(visible.filter(job=>(!q||words.every(word=>text(job).includes(word)))&&(!location||location==='country or city'||(job.locations||[]).some(v=>plain(v)===location))&&(!category||category==='all categories'||(job.categories||[]).some(v=>plain(v).includes(category)))&&(!type||(job.types||[]).some(v=>plain(v)===type))))
 .sort((a,b)=>score(b)-score(a)||time(b)-time(a)||(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0));
 const page=Math.max(1,Math.floor(Number(params.get('page'))||1));
 const size=Math.min(30,Math.max(1,Math.floor(Number(params.get('per_page'))||10)));
 const jobs=await publicJobPage(filtered,page,size,fetchRemote,visible.map(job=>job.slug));
 return jobs.map(job=>summarizeJob(job));
}
