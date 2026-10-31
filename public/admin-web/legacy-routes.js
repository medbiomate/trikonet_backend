// Redirect only known legacy routes with an equivalent current destination.
export function legacyDestination(path, params, taxonomies = {}, redirects = {}) {
  if (redirects[path]) return redirects[path];
  const fixed = {'/index.html':'/','/user-dashboard':'/profile','/my-account':'/profile','/my-applied':'/applied-jobs','/shortlist-jobs':'/saved-jobs','/cv-login':'/login'};
  if (fixed[path]) return fixed[path];
  const match = path.match(/^\/(job-category|employer-category|employer-location|job-type|job-tag)\/([^/]+)$/);
  if (match) {
    const [,type,slug] = match;
    const key = {'job-category':'categories','employer-category':'employerCategories','employer-location':'employerLocations','job-type':'types','job-tag':'tags'}[type];
    const term = (taxonomies[key] || []).find(item=>item.slug===slug);
    if (!term) return null;
    if (type==='job-category') return `/category/${encodeURIComponent(slug)}`;
    const target = new URL(type.startsWith('employer-')?'/employers':'/jobs','https://www.trikonet.com');
    target.searchParams.set({'employer-category':'category','employer-location':'location','job-type':'job_type','job-tag':'q'}[type],term.name);
    return target.pathname+target.search;
  }
  const paged=path.match(/^\/(jobs|employers)\/page\/([1-9]\d*)$/);
  if (paged) {const query=new URLSearchParams(params);query.set('page',paged[2]);return `/${paged[1]}?${query}`;}
  return null;
}
export function isFilteredListing(path,params) {
  return (['/jobs','/employers','/nurse-jobs-in-uae'].includes(path)||/^\/(category|job-location)\/[^/]+$/.test(path))
    && ['q','category','location','job_type','min_jobs','sort'].some(key=>params.has(key)&&params.get(key)!=='');
}
