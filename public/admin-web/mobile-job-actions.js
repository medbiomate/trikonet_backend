// Reuse the original controls so application and save handlers stay attached.
export function initMobileJobActions(root = document) {
  const hero = root.querySelector('.detail-exact .detail-hero:not(.employer-hero)');
  const actions = hero?.querySelector('.detail-actions');
  const title = hero?.querySelector('.detail-title');
  if (!actions || !title || actions.closest('.mobile-job-action-slot')) return;
  const slot = document.createElement('div');
  slot.className = 'mobile-job-action-slot';
  actions.before(slot);
  slot.append(actions);
  const originalParent = slot.parentElement;
  const media = matchMedia('(max-width: 850px)');
  const update = () => {
    const mobile = media.matches;
    if (mobile && slot.parentElement !== title) title.append(slot);
    if (!mobile && slot.parentElement !== originalParent) originalParent.append(slot);
    // Show only after the reader has passed the header by a short distance.
    const docked = mobile && hero.getBoundingClientRect().bottom <= -80;
    actions.classList.toggle('is-scroll-docked', docked);
    slot.style.minHeight = '';
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  media.addEventListener('change', schedule);
  update();
}

// Keep the existing Follow button and its account state; change only placement.
export function initMobileEmployerFollow(root = document) {
  const header = root.querySelector('.emp-profile-header-card');
  const dock = header?.querySelector('.emp-follow-dock');
  if (!dock || dock.dataset.scrollFollowReady) return;
  dock.dataset.scrollFollowReady = 'true';
  const media = matchMedia('(max-width: 850px)');
  const update = () => dock.classList.toggle('is-scroll-docked', media.matches && header.getBoundingClientRect().bottom <= -80);
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  media.addEventListener('change', schedule);
  update();
}
