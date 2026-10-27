import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('./public/admin.js',import.meta.url),'utf8');
const section=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const restore=section('  function restoreJobAfterCompany()', '  async function handleRoute()');
const route=section('  async function handleRoute()', "  window.addEventListener('hashchange', handleRoute);");
for (const hash of ['#job-new','#job-editor']) {
 test(`return from company preserves unsaved job on ${hash}`,async()=>{
  const draft={title:'Unsaved updated title',description:'Unsaved responsibilities',originalSlug:'existing-job',categories:['Nurse Jobs']};
  const context={job:draft,returnHash:hash,selectedEmployer:{title:'New Clinic',slug:'new-clinic',logo:'/clinic.png'}};
  let stored=JSON.stringify(context),filled,selected,view;
  const sandbox={location:{hash},sessionStorage:{getItem:()=>stored,removeItem:()=>{stored=null;}},fillJob:value=>{filled=value;},selectEmployerOption:(...args)=>{selected=args;},switchView:value=>{view=value;},editReportedJob:()=>{throw Error('Must not reload saved job over unsaved draft');}};
  vm.createContext(sandbox);vm.runInContext(restore+route,sandbox);await sandbox.handleRoute();
  assert.equal(filled.title,draft.title);assert.equal(filled.originalSlug,'existing-job');assert.deepEqual(Array.from(selected),['New Clinic','/clinic.png','new-clinic',true]);assert.equal(stored,null);assert.equal(view,hash==='#job-new'?'job-new':'job-edit');
 });
}
test('unrelated editor route does not consume pending job draft',()=>{
 let removed=false;
 const sandbox={location:{hash:'#job-editor/another'},sessionStorage:{getItem:()=>JSON.stringify({returnHash:'#job-new',job:{title:'Draft'}}),removeItem:()=>{removed=true;}}};
 vm.createContext(sandbox);vm.runInContext(restore,sandbox);assert.equal(sandbox.restoreJobAfterCompany(),false);assert.equal(removed,false);
});
test('background company refresh keeps an open picker and active search',()=>{
 const nodes={
  'employer-combobox-dropdown':{style:{display:'block'}},
  'employer-combobox-search':{value:'clinic'},
  'field-employer-company-value':{value:'Chosen Clinic',dataset:{employerSlug:'chosen-clinic'}},
  'field-employer-author':{value:'Chosen Clinic'}
 };
 let query,collapsed=false;
 const sandbox={document:{getElementById:id=>nodes[id]},allEmployers:()=>[{title:'Chosen Clinic',slug:'chosen-clinic'}],allJobs:()=>[],esc:v=>v,renderEmployerComboboxItems:q=>{query=q;},selectEmployerOption:()=>{collapsed=true;}};
 vm.createContext(sandbox);vm.runInContext('let employerDataset=[];'+section('  function populateEmployerDropdown()', '  function renderEmployerComboboxItems'),sandbox);sandbox.populateEmployerDropdown();
 assert.equal(collapsed,false);assert.equal(query,'clinic');assert.equal(nodes['employer-combobox-dropdown'].style.display,'block');
});
test('selection retains company slug before catalogue is available',()=>{
 const hidden={value:'',dataset:{}};
 const sandbox={document:{getElementById:id=>id==='field-employer-company-value'?hidden:null},renderEmployerComboboxItems:()=>{}};
 vm.createContext(sandbox);vm.runInContext(section('  function selectEmployerOption(', '  // Setup Combobox Events'),sandbox);sandbox.selectEmployerOption('Clinic','', 'clinic-profile',false);
 assert.equal(hidden.value,'Clinic');assert.equal(hidden.dataset.employerSlug,'clinic-profile');
 sandbox.selectEmployerOption('','', '',false);assert.equal(hidden.dataset.employerSlug,'');
});

test('saved company returns to job without a second catalogue load',async()=>{
 let submit;
 const saved={title:'Clinic',slug:'clinic',logo:'/clinic.png',status:'publish'};
 const context={job:{title:'Nurse'},returnHash:'#job-new'};
 const storage=new Map([['trikonet_job_return_ctx',JSON.stringify(context)]]);
 const nodes=new Map();
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{value:id==='employer-gutenberg-title'?'Clinic':id==='field-employer-logo-val'?'/clinic.png':'',innerHTML:'<p>Company description</p>',classList:{contains:()=>false},querySelectorAll:()=>[{value:'Healthcare'}]});
  return nodes.get(id);
 };
 const sandbox={employerForm:{originalSlug:{value:''},elements:{},addEventListener:(type,fn)=>{submit=fn;}},document:{getElementById:node,querySelector:()=>({})},employerStatusState:{},fetch:async()=>({ok:true,json:async()=>saved}),localEmployers:[],collectEmployerSocials:()=>[],normalizeWebsiteUrl:v=>v||'',showAdminNotice:()=>{},updateEmployerPreview:()=>{},renderEmployerRows:()=>{},populateEmployerDropdown:()=>{},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},location:{hash:'#employer-new'},setTimeout:()=>{},console};
 vm.createContext(sandbox);
 vm.runInContext(section("  employerForm.addEventListener('submit'",'  // Move to trash'),sandbox);
 await submit({preventDefault(){}});
 assert.equal(sandbox.location.hash,'#job-new');
 assert.equal(JSON.parse(storage.get('trikonet_job_return_ctx')).selectedEmployer.slug,'clinic');
 assert.equal(sandbox.localEmployers[0].slug,'clinic');
});
