const escape = value => String(value || '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label = value => String(value || '').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0*39;|&apos;/g,"'");
export function renderCategoryLinks(links,{category='',slug='',categoriesOnly=false,limit=Infinity}={}) {
  const unique=new Map();
  for(const page of links || []) {
    if(page.activeJobCount<(categoriesOnly?20:10) || page.slug===slug || (category && page.category!==category) || (categoriesOnly && page.pageType!=='main_category'))continue;
    const href=page.href || `/${page.slug}`;
    if(!href.startsWith('/') || href.startsWith('//'))continue;
    unique.set(href,page);
  }
  if(!unique.size)return '';
  const entries=[...unique];
  if(categoriesOnly)entries.sort((a,b)=>b[1].activeJobCount-a[1].activeJobCount || a[1].title.localeCompare(b[1].title) || a[0].localeCompare(b[0]));
  return `<section class="wrap job-category-links"><h2>${categoriesOnly?'Explore Jobs by Category':'Related Job Categories'}</h2><div class="job-category-links-box"><nav aria-label="${categoriesOnly?'Job categories':'Related job categories'}" class="job-category-links-grid">${entries.slice(0,limit).map(([href,page])=>`<a href="${escape(href)}">${escape(label(page.title))}<span aria-hidden="true">→</span></a>`).join('')}</nav></div>${entries.length>limit?'<p class="job-category-links-action"><a class="outline" href="/job-categories">View All Job Categories →</a></p>':''}</section>`;
}

export function renderAllCategories(links){
  const groups=new Map();
  for(const page of links || []){
    if(page.pageType!=='main_category' || page.activeJobCount<20)continue;
    const name=page.category || '';
    const group=page.group || (/nurs|doctor|medical|health|dent|pharma|physio|biomed|surg|radiograph|midwife/i.test(name)?'Healthcare':/engineer|mechanic|electric|civil|mep/i.test(name)?'Engineering':/teach|school|education|academic|instructor/i.test(name)?'Education':/account|financ|payroll|audit|bank/i.test(name)?'Finance':/software|technology|\bit\b|computer|data|system/i.test(name)?'Technology':'Other Job Categories');
    if(!groups.has(group))groups.set(group,[]);
    groups.get(group).push(page);
  }
  return `<main><section class="wrap job-category-links"><h1>All Job Categories</h1><p>Explore current job opportunities by category.</p></section>${[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([group,pages])=>renderCategoryLinks(pages,{categoriesOnly:true}).replace('<h2>Explore Jobs by Category</h2>',`<h2>${escape(group)}</h2>`)).join('')}</main>`;
}
