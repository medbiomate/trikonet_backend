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
  let lastTouchNavigation = null;
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
    if (event.type === 'click' && lastTouchNavigation?.href === url.href && Date.now() - lastTouchNavigation.time < 1000) return;
    navigate(url.href);
    return url.href;
  };
  // Touch intent survives a listing redraw between pointer-down and click.
  // Never cancel pointer-down: users must still be able to scroll/select.
  let touch = null;
  const onPointerDown = event => {
    touch = event.pointerType === 'touch' || event.pointerType === 'pen'
      ? { id: event.pointerId, x: event.clientX, y: event.clientY, target: event.target } : null;
  };
  const onPointerMove = event => {
    if (touch && (Math.abs(event.clientX - touch.x) > 10 || Math.abs(event.clientY - touch.y) > 10)) touch = null;
  };
  const onPointerCancel = () => { touch = null; };
  const onPointerUp = event => {
    const start = touch; touch = null;
    if (!start || start.id !== event.pointerId || event.defaultPrevented ||
      Math.abs(event.clientX - start.x) > 10 || Math.abs(event.clientY - start.y) > 10) return;
    const href = onClick({ button: 0, target: start.target,
      preventDefault: () => event.preventDefault(),
      stopImmediatePropagation: () => event.stopImmediatePropagation() });
    if (href) lastTouchNavigation = { href, time: Date.now() }; 
  };
  root.addEventListener('pointerdown', onPointerDown, true);
  root.addEventListener('pointermove', onPointerMove, true);
  root.addEventListener('pointercancel', onPointerCancel, true);
  root.addEventListener('pointerup', onPointerUp, true);
  root.addEventListener('click', onClick, true);
  globalThis.addEventListener?.('pageshow', () => {
    root.querySelectorAll('.job-navigation-pending').forEach(link => {
      link.removeAttribute('aria-busy');link.classList.remove('job-navigation-pending');
    });
  });
  return () => {
    for (const [name, handler] of [['click', onClick], ['pointerdown', onPointerDown], ['pointermove', onPointerMove], ['pointercancel', onPointerCancel], ['pointerup', onPointerUp]]) root.removeEventListener(name, handler, true);
  };
}
