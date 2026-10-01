export function adminJobConditions(where, values, params, excludedSlugs = []) {
  const status = params.get('status') || 'all';
  if (status === 'all') where.push("post_status IN ('publish','draft','pending','expired')");
  else { where.push('post_status = ?'); values.push(status === 'active' ? 'publish' : status); }
  if (excludedSlugs.length) { where.push(`post_name NOT IN (${excludedSlugs.map(() => '?').join(',')})`); values.push(...excludedSlugs); }
}

export function localJobMatches(job, params) {
  const status = params.get('status') || 'all';
  const normalized = job.status === 'active' || !job.status ? 'publish' : job.status;
  if (status !== 'all' && status !== 'mine' && normalized !== status) return false;
  const q = (params.get('q') || '').trim().toLowerCase();
  if (q && !`${job.title || ''} ${job.company || ''} ${(job.categories || []).join(' ')}`.toLowerCase().includes(q)) return false;
  return [['job_type', 'types', 'type'], ['category', 'categories', 'category']].every(([param, list, field]) => {
    const value = (params.get(param) || '').toLowerCase();
    return !value || (job[list] || [job[field] || '']).some(item => String(item).toLowerCase() === value);
  });
}

export function pagePlan(localJobs, remoteTotal, requestedPage, pageSize) {
  const total = localJobs.length + remoteTotal;
  const page = Math.min(Math.max(1, requestedPage), Math.max(1, Math.ceil(total / pageSize)));
  const offset = (page - 1) * pageSize;
  const local = localJobs.slice(offset, offset + pageSize);
  return { total, page, local, remoteOffset: Math.max(0, offset - localJobs.length), remoteLimit: pageSize - local.length };
}

export function importedJobPage(imported, local, params) {
  const records = new Map(imported.map(job => [job.slug, job]));
  for (const job of local) records.set(job.slug, { ...job, local: true });
  const names = value => Array.isArray(value) ? value.map(item => typeof item === 'object' ? item.name : item) : value && typeof value === 'object' ? Object.values(value) : value ? [value] : [];
  const jobs = [...records.values()].filter(job => {
    if (params.get('status') === 'mine' && !job.local) return false;
    const m = job.metas || {};
    return localJobMatches({ ...job, title: job.title?.rendered || job.title || '',
      company: job.company || m._job_employer_name || '',
      categories: names(job.categories || m._job_category), types: names(job.types || m._job_type)
    }, params);
  }).sort(adminJobsFirst);
  const size = Math.min(100, Math.max(1, Math.floor(Number(params.get('per_page')) || 20)));
  const plan = pagePlan(jobs, 0, Math.floor(Number(params.get('page')) || 1), size);
  return { jobs: plan.local, total: jobs.length, page: plan.page, perPage: size };
}

export function adminJobsFirst(a, b) {
  const time = job => {
    const value = job.postedDate || job.datePosted || job.publishedDate || job.date || job.createdAt || '';
    const timestamp = Date.parse(String(value).replace(' ', 'T'));
    return Number.isFinite(timestamp) ? timestamp : 0;
  };
  return Number(b.status === 'draft') - Number(a.status === 'draft') || time(b) - time(a) ||
    (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0) || Number(b.id || 0) - Number(a.id || 0);
}
