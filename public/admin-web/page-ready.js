// Reveal the rendered page promptly, without waiting for image downloads.
export async function revealPage() {
  const app = document.getElementById('app');
  // Images have reserved space; their downloads must not keep the loader open.
  // Give already-loading fonts a brief chance to settle, without a long delay.
  let timer;
  await Promise.race([
    document.fonts?.ready || Promise.resolve(),
    new Promise(resolve => { timer = setTimeout(resolve, 150); })
  ]);
  clearTimeout(timer);
  await new Promise(resolve => requestAnimationFrame(resolve));
  app?.removeAttribute('inert');
  app?.removeAttribute('aria-busy');
  document.documentElement.classList.remove('page-loading');
  document.getElementById('page-preloader')?.remove();
  window.clearTimeout(window.trikonetLoadingTimer);
  window.dispatchEvent?.(new Event('trikonet:ready'));
}
