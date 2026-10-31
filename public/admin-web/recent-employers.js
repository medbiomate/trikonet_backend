const title = item => String(item.title?.rendered ?? item.title ?? '');
export const employerAddedTime = item => {
  for (const value of [item.createdAt, item.date_gmt && `${item.date_gmt}Z`, item.date]) {
    const time = Date.parse(value || '');
    if (Number.isFinite(time)) return time;
  }
  return 0;
};
export async function recentEmployerPage(read, params, pageSize = 10) {
  const query = new URLSearchParams(params);
  query.set('per_page', '5000');
  const imported = [];
  for (let page = 1; ; page++) {
    query.set('page', String(page));
    const batch = await read(`/api/wp/employer?${query}`);
    if (!Array.isArray(batch)) throw Error('Invalid company response');
    imported.push(...batch);
    if (batch.length < 5000) break;
  }
  const local = await read('/api/local/employers');
  const merged = new Map(imported.map(item => [item.slug, item]));
  for (const item of local) merged.set(item.slug, item);
  const q = (params.get('q') || '').trim().toLowerCase();
  const category = (params.get('category') || '').toLowerCase();
  const location = (params.get('location') || '').toLowerCase();
  const values = value => Array.isArray(value) ? value : Object.values(value || {});
  const records = [...merged.values()].filter(item => {
    const m = item.metas || {};
    const categories = values(item.categories || m._employer_category);
    const locations = values(item.locations || m._employer_location);
    const text = [title(item), item.description, item.content?.rendered, ...categories, ...locations].join(' ').toLowerCase();
    return !item.autosaved && !item.slug?.startsWith('autosave-') && ['publish','published','active'].includes(item.status || 'publish') &&
      (!q || text.includes(q)) && (!category || categories.some(v => String(v).toLowerCase().includes(category))) &&
      (!location || locations.some(v => String(v).toLowerCase().includes(location))) &&
      Number(item.openJobs ?? m._employer_open_jobs ?? 0) >= Number(params.get('min_jobs') || 0);
  }).sort((a,b) => employerAddedTime(b)-employerAddedTime(a) || (Number(b.id)||0)-(Number(a.id)||0) || a.slug.localeCompare(b.slug));
  const page = Math.max(1, Number(params.get('page')) || 1);
  return {employers:records.slice((page-1)*pageSize,page*pageSize),total:records.length};
}
