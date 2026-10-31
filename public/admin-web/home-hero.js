const escapeAttr=value=>String(value||'').replaceAll('&','&amp;').replaceAll('\"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function renderHomeHero(s={}, {data, queryParams, customSelect}){
  const heroTitle = (s.title && s.title !== 'Trying to Connect') ? s.title : 'Find your next <span class="hero-title-gradient">career move</span> in the UAE';

  const liveCount = (data.counts && data.counts.job_listing) ? data.counts.job_listing : 13621;
  const formattedCount = Number(liveCount).toLocaleString() + '+';
  let subtitleHtml;
  if (s.subtitle && s.subtitle.trim() && s.subtitle !== 'Over 13,600+ Verified Jobs Across Dubai, Abu Dhabi & the GCC') {
    if (/\d[\d,]*\+?/.test(s.subtitle)) {
      subtitleHtml = escapeAttr(s.subtitle).replace(/\d[\d,]*\+?/, `<span class="hero-live-job-count" data-live-job-count>${formattedCount}</span>`);
    } else {
      subtitleHtml = escapeAttr(s.subtitle);
    }
  } else {
    subtitleHtml = `Over <span class="hero-live-job-count" data-live-job-count>${formattedCount}</span> Verified Jobs Across Dubai, Abu Dhabi & the GCC`;
  }

  return `<section class="hero-minimal">
    <div class="hero-minimal-wrap">
      <div class="hero-premium-pill">
        <span class="hero-pill-sparkle">✦</span>
        <span>Verified Opportunities Across UAE &amp; GCC</span>
      </div>

      <h1 class="hero-minimal-title">${heroTitle}</h1>
      <p class="hero-minimal-subtitle">${subtitleHtml}</p>

      <div class="hero-minimal-search-box">
        <form class="hero-minimal-search-form" action="/jobs" method="GET">
          <div class="hero-minimal-field field-keyword">
            <svg class="hero-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input class="hero-minimal-input" name="q" value="${escapeAttr(queryParams.get('q')||'')}" placeholder="Job title, skills, or company" aria-label="Job title or keywords">
          </div>

          <div class="hero-minimal-divider"></div>

          <div class="hero-minimal-field field-location">
            <svg class="hero-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${customSelect('location', data.taxonomies.locations, 'All Locations', queryParams.get('location') || '')}
          </div>

          <div class="hero-minimal-divider"></div>

          <div class="hero-minimal-field field-category">
            <svg class="hero-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <div class="category-autocomplete-wrap" id="category-autocomplete">
              <input
                type="text"
                class="category-input"
                name="category"
                id="category-search-input"
                value="${escapeAttr(queryParams.get('category') || '')}"
                placeholder="All Categories"
                autocomplete="off"
                aria-label="Job category"
              >
              <button type="button" class="category-clear-btn" id="category-clear-btn" aria-label="Clear category" style="display:${queryParams.get('category') ? 'flex' : 'none'};">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div class="category-suggestions-box" id="category-suggestions">
                <ul class="category-suggestions-list" role="listbox"></ul>
              </div>
            </div>
          </div>

          <button type="submit" class="hero-minimal-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Search</span>
          </button>
        </form>
      </div>

      <div class="hero-minimal-trending">
        <span class="trending-label">Popular:</span>
        <a class="trending-chip" href="/jobs?q=Nurse">Nurse</a>
        <a class="trending-chip" href="/jobs?q=Doctor">Doctor</a>
        <a class="trending-chip" href="/jobs?q=Accountant">Accountant</a>
        <a class="trending-chip" href="/jobs?q=Software">Software</a>
        <a class="trending-chip" href="/jobs?q=Sales">Sales</a>
        <a class="trending-chip" href="/jobs?q=Driver">Driver</a>
      </div>

      <div class="hero-minimal-image-wrap">
        <img class="hero-minimal-image" src="/assets/hero-team-1116.webp" srcset="/assets/hero-team-640.webp 640w, /assets/hero-team-1116.webp 1116w" sizes="(max-width: 700px) 100vw, 720px" fetchpriority="high" decoding="async" alt="Trikonet UAE Professionals Team" width="1116" height="542">
      </div>
    </div>
  </section>`;
}
