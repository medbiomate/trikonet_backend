export function categorySuggestions(options, query) {
  const q = query.trim().toLowerCase();
  const matches = options.filter(option => !q || option.label.toLowerCase().includes(q));
  if (q) matches.sort((a,b) => Number(b.label.toLowerCase().startsWith(q))-Number(a.label.toLowerCase().startsWith(q)));
  return matches.slice(0,5);
}
export function initSearchCategoryPickers(root = document) {
  for (const select of root.querySelectorAll('.searchbar select[name="category"], .searchbar select[name="location"]')) {
    if (select.dataset.searchable) continue;
    select.dataset.searchable = 'true';
    const isLocation = select.name === 'location';
    const label = isLocation ? 'Location' : 'Category';
    const plural = isLocation ? 'locations' : 'categories';
    const options = [...select.options].map(option => ({value:option.value,label:option.textContent}));
    const wrap = document.createElement('div');
    wrap.className = 'search-category-picker';
    const button = document.createElement('button');
    button.type = 'button';button.className = 'search-category-trigger';
    button.setAttribute('aria-label',label);button.setAttribute('aria-expanded','false');button.setAttribute('aria-haspopup','listbox');
    const panel = document.createElement('div');panel.className = 'search-category-panel';panel.hidden = true;panel.setAttribute('popover','manual');
    const search = document.createElement('input');search.type = 'search';search.placeholder = `Search ${plural}…`;search.setAttribute('aria-label',`Search ${plural}`);search.autocomplete = 'off';
    const list = document.createElement('div');list.setAttribute('role','listbox');list.setAttribute('aria-label',label);
    panel.append(search,list);wrap.append(button,panel);
    // Replace the wrapping label: interactive search controls need their own labels.
    const field = select.parentElement;const container = document.createElement('div');container.className = field.className;
    field.replaceWith(container);container.append(select,wrap);select.hidden = true;
    const close = () => {if(panel.matches(':popover-open'))panel.hidePopover();panel.hidden = true;button.setAttribute('aria-expanded','false');};
    const update = () => {button.textContent = (select.selectedOptions[0]?.textContent || (isLocation ? 'Country or City' : 'All Categories')) + ' ▾';};
    const render = () => {
      list.replaceChildren();
      for (const option of categorySuggestions(options,search.value)) {
        const item = document.createElement('button');item.type = 'button';item.setAttribute('role','option');item.setAttribute('aria-selected',String(select.value===option.value));item.textContent = option.label;
        item.addEventListener('click',()=>{select.value = option.value;select.dispatchEvent(new Event('change',{bubbles:true}));update();close();button.focus();});list.append(item);
      }
      if (!list.children.length) {const empty=document.createElement('p');empty.textContent=`No matching ${plural}`;empty.setAttribute('role','status');list.append(empty);}
    };
    button.addEventListener('click',()=>{if(!panel.hidden){close();return;}search.value='';render();panel.hidden=false;
      if(panel.showPopover){
        panel.showPopover();
        const rect=button.getBoundingClientRect();
        const width=Math.min(Math.max(rect.width,260),window.innerWidth-24);
        panel.style.cssText=`position:fixed;inset:auto;margin:0;left:${Math.max(12,Math.min(rect.left,window.innerWidth-width-12))}px;top:${rect.bottom+8}px;width:${width}px;max-height:${Math.max(140,window.innerHeight-rect.bottom-20)}px;overflow-y:auto;`;
      }
      button.setAttribute('aria-expanded','true');search.focus();});
    search.addEventListener('input',render);
    wrap.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();button.focus();}
      if(event.key==='Enter' && event.target===search){event.preventDefault();list.querySelector('button')?.click();}
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){
        event.preventDefault();const items=[...list.querySelectorAll('button')];const index=items.indexOf(document.activeElement);items[(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();
      }
    });
    document.addEventListener('click',event=>{if(!wrap.contains(event.target))close();});
    wrap.addEventListener('focusout',event=>{if(!wrap.contains(event.relatedTarget))close();});
    window.addEventListener('resize',close);
    window.addEventListener('scroll',event=>{if(!panel.contains(event.target))close();},true);
    select.addEventListener('change',update);update();
  }
}
