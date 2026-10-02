export function slugPart(value) {
  const text = typeof value === 'object' && value ? value.rendered || value.name || '' : value;
  return String(text || '').replace(/&amp;/g,' and ').replace(/&#\d+;/g,' ').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
export function generatedJobSlug(job, id) {
  if (!/^[1-9]\d*$/.test(String(id))) throw new Error('A permanent numeric job ID is required.');
  const location = Array.isArray(job.locations) ? job.locations[0] : job.location;
  return [slugPart(job.title) || 'job', slugPart(location) || 'uae', slugPart(job.company || job.companyName || job.metas?._job_employer_name) || 'company'].join('-');
}
export function publicJobPath(job) { return job.publicPath || `/job/${encodeURIComponent(job.slug)}`; }
export function applyJobUrl(job, existing, id, isAdmin) {
  const saved = { ...job, urlJobId: existing?.urlJobId || id };
  const published = existing && !existing.autosaved && ['publish','published','active',''].includes(String(existing.status || '').toLowerCase());
  if (published) {
    saved.publicPath = existing.publicPath || publicJobPath(existing);
    saved.slug = existing.slug;
    if (isAdmin && job.slug !== existing.slug) {
      saved.slug = slugPart(job.slug) || 'job';
      saved.publicPath = `/jobs/${saved.slug}`;
    }
  } else {
    saved.slug = existing?.publicPath && !existing.autosaved ? existing.slug : generatedJobSlug(job, saved.urlJobId);
    saved.publicPath = (!existing?.autosaved && existing?.publicPath) || `/jobs/${saved.slug}`;
  }
  saved.urlAliases = [...new Set([...(existing?.urlAliases || []), ...(existing && existing.slug !== saved.slug ? [publicJobPath(existing)] : [])])];
  return saved;
}

export function uniqueJobSlug(base, records, currentId) {
  const reserved = new Set(records.filter(job => String(job.id) !== String(currentId)).flatMap(job => [job.slug, ...(job.urlAliases || []).map(path => path.split('/').pop())]));
  let candidate = base, suffix = 0;
  while (reserved.has(candidate)) candidate = `${base}-${++suffix}`;
  return candidate;
}
export function shortenGeneratedJobUrls(records, imported = []) {
  let changed = 0;
  for (const job of records) {
    if (!job.publicPath?.startsWith('/jobs/') || !/^1\d{9,}$/.test(String(job.urlJobId || '')) || !job.slug.endsWith(`-${job.urlJobId}`)) continue;
    const previous = job.publicPath;
    job.slug = uniqueJobSlug(job.slug.slice(0,-String(job.urlJobId).length-1),[...records,...imported],job.id);
    job.publicPath = `/jobs/${job.slug}`;
    job.urlAliases = [...new Set([...(job.urlAliases || []),previous])];
    changed++;
  }
  return changed;
}
