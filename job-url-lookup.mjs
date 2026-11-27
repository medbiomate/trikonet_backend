// Prefer a current canonical identity over historical aliases. Both historical
// /job and /jobs links may have been shared for the same record.
const clean = path => String(path || '').replace(/\/$/, '');
const pathSlug = path => clean(path).match(/^\/(?:job|jobs)\/([^/]+)$/)?.[1];
export function findJobByPath(jobs, requested) {
  const path = clean(requested), slug = pathSlug(path);
  if (!slug) return null;
  const canonical = jobs.find(job => clean(job.publicPath || `/job/${encodeURIComponent(job.slug)}`) === path);
  if (canonical) return canonical;
  const exact = jobs.filter(job => job.slug === slug);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;
  const aliases = jobs.filter(job => (job.urlAliases || []).some(alias => clean(alias) === path || pathSlug(alias) === slug));
  if (aliases.length) return aliases.length === 1 ? aliases[0] : null;
  // A job published from WordPress keeps its WordPress address (/job/<post slug>) after the app gives it
  // a /jobs/ address. The stored source URL may name an older WordPress host, so only its path is compared.
  if (!path.startsWith('/job/')) return null;
  const sourced = jobs.filter(job => sourcePath(job.wordpressSource?.url) === path);
  return sourced.length === 1 ? sourced[0] : null;
}
function sourcePath(url) {
  try { return clean(decodeURIComponent(new URL(String(url || '')).pathname)); } catch { return ''; }
}
