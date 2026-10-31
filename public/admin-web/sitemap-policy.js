import { isPublishedRecord } from './indexing-policy.js';
const origin = 'https://www.trikonet.com';
const escapeXml = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Saved records override imported entries, including withdrawals and URL changes.
export function reconcileJobSitemap(xml, jobs) {
  const entries = new Map();
  for (const entry of xml.match(/<url>[\s\S]*?<\/url>/g) || []) {
    const loc = entry.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (loc) entries.set(loc, entry);
  }
  for (const job of jobs) {
    if (!job.slug) continue;
    const paths = [`/job/${job.slug}`, `/jobs/${job.slug}`, ...(job.urlAliases || []), ...(job.originalSlug ? [`/job/${job.originalSlug}`, `/jobs/${job.originalSlug}`] : [])];
    const canonical = new URL(job.publicPath || `/job/${job.slug}`, origin);
    if (canonical.origin !== origin) continue;
    for (const path of [...paths, canonical.pathname]) entries.delete(escapeXml(new URL(path,origin).href));
    if (isPublishedRecord(job)) {
      const loc = escapeXml(canonical.href);
      entries.set(loc, `<url><loc>${loc}</loc></url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...entries.values()].join('')}</urlset>`;
}
export function cleanSitemapIndex(xml) {
  return xml.replace(/<sitemap>[\s\S]*?<\/sitemap>/g, entry => /sitemap-employer-(?:categories|locations)\.xml/.test(entry) ? '' : entry);
}
