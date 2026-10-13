import {values,isActiveJob} from './seo-job-pages.mjs';
import {publicJobPath} from './job-urls.mjs';
const text=v=>String(v?.rendered??v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const esc=v=>text(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>text(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function alertSlot(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
 const slot=({8:'morning',12:'noon',16:'afternoon'})[Number(p.hour)]||null;
 return {day:`${p.year}-${p.month}-${p.day}`,slot};
}
const ignored=new Set(['senior','junior','jobs','job','uae','dubai','the','and','of','in']);
function roleTokens(role){return norm(role).split(' ').filter(t=>t&&!ignored.has(t)).map(t=>t==='nurses'?'nurse':t==='teachers'?'teacher':t==='accountants'?'accountant':t);}
export function matchesRole(job,profile={}){
 const role=profile.role||profile.currentDesignation;
 const tokens=roleTokens(role);
 if(!tokens.length||['professional','other','all'].includes(norm(role)))return false;
 const title=roleTokens(job.title);
 return tokens.every(token=>title.includes(token));
}
export function selectDigestJobs(jobs,profile={},excluded=new Set()){
 return jobs.filter(job=>isActiveJob(job)&&!excluded.has(String(job.id||job.slug))&&matchesRole(job,profile))
 .sort((a,b)=>Date.parse(b.date||b.createdAt||0)-Date.parse(a.date||a.createdAt||0)).slice(0,6);
}
export function selectGeneralJobs(jobs,excluded=new Set()){
 // Rotate a varied selection, without duplicating previous digests.
 const unique=new Map();for(const job of jobs)if(isActiveJob(job)&&!excluded.has(String(job.id||job.slug)))unique.set(String(job.id||job.slug),job);
 const shuffled=[...unique.values()];
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 return shuffled.slice(0,6);
}
const image=value=>{try{const u=new URL(String(value||''),'https://www.trikonet.com');return value&&u.protocol==='https:'?u.href:'';}catch{return '';}};
export function digestEmail(jobs,user,token,slot,origin='https://api.trikonet.com',{general=false}={}){
 const unsub=`${origin}/api/job-alerts/unsubscribe?token=${encodeURIComponent(token)}`;
 const profile='https://www.trikonet.com/profile';
 const url=job=>new URL(publicJobPath(job),'https://www.trikonet.com').href;
 const company=job=>text(job.company||job.companyName||job.metas?._job_employer_name)||'Hiring employer';
 const times={morning:'8:00 AM',noon:'12:00 PM',afternoon:'4:00 PM'};
 const introduction=general?'We did not find new jobs matching your role for this update. Here are general opportunities to explore—they are not exact recommendations. Complete or update your career profile so we can find jobs suited to you.':'Good news! These new opportunities match the job role in your career profile. We’re cheering you on as you take your next step.';
 const cards=jobs.map(job=>{
 const logo=image(job.logo||job.metas?._job_logo||job.employerLogo);
 const location=values(job,'locations','_job_location').join(', ')||text(job.location)||'See job details';
 const type=values(job,'types','_job_type').join(', ')||text(job.type)||'See job details';
 const employer=job.employerSlug||String(job.employerUrl||job.metas?._job_employer_url||'').split('/').filter(Boolean).pop();
 const employerUrl=employer?`https://www.trikonet.com/employer/${encodeURIComponent(employer)}`:'';
 return `<tr><td style="padding:10px 24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:12px"><tr><td style="padding:20px">${logo?`<img src="${esc(logo)}" width="52" height="52" alt="${esc(company(job))}" style="object-fit:contain;float:left;margin-right:14px">`:`<span style="float:left;padding:14px;background:#fff1f2;color:#b00008;margin-right:14px">${esc(company(job).slice(0,1))}</span>`}<h2 style="margin:0 0 8px;font-size:19px;color:#172033">${esc(job.title)}</h2><p style="margin:0;color:#475569">${esc(company(job))}</p><p style="clear:both;padding-top:12px;color:#64748b;font-size:14px">${esc(location)} · ${esc(type)}</p>${job.companyDetails?`<p style="font-size:14px;color:#64748b">${esc(text(job.companyDetails).slice(0,160))}</p>`:''}${employerUrl?`<p><a style="color:#b00008" href="${esc(employerUrl)}">About the company →</a></p>`:''}<a href="${esc(url(job))}" style="display:inline-block;background:#b00008;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">View job &amp; apply</a></td></tr></table></td></tr>`;
 }).join('');
 return {subject:`${text(user.name).split(' ')[0]||'Hello'}, ${jobs.length} ${general?'general opportunities':'role-matched jobs'} · Trikonet ${slot}`.slice(0,200),
 text:`Hi ${text(user.name)||'there'},\nYour ${slot} update · ${times[slot]} UAE time\n\n${introduction}\n\n${jobs.map(job=>`${text(job.title)}\n${company(job)}\n${values(job,'locations','_job_location').join(', ')||text(job.location)}\n${url(job)}`).join('\n\n')}\n\nComplete your profile: ${profile}\nWishing you a happy and successful job search!\nTeam Trikonet\nAt most 3 digests per day: 8 AM, noon, and 4 PM UAE time.\nUnsubscribe: ${unsub}`,
 html:`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#172033"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 8px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px"><tr><td style="padding:28px 24px"><img src="https://www.trikonet.com/assets/logo-black.png" width="156" alt="Trikonet"><p>Hi ${esc(user.name)||'there'},</p><p style="color:#b00008;font-weight:bold">YOUR ${esc(slot.toUpperCase())} UPDATE · ${times[slot]} UAE</p><h1 style="font-size:26px">${general?'Let’s find your next opportunity.':'Your next career move could be here.'}</h1><p style="color:#64748b;line-height:1.7">${esc(introduction)}</p><a href="${profile}" style="color:#b00008;font-weight:bold">Complete your profile →</a></td></tr>${cards}<tr><td style="padding:28px 24px"><p style="line-height:1.7">Wishing you a happy and successful job search!<br><strong>Team Trikonet</strong></p><p style="font-size:12px;color:#64748b;line-height:1.7">One email groups multiple jobs. At most three digests daily: 8 AM, 12 noon, and 4 PM UAE time. ${general?'These are general suggestions, not role matches.':''}<br><a href="${profile}">Update your profile</a> · <a href="${esc(unsub)}">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`};
}
