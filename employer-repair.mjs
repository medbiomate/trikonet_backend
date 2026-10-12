export const employerNameKey = value => String(value || '').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
export const isEmployerSnapshot = e => Boolean(e.autosaved || String(e.slug || '').startsWith('autosave-'));
// Repair only exact-name recovery copies. Preserve originals for recovery;
// independently saved companies are never merged solely because names match.
export function repairEmployerSnapshots(db) {
  const companies=(db.employers || []).filter(e=>!isEmployerSnapshot(e));
  const removed=new Set();
  let changed=false;
  for(const draft of db.employers || []) {
    if(!isEmployerSnapshot(draft))continue;
    const matches=companies.filter(e=>employerNameKey(e.title)===employerNameKey(draft.title));
    const target=matches.find(e=>e.slug===draft.sourceSlug) || (matches.length===1?matches[0]:null);
    if(!target)continue;
    db.employerMergeArchive ||= [];
    db.employerMergeArchive.push({mergedAt:new Date().toISOString(),targetSlug:target.slug,original:structuredClone(draft),targetBefore:structuredClone(target)});
    for(const key of ['description','logo','coverPhoto','email','phone','website','address','foundedDate','companySize','socials']) {
      if(!target[key] && draft[key])target[key]=structuredClone(draft[key]);
    }
    for(const key of ['categories','locations','profilePhotos'])target[key]=[...new Set([...(target[key] || []),...(draft[key] || [])])];
    target.urlAliases=[...new Set([...(target.urlAliases || []),`/employer/${draft.slug}`])];
    for(const job of db.jobs || []) {
      if(job.employerSlug===draft.slug)job.employerSlug=target.slug;
      for(const key of ['employerUrl','companyUrl'])if(String(job[key] || '').endsWith(`/employer/${draft.slug}`))job[key]=String(job[key]).replace(`/employer/${draft.slug}`,`/employer/${target.slug}`);
      const m=job.metas;
      if(m && String(m._job_employer_url || '').endsWith(`/employer/${draft.slug}`))m._job_employer_url=String(m._job_employer_url).replace(`/employer/${draft.slug}`,`/employer/${target.slug}`);
    }
    removed.add(draft.slug);changed=true;
  }
  if(changed)db.employers=db.employers.filter(e=>!removed.has(e.slug));
  return changed;
}
