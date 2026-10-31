export function createFormRecovery(form, type, account) {
  const view = form.closest('.admin-view');
  const autosaveEnabled = type !== 'job';
  let key, dirty = false, restoring = false, timer, pending, draftId, sourceSlug = '';
  // Never reuse another tab's new-job recovery identity (including duplicated tabs).
  let newDraftScope = crypto.randomUUID();
  let generation = 0, paused = false, autosaveController;
  let editingSlug = '';
  let jobId = '';
  function setJobId(id) {
    jobId = id ? String(id) : '';
    let field = form.querySelector('[name="id"]');
    if (!field && type === 'job') { field = document.createElement('input'); field.type = 'hidden'; field.name = 'id'; form.append(field); }
    if (field) field.value = jobId;
  }
  function presence(release = false) {
    if (!editingSlug || type !== 'job') return;
    void fetch('/api/admin/job-presence', {method:'POST',credentials:'include',keepalive:release,headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:editingSlug,release})}).catch(() => {});
  }
  setInterval(() => {
    if (!document.hidden && view.classList.contains('active-view')) presence();
    else presence(true);
  }, 15000);
  window.addEventListener('pagehide', () => presence(true));
  function record() {
    const data = Object.fromEntries(new FormData(form));
    const value = selector => view.querySelector(selector)?.value || '';
    data.title = value(type === 'job' ? '#job-gutenberg-title' : '#employer-gutenberg-title') || data.title || '';
    data.description = value(type === 'job' ? '#job-gutenberg-content' : '#employer-gutenberg-content') || data.description || '';
    if (type === 'job') {
      data.company = value('#field-employer-company-value') || data.company || '';
      for (const name of ['types','categories','locations','tags']) data[name] = [...view.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
    } else {
      data.logo = value('#field-employer-logo-val');
      for (const name of ['categories','locations']) data[name] = [...view.querySelectorAll(`#employer-checklist-${name} input:checked`)].map(el => el.value);
    }
    return data;
  }
  async function sync() {
    clearTimeout(timer);
    if (!autosaveEnabled || paused || !dirty || !key || pending) return pending;
    const snapshotKey = key, snapshotId = draftId, snapshotSlug = sourceSlug, snapshotGeneration = generation;
    const data = record();
    if (!data.title.trim() && !data.description.trim()) return;
    autosaveController = new AbortController();
    const timeout=setTimeout(()=>autosaveController?.abort(),8000);
    pending = (async () => {
      try {
        const response = await fetch('/api/admin/autosave', { method: 'POST', signal:autosaveController.signal, credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({type,draftId:snapshotId,sourceSlug:snapshotSlug,record:{...data,id:jobId || snapshotId}}) });
        if (!response.ok) {const failure=await response.json().catch(()=>({}));throw new Error(failure.error||`Draft sync failed (HTTP ${response.status})`);}
        const saved = await response.json();
        if (generation === snapshotGeneration && key === snapshotKey && !saved.skipped) {
          if (type === 'job') { setJobId(saved.id || snapshotId); sourceSlug = saved.slug; }
          editingSlug = sourceSlug || saved.slug;
          presence();
          notice.textContent = saved.status === 'publish' ? 'Changes saved for recovery. Update to publish them.' : 'Draft saved to this job.';
          if (type === 'job' && form.elements.originalSlug) form.elements.originalSlug.value = saved.slug;
        }
      } catch(error) { if (generation===snapshotGeneration && key === snapshotKey) notice.textContent = error.name==='AbortError' ? 'Recovery copy saved on this device. Server draft sync timed out. You can still use Publish.' : `Recovery copy saved on this device. ${error.message||'Server draft sync failed.'} You can still use Publish.`; }
      finally { clearTimeout(timeout);pending = null; }
    })();
    return pending;
  }
  window.addEventListener('online', sync);
  const fields = () => [...view.querySelectorAll('input,textarea,select,[contenteditable="true"]')].filter(el => !['password','file'].includes(el.type));
  const id = (el, i) => el.id || `${el.name || 'field'}:${i}`;
  const notice = document.createElement('div');
  notice.style.cssText = 'padding:10px 16px;background:#eff6ff;color:#334155;font-size:13px;display:none';
  view.prepend(notice);
  function save() {
    if (!autosaveEnabled || !key || !dirty || restoring) return;
    try {
      const values = fields().map((el, i) => ({ key: id(el, i), value: el.isContentEditable ? el.innerHTML : el.value, checked: el.checked, rich: el.isContentEditable }));
      localStorage.setItem(key, JSON.stringify({ values, draftId, date: Date.now(), status: 'draft' }));
      notice.style.display = 'block';
      notice.textContent = 'Recovery draft saved on this device. Not published.';
      clearTimeout(timer); if (!paused) timer = setTimeout(sync, 5000);
    } catch {
      notice.style.display = 'block';
      notice.textContent = 'Device draft storage is full or unavailable. Keep this tab open; server autosave and Publish are still available.';
      clearTimeout(timer); if (!paused) timer = setTimeout(sync, 5000);
    }
  }
  view.addEventListener('input', () => { dirty = true; save(); });
  view.addEventListener('change', () => { dirty = true; save(); });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  return {
    open(slug = '', id = '') {
      presence(true);
      generation++;
      paused = false;
      editingSlug = slug;
      clearTimeout(timer);
      dirty = false;
      sourceSlug = slug;
      if (!slug) newDraftScope = crypto.randomUUID();
      key = `trikonet-recovery:${encodeURIComponent(account)}:${type}:${encodeURIComponent(slug || `new:${newDraftScope}`)}`;
      notice.style.display = 'none';
      if (!autosaveEnabled) {
        // Manual saves retain a stable identity without writing recovery drafts.
        draftId = crypto.randomUUID();
        setJobId(id || (slug ? '' : draftId));
        if (slug) presence();
        return;
      }
      let draft;
      try { draft = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
      draftId = draft?.draftId || (slug.startsWith(`autosave-${type}-`) ? slug.slice(`autosave-${type}-`.length) : crypto.randomUUID());
      if (type === 'job') { setJobId(id || draftId); if (slug) presence(); }
      if (!draft?.values || type === 'job') return;
      notice.style.display = 'block';
      notice.textContent = 'An unfinished draft is available on this device. ';
      const restore = document.createElement('button');
      restore.type = 'button'; restore.textContent = 'Restore Draft';
      restore.addEventListener('click', () => {
        restoring = true;
        try {
          const map = new Map(draft.values.map(value => [value.key, value]));
          for (const [i, el] of fields().entries()) {
            const value = map.get(id(el, i));
            if (!value) continue;
            if (value.rich) el.innerHTML = value.value; else el.value = value.value;
            if (typeof value.checked === 'boolean') el.checked = value.checked;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } finally { restoring = false; }
        dirty = true; save();
      });
      notice.append(restore);
    },
    saved(job) { if (type === 'job') { setJobId(job.id); sourceSlug = job.slug; } },
    async preparePublish() { paused=true;generation++;clearTimeout(timer);autosaveController?.abort(); },
    pause() { paused = true; clearTimeout(timer); },
    resume() { paused = false; if (dirty) save(); },
    async flush() { clearTimeout(timer); if (pending) await pending; await sync(); },
    clear() { generation++; presence(true); editingSlug = ''; clearTimeout(timer); if (key) { try { localStorage.removeItem(key); } catch {} } dirty = false; notice.style.display = 'none'; }
  };
}
