// Keep browsing jobs and applying free of full-screen ad interruptions.
export function protectJobNavigation(root = document) {
  for (const link of root.querySelectorAll('a[href]')) {
    let url;
    try { url = new URL(link.getAttribute('href'), location.origin); } catch { continue; }
    if (link.classList.contains('apply') || (url.origin === location.origin &&
      /^\/(?:jobs?|employers?|category|job-location|nurse-jobs-in-uae)(?:\/|$)/.test(url.pathname))) {
      link.setAttribute('data-google-vignette', 'false');
    }
  }
}

// Register before advertising scripts can intercept a plain job-link click.
// Keep modified clicks, downloads and new-tab links under browser control.
export function initJobNavigation(root = document, navigate = href => location.assign(href)) {
  const onClick = event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    const card = !link && event.target.closest?.('.nurse-job-card');
    if (card && event.target.closest?.('button,input,select,textarea,[role="button"]')) return;
    const destination = link || card?.querySelector('.nurse-job-title-link, .nurse-view-job-btn');
    if (!destination || destination.hasAttribute('download') || (destination.target && destination.target !== '_self')) return;
    let url;
    try { url = new URL(destination.getAttribute('href'), location.origin); } catch { return; }
    if (url.origin !== location.origin || !/^\/(?:job\/|jobs\/|employer\/)[^/]+\/?$/.test(url.pathname)) return;
    if (card && String(globalThis.getSelection?.() || '').trim()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    destination.setAttribute('data-google-vignette', 'false');
    destination.setAttribute('aria-busy', 'true');
    destination.classList.add('job-navigation-pending');
    navigate(url.href);
  };
  root.addEventListener('click', onClick, true);
  globalThis.addEventListener?.('pageshow', () => {
    root.querySelectorAll('.job-navigation-pending').forEach(link => {
      link.removeAttribute('aria-busy');link.classList.remove('job-navigation-pending');
    });
  });
  return () => root.removeEventListener('click', onClick, true);
}
