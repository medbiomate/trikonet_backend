import {employerAddedTime} from './recent-employers.js';
import {formatCompanyName} from './company-name.js';
const escapeAttr=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decodeHtml=value=>String(value??'').replace(/&amp;/g,'&').replace(/&#039;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
export function renderEmployerDirectory({data,queryParams,currentPage=1,pageSize=10,pager=()=>''}) {
  const employersList = (data.employers || []);
  const total = data.employerResultTotal ?? data.counts.employer ?? employersList.length;
  const start = total ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(start + employersList.length - 1, total);
  
  const q = queryParams.get('q') || '';
  const selectedLocation = queryParams.get('location') || '';
  const selectedCategory = queryParams.get('category') || '';
  const selectedMinJobs = queryParams.get('min_jobs') || '';
  const sort = queryParams.get('sort') || 'default';

  let list = [...employersList];
  if (sort === 'recent') {
    list.sort((a,b) => employerAddedTime(b)-employerAddedTime(a));
  } else if (sort === 'jobs') {
    list.sort((a, b) => (b.openJobs || 0) - (a.openJobs || 0));
  } else if (sort === 'az') {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sort === 'za') {
    list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  }

  const catCountMap = new Map((data.taxonomies?.employerCategories || []).map(c => [c.name.toLowerCase(), Number(c.count)]));
  const getCatCount = (name, fallback) => {
    const val = catCountMap.get(name.toLowerCase());
    return (val !== undefined && val !== null && !isNaN(val)) ? val : fallback;
  };

  const locCountMap = new Map((data.taxonomies?.employerLocations || []).map(l => [l.name.toLowerCase(), Number(l.count)]));
  const getLocCount = (name, fallback) => {
    let val = locCountMap.get(name.toLowerCase());
    if ((val === undefined || isNaN(val)) && name.toLowerCase() === 'uae') {
      val = locCountMap.get('united arab emirates');
    }
    return (val !== undefined && val !== null && !isNaN(val)) ? val : fallback;
  };

  const topStripCategories = [
    { title: 'Healthcare', subtitle: `${getCatCount('Healthcare', 271)} Companies`, qParam: 'Healthcare' },
    { title: 'Hospitals & Clinics', subtitle: `${getCatCount('Hospital', 107)} Companies`, qParam: 'Hospital' },
    { title: 'IT & Technology', subtitle: `${getCatCount('Information Technology', 63)} Companies`, qParam: 'Information Technology' },
    { title: 'Education', subtitle: `${getCatCount('Educational Services', 339)} Companies`, qParam: 'Educational Services' },
    { title: 'Banking & Finance', subtitle: `${getCatCount('Banking', 33) + getCatCount('Finance and Insurance', 83)} Companies`, qParam: 'Banking' },
    { title: 'Hospitality', subtitle: `${getCatCount('Hospitality', 103)} Companies`, qParam: 'Hospitality' },
    { title: 'Real Estate', subtitle: `${getCatCount('Real Estate', 392)} Companies`, qParam: 'Real Estate' },
    { title: 'Construction', subtitle: `${getCatCount('Construction', 113)} Companies`, qParam: 'Construction' },
    { title: 'Retail & Commerce', subtitle: `${getCatCount('Retail', 92)} Companies`, qParam: 'Retail' }
  ];

  const buildFilterUrl = (overrides = {}) => {
    const params = new URLSearchParams(queryParams);
    params.delete('page');
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === '' || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    return `/employers${qs ? `?${qs}` : ''}`;
  };

  const hasActiveFilters = Boolean(q || selectedLocation || selectedCategory || selectedMinJobs);

  const sidebarCategoryKeys = [
    { name: 'Healthcare', fallback: 271 },
    { name: 'Hospital', fallback: 107 },
    { name: 'Educational Services', fallback: 339 },
    { name: 'Information Technology', fallback: 63 },
    { name: 'Banking', fallback: 33 },
    { name: 'Finance and Insurance', fallback: 83 },
    { name: 'Hospitality', fallback: 103 },
    { name: 'Real Estate', fallback: 392 },
    { name: 'Construction', fallback: 113 },
    { name: 'Manufacturing', fallback: 112 },
    { name: 'Retail', fallback: 92 },
    { name: 'Accounting', fallback: 78 },
    { name: 'Business Consulting and Services', fallback: 70 },
    { name: 'Other Services', fallback: 130 }
  ];

  const sidebarCategories = sidebarCategoryKeys.map(cat => ({
    name: cat.name,
    count: Number(getCatCount(cat.name, cat.fallback)).toLocaleString()
  }));

  const sidebarLocationKeys = [
    { name: 'UAE', fallback: 655 },
    { name: 'Abu Dhabi', fallback: 450 },
    { name: 'Dubai', fallback: 1680 },
    { name: 'Sharjah', fallback: 122 },
    { name: 'Ajman', fallback: 62 },
    { name: 'Umm Al Quwain', fallback: 10 },
    { name: 'Ras Al Khaimah', fallback: 37 },
    { name: 'Fujairah', fallback: 18 },
    { name: 'Al Ain', fallback: 20 }
  ];

  const sidebarLocations = sidebarLocationKeys.map(loc => ({
    name: loc.name,
    count: Number(getLocCount(loc.name, loc.fallback)).toLocaleString()
  }));

  const vacancyFilters = [
    { label: 'All Companies', value: '' },
    { label: 'Actively Hiring (1+ jobs)', value: '1' },
    { label: 'High Hiring (5+ jobs)', value: '5' },
    { label: 'Mass Hiring (10+ jobs)', value: '10' }
  ];

  const getEmpRating = employer => {
    const explicitReviews = Number(employer?.reviewCount || employer?.metas?._employer_review_count || 0);
    const explicitRating = Number(employer?.rating || employer?.metas?._employer_rating || 0);
    if (explicitReviews > 0 && explicitRating > 0) {
      return { rating: explicitRating.toFixed(1), reviews: explicitReviews };
    }
    try {
      const stored = JSON.parse(localStorage.getItem(`trikonet_emp_reviews_${employer?.slug || ''}`) || '[]');
      if (!Array.isArray(stored) || stored.length === 0) return null;
      const valid = stored.filter(review => Number(review?.ratingScore) > 0);
      if (valid.length === 0) return null;
      const average = valid.reduce((sum, review) => sum + Number(review.ratingScore), 0) / valid.length;
      return { rating: average.toFixed(1), reviews: valid.length };
    } catch {
      return null;
    }
  };

  return `<main class="emp-directory-page">
    <div class="wrap">
      <!-- Top Strip: Top companies hiring now (Trikonet Signature Crimson Red Branding) -->
      <section class="emp-top-hiring-strip" aria-label="Top companies hiring now">
        <div class="emp-top-hiring-head">
          <span class="emp-top-eyebrow">EXPLORE BY INDUSTRY</span>
          <h2>Top companies hiring now</h2>
        </div>
        <div class="emp-top-hiring-wrap">
          <button type="button" class="emp-top-arrow-btn prev" id="empTopPrevBtn" aria-label="Scroll to previous categories">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="emp-top-hiring-track" id="empTopHiringTrack">
            ${topStripCategories.map(cat => {
              const isActive = selectedCategory.toLowerCase() === cat.qParam.toLowerCase();
              return `<a href="${buildFilterUrl({ category: isActive ? null : cat.qParam, q: null })}" class="emp-top-hiring-card${isActive ? ' active' : ''}">
                <strong>${escapeAttr(cat.title)}</strong>
                <span class="emp-top-count">${cat.subtitle} <span class="arrow">›</span></span>
              </a>`;
            }).join('')}
          </div>
          <button type="button" class="emp-top-arrow-btn" id="empTopNextBtn" aria-label="Scroll next categories">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </section>

      <section class="emp-directory-search" aria-label="Search companies">
        <div class="emp-directory-search-copy">
          <strong>Find a company</strong>
          <span>Search by company name, industry, or location</span>
        </div>
        <form class="emp-search-form emp-search-form-prominent" action="/employers" method="GET" onsubmit="event.preventDefault(); const val=this.q.value.trim(); location.href='${buildFilterUrl({ q: null })}'+(val?('${buildFilterUrl({ q: null })}'.includes('?')?'&':'?')+'q='+encodeURIComponent(val):'');">
          <div class="emp-search-input-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="search" name="q" value="${escapeAttr(q)}" placeholder="Search companies…" aria-label="Search companies">
          </div>
          <button type="submit" class="emp-directory-search-btn">
            <span>Search</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </form>
      </section>

      <!-- Main Layout: Sidebar Filters + Right Listings -->
      <div class="emp-main-layout">
        <!-- Left Filters Sidebar -->
        <aside class="emp-filters-sidebar">
          <div class="emp-filters-head">
            <h3>All Filters</h3>
            ${hasActiveFilters ? `<a href="/employers" class="emp-clear-all">Clear All</a>` : ''}
          </div>

          <button type="button" class="emp-mobile-filter-toggle" id="empMobileFilterToggle" aria-expanded="false" aria-controls="empExpandableFilters">
            <span>Show filters</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <div class="emp-expandable-filters" id="empExpandableFilters">

          <!-- Company Type / Industry Filter Group -->
          <div class="emp-filter-group">
            <h4>
              <span>Company Type</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </h4>
            <div class="emp-filter-list">
              ${sidebarCategories.map(cat => {
                const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return `<a href="${buildFilterUrl({ category: isActive ? null : cat.name, q: null })}" class="emp-filter-row${isActive ? ' active' : ''}">
                  <span class="emp-checkbox${isActive ? ' checked' : ''}">${isActive ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}</span>
                  <span class="label">${escapeAttr(cat.name)}</span>
                  <span class="count">(${cat.count})</span>
                </a>`;
              }).join('')}
            </div>
          </div>

          <!-- Location Filter Group -->
          <div class="emp-filter-group">
            <h4>
              <span>Location</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </h4>
            <div class="emp-filter-list">
              ${sidebarLocations.map(loc => {
                const isActive = selectedLocation.toLowerCase() === loc.name.toLowerCase();
                return `<a href="${buildFilterUrl({ location: isActive ? null : loc.name })}" class="emp-filter-row${isActive ? ' active' : ''}">
                  <span class="emp-checkbox${isActive ? ' checked' : ''}">${isActive ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}</span>
                  <span class="label">${escapeAttr(loc.name)}</span>
                  <span class="count">(${loc.count})</span>
                </a>`;
              }).join('')}
            </div>
          </div>

          <!-- Open Vacancies Group -->
          <div class="emp-filter-group">
            <h4>
              <span>Open Vacancies</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </h4>
            <div class="emp-filter-list">
              ${vacancyFilters.map(v => {
                const isActive = selectedMinJobs === v.value;
                return `<a href="${buildFilterUrl({ min_jobs: isActive ? null : (v.value || null) })}" class="emp-filter-row${isActive ? ' active' : ''}">
                  <span class="emp-checkbox${isActive ? ' checked' : ''}">${isActive ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}</span>
                  <span class="label">${escapeAttr(v.label)}</span>
                </a>`;
              }).join('')}
            </div>
          </div>
          </div>
        </aside>

        <!-- Right Column: Listing Pane -->
        <section class="emp-listing-pane" aria-label="Company Listings">
          <div class="emp-listing-top">
            <div class="emp-results-count">
              ${total > 0 ? `Showing <strong class="emp-count-highlight">${start} – ${end}</strong> of <strong class="emp-count-highlight">${total.toLocaleString()}</strong> companies` : (data.employersLoadError?'Companies could not be loaded. Please retry.':'No companies found matching your filters')}
            </div>
            <div class="emp-listing-sorts">
              <select onchange="window.location.href=this.value" aria-label="Sort Companies">
                <option value="${buildFilterUrl({ sort: null })}"${sort === 'default' ? ' selected' : ''}>Sort by: Recommended</option>
                <option value="${buildFilterUrl({ sort: 'recent' })}"${sort === 'recent' ? ' selected' : ''}>Recently Added</option>
                <option value="${buildFilterUrl({ sort: 'jobs' })}"${sort === 'jobs' ? ' selected' : ''}>Most Open Jobs</option>
                <option value="${buildFilterUrl({ sort: 'az' })}"${sort === 'az' ? ' selected' : ''}>Company Name (A - Z)</option>
                <option value="${buildFilterUrl({ sort: 'za' })}"${sort === 'za' ? ' selected' : ''}>Company Name (Z - A)</option>
              </select>
            </div>
          </div>

          <!-- 2-Column Naukri Cards Grid -->
          <div class="emp-naukri-grid">
            ${list.length > 0 ? list.map(e => {
              const displayTitle = formatCompanyName(decodeHtml(e.title || ''));
              const initials = displayTitle.split(/\s+/).map(x => x[0]).join('').slice(0, 3).toUpperCase() || 'CO';
              const reviewData = getEmpRating(e);
              const primaryCat = decodeHtml((e.categories && e.categories[0]) || 'Corporate');
              const primaryLoc = decodeHtml((e.locations && e.locations[0]) || '');
              const openJobs = e.openJobs || 0;

              return `<a href="/employer/${e.slug}" class="emp-naukri-card">
                <div class="emp-naukri-logo">
                  ${e.logo ? `<img src="${e.logo}" alt="${escapeAttr(displayTitle)}" loading="lazy">` : `<div class="emp-naukri-fallback">${initials}</div>`}
                </div>
                <div class="emp-naukri-info">
                  <h3 class="emp-naukri-title" title="${escapeAttr(displayTitle)}">${escapeAttr(displayTitle)}</h3>
                  <div class="emp-naukri-meta">
                    ${reviewData ? `<span class="emp-rating-pill">★ ${reviewData.rating}</span><span class="emp-meta-divider">|</span><span class="emp-reviews-count">${reviewData.reviews} ${reviewData.reviews === 1 ? 'review' : 'reviews'}</span>` : ''}
                    <span class="emp-jobs-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> ${openJobs} ${openJobs === 1 ? 'Job' : 'Jobs'} Hiring</span>
                  </div>
                  <div class="emp-naukri-tags">
                    <span class="emp-pill-tag">${escapeAttr(primaryCat)}</span>
                    ${primaryLoc ? `<span class="emp-pill-tag loc"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>${escapeAttr(primaryLoc)}</span>` : ''}
                  </div>
                </div>
                <div class="emp-naukri-arrow" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </a>`;
            }).join('') : `
              <div class="emp-empty-card">
                <h3>${data.employersLoadError?'Companies are temporarily unavailable':'No companies found'}</h3>
                <p>Try adjusting your search keywords, location or company type filters.</p>
                <div style="margin-top: 16px;">
                  <a href="/employers" class="primary" style="display:inline-block; padding:8px 20px; border-radius:10px; background:#b00008; color:#fff; text-decoration:none; font-weight:600; font-size:13.5px;">View All Companies</a>
                </div>
              </div>
            `}
          </div>

          <!-- Pagination -->
          ${pager('/employers', total)}
        </section>
      </div>
    </div>
  </main>`;
}
