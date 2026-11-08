// Public content belongs on the website, where crawler metadata includes the
// company's logo. Never serve the admin SPA as a company/job share preview.
export function publicPageRedirect(method, requestUrl) {
  if (!['GET', 'HEAD'].includes(method)) return null;
  if (!/^\/(?:employer|job|jobs)\/[^/]+\/?$/.test(requestUrl.pathname)) return null;
  return `https://www.trikonet.com${requestUrl.pathname}${requestUrl.search}`;
}
