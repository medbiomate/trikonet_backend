export function openJobTabs(value, origin, open) {
  const requested=Number(value);
  if(!Number.isInteger(requested)||requested<1||requested>10)throw new RangeError('Choose between 1 and 10 job tabs.');
  let opened=0;
  for(let i=0;i<requested;i++){
    // Retain a handle to detect blocked pop-ups; detach before navigating.
    const tab=open('about:blank','_blank');
    if(!tab)break;
    tab.opener=null;
    tab.location.href=new URL('/admin#job-new',origin).href;
    opened++;
  }
  return {opened,requested};
}
