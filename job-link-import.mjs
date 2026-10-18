import https from 'node:https';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
export function publicAddress(address){
 if(isIP(address)===4){const [a,b]=address.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19));}
 // Only globally routed IPv6; reject mapped IPv4 and local ranges.
 return isIP(address)===6&&/^[23][0-9a-f]{3}:/i.test(address)&&!address.startsWith('2001:db8:');
}
export async function fetchJobPage(input,redirects=0,json=false){
 const url=new URL(input);if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443')throw Error('Use a public HTTPS job link.');
 const addresses=await lookup(url.hostname,{all:true});if(!addresses.length||addresses.some(item=>!publicAddress(item.address)))throw Error('This link does not point to a public website.');
 const selected=addresses[0];
 return new Promise((resolve,reject)=>{
  const request=https.get(url,{lookup:(_host,options,callback)=>options.all?callback(null,[selected]):callback(null,selected.address,selected.family),headers:{'User-Agent':'Trikonet job importer','Accept':json?'application/json':'text/html'},timeout:12000},response=>{
   if([301,302,303,307,308].includes(response.statusCode)){response.resume();if(redirects>=3)return reject(Error('Too many redirects.'));return fetchJobPage(new URL(response.headers.location,url).href,redirects+1,json).then(resolve,reject);}
   if(response.statusCode!==200){response.resume();return reject(Error('The website blocked this link or the job is unavailable.'));}
   if(!String(response.headers['content-type']).includes(json?'json':'text/html')){response.resume();return reject(Error('This link must open a job webpage.'));}
   let size=0;const chunks=[];response.on('data',chunk=>{size+=chunk.length;if(size>2*1024*1024){response.destroy(Error('Page is too large.'));return;}chunks.push(chunk);});response.on('error',reject);response.on('end',()=>resolve({html:Buffer.concat(chunks).toString('utf8'),url:url.href}));
  });request.on('timeout',()=>request.destroy(Error('Website took too long to respond.')));request.on('error',reject);
 });
}
const text=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function extractJobPage(html,url){
 const records=[];function walk(value){if(Array.isArray(value))return value.forEach(walk);if(!value||typeof value!=='object')return;if([value['@type']].flat().includes('JobPosting'))records.push(value);if(value['@graph'])walk(value['@graph']);}
 for(const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(match[1]));}catch{}}
 if(records.length!==1)throw Error(records.length?'This page lists multiple jobs. Paste a link to one specific job.':'No structured job details found. This website may require login or block automated access.');
 const p=records[0],address=[p.jobLocation].flat().find(item=>item?.address)?.address||{},salary=p.baseSalary?.value||{},company=p.hiringOrganization||{};
 const description=text(p.description);const country=typeof address.addressCountry==='object'?address.addressCountry.name:address.addressCountry;
 const job={...extractJobRequirements(p.description,p.educationRequirements,p.experienceRequirements),category:text(p.occupationalCategory),title:text(p.title),company:text(company.name),description:description?`<p>${escape(description)}</p>`:'',employmentType:[p.employmentType].flat().find(Boolean)||'',streetAddress:text(address.streetAddress),addressLocality:text(address.addressLocality),addressRegion:text(address.addressRegion),postalCode:text(address.postalCode),addressCountry:text(country),address:[address.streetAddress,address.addressLocality,address.addressRegion,country].filter(Boolean).map(text).join(', '),datePosted:String(p.datePosted||'').slice(0,10),deadline:String(p.validThrough||'').slice(0,10),minSalary:String(salary.minValue??salary.value??''),maxSalary:String(salary.maxValue??''),salaryCurrency:text(p.baseSalary?.currency),salaryType:({MONTH:'Monthly',YEAR:'Yearly',HOUR:'Hourly',WEEK:'Weekly'})[salary.unitText]||'Not specified',applyType:'External URL',applyUrl:url};
 return {job:Object.fromEntries(Object.entries(job).filter(([,value])=>value)),sourceUrl:url,warnings:['Review imported details before publishing. Fields absent from the source remain empty.']};
}

