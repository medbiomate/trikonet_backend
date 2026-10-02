export function findJobIndex(jobs, record) {
  if (record.id) {
    const index = jobs.findIndex(job => String(job.id) === String(record.id));
    if (index >= 0) return index;
  }
  const slug = record.originalSlug || record.sourceSlug || record.slug;
  return slug ? jobs.findIndex(job => job.slug === slug) : -1;
}

export function saveJobRecord(jobs, record, createId, now) {
  const index = findJobIndex(jobs, record);
  const existing = index >= 0 ? jobs[index] : null;
  const collision = jobs.findIndex(job => job.slug === record.slug);
  const aliasCollision = jobs.findIndex((job, i) => i !== index && ((job.urlAliases || []).includes(record.publicPath) || (record.urlAliases || []).includes(job.publicPath || `/job/${job.slug}`)));
  if (aliasCollision >= 0) throw new Error('This URL is reserved for another job.');
  if (collision >= 0 && collision !== index) throw new Error('This URL slug belongs to another job. Choose a different slug.');
  const saved = { ...existing, ...record, id: existing?.id || record.id || createId(), createdAt: existing?.createdAt || record.createdAt || now, updatedAt: now, local: true };
  delete saved.originalSlug;
  delete saved.recoveryDraft;
  delete saved.autosaved;
  if (index >= 0) jobs[index] = saved; else jobs.unshift(saved);
  return saved;
}

export function refreshPublicationDate(job, now) {
  if (!['publish','published','active'].includes(String(job.status || '').toLowerCase())) return job;
  const day = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
  return {...job,publishedDate:day,datePosted:day,postedDate:day,date:day,updatedDate:day};
}
