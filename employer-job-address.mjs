export const employerAddressFields=['streetAddress','addressLocality','addressRegion','addressCountry','postalCode','address'];
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function employerAddressKey(record){return record.employerSlug?`slug:${record.employerSlug}`:record.company?`name:${normalize(record.company)}`:'';}
export function rememberEmployerAddress(db,job){
 const key=employerAddressKey(job);if(!key||!job.streetAddress||!job.addressLocality)return;
 db.employerJobAddresses ||= {};
 db.employerJobAddresses[key]={...Object.fromEntries(employerAddressFields.map(field=>[field,String(job[field]||'')])),updatedAt:new Date().toISOString()};
}
export function findEmployerAddress(db,company,slug){
 const key=employerAddressKey({company,employerSlug:slug});const saved=db.employerJobAddresses?.[key];if(saved)return{address:saved,source:'saved company address'};
 const jobs=(db.jobs||[]).filter(job=>slug&&job.employerSlug===slug||company&&normalize(job.company)===normalize(company)).filter(job=>job.streetAddress&&job.addressLocality).sort((a,b)=>Date.parse(b.updatedAt||b.createdAt||0)-Date.parse(a.updatedAt||a.createdAt||0));
 const latest=jobs[0];return latest?{address:Object.fromEntries(employerAddressFields.map(field=>[field,String(latest[field]||'')])),source:'previous company job'}:{address:null};
}
