const hambBtn=document.querySelector('.hamb');
hambBtn?.addEventListener('click',function(){
  const links=document.querySelector('.links');
  const isOpen=links?.classList.toggle('open');
  this.classList.toggle('open',!!isOpen);
  this.setAttribute('aria-expanded',isOpen?'true':'false');
  document.body.classList.toggle('mobile-nav-open',!!isOpen);
});
const closeMobileNavigation=()=>{
  document.querySelector('.links')?.classList.remove('open');
  document.querySelector('.hamb')?.classList.remove('open');
  document.querySelector('.hamb')?.setAttribute('aria-expanded','false');
  document.body.classList.remove('mobile-nav-open');
};
document.querySelectorAll('.mobile-nav-actions a').forEach(link=>link.addEventListener('click',closeMobileNavigation));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMobileNavigation();}});
document.querySelectorAll('.nav-has-mega > .nav-link, .nav-has-dropdown > .nav-link').forEach(link => {
  link.addEventListener('click', e => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      const parent = link.closest('.nav-item');
      if (parent) {
        const isCurrentOpen = parent.classList.contains('mobile-expanded');
        document.querySelectorAll('.nav-item.mobile-expanded').forEach(item => item.classList.remove('mobile-expanded'));
        if (!isCurrentOpen) parent.classList.add('mobile-expanded');
      }
    }
  });
});
window.addEventListener('resize', () => {
  if (window.innerWidth <= 1100) return;
  const links = document.querySelector('.links');
  const button = document.querySelector('.hamb');
  links?.classList.remove('open');
  button?.classList.remove('open');
  button?.setAttribute('aria-expanded', 'false');
  document.querySelectorAll('.nav-item.mobile-expanded').forEach(item => item.classList.remove('mobile-expanded'));
  document.body.classList.remove('mobile-nav-open');
});
