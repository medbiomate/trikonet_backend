import {profileFieldOptions} from './profile-field-options.js?v=20261018-11';
const templates={educationEntries:{id:'',level:'',course:'',institution:'',university:'',startYear:'',endYear:'',mode:'',specialization:'',grading:'',score:'',maximum:''},accomplishments:{id:'',kind:'',title:'',url:'',date:'',description:'',organization:'',status:'',reference:'',from:'',until:'',ongoing:false}};
const labels={photo:'Profile photo',hospitalType:'Preferred employer',locations:'Preferred locations',salaryExpectation:'Expected salary',dateOfBirth:'Date of birth',linkedin:'LinkedIn',url:'URL',educationEntries:'Qualifications',licenseDetails:'License details',languageDetails:'Language proficiency',postalCode:'ZIP / PIN code'};
const label=key=>labels[key]||key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const options={...profileFieldOptions,maritalStatus:['Single','Married','Divorced','Widowed','Prefer not to say'],workPermit:['Valid work permit','Employer sponsorship required','Application in progress','Not applicable'],languages:['English','Arabic','Hindi','Malayalam','Urdu','Tamil','French','Tagalog'],abilities:['Speak','Read','Write'],mode:['Full time','Part time','Distance learning','Online'],grading:['Percentage','CGPA','Marks','Pass / Fail'],kind:['Award','Achievement','Certification','Project','Publication','Other']};
const years=Array.from({length:100},(_,i)=>String(new Date().getFullYear()+6-i));options.startYear=years;options.endYear=years;
const names=new Intl.DisplayNames(['en'],{type:'region'});
options.nationality=[];
for(let a=65;a<=90;a++)for(let b=65;b<=90;b++){const code=String.fromCharCode(a,b);const name=names.of(code);if(name!==code)options.nationality.push(name);}
options.nationality.sort();
export function configureProfileOptions(next){for(const [key,values]of Object.entries(next))options[key]=[...new Set(values.filter(Boolean))];}
function scalar(value,onChange,key,context){
 const field=document.createElement('label');field.className='app-profile-field';field.dataset.profileField=key;
 const caption=document.createElement('span');caption.textContent=label(key);field.append(caption);
 let choices=options[key];
 if(key==='level')choices=context.includes('languageDetails')?['Beginner','Midlevel','Native']:['PhD / Doctorate','Postgraduate','Graduate','Diploma','Plus 2 / Pre-degree','Secondary school','Primary school','Other'];
 if(key==='status'&&context.includes('licenseDetails'))choices=options.licenseStatus;
 const multiline=['summary','bio','skills','description','address','permanentAddress','education','workExperience'].includes(key);
 const control=document.createElement(choices?'select':multiline?'textarea':'input');control.className=choices?'modern-select':'modern-input';
 if(choices){
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=`Select ${label(key).toLowerCase()}`;control.append(placeholder);
  [...new Set([...choices,...(value?[String(value)]:[])])].forEach(choice=>{const option=document.createElement('option');option.value=choice;option.textContent=choice;control.append(option);});
  control.value=value??'';
 }else{
  if(!multiline)control.type=typeof value==='boolean'?'checkbox':['dateOfBirth','licenseExpiry','expiry','date','from','until'].includes(key)?'date':key==='phone'?'tel':['website','linkedin','url'].includes(key)?'url':key==='email'?'email':['age','maximum','score'].includes(key)?'number':'text';
  if(control.type==='checkbox')control.checked=Boolean(value);else control.value=Array.isArray(value)?value.join(', '):value??'';
  if(['maximum','score'].includes(key))control.step='any';
  if(control.type==='date'&&key==='dateOfBirth')control.max=new Date().toISOString().slice(0,10);
 }
 control.addEventListener(choices?'change':'input',()=>onChange(control.type==='checkbox'?control.checked:typeof value==='number'?Number(control.value):control.value));
 field.append(control);return field;
}
function multi(value,onChange,key){
 let selected=Array.isArray(value)?[...new Set(value.filter(Boolean))]:String(value||'').split(',').map(v=>v.trim()).filter(Boolean);
 const wrap=document.createElement('fieldset');wrap.className='profile-choice-field';wrap.dataset.profileField=key;
 const legend=document.createElement('legend');legend.textContent=label(key);wrap.append(legend);
 const hint=document.createElement('p');hint.textContent='Select all that apply';wrap.append(hint);
 const grid=document.createElement('div');grid.className='profile-choice-options';wrap.append(grid);
 const render=()=>{grid.replaceChildren();[...new Set([...(options[key]||[]),...selected])].forEach(choice=>{
  const button=document.createElement('button');button.type='button';button.className='profile-choice-option';button.textContent=choice;button.setAttribute('aria-pressed',String(selected.includes(choice)));
  button.onclick=()=>{selected=selected.includes(choice)?selected.filter(item=>item!==choice):[...selected,choice];onChange([...selected]);render();};grid.append(button);
 });};render();
 if(['languages','skills'].includes(key)){
  const add=document.createElement('div');add.className='profile-choice-custom';const text=document.createElement('input');text.type='text';text.placeholder=`Add ${key==='languages'?'another language':'a skill'}`;text.setAttribute('aria-label',text.placeholder);
  const button=document.createElement('button');button.type='button';button.textContent='Add';button.onclick=()=>{const entry=text.value.trim();if(!entry)return;if(!selected.some(item=>item.toLowerCase()===entry.toLowerCase())){selected.push(entry);onChange([...selected]);render();}text.value='';};
  text.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();button.click();}};add.append(text,button);wrap.append(add);
 }
 return wrap;
}
function photo(value,onChange){
 const wrap=document.createElement('div');wrap.className='profile-photo-field app-profile-field';const title=document.createElement('span');title.textContent='Profile photo';
 const preview=document.createElement('img');preview.alt='Profile photo preview';preview.hidden=!value;if(value)preview.src=value;
 const field=document.createElement('input');field.type='file';field.accept='image/jpeg,image/png,image/webp';field.setAttribute('aria-label','Upload profile photo');
 const hint=document.createElement('small');hint.textContent='JPG, PNG or WebP · Maximum 1 MB';hint.setAttribute('role','status');
 const remove=document.createElement('button');remove.type='button';remove.textContent='Remove photo';remove.hidden=!value;
 remove.onclick=()=>{preview.removeAttribute('src');preview.hidden=true;remove.hidden=true;field.value='';onChange('');};
 field.onchange=async()=>{const file=field.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>1024*1024){hint.textContent='Choose a JPG, PNG or WebP smaller than 1 MB.';field.value='';return;}
  try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});preview.src=data;preview.hidden=false;remove.hidden=false;hint.textContent='Photo ready. Save your changes to upload.';onChange(data);}catch{hint.textContent='Unable to read this file. Try another photo.';}
 };wrap.append(title,preview,field,hint,remove);return wrap;
}
function editor(value,onChange,key,context=''){
 if(key==='photo')return photo(value,onChange);
 if(['locations','licenses','languages','abilities'].includes(key))return multi(value,onChange,key);
 if(key==='skills')return multi(value,next=>onChange(Array.isArray(value)?next:next.join(', ')),key);
 if(value===null||typeof value!=='object')return scalar(value,onChange,key,context);
 const wrap=document.createElement('div');wrap.className='app-profile-collection';wrap.dataset.profileField=key;
 const heading=document.createElement('strong');heading.textContent=label(key);wrap.append(heading);const list=document.createElement('div');wrap.append(list);
 const render=()=>{list.replaceChildren();Object.entries(value).forEach(([k,v])=>{
  if(k==='id')return;const row=document.createElement('div');row.className='app-profile-record';row.append(editor(v,next=>{value[k]=next;onChange(value);},Array.isArray(value)?key==='educationEntries'?'Qualification':key==='accomplishments'?'Accomplishment':`${label(key)} ${Number(k)+1}`:k,`${context}.${key}`));
  if(Array.isArray(value)){const remove=document.createElement('button');remove.type='button';remove.className='modern-btn-secondary';remove.textContent='Remove';remove.onclick=()=>{value.splice(Number(k),1);onChange(value);render();};row.append(remove);}list.append(row);
 });if(!Object.keys(value).length){const empty=document.createElement('p');empty.className='candidate-field-hint';empty.textContent='No entries added yet.';list.append(empty);}};
 const add=document.createElement('button');add.type='button';add.className='modern-btn-secondary';add.textContent=key==='educationEntries'?'＋ Add qualification':key==='accomplishments'?'＋ Add accomplishment':'＋ Add details';
 add.onclick=()=>{if(Array.isArray(value))value.push(templates[key]?{...templates[key],id:crypto.randomUUID()}: '');else{
  const name=entryName.value.trim();if(!name||Object.hasOwn(value,name))return;value[name]=key==='licenseDetails'?{number:'',authority:'',status:'',expiry:''}:key==='languageDetails'?{abilities:[],level:''}:'';entryName.value='';
 }onChange(value);render();};
 const entryName=document.createElement('input');entryName.className='modern-input';entryName.placeholder=key==='licenseDetails'?'License name':key==='languageDetails'?'Language name':'Entry name';entryName.setAttribute('aria-label',entryName.placeholder);
 if(!Array.isArray(value))wrap.append(entryName);wrap.append(add);render();return wrap;
}
export {editor as createProfileField};
