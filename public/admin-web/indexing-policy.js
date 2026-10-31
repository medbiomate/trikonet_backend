export function isPrivatePage(path, params = new URLSearchParams()) {
  return /^\/(?:admin[^/]*|trikonet-admin-access|login|signin|sign-in|sign-up|login-register|register|signup|logout|profile|dashboard|account|saved-jobs|applied-jobs|followed-companies|email-campaigns|submit-job|candidate|wp-admin|candidate-alerts|shortlist-candidates|meetings-employer)(?:\/|$)/i.test(path)
    || params.has('preview') || params.has('draft');
}
export function isPublishedRecord(record) {
  return !!record && !record.autosaved && !String(record.slug || '').startsWith('autosave-') && ['publish','published','active',''].includes(String(record.status || '').toLowerCase());
}

// Only routes implemented by the client may use the SPA document.
export function isPublicAppRoute(path) {
  return /^\/(?:jobs|job-list|job-openings|job-categories|employers|blog|about|contact|faq|services|nurse-jobs-in-uae|medical-coder-class|resume|cv|resume-library|resume-maker|resume-builder|ats-resume-builder|cv-builder|privacy|privacy-policy|terms|terms-and-conditions|employer-terms)$/.test(path)
    || path === '/' || path === '/services/medical-coder-class'
    || /^\/(?:category|job-location)\/[^/]+$/.test(path);
}
export function canonicalPageUrl(path, params = new URLSearchParams()) {
  const aliases = {'/job-list':'/jobs','/job-openings':'/jobs'};
  const canonical = new URL(aliases[path] || path, 'https://www.trikonet.com');
  // Pagination contains different records. Tracking and search/filter URLs do
  // not belong in the canonical or sitemap.
  const page = params.get('page');
  if (/^[1-9]\d*$/.test(page || '') && Number(page) > 1) canonical.searchParams.set('page', page);
  return canonical.href;
}
