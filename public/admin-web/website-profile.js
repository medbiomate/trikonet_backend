import {createProfileField} from './profile-field-editor.js?v=20261018-textarea-13';
export const websiteProfileSections=[
 {id:'contact',title:'Contact info',icon:'user',keys:['name','email','phone','nationality','currentLocation']},
 {id:'professional',title:'Professional details',icon:'briefcase',keys:['experience','currentSalary','industry','specialization','previousEmployers','currentDesignation','departmentExperience','workExperience']},
 {id:'job',title:'Job info',icon:'search',keys:['role','category','locations','salaryExpectation','availability','hospitalType','noticePeriod']},
 {id:'skills',title:'Key skills',icon:'spark',keys:['skills']},
 {id:'education',title:'Qualifications',icon:'book',keys:['qualification','degree','specialization','university','educationEntries','education']},
 {id:'awards',title:'Awards & achievements',icon:'award',keys:['accomplishments']},
 {id:'personal',title:'Personal details',icon:'user',keys:['dateOfBirth','age','gender','maritalStatus','workPermit','permanentAddress','hometown','postalCode','address']},
 {id:'licenses',title:'Professional licenses',icon:'award',keys:['licenses','licenseDetails','licenseStatus','licenseExpiry','certifications']},
 {id:'languages',title:'Languages',icon:'globe',keys:['languages','languageDetails']},
 {id:'preferences',title:'Work preferences',icon:'briefcase',keys:['visaStatus','preferredDepartment','relocationPreference','preferredDistance','workType','shiftPreference']},
 {id:'about',title:'About me',icon:'book',keys:['summary','website','linkedin','socialLinks']}
];
const arrayKeys=new Set(['locations','educationEntries','licenses','languages','accomplishments']);
const objectKeys=new Set(['licenseDetails','languageDetails']);
const names={role:'Desired job role',hospitalType:'Preferred employer',locations:'Preferred locations',salaryExpectation:'Expected salary',dateOfBirth:'Date of birth',postalCode:'ZIP / PIN code',linkedin:'LinkedIn',summary:'Professional summary'};
const label=key=>names[key]||key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const paths={user:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>',search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',book:'<path d="M12 5v16M12 5C8 2 3 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z"/>',award:'<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z"/>',spark:'<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.user}</svg>`;
const filled=value=>Array.isArray(value)?value.length>0:value&&typeof value==='object'?Object.keys(value).length>0:String(value??'').trim().length>0;
export function createCandidateProfile({getCurrentUser,escapeAttr,calculateCandidateCompletion}){
 const escape=value=>escapeAttr(String(value??''));
 const printable=value=>{
  if(Array.isArray(value))return value.map(item=>typeof item==='object'?[item.title||item.course||item.role||item.level,item.institution||item.organization,item.university,item.date||item.endYear,item.description].filter(Boolean).join(' · '):String(item)).filter(Boolean).join('\n');
  if(value&&typeof value==='object')return Object.entries(value).map(([key,item])=>`${label(key)}: ${typeof item==='object'?Object.entries(item).filter(([,v])=>filled(v)).map(([k,v])=>`${label(k)}: ${Array.isArray(v)?v.join(', '):v}`).join(' · '):item}`).join('\n');
  return String(value??'');
 };
 function details(section,p){
  if(section.id==='skills'){
   const skills=Array.isArray(p.skills)?p.skills:String(p.skills||'').split(/[,\n]+/).map(s=>s.trim()).filter(Boolean);
   return skills.length?`<div class="web-profile-chips">${skills.map(skill=>`<span>${escape(skill)}</span>`).join('')}</div>`:'<p class="web-profile-empty">Add skills that show what you do best.</p>';
  }
  if(section.id==='education'&&p.educationEntries?.length)return `<div class="web-profile-records">${p.educationEntries.map(entry=>`<article>${icon('book')}<div><strong>${escape(entry.course||entry.level||'Qualification')}</strong><p>${escape([entry.institution,entry.university].filter(Boolean).join(' · '))}</p><small>${escape([entry.startYear,entry.endYear,entry.mode,entry.specialization,entry.score].filter(Boolean).join(' · '))}</small></div></article>`).join('')}</div>`;
  if(section.id==='awards'&&p.accomplishments?.length)return `<div class="web-profile-records">${p.accomplishments.map(entry=>`<article>${icon('award')}<div><strong>${escape(entry.title||'Accomplishment')}</strong><small>${escape([entry.kind,entry.organization,entry.date].filter(Boolean).join(' · '))}</small><p>${escape(entry.description||'')}</p></div></article>`).join('')}</div>`;
  if(['languages','licenses'].includes(section.id)&&p[section.id]?.length)return `<div class="web-profile-records">${p[section.id].map(name=>`<article>${icon(section.icon)}<div><strong>${escape(name)}</strong><small>${escape(printable((section.id==='languages'?p.languageDetails:p.licenseDetails)?.[name])||'Add details')}</small></div></article>`).join('')}</div>`;
  const keys=section.keys.filter(key=>!['educationEntries','workExperience','licenseDetails','languageDetails','socialLinks','education'].includes(key)||filled(p[key]));
  return `<dl class="web-profile-details">${keys.map(key=>`<div class="${['summary','permanentAddress','address','accomplishments'].includes(key)?'wide':''}"><dt>${escape(label(key))}</dt><dd class="${filled(p[key])?'':'is-empty'}">${filled(p[key])?escape(printable(p[key])):'Not added'}</dd></div>`).join('')}</dl>`;
 }
 function candidateProfileWorkspace(profile={}){
  const user=getCurrentUser();if(!user)return '';
  if(user.profileLoadError)return '<main class="web-profile"><p role="alert">Unable to load your profile. Please refresh to try again.</p></main>';
  const p={...profile,name:profile.name||user.name,email:user.email};const score=calculateCandidateCompletion(p);
  const nextSection=websiteProfileSections.find(section=>section.keys.some(key=>!filled(p[key])))||websiteProfileSections[0];
  return `<main class="web-profile web-profile-focused"><div class="profile-details-heading"><h1>My profile</h1><span>Keep your details up to date</span></div>
  <div class="web-profile-layout"><aside class="web-profile-sidebar"><section class="web-profile-identity"><label class="web-profile-avatar" title="Change profile photo">${p.photo||user.avatar?`<img src="${escape(p.photo||user.avatar)}" alt="Profile photo">`:`<span>${escape((p.name||'U').split(/\s+/).slice(0,2).map(w=>w[0]).join(''))}</span>`}<input id="web-profile-photo" type="file" accept="image/*"><span class="web-profile-camera">+</span></label><h2>${escape(p.name)}</h2><p>${escape(p.role||p.currentDesignation||'Your next opportunity starts here')}</p><small>${escape(p.currentLocation||'Add your location')}</small></section>
  <section class="web-profile-progress"><div><strong>Profile completeness</strong><span>${score}%</span></div><progress max="100" value="${score}" aria-label="Profile completeness"></progress><p>Complete your details for better job matches.</p></section>
  <nav class="web-profile-nav" aria-label="Profile sections">${websiteProfileSections.map(section=>`<a href="#web-profile-${section.id}" data-profile-section="${section.id}">${icon(section.icon)}<span>${section.title}</span><small>${section.keys.some(key=>filled(p[key]))?'✓':'+'}</small></a>`).join('')}</nav></aside>
  <div class="web-profile-main">${websiteProfileSections.map(section=>`<section class="web-profile-card" id="web-profile-${section.id}"><header><div class="web-profile-card-title">${icon(section.icon)}<h2>${section.title}</h2></div><button type="button" data-profile-edit="${section.id}" aria-label="Edit ${section.title}">Edit <span aria-hidden="true">↗</span></button></header>${details(section,p)}</section>`).join('')}</div></div><div id="web-profile-status" role="status" aria-live="polite"></div></main>`;
 }
 function initCandidateProfile(){
  const root=document.querySelector('.web-profile');if(!root)return;
  const activateSection=id=>{
    const valid=websiteProfileSections.some(section=>section.id===id)?id:'contact';
    root.querySelectorAll('.web-profile-card').forEach(card=>{card.hidden=card.id!==`web-profile-${valid}`;});
    root.querySelectorAll('[data-profile-section]').forEach(link=>{const active=link.dataset.profileSection===valid;link.classList.toggle('is-active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  };
  activateSection(location.hash.replace('#web-profile-',''));
  root.querySelectorAll('[data-profile-section]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();activateSection(link.dataset.profileSection);history.replaceState(null,'',`#web-profile-${link.dataset.profileSection}`);}));

  const notify=text=>{const node=document.getElementById('web-profile-status');if(node){node.textContent=text;setTimeout(()=>{node.textContent='';},4000);}};
  const rerender=()=>{root.outerHTML=candidateProfileWorkspace(getCurrentUser().profile||{});initCandidateProfile();};
  root.addEventListener('click',event=>{
   const button=event.target.closest('[data-profile-edit]');if(!button)return;
   const section=websiteProfileSections.find(item=>item.id===button.dataset.profileEdit);if(!section)return;
   const profile=getCurrentUser().profile||{};const draft={};
   const dialog=document.createElement('dialog');dialog.className='web-profile-dialog';dialog.setAttribute('aria-labelledby','web-profile-edit-title');
   dialog.innerHTML=`<form><header><div><small>EDIT PROFILE</small><h2 id="web-profile-edit-title">${escape(section.title)}</h2></div><button type="button" data-close aria-label="Close editor">×</button></header><div class="web-profile-edit-fields"></div><p class="web-profile-edit-error" role="alert"></p><footer><span>Saved to your Trikonet account</span><button type="button" data-close>Cancel</button><button type="submit">Save changes</button></footer></form>`;
   const fields=dialog.querySelector('.web-profile-edit-fields');
   section.keys.filter(key=>key!=='email').forEach(key=>{
    const value=structuredClone(profile[key]??(arrayKeys.has(key)?[]:objectKeys.has(key)?{}:''));
    draft[key]=value;
    fields.append(createProfileField(value,next=>{draft[key]=next;},key));
   });
   dialog.querySelectorAll('[data-close]').forEach(close=>close.onclick=()=>dialog.close());
   dialog.addEventListener('close',()=>{dialog.remove();button.focus();});
   dialog.querySelector('form').onsubmit=async event=>{
    event.preventDefault();const save=dialog.querySelector('[type=submit]');save.disabled=true;save.textContent='Saving…';
    try{
     const response=await fetch('/api/candidate/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...draft,profileUpdatedAt:Date.now()})});
     const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to save profile');
     const user=getCurrentUser();user.profile=data.profile;user.name=data.profile.name||user.name;user.completionPercentage=data.completionPercentage;
     dialog.close();history.replaceState(null,'',`#web-profile-${section.id}`);rerender();document.getElementById(`web-profile-${section.id}`)?.scrollIntoView({block:'nearest'});document.querySelector(`[data-profile-edit="${section.id}"]`)?.focus();
     document.getElementById('web-profile-status').textContent='Profile updated';
    }catch(error){dialog.querySelector('.web-profile-edit-error').textContent=error.message;}
    finally{save.disabled=false;save.textContent='Save changes';}
   };
   document.body.append(dialog);dialog.showModal();
  });
  document.getElementById('web-profile-photo')?.addEventListener('change',async event=>{
   const file=event.target.files?.[0];if(!file)return;if(file.size>1024*1024){notify('Choose a photo smaller than 1 MB.');return;}
   try{
    const photo=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
    const response=await fetch('/api/candidate/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({photo,profileUpdatedAt:Date.now()})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to save photo');getCurrentUser().profile=data.profile;getCurrentUser().avatar=data.profile.photo;rerender();
   }catch(error){notify(error.message);}
  });
 }
 return {candidateProfileWorkspace,initCandidateProfile};
}
