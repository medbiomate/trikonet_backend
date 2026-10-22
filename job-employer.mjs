// Editor fields describe the selected employer; imported metadata may still
// describe the employer that owned the original WordPress listing.
export function normalizeJobEmployer(job) {
  if (!job || !String(job.company || '').trim()) return job;
  const metas = { ...job.metas, _job_employer_name: job.company };
  const slug = String(job.employerSlug || '').trim();
  const previousUrl = String(job.metas?._job_employer_url || '');
  if (slug) {
    metas._job_employer_url = `https://www.trikonet.com/employer/${encodeURIComponent(slug)}`;
    // A stale numeric relation must not fetch another company's profile/jobs.
    const previousSlug = previousUrl.split(/[?#]/)[0].replace(/\/$/, '').split('/').pop();
    if (previousSlug !== slug) delete metas._job_employer_posted_by;
  } else if (job.employerUrl) {
    metas._job_employer_url = job.employerUrl;
  }
  if (job.logo) metas._job_logo = job.logo;
  else if (slug && previousUrl && !previousUrl.replace(/\/$/, '').endsWith(`/employer/${slug}`)) delete metas._job_logo;
  return { ...job, metas };
}
