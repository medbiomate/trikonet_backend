// A job URL identifies one listing. Prefer the most recently saved copy.
export function uniqueJobs(records) {
  const bySlug = new Map();
  const time = job => Date.parse(job.updatedAt || job.modified || job.createdAt || '') || 0;
  for (const job of records) {
    const key = job.slug || (job.id ? `id:${job.id}` : job);
    const previous = bySlug.get(key);
    if (!previous || time(job) >= time(previous)) bySlug.set(key, job);
  }
  return [...bySlug.values()];
}
