// The async AdSense loader is already included once in index.html.
import { isPrivatePage } from './indexing-policy.js';

export function initDisplayAds() {
  if (['/', '/index.html'].includes(location.pathname.replace(/\/+$/, '') || '/')) return;
  if (isPrivatePage(location.pathname, new URLSearchParams(location.search))) return;
  if (/^404\b|page not found/i.test(document.title)) return;
  const article = document.querySelector('.post-article-content');
  if (article) { initBlogAds(article); return; }
  const jobs = document.querySelector('.jobs-layout, .nurse-results-layout');
  if (jobs) { initJobListingAds(jobs); return; }
  initJobDetailAd();
  // Keep company content and actions together, without an extra inserted ad.
  // The bottom slot is the only supplemental job-detail placement.
  initJobBottomAd();
  initEmployerJobsAds();
}

function initJobListingAds(jobs) {
  if (jobs.querySelector('[data-trikonet-job-list-ad]')) return;
  const feed = jobs.querySelector('.job-grid, .nurse-job-list');
  if (!feed || !feed.children.length) return;
  const cards = Array.from(feed.children);
  for (const [spot, cardIndex] of [4, 9].entries()) {
    if (!cards[cardIndex]) continue;
    const placement = document.createElement('aside');
    placement.className = 'site-ad';
    placement.dataset.trikonetJobListAd = String(spot + 1);
    placement.setAttribute('aria-label', 'Advertisement');
    placement.style.cssText = 'width:100%;max-width:1100px;min-width:0;grid-column:1 / -1;clear:both;';
    placement.innerHTML = '<div style="text-align:center;font:11px/1.5 system-ui;color:#64748b;margin-bottom:8px">Advertisement</div><ins class="adsbygoogle" style="display:block;min-height:250px" data-ad-client="ca-pub-4310822705633659" data-ad-slot="9017818388" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    const pagination = feed.parentElement.querySelector('.data-pagination');
    if (cardIndex === cards.length - 1 && pagination) pagination.after(placement);
    else cards[cardIndex].after(placement);
    initializeAd(placement.querySelector('ins'), true);
  }
}

function initBlogAds(article) {
  if (document.querySelector('[data-trikonet-blog-ad]')) return;
  const blocks = Array.from(article.children).filter(block =>
    ['P', 'UL', 'OL', 'BLOCKQUOTE', 'FIGURE', 'TABLE', 'DIV'].includes(block.tagName)
    && !block.classList.contains('content-feedback-section')
    && block.textContent.trim().length > 40
  );
  for (let spot = 0; spot < 5; spot++) {
    const placement = document.createElement('aside');
    placement.className = 'site-ad';
    placement.dataset.trikonetBlogAd = String(spot + 1);
    placement.setAttribute('aria-label', 'Advertisement');
    placement.style.cssText = 'width:100%;max-width:1100px;min-width:0;clear:both;';
    placement.innerHTML = '<div style="text-align:center;font:11px/1.5 system-ui;color:#64748b;margin-bottom:8px">Advertisement</div><ins class="adsbygoogle" style="display:block;min-height:250px" data-ad-client="ca-pub-4310822705633659" data-ad-slot="9017818388" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    if (spot === 0) article.before(placement);
    else if (spot === 4) article.after(placement);
    else if (blocks.length) blocks[Math.min(blocks.length - 1, Math.max(0, Math.ceil(blocks.length * spot / 4) - 1))].after(placement);
    else article.append(placement);
    initializeAd(placement.querySelector('ins'), true);
  }
}

function initJobDetailAd() {
  if (isPrivatePage(location.pathname, new URLSearchParams(location.search))) return;
  const main = document.querySelector('.detail-page.detail-exact:not(.employer-detail-page)');
  const grid = main?.querySelector('.detail-grid:not(.employer-detail-grid)');
  if (!grid || main.querySelector('[data-trikonet-job-detail-ad]')) return;
  const mobile = window.matchMedia('(max-width: 850px)').matches;
  const heading = main.querySelector('.job-description .job-desc-heading');
  if (!mobile && !heading) return;
  const placement = document.createElement('aside');
  placement.className = 'site-ad';
  placement.dataset.trikonetJobDetailAd = '';
  placement.className = 'site-ad job-detail-ad';
  placement.style.cssText = 'width:calc(100% - 32px);max-width:1100px;min-width:0;clear:both;';
  placement.setAttribute('aria-label', 'Advertisement');
  placement.innerHTML = '<div class="job-detail-ad-label" style="text-align:center;font:11px/1.5 system-ui;color:#64748b;margin-bottom:8px">Advertisement</div><ins class="adsbygoogle" style="display:block;min-height:250px" data-ad-client="ca-pub-4310822705633659" data-ad-slot="9017818388" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  if (mobile) grid.before(placement);
  else {
    placement.style.cssText = 'display:block;width:100%;min-width:0;margin:24px 0 32px;clear:both;';
    heading.after(placement);
  }
  initializeAd(placement.querySelector('ins'));
}

