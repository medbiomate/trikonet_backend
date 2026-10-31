// Trikonet Frontend API Configuration
// Automatically routes to local backend when on localhost, or https://api.trikonet.com in production
const isLocal = typeof window !== 'undefined' && (
  !window.location.hostname ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.endsWith('.local')
);

window.TRIKONET_CONFIG = window.TRIKONET_CONFIG || {
  apiBase: window.TRIKONET_API_BASE || (isLocal ? '' : 'https://api.trikonet.com')
};

// Global fetch wrapper to route relative /api/* requests to the configured backend domain
(function () {
  const originalFetch = window.fetch.bind(window);
  const pendingReads = new Map();
  // Share simultaneous public reads, never account/admin requests or writes.
  function request(resource, init) {
    const method = String(init.method || resource?.method || 'GET').toUpperCase();
    const url = typeof resource === 'string' ? resource : resource?.url;
    const publicRead = method === 'GET' && typeof resource === 'string' && !init.signal &&
      /\/api\/(?:wp\/|job-category-links(?:\?|$))/.test(url);
    const options = { ...init };
    if (method === 'GET' && !options.signal) options.signal = AbortSignal.timeout(/\/api\/(?:wp\/|local\/|employer-jobs\/|seo-job-pages\/)/.test(url || '') ? 8000 : 8000);
    if (!publicRead) return originalFetch(resource, options);
    const key = JSON.stringify([url, options.credentials, options.cache, Array.from(new Headers(options.headers).entries())]);
    let pending = pendingReads.get(key);
    if (!pending) {
      pending = originalFetch(resource, options).finally(() => pendingReads.delete(key));
      pendingReads.set(key, pending);
    }
    return pending.then(response => response.clone());
  }
  window.fetch = function (resource, init = {}) {
    let url = typeof resource === 'string' ? resource : resource?.url;
    if (typeof url === 'string' && url.startsWith('/api/') && window.TRIKONET_CONFIG.apiBase) {
      const fullUrl = window.TRIKONET_CONFIG.apiBase.replace(/\/+$/, '') + url;
      return request(fullUrl, {
        ...init,
        // A relative same-origin request becomes cross-origin after routing.
        // Preserve explicit anonymous requests, but carry the account cookie otherwise.
        credentials: init.credentials === 'omit' ? 'omit' : 'include'
      });
    }
    return request(resource, init);
  };
})();
