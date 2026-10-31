const SESSION_KEY = 'trikonet_admin_session';
const SIGNAL_KEY = 'trikonet_admin_session_changed';
let verifiedAdmin = null;
let pending = null;
const allowedRoles = ['Administrator', 'Editor', 'Content Editor'];

export function getVerifiedAdmin() {
  return verifiedAdmin && Number(verifiedAdmin.expiresAt) > Date.now() ? verifiedAdmin : null;
}

export async function refreshAdminSession() {
  if (pending) return pending;
  pending = (async () => {
    let admin = null;
    try {
      const early=window.trikonetEarlyAdminSession;delete window.trikonetEarlyAdminSession;
      const response = (early?await early:null)||await fetch('/api/admin/me', { credentials: 'include', cache: 'no-store' });
      if (response.ok) {
        const payload = await response.json();
        if (allowedRoles.includes(payload.admin?.role) && Number(payload.admin.expiresAt) > Date.now()) admin = payload.admin;
      }
    } catch {}
    verifiedAdmin = admin;
    // Each tab gets the console's display data only after cookie verification.
    try {
      localStorage.removeItem(SESSION_KEY);
      if (admin) sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    return admin;
  })();
  try { return await pending; } finally { pending = null; }
}

export function signalAdminSessionChange() {
  try { localStorage.setItem(SIGNAL_KEY, `${Date.now()}-${Math.random()}`); } catch {}
}

export function initPublicAdminBar(editContext = null) {
  if (location.pathname.startsWith('/admin') || ['/trikonet-admin-access'].includes(location.pathname)) return;
  const style = document.createElement('style');
  style.textContent = `
    body.has-public-admin-bar{padding-top:0}
    body.has-public-admin-bar .topbar{top:36px;height:68px}
    body.has-public-admin-bar #app{padding-top:36px;overflow-x:clip;overflow-y:visible}
    body.has-public-admin-bar .topbar .nav{min-height:68px}
    body.has-public-admin-bar .topbar.site-header-boxed{top:54px}
    .public-admin-bar{position:fixed;inset:0 0 auto;height:36px;z-index:100000;display:flex;align-items:center;gap:4px;padding:0 16px;background:#1d2327;color:#f0f0f1;font:13px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 1px 3px #0003}
    .public-admin-bar a,.public-admin-bar button{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;color:inherit;background:none;border:0;border-radius:0;text-decoration:none;font:inherit;white-space:nowrap;cursor:pointer}
    .public-admin-bar a:hover,.public-admin-bar button:hover{background:#2c3338;color:#72aee6}
    .public-admin-bar a:focus-visible,.public-admin-bar button:focus-visible{outline:2px solid #72aee6;outline-offset:-3px}
    .public-admin-bar .public-admin-brand{font-weight:700;padding-left:0}
    .public-admin-bar .public-admin-account{margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px}
    .public-admin-bar .public-admin-error{color:#ffb4b4;font-size:12px}
    @media(max-width:600px){.public-admin-bar{padding:0 8px;gap:0}.public-admin-bar a,.public-admin-bar button{padding:0 8px;font-size:12px}.public-admin-bar .public-admin-account,.public-admin-bar .public-admin-brand{display:none}.public-admin-bar .public-admin-logout{margin-left:auto}}
  `;
  document.head.append(style);
  let expiryTimer;
  function renderBar() {
    clearTimeout(expiryTimer);
    document.getElementById('public-admin-bar')?.remove();
    const admin = getVerifiedAdmin();
    document.body.classList.toggle('has-public-admin-bar', Boolean(admin));
    if (!admin) return;
    const bar = document.createElement('nav');
    bar.id = 'public-admin-bar';
    bar.className = 'public-admin-bar';
    bar.setAttribute('aria-label', 'Administration shortcuts');
    bar.innerHTML = `<a class="public-admin-brand" href="/admin">TriKonet</a><a href="/admin">Console</a><a href="/admin#jobs">Jobs</a><a href="/admin#job-new">＋ Add Job</a><span class="public-admin-account"></span><span class="public-admin-error" role="status"></span><button type="button" class="public-admin-logout">Admin Logout</button>`;
    if (editContext?.slug && ['job', 'employer', 'post'].includes(editContext.type)) {
      const link = document.createElement('a');
      link.href = `/admin#${editContext.type}-editor/${encodeURIComponent(editContext.slug)}`;
      link.textContent = { job: 'Edit Job', employer: 'Edit Employer', post: 'Edit Post' }[editContext.type];
      bar.querySelector('.public-admin-account').before(link);
    }
    bar.querySelector('.public-admin-account').textContent = `Hello, ${admin.name || admin.username || 'Administrator'}`;
    bar.querySelector('button').addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        const response = await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
        if (!response.ok) throw new Error('Logout failed');
        verifiedAdmin = null;
        try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch {}
        signalAdminSessionChange();
        renderBar();
      } catch {
        button.disabled = false;
        bar.querySelector('.public-admin-error').textContent = 'Logout failed. Try again.';
      }
    });
    document.body.prepend(bar);
    expiryTimer = setTimeout(renderBar, Math.max(0, Number(admin.expiresAt) - Date.now()) + 25);
  }
  async function refresh() { await refreshAdminSession(); renderBar(); }
  renderBar();
  window.addEventListener('focus', refresh);
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('storage', event => { if (event.key === SIGNAL_KEY) refresh(); });
  setInterval(() => { if (!document.hidden) refresh(); }, 60000);
}
