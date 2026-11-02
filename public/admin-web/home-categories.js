const escapeAttr=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const defaultTopCategories = [
  { name: 'Education and Training', slug: 'education-and-training', count: 3148 },
  { name: 'Accounting or Finance', slug: 'accounting-finance', count: 1767 },
  { name: 'Administration', slug: 'administration', count: 1302 },
  { name: 'HealthCare', slug: 'healthcare', count: 762 },
  { name: 'Nurse Jobs', slug: 'nurse-jobs', count: 706 },
  { name: 'Human Resource', slug: 'human-resource', count: 654 },
  { name: 'Digital Marketing Jobs', slug: 'digital-marketing', count: 636 },
  { name: 'Marketing and Sales', slug: 'marketing-and-sales', count: 627 },
  { name: 'Customer Service Associate Jobs', slug: 'customer-service-associate-jobs', count: 231 },
  { name: 'Engineering', slug: 'engineering', count: 179 }
];
function getCategorySvg(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('educat') || n.includes('teach') || n.includes('school') || n.includes('academic')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
  }
  if (n.includes('account') || n.includes('financ') || n.includes('audit') || n.includes('bank') || n.includes('cashier')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
  }
  if (n.includes('nurse')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`;
  }
  if (n.includes('health') || n.includes('doctor') || n.includes('medic') || n.includes('clinic') || n.includes('hospital')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 9v6m-3-3h6"/></svg>`;
  }
  if (n.includes('human') || n.includes('hr') || n.includes('talent') || n.includes('recruit')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  }
  if (n.includes('digital') || n.includes('marketing') || n.includes('seo') || n.includes('media')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`;
  }
  if (n.includes('sale') || n.includes('retail') || n.includes('customer')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
  }
  if (n.includes('engineer') || n.includes('tech') || n.includes('software') || n.includes('comput')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  }
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
}

export function renderHomeCategories(s = {}, {categories = defaultTopCategories, homeSectionAttrs = () => '', slugifyCategory = category => category.slug} = {}) {
  const sourceList = categories.length ? categories : defaultTopCategories;
  const mainCategories = sourceList.filter(c => !c.parent || ['Nurse Jobs'].includes(c.name));
  const cats = [...(mainCategories.length >= 9 ? mainCategories : sourceList)]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 9);
  return `<section class="section home-categories-section${homeSectionAttrs(s)}">
    <div class="wrap">
      <div class="categories-header">
        <div class="categories-header-text">
          <span class="categories-eyebrow">BROWSE BY INDUSTRY</span>
          <h2 class="categories-title">${escapeAttr(s.title || 'Popular Job Categories')}</h2>
          <p class="categories-subtitle">${escapeAttr(s.subtitle || 'Explore thousands of active vacancies across top in-demand industries in the UAE')}</p>
        </div>
        <a href="/jobs" class="categories-all-link">
          <span>Explore All Categories</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
      <div class="category-grid">
        ${cats.map((c) => `
          <a class="category-card" href="/category/${slugifyCategory(c)}">
            <div class="category-card-icon">
              ${getCategorySvg(c.name)}
            </div>
            <div class="category-card-body">
              <h3 class="category-card-title">${escapeAttr(c.name)}</h3>
              <span class="category-card-count">${c.count == null ? 'Browse jobs' : `${Number(c.count).toLocaleString()} open positions`}</span>
            </div>
            <div class="category-card-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  </section>`;
}
