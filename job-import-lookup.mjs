// UUIDs identify local jobs and must never be looked up as WordPress post IDs.
export function jobImportLookup(job) {
  if (job.originalSlug) return new URLSearchParams({slug:job.originalSlug,per_page:'1'});
  const id = String(job.id || '');
  return /^[1-9]\d*$/.test(id) ? new URLSearchParams({id,per_page:'1'}) : null;
}
