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
  if (collision >= 0 && collision !== index) throw new Error('This URL slug belongs to another job. Choose a different slug.');
  const saved = { ...existing, ...record, id: existing?.id || record.id || createId(), createdAt: existing?.createdAt || record.createdAt || now, updatedAt: now, local: true };
  delete saved.originalSlug;
  delete saved.recoveryDraft;
  delete saved.autosaved;
  if (index >= 0) jobs[index] = saved; else jobs.unshift(saved);
  return saved;
}
