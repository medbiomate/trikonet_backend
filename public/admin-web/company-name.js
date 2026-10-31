const acronyms = new Set(['IT','UAE','LLC','LLP','PLC','PJSC','FZE','FZCO','GEMS','NMC','HSBC','IBM','ABB','ADCB','ADIB','DHL','HP','BP','EY','KPMG','PWC','BMW']);
// Presentation only: never rewrite legal names, slugs or stored user input.
export function formatCompanyName(value) {
  return String(value || '').trim().replace(/\s+/g,' ').replace(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu, word => {
    if(acronyms.has(word.toUpperCase()))return word.toUpperCase();
    return word.charAt(0).toLocaleUpperCase()+word.slice(1).toLocaleLowerCase();
  });
}

const jobAcronyms = new Set(['HR','IT','ICT','CEO','CFO','COO','CTO','UAE','QA','QC','HSE','HVAC','MEP','RCM','ICU','NICU','ENT','CSSD','EMT','GP','RN','LPN','OT','PE','KG','SEO','SEM','UI','UX','VP','B2B','B2C','ERP','SAP','SQL','PHP']);
export function formatJobTitle(value) {
  return String(value || '').trim().replace(/\s+/g,' ').replace(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu, word => {
    if (jobAcronyms.has(word.toUpperCase())) return word.toUpperCase();
    if (/^(?:iOS|DevOps|JavaScript|TypeScript|WordPress|LinkedIn)$/i.test(word)) return {ios:'iOS',devops:'DevOps',javascript:'JavaScript',typescript:'TypeScript',wordpress:'WordPress',linkedin:'LinkedIn'}[word.toLowerCase()];
    return word.charAt(0).toLocaleUpperCase()+word.slice(1).toLocaleLowerCase();
  });
}
