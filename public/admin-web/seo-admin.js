const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => value ? new Date(value).toLocaleString('en-GB',{timeZone:'Asia/Dubai'}) : '—';
export function initSeoAdmin(notice) {
  let pages=[],filter='all',loaded=false,current=null;
  const el=id=>document.getElementById(id);
  async function request(url,method='GET',body) {
    const response=await fetch(url,{method,cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
    const result=await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to load SEO pages.');return result;
  }
  function render() {
    const query=(el('seo-job-search')?.value || '').trim().toLowerCase();
    const category=el('seo-job-category-filter')?.value,location=el('seo-job-location-filter')?.value;
    const filtered=pages.filter(p=>(!category || p.category===category)&&(!location || p.location===location)&&(!query || `${p.title} ${p.slug} ${p.category}`.toLowerCase().includes(query))&&(filter==='all'||p.status===filter||p.indexingStatus===filter||p.managementMode===filter||(filter==='MANUAL'&&p.managementMode!=='AUTO')));
    el('seo-job-page-count').textContent=`${filtered.length} items`;
    el('seo-job-page-rows').innerHTML=filtered.map(p=>`<tr><td class="post-col-cb"><input type="checkbox" value="${escape(p.id)}" aria-label="Select ${escape(p.title)}"></td><td><a class="post-headline-link" href="#seo-job-editor/${encodeURIComponent(p.id)}">${escape(p.title)}</a></td><td><a href="/${escape(p.slug)}" target="_blank" rel="noopener">/${escape(p.slug)}</a></td><td>${escape(p.category)}</td><td>${escape(p.location)}</td><td>${p.activeJobCount}</td><td>Category + Location</td><td>${escape(p.status)}</td><td>${escape(p.indexingStatus)}</td><td>${p.managementMode==='AUTO'?'Auto':p.managementMode==='MANUAL_DRAFT'?'Manual Draft':'Manual Published'}</td><td>${escape(p.eligibilityStatus)}${p.eligibilityStatus==='Below Threshold'?'<small style="display:block">Previously qualified</small>':''}</td><td>${escape(date(p.createdAt))}</td><td>${escape(date(p.updatedAt))}</td><td><div class="post-row-actions-bar" style="flex-wrap:wrap"><a href="#seo-job-editor/${encodeURIComponent(p.id)}">Edit</a><a href="/${escape(p.slug)}" target="_blank" rel="noopener">View</a><button class="modern-search-submit-btn" data-seo-action="status" data-id="${escape(p.id)}">${p.status==='Published'?'Draft':'Publish'}</button><button class="modern-search-submit-btn" data-seo-action="index" data-id="${escape(p.id)}">${p.indexingStatus==='Index'?'Noindex':'Index'}</button><button class="modern-search-submit-btn" data-seo-action="auto" data-id="${escape(p.id)}">Return to Auto</button><button class="modern-search-submit-btn" data-seo-action="regenerate" data-id="${escape(p.id)}">Regenerate Metadata</button></div></td></tr>`).join('') || '<tr><td colspan="14" style="padding:36px;text-align:center;color:#64748b">No SEO pages match. Create a main category page to enable automatic location pages at 10 active jobs.</td></tr>';
    el('seo-job-select-all').checked=false;
  }
  async function load() {
    try {
      pages=await request('/api/admin/seo-job-pages');loaded=true;
      for (const [id,field,label] of [['seo-job-category-filter','category','All categories'],['seo-job-location-filter','location','All locations']]) {
        const select=el(id),value=select.value;select.innerHTML=`<option value="">${label}</option>`+[...new Set(pages.map(p=>p[field]))].sort().map(v=>`<option>${escape(v)}</option>`).join('');select.value=value;
      }
      render();
    } catch(error) { el('seo-job-page-rows').innerHTML='<tr><td colspan="14" style="padding:36px">Unable to load SEO pages. Use Refresh to try again.</td></tr>';notice(error.message,'error'); }
  }
  async function open(id) {
    if (!loaded) await load();
    current=pages.find(p=>p.id===id);if (!current) {notice('SEO page not found.','error');return;}
    const fields={id:current.id,category:current.category,location:current.location,count:current.activeJobCount,checked:date(current.lastCheckedAt),created:date(current.createdAt),title:current.h1 || current.title,'seo-title':current.seoTitle,'meta-description':current.metaDescription,slug:current.slug,intro:current.introContent,bottom:current.bottomContent,status:current.status,indexing:current.indexingStatus,mode:current.managementMode};
    for (const [field,value] of Object.entries(fields)) if (el(`seo-job-${field}`)) el(`seo-job-${field}`).value=value ?? '';
    el('seo-job-view').href=`/${current.slug}`;
  }
  el('seo-job-page-form')?.addEventListener('submit',async event=>{
    event.preventDefault();if (!current) return;
    const button=event.submitter;button.disabled=true;
    try {
      const title=el('seo-job-title').value.trim();
      const next=await request(`/api/admin/seo-job-pages/${encodeURIComponent(current.id)}`,'PUT',{title,h1:title,seoTitle:el('seo-job-seo-title').value,metaDescription:el('seo-job-meta-description').value,slug:el('seo-job-slug').value,introContent:el('seo-job-intro').value,bottomContent:el('seo-job-bottom').value,status:el('seo-job-status').value,indexingStatus:el('seo-job-indexing').value,managementMode:el('seo-job-mode').value});
      pages=pages.map(p=>p.id===next.id?next:p);await open(next.id);render();notice('SEO job page saved.');
    } catch(error) {notice(error.message,'error');}finally{button.disabled=false;}
  });
  el('seo-job-status')?.addEventListener('change',()=>{el('seo-job-mode').value=el('seo-job-status').value==='Draft'?'MANUAL_DRAFT':'MANUAL_PUBLISHED';});
  el('seo-job-mode')?.addEventListener('change',()=>{if (el('seo-job-mode').value!=='AUTO') el('seo-job-status').value=el('seo-job-mode').value==='MANUAL_DRAFT'?'Draft':'Published';});
  async function regenerate(id) {const next=await request(`/api/admin/seo-job-pages/${encodeURIComponent(id)}/regenerate`,'POST',{});pages=pages.map(p=>p.id===id?next:p);render();if(current?.id===id)await open(id);notice('Metadata regenerated; manual overrides preserved.');}
  el('seo-job-regenerate')?.addEventListener('click',()=>current&&regenerate(current.id).catch(e=>notice(e.message,'error')));
  el('seo-job-page-rows')?.addEventListener('click',async event=>{
    const button=event.target.closest('[data-seo-action]');if (!button) return;const page=pages.find(p=>p.id===button.dataset.id);if (!page) return;button.disabled=true;
    try {
      if (button.dataset.seoAction==='regenerate') await regenerate(page.id);
      else { const action=button.dataset.seoAction==='status'?(page.status==='Published'?'draft':'publish'):button.dataset.seoAction==='index'?(page.indexingStatus==='Index'?'noindex':'index'):'auto';pages=await request('/api/admin/seo-job-pages/bulk','POST',{ids:[page.id],action});render();notice('SEO page updated.'); }
    }catch(error){notice(error.message,'error');}finally{button.disabled=false;}
  });
  el('seo-job-bulk-apply')?.addEventListener('click',async event=>{
    const ids=[...document.querySelectorAll('#seo-job-page-rows input:checked')].map(i=>i.value),action=el('seo-job-bulk-action').value;
    if(!ids.length||!action)return notice('Select pages and a bulk action.','error');
    if(action==='draft'&&!window.confirm(`Move ${ids.length} SEO pages to Draft? Their URLs will become unavailable.`))return;
    event.target.disabled=true;try{pages=await request('/api/admin/seo-job-pages/bulk','POST',{ids,action});render();notice('Selected SEO pages updated.');}catch(error){notice(error.message,'error');}finally{event.target.disabled=false;}
  });
  el('seo-job-select-all')?.addEventListener('change',event=>document.querySelectorAll('#seo-job-page-rows input').forEach(i=>{i.checked=event.target.checked;}));
  document.querySelectorAll('[data-seo-status]').forEach(tab=>tab.addEventListener('click',event=>{event.preventDefault();filter=tab.dataset.seoStatus;document.querySelectorAll('[data-seo-status]').forEach(t=>t.classList.toggle('current',t===tab));render();}));
  for(const id of ['seo-job-search','seo-job-category-filter','seo-job-location-filter'])el(id)?.addEventListener(id.includes('search')?'input':'change',render);
  el('seo-job-search-btn')?.addEventListener('click',render);
  el('seo-job-refresh')?.addEventListener('click',load);
  async function loadMains() {
    const mains=await request('/api/admin/seo-job-pages/main-categories');
    el('seo-main-list').innerHTML=mains.map(m=>`<a class="post-row-action-link" href="/${escape(m.slug)}" target="_blank" rel="noopener">${escape(m.category)}: /${escape(m.slug)}</a>`).join(' · ')||'No main categories registered yet.';
    const tax=await request('/api/local/taxonomies');
    el('seo-main-category').innerHTML='<option value="">Choose a main job category</option>'+(tax.categories || []).map(c=>`<option>${escape(c.name)}</option>`).join('');
  }
  el('seo-main-category')?.addEventListener('change',()=>{el('seo-main-slug').value=el('seo-main-category').value.toLowerCase().replace(/\s+jobs$/i,'').replace(/&amp;|&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-jobs';});
  el('seo-main-form')?.addEventListener('submit',async event=>{
    event.preventDefault();event.submitter.disabled=true;
    try{await request('/api/admin/seo-job-pages/main-categories','POST',{category:el('seo-main-category').value,slug:el('seo-main-slug').value});await loadMains();await load();notice('Main category page saved. Eligible location pages are generated automatically.');}catch(error){notice(error.message,'error');}finally{event.submitter.disabled=false;}
  });
  return {load:async()=>{await load();await loadMains().catch(e=>notice(e.message,'error'));},open};
}
