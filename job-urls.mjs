export function slugPart(value) {
  const text = typeof value === 'object' && value ? value.rendered || value.name || '' : value;
  return String(text || '').replace(/&amp;/g,' and ').replace(/&#\d+;/g,' ').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
export function generatedJobSlug(job, id) {
  if (!/^[1-9]\d*$/.test(String(id))) throw new Error('A permanent numeric job ID is required.');
  const location = Array.isArray(job.locations) ? job.locations[0] : job.location;
  return [slugPart(job.title) || 'job', slugPart(location) || 'uae', slugPart(job.company || job.companyName || job.metas?._job_employer_name) || 'company', String(id)].join('-');
}
export function publicJobPath(job) { return job.publicPath || `/job/${encodeURIComponent(job.slug)}`; }
export function applyJobUrl(job, existing, id, isAdmin) {
  const saved = { ...job, urlJobId: existing?.urlJobId || id };
  const published = existing && !existing.autosaved && ['publish','published','active',''].includes(String(existing.status || '').toLowerCase());
  if (published && !isAdmin && job.slug !== existing.slug) throw new Error('Only administrators can change a published job URL.');
  if (published) {
    saved.publicPath = existing.publicPath || publicJobPath(existing);
    saved.slug = existing.slug;
    if (isAdmin && job.slug !== existing.slug) {
      saved.slug = `${slugPart(job.slug).replace(new RegExp(`-${saved.urlJobId}$`), '') || 'job'}-${saved.urlJobId}`;
      saved.publicPath = `/jobs/${saved.slug}`;
    }
  } else {
    saved.slug = existing?.publicPath && !existing.autosaved ? existing.slug : generatedJobSlug(job, saved.urlJobId);
    saved.publicPath = (!existing?.autosaved && existing?.publicPath) || `/jobs/${saved.slug}`;
  }
  saved.urlAliases = [...new Set([...(existing?.urlAliases || []), ...(existing && existing.slug !== saved.slug ? [publicJobPath(existing)] : [])])];
  return saved;
}