export function oracleJobRequest(input){
 const url=new URL(input),match=url.pathname.match(/\/CandidateExperience\/[^/]+\/sites\/([^/]+)\/(?:jobs\/preview|job)\/(\d+)/);
 if(!url.hostname.endsWith('.oraclecloud.com')||!match)return null;
 const endpoint=new URL('/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails',url);
 endpoint.search=new URLSearchParams({onlyData:'true',expand:'all',finder:`ById;Id="${match[2]}",siteNumber=${match[1]}`});return endpoint.href;
}
export function extractOracleJob(payload,html,url){
 const p=payload.items?.[0];if(!p?.Title)throw Error('This Oracle job is no longer available.');
 const workplace=p.workLocation?.[0]||{};
 const meta=html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)/i);
 const company=text(meta?.[1]||workplace.LocationName||'');
 const description=[p.ExternalDescriptionStr,p.ExternalResponsibilitiesStr,p.ExternalQualificationsStr].filter(Boolean).map((part,index)=>`<h3>${['Job description','Responsibilities','Qualifications'][index]}</h3><p>${escape(text(part))}</p>`).join('');
 const job={salaryType:'Not specified',...extractJobRequirements([p.ExternalDescriptionStr,p.ExternalQualificationsStr].filter(Boolean).join(' ')),category:text(p.Category),title:text(p.Title),company,description,employmentType:/full/i.test(p.JobSchedule)?'FULL_TIME':/part/i.test(p.JobSchedule)?'PART_TIME':'',datePosted:String(p.ExternalPostedStartDate||'').slice(0,10),deadline:String(p.ExternalPostedEndDate||'').slice(0,10),addressLocality:text(workplace.TownOrCity||String(p.PrimaryLocation||'').split(',')[0]),addressRegion:text(workplace.Region1||String(p.PrimaryLocation||'').split(',')[0]),addressCountry:text(p.PrimaryLocationCountry),streetAddress:text(workplace.AddressLine1),postalCode:text(workplace.PostalCode),address:[workplace.AddressLine1,p.PrimaryLocation].filter(Boolean).map(text).join(', '),applyType:'External URL',applyUrl:url};
 return {job:Object.fromEntries(Object.entries(job).filter(([,value])=>value)),sourceUrl:url,warnings:['Review the imported details before publishing.']};
}
export async function importJobLink(url){
 const page=await fetchJobPage(url),endpoint=oracleJobRequest(page.url);
 if(endpoint){const response=await fetchJobPage(endpoint,0,true);return extractOracleJob(JSON.parse(response.html),page.html,page.url);}
 return extractJobPage(page.html,page.url);
}

export function extractJobRequirements(description,education,experience){
 const content=text(description);const job={};
 const experienceText=typeof experience==='object'&&experience?.monthsOfExperience?`${Number(experience.monthsOfExperience)/12} years`:text(typeof experience==='string'?experience:'');
 const years=content.match(/(?:minimum(?: of)?|at least|over|more than)?\s*\d+(?:\s*[-–to]+\s*\d+)?\+?\s*(?:years?|months?)(?:\s+(?:of\s+)?(?:relevant\s+|professional\s+|work\s+)?experience|\s+experience)/i);
 if(experienceText||years)job.experience=experienceText||years[0].trim();
 const educationText=text(typeof education==='string'?education:education?.credentialCategory||'');
 const qualifications=content.match(/(?:bachelor[’']?s?(?:\s+degree)?|master[’']?s?(?:\s+degree)?|diploma|MBBS|BSc|MSc|PhD|high school)(?:\s+in\s+[a-z &]+)?/gi);
 if(educationText||qualifications)job.qualification=educationText||[...new Set(qualifications)].join(', ');
 // Currency must be explicitly stated; never infer an AED salary from a bare number.
 const salary=content.match(/AED\s*([\d,]+)(?:\s*[-–]\s*(?:AED\s*)?([\d,]+))?/i);
 if(salary){job.minSalary=salary[1].replace(/,/g,'');if(salary[2])job.maxSalary=salary[2].replace(/,/g,'');job.salaryType=/per year|annual|yearly/i.test(content)?'Yearly':/per hour|hourly/i.test(content)?'Hourly':/per month|monthly/i.test(content)?'Monthly':'Not specified';}
 return job;
}
