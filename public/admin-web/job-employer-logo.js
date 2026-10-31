const text = value => String(value?.rendered ?? value ?? '').trim();
const key = value => text(value).toLowerCase().replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const logoOf = employer => employer?.logo || employer?.metas?._employer_logo || employer?.metas?._employer_featured_image_img || '';

// Reuse company lookups across cards and requests without caching failures forever.
export function createJobLogoResolver(fetcher, base = '') {
  const cache = new Map();
  async function read(path) {
    const response = await fetcher(`${base}${path}`, {signal: AbortSignal.timeout(2500)});
    if (response.status === 404) return null;
    if (!response.ok) throw Error('Employer unavailable');
    return response.json();
  }
  async function lookup(job) {
    const meta = job.metas || {};
    const company = text(job.company || meta._job_employer_name);
    let slug = job.employerSlug || '';
    try { if (job.employerUrl || meta._job_employer_url) slug ||= new URL(job.employerUrl || meta._job_employer_url, 'https://www.trikonet.com').pathname.split('/').filter(Boolean).pop() || ''; } catch {}
    const id = meta._job_employer_posted_by;
    const cacheKey = JSON.stringify([slug, id || '', key(company)]);
    const cached = cache.get(cacheKey);
    if (cached && cached.until > Date.now()) return cached.promise;
    const promise = (async () => {
      if (slug || id) {
        const params = new URLSearchParams(slug ? {slug} : {id});
        const [saved, imported] = await Promise.all([
          slug ? read(`/api/local/employers/${encodeURIComponent(slug)}`).catch(() => null) : null,
          read(`/api/wp/employer?${params}`).catch(() => null)
        ]);
        const selected = saved || imported?.[0];
        if (selected && (!company || key(selected.title) === key(company)) && logoOf(selected)) return selected;
      }
      if (!company) return null;
      // A display name is not necessarily the employer's stored slug.
      const guessed = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const [saved, imported] = await Promise.all([
        read(`/api/local/employers/${encodeURIComponent(guessed)}`).catch(() => null),
        read(`/api/wp/employer?${new URLSearchParams({q: company, per_page: '100'})}`)
      ]);
      if (saved && key(saved.title) === key(company) && logoOf(saved)) return saved;
      const matches = (imported || []).filter(employer => key(employer.title) === key(company));
      return matches.length === 1 ? matches[0] : null;
    })();
    if (cache.size >= 500) cache.delete(cache.keys().next().value);
    cache.set(cacheKey, {promise, until: Date.now() + 300000});
    promise.then(result => { if (!result) cache.delete(cacheKey); }, () => cache.delete(cacheKey));
    return promise;
  }
  return async jobs => Promise.all(jobs.map(async job => {
    if (job.logo || (job.metas?._job_logo && !job.local)) return job;
    try {
      const employer = await lookup(job);
      const logo = logoOf(employer);
      if (!logo) return job;
      const employerUrl = employer.slug ? `/employer/${employer.slug}` : job.employerUrl;
      return {...job, logo, employerSlug: employer.slug || job.employerSlug, employerUrl,
        metas: {...job.metas, _job_logo: logo, _job_employer_url: employerUrl}};
    } catch { return job; } // Optional branding must never hide a job.
  }));
}
