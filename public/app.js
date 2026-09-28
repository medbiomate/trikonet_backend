import { renderAdmin, initAdmin } from './admin.js?v=1.0';

document.querySelector('#app').innerHTML = renderAdmin();

// The extracted project contains only the administration application.
// Links that normally open the public portal target the original local site.
document.querySelectorAll('a[title="View live job portal website"], a[href="/"]').forEach(link => {
  if (link.matches('[title="View live job portal website"], .admin-sidebar-footer a')) {
    link.href = 'http://127.0.0.1:4173/';
  }
});

await initAdmin();
