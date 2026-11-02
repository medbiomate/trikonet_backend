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
