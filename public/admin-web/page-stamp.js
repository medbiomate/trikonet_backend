export async function addPageStamp({ record, post, seoPage } = {}) {
  const footer = document.querySelector('.site-footer-standard');
  if (!footer || document.querySelector('.not-found-page, .error-404') || document.title.startsWith('404')) return;
  const path = location.pathname;
  const job = path.startsWith('/job/');
  // These app-owned pages launched on this date; this is not a WP date.
  const mainPages = new Set(['/', '/jobs', '/employers', '/blog', '/blogs', '/about', '/about-us', '/contact', '/contact-us', '/faq', '/privacy-policy', '/terms', '/terms-and-conditions', '/job-categories']);
  let source = record || post || seoPage;
  let cmsPage = false;
  if (!source) {
    try {
      const slug = path === '/' ? 'home' : path.split('/').filter(Boolean).at(-1);
      const response = await fetch(`/api/wp/pages?slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        source = (await response.json())[0];
        cmsPage = Boolean(source);
      }
    } catch { /* Never block page content for metadata. */ }
  }
  const raw = (job ? source?.publishedDate || source?.postedDate || source?.date || source?.createdAt
    : source?.date || source?.createdAt || source?.publishedDate) || (mainPages.has(path) ? '2026-10-01T00:00:00' : '');
  if (!raw) return; // Do not invent dates for pages without a CMS record.
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return;
  const formatted = `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`;
  const excludeAuthor = job || path.startsWith('/employer/') || path.startsWith('/candidate') || Boolean(post) || cmsPage || ['/about', '/about-us', '/contact', '/contact-us', '/faq', '/privacy-policy', '/terms', '/terms-and-conditions'].includes(path);
  const row = document.createElement('div');
  row.className = 'page-update-stamp';
  row.innerHTML = `<div class="wrap">${excludeAuthor ? '' : '<span>Author: Team Trikonet</span>'}<span class="page-update-date">Last updated: ${formatted}</span></div>`;
  footer.before(row);
}
