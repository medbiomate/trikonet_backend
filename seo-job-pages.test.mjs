import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile,editPage,isActiveJob,indexable,defaults,createSeoRepository } from './seo-job-pages.mjs';
const main={categoryId:1,category:'Nurse',slug:'nurse-jobs',pageType:'main_category'};
const counts=n=>new Map([['nurse::dubai',n]]);
test('manual main category required; 9 does not qualify, 10 does',()=>{
  assert.equal(reconcile([],[],counts(20)).length,0);
  assert.equal(reconcile([],[main],counts(9)).length,0);
  const pages=reconcile([],[main],counts(10));assert.equal(pages.length,1);assert.equal(pages[0].slug,'nurse-jobs-in-dubai');assert.equal(pages[0].status,'Published');
});
test('previously qualified pages persist below threshold and manual draft never republishes',()=>{
  const initial=reconcile([],[main],counts(10));
  const dropped=reconcile(initial,[main],counts(8));assert.equal(dropped[0].status,'Published');assert.equal(dropped[0].eligibilityStatus,'Below Threshold');
  const draft=editPage(dropped[0],{status:'Draft'});assert.equal(draft.managementMode,'MANUAL_DRAFT');
  assert.equal(reconcile([draft],[main],counts(30))[0].status,'Draft');
  assert.equal(editPage(draft,{managementMode:'AUTO'}).status,'Draft');
  assert.equal(editPage(draft,{managementMode:'MANUAL_PUBLISHED'}).status,'Published');
});
test('manual metadata survives regeneration; unchanged form fields do not create overrides',()=>{
  const page=reconcile([],[main],counts(10))[0];
  assert.equal(editPage(page,{seoTitle:page.seoTitle}).seoTitleOverridden,false);
  const edited=editPage(page,{h1:'Nursing careers',seoTitle:'Custom title',metaDescription:'Custom description',introContent:'My intro'});
  const regenerated=editPage(edited,{}, {regenerate:true,main});
  assert.equal(regenerated.seoTitle,'Custom title');assert.equal(regenerated.h1,'Nursing careers');assert.equal(regenerated.metaDescription,'Custom description');assert.equal(regenerated.introContent,'My intro');
});
test('published indexing controls sitemap independently from management',()=>{
  assert.equal(indexable({status:'Published',indexingStatus:'Index'}),true);
  assert.equal(indexable({status:'Published',indexingStatus:'Noindex'}),false);
  assert.equal(indexable({status:'Draft',indexingStatus:'Index'}),false);
});
test('active count excludes drafts, filled, inactive and expired jobs using UAE end of day',()=>{
  const now=new Date('2026-09-30T10:00:00Z');
  assert.equal(isActiveJob({status:'publish',expiryDate:'2026-09-30'},now),true);
  for(const job of [{status:'draft'},{filled:true},{active:false},{metas:{_filled:'1'}},{expiryDate:'2026-09-29'},{expiryDate:'invalid'}])assert.equal(isActiveJob(job,now),false);
});
test('slug derives from administrator main URL and avoids duplicate Jobs wording',()=>{
  assert.equal(defaults({category:'Nurse Jobs',slug:'nurse-jobs'},{name:'Dubai'}).slug,'nurse-jobs-in-dubai');
  assert.equal(defaults({category:'Accounting & Finance',slug:'accounting-finance-jobs'},{name:'Dubai'}).slug,'accounting-finance-jobs-in-dubai');
  assert.equal(defaults({category:'Accounting or Finance',slug:'accounting-finance-in-uae'},{name:'Dubai'}).slug,'accounting-finance-jobs-in-dubai');
});
test('durable repository merges local and imported jobs once and preserves manual status across a reload',async()=>{
  const table=new Map();const pool={async query(sql,args){if(sql.startsWith('CREATE'))return [[]];if(sql.startsWith('SELECT'))return [[...table.values()].map(payload=>({payload:JSON.stringify(payload)}))];if(sql.startsWith('INSERT')){table.set(args[0],JSON.parse(args[3]));return [[]];}throw Error(sql);}};
  const jobs=Array.from({length:10},(_,i)=>({slug:'job-'+i,status:'publish',categories:['Nurse'],locations:['Dubai']}));
  const source=async()=>({jobs,taxonomies:{categories:[{id:1,name:'Nurse'}],locations:[{id:2,name:'Dubai'}]}});
  const db=async()=>({jobs:[{...jobs[0]}]});
  const repo=createSeoRepository(pool,db,source);
  await repo.createMain(main);
  const retained=await repo.createMain({...main,slug:'replacement-jobs',onlyIfMissing:true});
  assert.equal(retained.slug,'nurse-jobs');
  const page=(await repo.list(true)).find(p=>p.pageType==='category_location');assert.equal(page.activeJobCount,10);
  await repo.update(page.id,{status:'Draft'});
  const restarted=createSeoRepository(pool,db,source);
  const loaded=(await restarted.list(true)).find(p=>p.id===page.id);assert.equal(loaded.status,'Draft');assert.equal(loaded.managementMode,'MANUAL_DRAFT');
  await assert.rejects(()=>repo.update(page.id,{slug:'nurse-jobs'}),/already exists/);
  jobs.forEach(job=>{job.categories=['Nursing'];});
  const renamedSource=async()=>({jobs,taxonomies:{categories:[{id:1,name:'Nursing'}],locations:[{id:2,name:'Dubai'}]}});
  const renamed=createSeoRepository(pool,db,renamedSource);
  const current=(await renamed.list(true)).find(p=>p.id===page.id);
  assert.equal(current.activeJobCount,10);
  assert.equal((await renamed.jobs(current)).length,10);
});
