export function jobEditorUrls(currentUrl, count, createId = () => crypto.randomUUID()) {
  if (!Number.isInteger(count) || count < 1 || count > 10) throw Error('Choose between 1 and 10 jobs.');
  return Array.from({length:count},()=>{
    const url=new URL(currentUrl);
    url.search='';url.searchParams.set('editor',createId());url.hash='job-new';
    return url.href;
  });
}
export function initJobEditorLauncher() {
  const count=document.getElementById('job-launch-count');
  const status=document.getElementById('job-launch-status');
  const links=document.getElementById('job-launch-links');
  if(!count||!status||!links)return;
  const triggers='#new-job-top,#new-job-link,#header-add-job-btn';
  for(const trigger of document.querySelectorAll(triggers)) trigger.href=jobEditorUrls(location.href,1)[0];
  document.addEventListener('pointerdown',event=>{
    const trigger=event.target.closest(triggers);
    if(trigger)trigger.href=jobEditorUrls(location.href,1)[0];
  },true);
  document.addEventListener('click',event=>{
    const trigger=event.target.closest(triggers);
    if(!trigger||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();event.stopImmediatePropagation();
    const useCount=trigger.id==='new-job-top';
    if(useCount&&!count.reportValidity()){count.focus();return;}
    const urls=jobEditorUrls(location.href,useCount?Number(count.value):1);
    status.textContent='';links.replaceChildren();
    if(urls.length===1){location.assign(urls[0]);return;}
    let blocked=0;
    urls.forEach((url,index)=>{
      const tab=window.open(url,'_blank');
      if(tab){try{tab.opener=null;}catch{}return;}
      blocked++;
      const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent=`Open job editor ${index+1}`;link.style.cssText='display:block;color:#2563eb;padding:8px 0;text-decoration:underline';links.append(link);
    });
    status.textContent=blocked?`${urls.length-blocked} editors opened. Your browser blocked ${blocked}. Use these links to open the remaining editors.`:`${urls.length} separate job editors opened.`;
  },true);
}
