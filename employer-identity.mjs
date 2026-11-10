import {employerNameKey,isEmployerSnapshot} from './employer-repair.mjs';
const slugify=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
const nameKey = company => employerNameKey(company.title?.rendered ?? company.title);
export const isTrashedCompany = company => ['trash', 'deleted'].includes(company?.status);
export function assertUniqueCompany(company, local, imported, previous) {
 const localSlugs = new Set(local.map(item=>item.slug));
 const effective = [...local, ...imported.filter(item=>!localSlugs.has(item.slug))];
 const duplicate = effective.find(item => !isTrashedCompany(item) && !isEmployerSnapshot(item) &&
   item !== previous && (company.id == null || item.id !== company.id) &&
   (item.slug === company.slug || (nameKey(item) === nameKey(company) && (!previous || nameKey(previous) !== nameKey(company)))));
 if (duplicate) throw Object.assign(new Error('A company with this name or URL already exists. Edit the existing company.'), {status:409, existingSlug:duplicate.slug});
}
export function employerIdentity(record, local, imported=[]) {
 const original=String(record.originalSlug||'');
 const index=local.findIndex(item=>original ? item.slug===original : record.draftId && item.id===record.draftId && isEmployerSnapshot(item));
 const existing=index>=0?local[index]:null;
 const requested=String(record.slug||'').trim();
 const slug=requested===original && requested && !requested.startsWith('autosave-') ? requested : slugify(!requested||requested.startsWith('autosave-')?record.requestedSlug||existing?.requestedSlug||record.title:requested);
 if(!slug||slug.startsWith('autosave-'))throw new Error('Enter a company URL without the reserved autosave prefix.');
 const collision=[...local,...imported].find(item=>item.slug===slug&&item!==existing&&!(original&&item.slug===original));
 if(collision){const error=new Error('This company URL is already in use. Edit the existing company or choose another URL.');error.status=409;error.existingSlug=collision.slug;throw error;}
 return {index,existing,slug,snapshot:!!existing&&isEmployerSnapshot(existing)};
}
