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
 for(const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(parseJobJson(match[1]));}catch{}}
 if(records.length!==1)throw Error(records.length?'This page lists multiple jobs. Paste a link to one specific job.':'No structured job details found. This website may require login or block automated access.');
 const p=records[0],address=[p.jobLocation].flat().find(item=>item?.address)?.address||{},salary=p.baseSalary?.value||{},company=p.hiringOrganization||{};
 const description=text(p.description);const country=typeof address.addressCountry==='object'?address.addressCountry.name:address.addressCountry;
 const job={...extractJobRequirements(p.description,p.educationRequirements,p.experienceRequirements),category:text(p.occupationalCategory),title:text(p.title),company:text(company.name),description:description?formatImportedDescription(p.description):'',employmentType:[p.employmentType].flat().find(Boolean)||'',streetAddress:text(address.streetAddress),addressLocality:text(address.addressLocality),addressRegion:text(address.addressRegion),postalCode:text(address.postalCode),addressCountry:text(country),address:[address.streetAddress,address.addressLocality,address.addressRegion,country].filter(Boolean).map(text).join(', '),datePosted:String(p.datePosted||'').slice(0,10),deadline:String(p.validThrough||'').slice(0,10),minSalary:String(salary.minValue??salary.value??''),maxSalary:String(salary.maxValue??''),salaryCurrency:text(p.baseSalary?.currency),salaryType:({MONTH:'Monthly',YEAR:'Yearly',HOUR:'Hourly',WEEK:'Weekly'})[salary.unitText]||'Not specified',applyType:'External URL',applyUrl:url};
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
 const description=[p.ExternalDescriptionStr,p.ExternalResponsibilitiesStr,p.ExternalQualificationsStr].filter(Boolean).map((part,index)=>`<h3>${['Job description','Responsibilities','Qualifications'][index]}</h3>${formatImportedDescription(part)}`).join('');
 const job={salaryType:'Not specified',...extractJobRequirements([p.ExternalDescriptionStr,p.ExternalQualificationsStr].filter(Boolean).join(' ')),category:text(p.Category),title:text(p.Title),company,description,employmentType:/full/i.test(p.JobSchedule)?'FULL_TIME':/part/i.test(p.JobSchedule)?'PART_TIME':'',datePosted:String(p.ExternalPostedStartDate||'').slice(0,10),deadline:String(p.ExternalPostedEndDate||'').slice(0,10),addressLocality:text(workplace.TownOrCity||String(p.PrimaryLocation||'').split(',')[0]),addressRegion:text(workplace.Region1||String(p.PrimaryLocation||'').split(',')[0]),addressCountry:text(p.PrimaryLocationCountry),streetAddress:text(workplace.AddressLine1),postalCode:text(workplace.PostalCode),address:[workplace.AddressLine1,p.PrimaryLocation].filter(Boolean).map(text).join(', '),applyType:'External URL',applyUrl:url};
 return {job:Object.fromEntries(Object.entries(job).filter(([,value])=>value)),sourceUrl:url,warnings:['Review the imported details before publishing.']};
}
export async function importJobLink(url){
 const page=await fetchJobPage(url),endpoint=oracleJobRequest(page.url);
 if(endpoint){const response=await fetchJobPage(endpoint,0,true);return extractOracleJob(JSON.parse(response.html),page.html,page.url);}
 if(isLinkedInPost(page.url))return extractLinkedInPost(page.html,page.url);
 if(isLinkedInJob(page.url))return extractLinkedInJob(page.html,page.url);
 try{return extractJobPage(page.html,page.url);}catch(error){if(/itemtype\s*=\s*["']https?:\/\/schema.org\/JobPosting["']/i.test(page.html))return extractMicrodataJob(page.html,page.url);throw error;}
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

export function isLinkedInJob(input){try{const url=new URL(input);return (url.hostname==='linkedin.com'||url.hostname.endsWith('.linkedin.com'))&&/\/jobs\/view\/(?:[^/]*-)?\d+/.test(url.pathname);}catch{return false;}}
export function extractLinkedInJob(html,url){
 try{return extractJobPage(html,url);}catch{}
 const field=(tag,className)=>{const expression=new RegExp(`<${tag}\\b[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/${tag}>`,'i');return text(html.match(expression)?.[1]||'');};
 const title=field('h1','top-card-layout__title'),company=field('a','topcard__org-name-link'),location=field('span','topcard__flavor--bullet');
 const match=html.match(/<div\b[^>]*class=["'][^"']*show-more-less-html__markup[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
 const description=text(match?.[1]);
 const formattedDescription=formatImportedDescription(match?.[1]);
 if(!title||!description)throw Error('LinkedIn did not provide public job details. Open the listing and use Paste job text instead.');
 const job={title,company,description:formattedDescription,...extractJobRequirements(description),applyType:'External URL',applyUrl:url,salaryType:'Not specified'};
 if(location){job.addressLocality=location.split(',')[0].trim();job.address=location;}
 const schedule=html.match(/Employment type[\s\S]{0,500}?<span[^>]*>([^<]+)<\/span>/i)?.[1]||'';
 if(/full.?time/i.test(schedule))job.employmentType='FULL_TIME';else if(/part.?time/i.test(schedule))job.employmentType='PART_TIME';
 return {job,sourceUrl:url,warnings:['Review the imported LinkedIn listing before publishing.']};
}
export function importPastedJob(content,url=''){
 if(/\b(?:we are hiring|hiring|looking for)\b/i.test(String(content)))return extractHiringPost(content,url);
 const lines=String(content||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);if(lines.length<2)throw Error('Paste the job title and full description.');
 const job={title:lines[0],description:`<p>${escape(lines.slice(1).join('\n'))}</p>`,...extractJobRequirements(content),salaryType:'Not specified'};
 if(url){const link=new URL(url);if(link.protocol!=='https:')throw Error('Use an HTTPS job link.');job.applyType='External URL';job.applyUrl=link.href;}
 return {job,warnings:['Select the existing employer and review all details.']};
}

export function formatImportedDescription(html){
 const source=decodeDescriptionMarkup(html).replace(/<(script|style|iframe|object|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
 const allowed=new Set(['p','br','ul','ol','li','strong','b','em','i','h2','h3','h4']);
 const safe=source.split(/(<[^>]+>)/g).map(part=>{
  if(!part.startsWith('<'))return ( /^\s/.test(part)?' ':'' )+escape(text(part))+( /\s$/.test(part)?' ':'' );
  const match=part.match(/^<(\/?)\s*([a-z0-9]+)/i);if(!match)return '';
  const tag=match[2].toLowerCase();return allowed.has(tag)?`<${match[1]}${tag}>`:'';
 }).join('');
 return safe.trim();
}

export function isLinkedInPost(input){try{const u=new URL(input);return (u.hostname==='linkedin.com'||u.hostname.endsWith('.linkedin.com'))&&/^\/(?:posts\/|feed\/update\/urn:li:activity:)/.test(u.pathname);}catch{return false;}}
function decodePostText(value){return String(value||'').replace(/\\r\\n|\\n|\\r/g,'\n').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,code)=>{const n=code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):Number(code);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}).replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');}
export function extractHiringPost(content,url=''){
 const raw=decodePostText(content).replace(/\r/g,'').trim();
 const lines=raw.split('\n').map(line=>line.trim()).filter(Boolean);
 const titleLine=lines.find(line=>/\b(?:we are hiring|hiring|job title|position|vacancy)\b/i.test(line))||lines[0]||'';
 let title=titleLine.replace(/^[^\p{L}\p{N}]+/u,'').replace(/^(?:we\s+are\s+)?hiring\s*[:|!–—-]*\s*/i,'').replace(/^(?:job title|position|vacancy)\s*[:|–—-]\s*/i,'').trim();
 if(!title||/^(?:we are hiring|hiring)$/i.test(title))title=lines[lines.indexOf(titleLine)+1]||'';
 if(!title||lines.length<2||title.length>150)throw Error('Paste a single job announcement with its role title and description.');
 const description=lines.map(line=>`<p>${escape(line)}</p>`).join('');
 const job={title,description,salaryType:'Not specified',...extractJobRequirements(raw)};
 const company=lines.filter(line=>!/^\W*we\s+are\s+hiring/i.test(line)).join('\n').match(/(?:^|\n)\s*([^\n]{2,180}?)\s+(?:is|are)\s+(?:looking for|hiring|seeking|recruiting)\b/i)?.[1]||raw.match(/(?:^|\n)\s*(?:company|employer)\s*:\s*([^\n]+)/i)?.[1];
 if(company)job.company=company.replace(/\s+/g,' ').trim();
 const location=raw.match(/(?:^|\n)[^\p{L}\p{N}\n]*Location\s*:\s*([^\n]+)/iu)?.[1];
 if(location){job.address=location.trim();const city=['Abu Dhabi','Dubai','Sharjah','Ajman','Al Ain','Ras Al Khaimah','Umm Al Quwain','Fujairah'].find(city=>location.toLowerCase().includes(city.toLowerCase()));if(city){job.addressLocality=city;job.addressRegion=city;job.locations=[city];}if(/\bUAE\b|United Arab Emirates/i.test(raw)){job.addressCountry='AE';}}
 const years=raw.match(/(?:minimum(?:\s+of)?|at least)\s+\d+(?:\s*[-–]\s*\d+)?\+?\s+years?[^.\n]*/i)?.[0];if(years)job.experience=years.trim();
 const schedule=raw.match(/\b(full[ -]time|part[ -]time|internship|temporary|contract)\b/i)?.[0].toLowerCase();
 if(schedule){job.employmentType=/full/.test(schedule)?'FULL_TIME':/part/.test(schedule)?'PART_TIME':schedule==='internship'?'INTERN':schedule==='temporary'?'TEMPORARY':'CONTRACTOR';job.types=[({'FULL_TIME':'Full Time','PART_TIME':'Part Time','INTERN':'Internship','TEMPORARY':'Temporary','CONTRACTOR':'Contract'})[job.employmentType]];}
 const email=raw.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0];
 if(email){job.applyType='By Email';job.applyEmail=email;}
 else if(url){job.applyType='External URL';job.applyUrl=url;}
 return {job,sourceUrl:url,warnings:['Extracted from a hiring announcement. Review the employer, role and application details before publishing.']};
}
export function extractLinkedInPost(html,url){
 let body='';
 for(const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{const parsed=JSON.parse(match[1]);const items=Array.isArray(parsed)?parsed:parsed['@graph']||[parsed];const post=items.find(item=>['SocialMediaPosting','DiscussionForumPosting','Article'].includes(item['@type'])&&typeof item.articleBody==='string');if(post){body=post.articleBody;break;}}catch{}
 }
 if(!body){for(const tag of html.matchAll(/<meta\b[^>]*>/gi)){const attributes={};for(const a of tag[0].matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g))attributes[a[1].toLowerCase()]=a[3];if(attributes.property==='og:description'){body=attributes.content||'';break;}}}
 if(!/\b(?:hiring|looking for|vacancy|job title|position)\b/i.test(body)||body.length<80)throw Error('LinkedIn did not expose the full hiring post. Open Paste job text and paste the announcement.');
 if(/(?:…|\.\.\.)\s*$/.test(body))throw Error('LinkedIn returned a shortened preview. Paste the full job text to avoid importing incomplete details.');
 return extractHiringPost(body,url);
}

// Some ATS templates put literal newlines and JavaScript apostrophe escapes in
// JSON strings. Repair only these syntax defects; never execute source scripts.
export function parseJobJson(source){
 try{return JSON.parse(source);}catch{}
 let output='',quoted=false;
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(quoted&&ch==='\\'){
   const next=source[++i];if(next==="'"){output+="'";continue;}
   output+='\\'+(next??'');continue;
  }
  if(ch==='"')quoted=!quoted;
  output+=quoted&&ch==='\n'?'\\n':quoted&&ch==='\r'?'\\r':quoted&&ch==='\t'?'\\t':ch;
 }
 return JSON.parse(output);
}
function markupElement(html,property){
 const opening=new RegExp(`<([a-z][\\w:-]*)\\b[^>]*\\bitemprop\\s*=\\s*["']${property}["'][^>]*>`,'i').exec(html);
 if(!opening)return null;
 const tag=opening[1].toLowerCase(),attrs=opening[0];
 if(tag==='meta')return {content:attrs.match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i)?.[2]||''};
 const rest=html.slice(opening.index+attrs.length),tokens=new RegExp(`<\\/?${tag}\\b[^>]*>`,'gi');let depth=1;
 for(const match of rest.matchAll(tokens)){depth+=/^<\//.test(match[0])?-1:1;if(depth===0)return {content:rest.slice(0,match.index)};}
 return null;
}
export function extractMicrodataJob(html,url){
 if(!/itemtype\s*=\s*["']https?:\/\/schema.org\/JobPosting["']/i.test(html))throw Error('No structured job details found. Paste the full job text instead.');
 const title=text(markupElement(html,'title')?.content),description=markupElement(html,'description')?.content;
 if(!title||!description||text(description).length<40)throw Error('This job page did not expose enough details. Paste the full job text instead.');
 const p={'@type':'JobPosting',title,description,hiringOrganization:{name:text(markupElement(html,'hiringOrganization')?.content)}};
 for(const key of ['datePosted','validThrough']){const value=markupElement(html,key)?.content;const date=new Date(value||'');if(value&&Number.isFinite(date.getTime()))p[key]=date.toISOString();}
 const city=['Abu Dhabi','Dubai','Sharjah','Ajman','Al Ain','Ras Al Khaimah','Fujairah'].find(city=>new RegExp(`\\b${city}\\b`,'i').test(title));
 if(city)p.jobLocation={address:{addressLocality:city,addressRegion:city}};
 return extractJobPage(`<script type="application/ld+json">${JSON.stringify(p).replace(/</g,'\\u003c')}</script>`,url);
}

function decodeDescriptionMarkup(value){
 let output=String(value||'');
 for(let pass=0;pass<2;pass++){
  if(!/&(?:amp;)?lt;\/?(?:p|strong|ul|ol|li|br|div|span|h[1-6])\b/i.test(output))break;
  output=output.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
 }
 return output.replace(/&(?:nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo);/g,e=>({'&nbsp;':' ','&ndash;':'–','&mdash;':'—','&rsquo;':"'",'&lsquo;':"'",'&rdquo;':'"','&ldquo;':'"'}[e]));
}
