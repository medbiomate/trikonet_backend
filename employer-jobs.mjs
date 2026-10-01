import { isPublicRecord } from './public-record.mjs';
export function employerJobPage(imported, local, employer, requestedPage = 1) {
  const merged = new Map(imported.map(job => [job.slug, job]));
  local.forEach(job => merged.set(job.slug, job));
  const name = String(employer.title?.rendered || employer.title || '').trim().toLowerCase();
  const jobs = [...merged.values()].filter(job => {
    if (!isPublicRecord(job)) return false;
    const m = job.metas || {};
    const company = String(job.company || m._job_employer_name || '').trim().toLowerCase();
    return (employer.id && String(m._job_employer_posted_by) === String(employer.id)) ||
      (employer.slug && (job.employerSlug === employer.slug || String(job.employerUrl || m._job_employer_url || '').replace(/\/$/, '').endsWith(`/employer/${employer.slug}`))) ||
      (name && company === name);
  });
  const time = job => {
    for (const value of [job.datePosted, job.postedDate, job.publishedDate, job.date, job.createdAt]) {
      const timestamp = Date.parse(value);
      if (Number.isFinite(timestamp)) return timestamp;
    }
    return 0;
  };
  jobs.sort((a,b) => time(b)-time(a) || Date.parse(b.createdAt || 0)-Date.parse(a.createdAt || 0) || Number(b.id || 0)-Number(a.id || 0));
  const total = jobs.length, perPage = 10;
  const page = Math.min(Math.max(1, Math.ceil(total/perPage)), Math.max(1, Math.floor(Number(requestedPage) || 1)));
  return {jobs:jobs.slice((page-1)*perPage,page*perPage), total, page, perPage};
}
