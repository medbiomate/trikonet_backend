import {isPublicRecord} from './public-record.mjs';

const normalize = value => String(value ?? '').trim().toLowerCase();
const terms = value => Array.isArray(value) ? value : Object.values(value || {});
const added = item => Date.parse(item.createdAt || item.date_gmt || item.date || '') || 0;

export function publicEmployerDirectory(imported, local, jobs, params) {
  const companies = new Map(imported.map(item => [item.slug, item]));
  for (const item of local) companies.set(item.slug, item);
  const query = normalize(params.get('q'));
  const category = normalize(params.get('category'));
  const location = normalize(params.get('location'));
  const minimum = Math.max(0, Number(params.get('min_jobs')) || 0);
  const sort = params.get('sort');
  const page = Math.max(1, Math.floor(Number(params.get('page')) || 1));
  const size = Math.min(30, Math.max(1, Math.floor(Number(params.get('per_page')) || 10)));
  const listings = [];
  for (const item of companies.values()) {
    if (!item.slug || !isPublicRecord(item)) continue;
    const meta = item.metas || {};
    const title = String(item.title?.rendered ?? item.title ?? '');
    const categories = terms(item.categories || meta._employer_category);
    const locations = terms(item.locations || meta._employer_location);
    const openJobs = jobs.get(item.slug) || 0;
    if (openJobs < minimum || (category && !categories.some(value => normalize(value) === category)) ||
        (location && !locations.some(value => normalize(value) === location)) ||
        (query && !normalize([title, ...categories, ...locations].join(' ')).includes(query))) continue;
    listings.push({
      slug: item.slug, title, categories, locations, openJobs, createdAt: item.createdAt || item.date,
      logo: item.logo || meta._employer_logo || meta._employer_featured_image_img || meta._employer_featured_image || '',
      time: added(item)
    });
  }
  const order = {
    az: (a,b) => a.title.localeCompare(b.title),
    za: (a,b) => b.title.localeCompare(a.title),
    jobs: (a,b) => b.openJobs-a.openJobs
  };
  const compare = Object.hasOwn(order,sort) ? order[sort] : null;
  listings.sort((a,b) => (compare?.(a,b) || 0) || b.time-a.time || a.slug.localeCompare(b.slug));
  return {employers:listings.slice((page-1)*size,page*size).map(({time,...item})=>item),total:listings.length};
}
