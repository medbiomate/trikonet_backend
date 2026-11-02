import {createApplyDockState} from './apply-dock-state.js';
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

export function initMobileApplyAfterCompany(root = document) {
  const card = root.querySelector('.job-apply-box');
  const actions = card?.querySelector('.detail-actions');
  if (!actions?.querySelector('.apply') || card.dataset.companyDockReady) return;
  card.dataset.companyDockReady = 'true';
  const media = matchMedia('(max-width: 850px)');
  const slot = document.createElement('div');
  slot.className = 'job-apply-action-slot';
  actions.before(slot); slot.append(actions);
  const desktopActions = root.querySelector('.detail-hero .detail-action-group');
  let inlineHeight = actions.getBoundingClientRect().height;
  const detectDock = createApplyDockState(scrollY);
  const update = () => {
    if (!media.matches && desktopActions && actions.parentElement !== desktopActions) desktopActions.append(actions);
    if (media.matches && actions.parentElement !== slot) slot.append(actions);
    if (!actions.classList.contains('is-company-passed')) inlineHeight = actions.getBoundingClientRect().height;
    // Company details may arrive after the main job content.
    const company = root.querySelector('.job-description .detail-about-company-card');
    const docked = detectDock({y: Math.max(0, scrollY), mobile: media.matches, companyBottom: company?.getBoundingClientRect().bottom});
    slot.style.minHeight = docked ? `${inlineHeight}px` : '';
    actions.classList.toggle('is-company-passed', docked);
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
