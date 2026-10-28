import {isEmployerSnapshot} from './employer-repair.mjs';
const slugify=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
export function employerIdentity(record, local, imported=[]) {
 const original=String(record.originalSlug||'');
 const index=original?local.findIndex(item=>item.slug===original):-1;
 const existing=index>=0?local[index]:null;
 const requested=String(record.slug||'').trim();
 const slug=slugify(!requested||requested.startsWith('autosave-')?record.requestedSlug||existing?.requestedSlug||record.title:requested);
 if(!slug||slug.startsWith('autosave-'))throw new Error('Enter a company URL without the reserved autosave prefix.');
 const collision=[...local,...imported].find(item=>item.slug===slug&&item!==existing&&!(original&&item.slug===original));
 if(collision){const error=new Error('This company URL is already in use. Edit the existing company or choose another URL.');error.status=409;throw error;}
 return {index,existing,slug,snapshot:!!existing&&isEmployerSnapshot(existing)};
}
