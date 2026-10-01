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
