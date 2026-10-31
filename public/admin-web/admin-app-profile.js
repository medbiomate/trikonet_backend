import {createProfileField as editor} from './profile-field-editor.js?v=20261018-textarea-13';
const groups = [
 ['Personal details', ['nationality','gender','dateOfBirth','age','maritalStatus','permanentAddress','hometown','postalCode','address','photo']],
 ['Career & education', ['industry','currentDesignation','degree','specialization','university','departmentExperience','skills','education','educationEntries','workExperience','previousEmployers']],
 ['Licenses & certifications', ['licenses','licenseDetails','licenseStatus','licenseExpiry','certifications']],
 ['Languages & accomplishments', ['languages','languageDetails','accomplishments']],
 ['Salary & availability', ['currentSalary','salaryExpectation','availability','noticePeriod']],
 ['Work preferences', ['locations','hospitalType','visaStatus','workPermit','preferredDepartment','relocationPreference','preferredDistance','workType','shiftPreference']],
 ['Links', ['website','linkedin','socialLinks']]
];
const arrays = new Set(['licenses','languages','locations','educationEntries','accomplishments']);
const objects = new Set(['licenseDetails','languageDetails']);
const templates = {
 educationEntries: {id:'',level:'',course:'',institution:'',university:'',startYear:'',endYear:'',mode:'',specialization:'',grading:'',score:'',maximum:''},
 accomplishments: {id:'',kind:'',title:'',url:'',date:'',description:'',organization:'',status:'',reference:'',from:'',until:'',ongoing:false}
};
const labels = {photo:'Profile photo URL',hospitalType:'Employer type',locations:'Preferred locations',salaryExpectation:'Expected salary',dateOfBirth:'Date of birth',linkedin:'LinkedIn',url:'URL'};
const label = key => labels[key] || key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
let draft = {};
const descriptions = [
 'Contact information, professional details, and a short introduction.',
 'Personal information and contact addresses.',
 'Education, career history, and areas of expertise.',
 'Professional licenses, credentials, and certifications.',
 'Language proficiency, achievements, and recognitions.',
 'Compensation expectations and joining availability.',
 'Preferred roles, locations, and working arrangements.',
 'Professional websites and social profiles.'
];
const icons = ['◉','◎','▤','◇','✦','◷','⌘','↗'];
export function fillAppProfile(record={}) {
 draft=structuredClone(record);
 for(const [id,key] of [['candidate-experience','experience'],['candidate-qualification','qualification']]){
  const old=document.getElementById(id);
  if(old?.tagName==='INPUT'){
   const field=editor(record[key]||'',()=>{},key);
   const select=field.querySelector('select');
   if(select){select.id=old.id;select.name=old.name;select.className='modern-select';old.replaceWith(select);}
  }
  const current=document.getElementById(id);
  if(current&&record[key]){
   if(!Array.from(current.options||[]).some(option=>option.value===record[key]))current.add(new Option(record[key],record[key]));
   current.value=record[key];
  }
 }

 const main=document.querySelector('.candidate-editor-main');
 if(!main)return;
 let host=document.getElementById('candidate-app-profile');
 let overview=host?.querySelector('[data-profile-panel="0"]');
 if(!overview){
  overview=document.createElement('div');overview.dataset.profilePanel='0';overview.className='app-profile-overview';
  Array.from(main.children).filter(child=>child!==host).forEach(child=>overview.append(child));
 }
 if(!host){host=document.createElement('div');host.id='candidate-app-profile';main.append(host);}
 host.replaceChildren();host.className='app-profile-workspace';
 const nav=document.createElement('nav');nav.className='app-profile-nav';nav.setAttribute('aria-label','Candidate profile sections');
 const eyebrow=document.createElement('span');eyebrow.className='app-profile-nav-label';eyebrow.textContent='PROFILE SECTIONS';nav.append(eyebrow);
 const content=document.createElement('div');content.className='app-profile-content';
 const heading=document.createElement('header');heading.className='app-profile-panel-heading';
 const kicker=document.createElement('span');kicker.textContent='CANDIDATE PROFILE';
 const title=document.createElement('h2');const description=document.createElement('p');
 heading.append(kicker,title,description);content.append(heading,overview);
 const panels=[overview],buttons=[];
 const activate=index=>{
  panels.forEach((panel,i)=>{panel.hidden=i!==index;});
  buttons.forEach((button,i)=>{button.classList.toggle('is-active',i===index);button.setAttribute('aria-current',i===index?'page':'false');});
  title.textContent=index===0?'Overview':groups[index-1][0];description.textContent=descriptions[index];
 };
 const entries=[['Overview',[]],...groups];
 entries.forEach(([name,keys],index)=>{
  const button=document.createElement('button');button.type='button';button.className='app-profile-nav-item';
  const icon=document.createElement('span');icon.className='app-profile-nav-icon';icon.setAttribute('aria-hidden','true');icon.textContent=icons[index];
  const text=document.createElement('span');text.textContent=name;
  button.append(icon,text);button.onclick=()=>activate(index);buttons.push(button);nav.append(button);
  if(index===0)return;
  const panel=document.createElement('section');panel.dataset.profilePanel=String(index);panel.className='candidate-editor-section app-profile-section';panel.setAttribute('aria-label',name);
  const grid=document.createElement('div');grid.className='candidate-fields';panel.append(grid);
  keys.forEach(key=>{
   const value=draft[key]??(arrays.has(key)?[]:objects.has(key)?{}:'');
   grid.append(editor(value,next=>{draft[key]=next;},key));
  });panels.push(panel);content.append(panel);
 });
 const help=document.createElement('div');help.className='app-profile-nav-help';help.textContent='Changes sync to the candidate’s app profile when saved.';nav.append(help);
 host.append(nav,content);activate(0);
 // Reveal required fields if browser validation finds an issue in another section.
 overview.oninvalid=()=>activate(0);
 overview.addEventListener('invalid',()=>activate(0),true);
 const sidebar=document.querySelector('.candidate-editor-sidebar');
 let identity=document.getElementById('candidate-editor-identity');
 if(!identity){identity=document.createElement('div');identity.id='candidate-editor-identity';identity.className='candidate-editor-identity';sidebar?.prepend(identity);}
 identity.replaceChildren();
 const avatar=document.createElement('div');avatar.className='candidate-identity-avatar';avatar.textContent=(record.name||'New candidate').split(/\s+/).map(word=>word[0]).slice(0,2).join('').toUpperCase();
 if(record.photo){const image=document.createElement('img');image.src=record.photo;image.alt='Candidate photo';avatar.replaceChildren(image);}
 const name=document.createElement('strong');name.textContent=record.name||'New candidate';
 const role=document.createElement('span');role.textContent=record.jobTitle||record.role||'Candidate profile';
 const account=document.createElement('small');account.textContent=record.userId||record.sourceAccountId?'● Connected app account':'Talent profile';
 identity.append(avatar,name,role,account);
 const actions=document.querySelector('.candidate-editor-savebar');
 if(sidebar&&actions)sidebar.insertBefore(actions,identity);
}
export function readAppProfile(){return structuredClone(draft);}