function initAdditionalFeedAd() {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || isPrivatePage(path, new URLSearchParams(location.search))) return;
  if (document.querySelector('[data-trikonet-additional-feed-ad], #cv-builder-root, .not-found-page')) return;
  if (/^404\b|page not found/i.test(document.title)) return;
  const main = document.querySelector('#app main');
  if (!main) return;
  const placement = document.createElement('aside');
  placement.className = 'site-ad';
  placement.dataset.trikonetAdditionalFeedAd = '';
  placement.setAttribute('aria-label', 'Advertisement');
  placement.style.cssText = 'width:calc(100% - 32px);max-width:1100px;min-width:0;clear:both;';
  placement.innerHTML = '<div style="text-align:center;font:11px/1.5 system-ui;color:#64748b;margin-bottom:8px">Advertisement</div><ins class="adsbygoogle" style="display:block;min-height:250px" data-ad-format="auto" data-full-width-responsive="true" data-ad-client="ca-pub-4310822705633659" data-ad-slot="9017818388"></ins>';
  const companyCard = main.querySelector('.job-description .detail-about-company-card');
  if (companyCard) {
    placement.style.width = '100%';
    companyCard.before(placement);
  } else {
    const tabs = main.querySelector('.emp-profile-tabs-strip');
    const about = tabs && main.querySelector('.emp-about-block');
    if (about && window.matchMedia('(min-width: 851px)').matches) {
      placement.style.cssText = 'display:block;width:100%;min-width:0;clear:both;';
      about.after(placement);
    } else if (tabs) tabs.before(placement);
    else main.append(placement);
  }
  initializeAd(placement.querySelector('ins'));
}

function initOtherJobsAd() {
  const section = document.querySelector('.detail-exact .detail-org-jobs-box');
  if (!section || document.querySelector('[data-trikonet-other-jobs-ad]')) return;
  const placement = document.createElement('aside');
  placement.className = 'site-ad';
  placement.dataset.trikonetOtherJobsAd = '';
  placement.setAttribute('aria-label', 'Advertisement');
  placement.style.cssText = 'display:block;width:100%;min-width:0;order:1;';
  placement.innerHTML = '<div style="text-align:center;font:11px/1.5 system-ui;color:#64748b;margin-bottom:8px">Advertisement</div><ins class="adsbygoogle" style="display:block;min-height:250px" data-ad-client="ca-pub-4310822705633659" data-ad-slot="9017818388" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  section.before(placement);
  initializeAd(placement.querySelector('ins'), true);
}

function initJobBottomAd() {
  const main = document.querySelector('.detail-page.detail-exact:not(.employer-detail-page)');
  if (!main || main.querySelector('[data-trikonet-job-bottom-ad]')) return;
  const placement = document.createElement('aside');
  placement.className = 'site-ad';
  placement.dataset.trikonetJobBottomAd = '';
  placement.setAttribute('aria-label', 'Advertisement');
  placement.style.cssText = 'display:block;width:calc(100% - 32px);max-width:1100px;min-width:0;';
  placement.innerHTML = '<div style="text-align:center;font:11px/1.5 system-ui;color:#64748b;margin-bottom:8px">Advertisement</div><ins class="adsbygoogle" style="display:block;min-height:250px" data-ad-client="ca-pub-4310822705633659" data-ad-slot="9017818388" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  main.append(placement);
  initializeAd(placement.querySelector('ins'), true);
}

function initEmployerJobsAds() {
  const list = document.querySelector('.emp-positions-list');
  if (!list || list.querySelector('[data-trikonet-employer-jobs-ad]')) return;
  const cards = Array.from(list.children);
  // Place ads between cards, with at least five jobs between placements.
  for (let index = 4; index < cards.length - 1 && index < 10; index += 5) {
    const placement = document.createElement('aside');
    placement.className = 'site-ad';
    placement.dataset.trikonetEmployerJobsAd = '';
    placement.setAttribute('aria-label', 'Advertisement');
    placement.style.cssText = 'width:100%;min-width:0;grid-column:1 / -1;';
    placement.innerHTML = '<div style="text-align:center;font:11px/1.5 system-ui;color:#64748b;margin-bottom:8px">Advertisement</div><ins class="adsbygoogle" style="display:block;min-height:250px" data-ad-client="ca-pub-4310822705633659" data-ad-slot="9017818388" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    cards[index].after(placement);
    initializeAd(placement.querySelector('ins'));
  }
}

function initializeAd(ad, lazy = false) {
  if (lazy && typeof IntersectionObserver !== 'undefined') {
    const viewport = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      viewport.disconnect();
      initializeAd(ad);
    }, { rootMargin: '300px' });
    viewport.observe(ad);
    return;
  }
  // Request only once, once the responsive container has a measurable width.
  const resize = new ResizeObserver(() => {
    if (!ad.isConnected || ad.getBoundingClientRect().width <= 0) return;
    resize.disconnect();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn('Trikonet display ad could not initialize:', error);
    }
  });
  resize.observe(ad);
}
