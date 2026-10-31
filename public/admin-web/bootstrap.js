import {initJobNavigation} from './job-navigation.js?v=20261018-server-job-list';
initJobNavigation();
// A failed module or stalled request must never leave the full-page loader open.
export function showLoadingRecovery(error) {
  console.warn('Trikonet page initialization interrupted:', error);
  globalThis.window?.dispatchEvent?.(new Event('trikonet:failed'));
  const app = document.getElementById('app');
  const serverJob = app?.hasAttribute('data-server-rendered') || app?.querySelector('[data-loading-shell]');
  if (!serverJob && app) {
    const main = document.createElement('main');
    main.style.cssText = 'max-width:720px;margin:80px auto;padding:24px;font-family:system-ui,sans-serif';
    const title = document.createElement('h1');
    title.textContent = 'This page is taking longer than expected';
    const message = document.createElement('p');
    message.textContent = 'Please retry to load the latest jobs. Your saved jobs and account have not been changed.';
    const retry = document.createElement('button');
    retry.type = 'button';retry.textContent = 'Retry';retry.addEventListener('click', () => location.reload());
    const home = document.createElement('a');
    home.href = '/';home.textContent = 'Return to Trikonet';home.style.marginLeft = '20px';
    home.setAttribute('data-google-vignette','false');
    main.append(title,message,retry,home);app.replaceChildren(main);
  }
  app?.removeAttribute('inert');app?.removeAttribute('aria-busy');app?.removeAttribute('data-seo-pending');
  document.documentElement.classList.remove('page-loading');
  document.getElementById('page-preloader')?.remove();document.getElementById('seo-loading')?.remove();
}
// A slow transfer is not a failed module. Keep the useful page and let loading continue.
const timeout = setTimeout(() => {
  const status = document.getElementById('initial-loading-status');
  if (status) status.textContent = 'Your connection is taking a little longer. You can still use search and navigation.';
  // Keep initialization alive; only a rejected module should replace the page.
  // Slow authentication or a busy server is not a failed editor.
}, 12000);
import('./app.js?v=20261031-all-entry-2').catch(showLoadingRecovery).finally(() => clearTimeout(timeout));
