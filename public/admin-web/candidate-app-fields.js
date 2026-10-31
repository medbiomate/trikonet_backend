const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=k=>k.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
const groups=[
 ['Personal details',['nationality','gender','dateOfBirth','age','maritalStatus','permanentAddress','hometown','postalCode','address']],
 ['Career & skills',['industry','currentDesignation','specialization','skills','previousEmployers','departmentExperience','preferredDepartment']],
 ['Work preferences',['locations','workType','shiftPreference','preferredDistance','availability','noticePeriod','hospitalType','visaStatus','workPermit','relocationPreference','currentSalary','salaryExpectation']],
 ['Education',['degree','university','certifications','educationEntries']],
 ['Licenses & languages',['licenses','licenseStatus','licenseExpiry','licenseDetails','languages','languageDetails']],
 ['Achievements & links',['accomplishments','workExperience','education','socialLinks','website','linkedin']]
];
const lists=new Set(['locations','licenses','languages']);
const structures=new Set(['educationEntries','accomplishments','workExperience','education','socialLinks']);
const objects=new Set(['licenseDetails','languageDetails']);
const entryDefaults={educationEntries:{level:'',course:'',institution:'',university:'',startYear:'',endYear:'',mode:'',specialization:'',grading:'',score:'',maximum:''},accomplishments:{kind:'',title:'',url:'',date:'',description:'',organization:'',status:'',reference:'',from:'',until:'',ongoing:false}};
function field(key,value,path){
 const attr=esc(JSON.stringify(path));
 if(Array.isArray(value)&&!lists.has(key))return `<div class="caf-complex"><strong>${esc(title(key))}</strong>${value.map((entry,index)=>`<div class="caf-entry"><div class="caf-entry-title">Entry ${index+1}<button type="button" data-caf-remove="${esc(JSON.stringify([...path,index]))}">Remove</button></div>${field('',entry,[...path,index])}</div>`).join('')}${entryDefaults[key]?`<button type="button" class="caf-add" data-caf-add="${attr}">+ Add ${key==='educationEntries'?'education':'achievement'}</button>`:value.length?'':'<p class="caf-empty">Not provided</p>'}</div>`;
 if(value&&typeof value==='object')return `<div class="caf-complex">${key?`<strong>${esc(title(key))}</strong>`:''}<div class="caf-grid">${Object.entries(value).filter(([k])=>k!=='id').map(([k,v])=>field(k,v,[...path,k])).join('')}</div>${Object.keys(value).length?'':'<p class="caf-empty">Not provided</p>'}</div>`;
 const boolean=typeof value==='boolean';const text=Array.isArray(value)?value.join(', '):value??'';
 return `<label class="caf-field"><span>${esc(title(key))}</span>${boolean?`<input type="checkbox" data-caf-path="${attr}" checked>`:`<${['description','skills','summary','previousEmployers'].includes(key)?'textarea':'input'} data-caf-path="${attr}" ${lists.has(key)?'data-caf-list="true"':''} ${['description','skills','summary','previousEmployers'].includes(key)?`rows="3">${esc(text)}</textarea>`:`type="${/url|website|linkedin/i.test(key)?'url':key==='dateOfBirth'||key==='licenseExpiry'?'date':'text'}" value="${esc(text)}">`}`}${lists.has(key)?'<small>Separate values with commas</small>':''}</label>`;
}
function setPath(root,path,value){let current=root;for(let i=0;i<path.length-1;i++){current[path[i]]??=typeof path[i+1]==='number'?[]:{};current=current[path[i]]}current[path.at(-1)]=value}
export function mountCandidateAppFields(form,profile={}){
 form.querySelector('#candidate-app-fields')?.remove();
 const section=document.createElement('section');section.id='candidate-app-fields';section.className='caf-sections';
 const state=structuredClone(profile);form.candidateAppProfile=state;
 const paint=()=>{section.innerHTML=`<header class="caf-intro"><h3>Complete app profile</h3><p>Career details saved by the candidate in Trikonet. Changes here update the same account.</p></header>${profile.photo?`<img class="caf-photo" src="${esc(profile.photo)}" alt="Candidate profile photo">`:''}${groups.map(([heading,keys])=>`<details open class="caf-section"><summary>${esc(heading)}</summary><div class="caf-grid">${keys.map(key=>field(key,state[key]??(lists.has(key)||structures.has(key)?[]:objects.has(key)?{}:''),[key])).join('')}</div></details>`).join('')}`;section.querySelectorAll('input[type=checkbox]').forEach(input=>{let value=state;for(const key of JSON.parse(input.dataset.cafPath))value=value?.[key];input.checked=Boolean(value)})};
 section.addEventListener('input',event=>{const input=event.target;if(!input.dataset.cafPath)return;const value=input.type==='checkbox'?input.checked:input.dataset.cafList?input.value.split(',').map(v=>v.trim()).filter(Boolean):input.value;setPath(state,JSON.parse(input.dataset.cafPath),value)});
 section.addEventListener('click',event=>{const button=event.target.closest('[data-caf-add],[data-caf-remove]');if(!button)return;const path=JSON.parse(button.dataset.cafAdd||button.dataset.cafRemove);if(button.dataset.cafAdd){let list=state;for(const key of path.slice(0,-1))list=list[key];list[path.at(-1)]||=[];list[path.at(-1)].push({id:crypto.randomUUID(),...entryDefaults[path[0]]})}else{let list=state;for(const key of path.slice(0,-1))list=list[key];list.splice(path.at(-1),1)}paint()});
 const submit=form.querySelector('[type=submit]');const anchor=submit?.closest('.modern-form-actions')||submit?.parentElement; if(anchor)anchor.before(section);else form.append(section);paint();
}
export function readCandidateAppFields(form){return structuredClone(form.candidateAppProfile||{})}
