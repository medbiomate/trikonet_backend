import crypto from 'node:crypto';

export const UAE_LOCATIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah', 'Umm Al Quwain', 'Fujairah'];
export const slugify = value => String(value || '').toLowerCase().replace(/&amp;|&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const key = value => String(value || '').trim().toLowerCase();
const pairId = (categoryId, locationId) => `id:${categoryId}::${locationId}`;
function matchesTaxonomy(job, field, meta, id, name, taxonomy = []) {
  const selected = taxonomy.find(term => String(term.id ?? term.slug) === String(id));
  // Resolve stored IDs to current taxonomy names; local/imported jobs use names.
  return values(job,field,meta).some(value => key(value) === key(selected?.name || name));
}
export function isActiveJob(job, now = new Date()) {
  if (!['publish','published','active'].includes(key(job.status || 'publish')) || job.filled === true || job.active === false || key(job.activityStatus) === 'inactive' || key(job.metas?._filled) === '1') return false;
  const dates = [job.expiryDate, job.deadline, job.metas?._job_expiry_date, job.metas?._job_application_deadline_date].filter(Boolean);
  return dates.every(value => {
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T23:59:59+04:00` : value);
    return Number.isFinite(date.getTime()) && date >= now;
  });
}
export function values(job, field, meta) {
  const value = job[field] ?? job[field==='categories'?'category':field==='locations'?'location':field] ?? job.metas?.[meta];
  return (Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : String(value || '').split(',')).map(String).map(v => v.trim()).filter(Boolean);
}
export function defaults(main, location) {
  const base = String(main.slug).replace(/-in-uae$/, '').replace(/-jobs$/, '');
  const title = `${main.category.replace(/\s+jobs$/i, '')} Jobs in ${location.name}`;
  return { title, h1: title, slug: `${base}-jobs-in-${location.slug || slugify(location.name)}`, seoTitle: `${title} - Latest Vacancies | Trikonet`, metaDescription: `Find the latest ${main.category.replace(/\s+jobs$/i, '')} jobs in ${location.name}. Explore current vacancies and apply for relevant opportunities on Trikonet.` };
}
export function reconcile(pages, mains, counts, now = new Date().toISOString()) {
  const next = structuredClone(pages);
  for (const page of next) {
    const count = counts.get(pairId(page.categoryId,page.locationId)) ?? counts.get(`${key(page.category)}::${key(page.location)}`) ?? 0;
    if (page.activeJobCount !== count) page.updatedAt = now;
    page.activeJobCount = count;
    page.lastCheckedAt = now;
    page.eligibilityStatus = page.managementMode === 'AUTO' ? count >= 10 ? 'Eligible' : 'Below Threshold' : 'Manual Override';
    if (count >= 10) page.lastQualifiedAt = now;
    // Previously qualified URLs retain their status, even below threshold.
  }
  for (const main of mains.filter(p=>!p.status || p.status==='Published')) for (const name of UAE_LOCATIONS) {
    const locationId = main.locations?.find(l => key(l.name) === key(name))?.id || slugify(name);
    const count = counts.get(pairId(main.categoryId,locationId)) ?? counts.get(`${key(main.category)}::${key(name)}`) ?? 0;
    if (count < 10 || next.some(p => key(p.category) === key(main.category) && key(p.location) === key(name))) continue;
    const location = { name, slug: slugify(name) };
    const metadata = defaults(main, location);
    if (next.some(p => p.slug === metadata.slug) || mains.some(p => p.slug === metadata.slug)) continue;
    next.push({ id: crypto.randomUUID(), categoryId: main.categoryId, locationId: main.locations?.find(l => key(l.name) === key(name))?.id || slugify(name), category: main.category, location: name, pageType: 'category_location', ...metadata, introContent: '', bottomContent: '', activeJobCount: count, status: 'Published', indexingStatus: 'Index', managementMode: 'AUTO', eligibilityStatus: 'Eligible', seoTitleOverridden: false, metaDescriptionOverridden: false, h1Overridden: false, contentOverridden: false, firstQualifiedAt: now, lastQualifiedAt: now, lastCheckedAt: now, createdAt: now, updatedAt: now });
  }
  return next;
}
export function editPage(page, changes, { regenerate = false, main } = {}) {
  const next = { ...page };
  if (regenerate) {
    const generated = defaults(main || { category: page.category, slug: `${slugify(page.category.replace(/\s+jobs$/i, ''))}-jobs` }, { name: page.location });
    if (!page.h1Overridden) { next.h1 = generated.h1; next.title = generated.title; }
    if (!page.seoTitleOverridden) next.seoTitle = generated.seoTitle;
    if (!page.metaDescriptionOverridden) next.metaDescription = generated.metaDescription;
  }
  for (const field of ['title','h1','seoTitle','metaDescription','slug','introContent','bottomContent']) {
    if (!(field in changes) || changes[field] === page[field]) continue;
    next[field] = String(changes[field]);
    const flag = { title:'h1Overridden', h1:'h1Overridden', seoTitle:'seoTitleOverridden', metaDescription:'metaDescriptionOverridden', introContent:'contentOverridden', bottomContent:'contentOverridden' }[field];
    if (flag) next[flag] = true;
  }
  if ('slug' in changes) { next.slug = slugify(changes.slug); if (!next.slug || next.slug.length>191 || ['admin','admin-login','jobs','employers','login','register','blog','about','contact','faq'].includes(next.slug)) throw new Error('A unique landing page slug of up to 191 characters is required.'); }
  if ('indexingStatus' in changes) { if (!['Index','Noindex'].includes(changes.indexingStatus)) throw new Error('Invalid indexing status.'); next.indexingStatus = changes.indexingStatus; }
  if ('status' in changes) { if (!['Published','Draft'].includes(changes.status)) throw new Error('Invalid status.'); if (changes.status !== page.status) next.managementMode = changes.status === 'Draft' ? 'MANUAL_DRAFT' : 'MANUAL_PUBLISHED'; next.status = changes.status; }
  if ('managementMode' in changes) {
    if (!['AUTO','MANUAL_PUBLISHED','MANUAL_DRAFT'].includes(changes.managementMode)) throw new Error('Invalid management mode.');
    if (changes.managementMode !== page.managementMode || !('status' in changes)) next.managementMode = changes.managementMode;
  }
  if (next.managementMode === 'MANUAL_DRAFT') next.status = 'Draft';
  if (next.managementMode === 'MANUAL_PUBLISHED') next.status = 'Published';
  next.eligibilityStatus = next.managementMode === 'AUTO' ? next.activeJobCount >= 10 ? 'Eligible' : 'Below Threshold' : 'Manual Override';
  next.updatedAt = new Date().toISOString();
  return next;
}
export const indexable = page => page.status === 'Published' && page.indexingStatus === 'Index';

export function createSeoRepository(pool, readLocalDb, loadRecords) {
  let ready;
  let serial = Promise.resolve();
  let lastSync = 0;
  const queue = fn => { const result = serial.then(fn); serial = result.catch(() => {}); return result; };
  async function ensure() {
    ready ||= pool.query(`CREATE TABLE IF NOT EXISTS seo_job_pages (id VARCHAR(64) PRIMARY KEY, slug VARCHAR(191) UNIQUE NOT NULL, page_type VARCHAR(32) NOT NULL, payload LONGTEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(error => { ready = null; throw error; });
    await ready;
  }
  async function rows() { await ensure(); const [list] = await pool.query('SELECT payload FROM seo_job_pages'); return list.map(row => JSON.parse(row.payload)); }
  async function save(page) { await ensure(); await pool.query('INSERT INTO seo_job_pages (id,slug,page_type,payload) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE slug=VALUES(slug),payload=VALUES(payload)', [page.id,page.slug,page.pageType,JSON.stringify(page)]); }
  async function counts() {
    const db = await readLocalDb();
    const { jobs, taxonomies } = await loadRecords();
    const merged = new Map(jobs.map(job => [job.slug || String(job.id),job]));
    (db.jobs || []).forEach(job => merged.set(job.slug || String(job.id),job));
    const result = new Map();
    for (const job of merged.values()) {
      if (!isActiveJob(job)) continue;
      for (const category of values(job,'categories','_job_category')) for (const location of values(job,'locations','_job_location')) {
        if (!UAE_LOCATIONS.some(name => key(name) === key(location))) continue;
        const pair = `${key(category)}::${key(location)}`;
        result.set(pair,(result.get(pair) || 0) + 1);
        const categoryTerm=taxonomies.categories?.find(t=>key(t.name)===key(category));
        const locationTerm=taxonomies.locations?.find(t=>key(t.name)===key(location));
        if(categoryTerm && locationTerm){const idPair=pairId(categoryTerm.id ?? categoryTerm.slug,locationTerm.id ?? locationTerm.slug);result.set(idPair,(result.get(idPair) || 0)+1);}
      }
    }
    return { result, jobs:[...merged.values()], taxonomies };
  }
  async function syncUnlocked(force = false) {
    let list = await rows();
    if (!force && Date.now() - lastSync < 60000) return list;
    const { result } = await counts();
    const mains = list.filter(p => p.pageType === 'main_category');
    const pages = reconcile(list.filter(p => p.pageType === 'category_location'),mains,result);
    for (const page of pages) await save(page);
    lastSync = Date.now();
    return [...mains,...pages];
  }
  return {
    list: (force = false) => queue(() => syncUnlocked(force)),
    createMain: body => queue(async () => {
      if (!body.category || !body.slug) throw new Error('Choose a category and a main page URL.');
      const { taxonomies } = await loadRecords();
      const category = taxonomies.categories?.find(c => key(c.name) === key(body.category));
      if (!category) throw new Error('Choose an existing job category.');
      const list = await rows();
      const existing = list.find(p => p.pageType === 'main_category' && key(p.category) === key(category.name));
      if (existing && body.onlyIfMissing) return existing;
      const slug = slugify(body.slug);
      if (list.some(p => p.slug === slug && p.id !== existing?.id)) throw new Error('This URL already exists.');
      const now = new Date().toISOString();
      if (!slug || slug.length>191 || ['home','jobs','employers','admin','admin-login','login','register','blog','about','contact','faq'].includes(slug)) throw new Error('Choose a unique category landing page URL of up to 191 characters.');
      const main = { ...(existing || {}),id:existing?.id || crypto.randomUUID(),pageType:'main_category',categoryId:category.id || category.slug,category:category.name,slug,title:body.title || existing?.title || `${category.name.replace(/\s+jobs$/i,'')} Jobs`,status:body.status==='Draft'?'Draft':'Published',indexingStatus:'Index',createdAt:existing?.createdAt || now,updatedAt:now,locations:taxonomies.locations || [],cmsPageId:body.cmsPageId || existing?.cmsPageId,seoTitle:body.seoTitle || existing?.seoTitle,metaDescription:body.metaDescription ?? existing?.metaDescription,introContent:body.introContent ?? existing?.introContent };
      await save(main); lastSync = 0; await syncUnlocked(true); return main;
    }),
    update: (id,changes,regenerate = false) => queue(async () => {
      const list = await rows(); const page = list.find(p => p.id === id && p.pageType === 'category_location');
      if (!page) throw new Error('SEO job page not found.');
      const next = editPage(page,changes,{ regenerate,main:list.find(p => p.pageType === 'main_category' && key(p.category) === key(page.category)) });
      if (list.some(p => p.id !== id && p.slug === next.slug)) throw new Error('This URL already exists.');
      await save(next); return next;
    }),
    bulk: (ids,action) => queue(async () => {
      const actions = { publish:{status:'Published',managementMode:'MANUAL_PUBLISHED'},draft:{status:'Draft',managementMode:'MANUAL_DRAFT'},index:{indexingStatus:'Index'},noindex:{indexingStatus:'Noindex'},auto:{managementMode:'AUTO'} };
      if (!actions[action]) throw new Error('Invalid bulk action.');
      const list = await rows();
      for (const page of list.filter(p => p.pageType === 'category_location' && ids.includes(p.id))) await save(editPage(page,actions[action]));
      return syncUnlocked();
    }),
    jobs: async page => {
      const { jobs, taxonomies } = await counts();
      return jobs.filter(job => isActiveJob(job) && matchesTaxonomy(job,'categories','_job_category',page.categoryId,page.category,taxonomies.categories) && (page.pageType === 'main_category' || matchesTaxonomy(job,'locations','_job_location',page.locationId,page.location,taxonomies.locations)))
        .sort((a,b)=>(Date.parse(b.postedDate || b.date || '') || 0)-(Date.parse(a.postedDate || a.date || '') || 0));
    }
  };
}
