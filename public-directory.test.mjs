import test from 'node:test';
import assert from 'node:assert/strict';
import {publicDirectory} from './public-directory.mjs';
test('only requested page leaves server, with full-description search and no detail payload',async()=>{
 const records=Array.from({length:1232},(_,id)=>({id,slug:`job-${id}`,title:'Nurse',status:'publish',categories:['Nursing'],locations:['Dubai'],types:['Full Time'],description:'Rare skill '+ 'care '.repeat(500),publishedDate:'2026-10-01',local:true}));
 const jobs=await publicDirectory(records,new URLSearchParams('page=2&per_page=10&q=Rare&category=Nursing&location=Dubai'),async()=>{assert.fail('local page already filled')});
 assert.equal(jobs.length,10);assert.equal(jobs[0].slug,'job-10');assert.ok(jobs.every(j=>j.description===undefined));assert.ok(JSON.stringify(jobs).length<10000);
});
test('merges remote jobs without duplicates and retains filters',async()=>{
 const local=[{slug:'one',title:'Nurse',status:'publish',categories:['Nursing'],locations:['Dubai']},{slug:'draft',status:'draft'}];let called=0;
 const jobs=await publicDirectory(local,new URLSearchParams('category=Nursing&per_page=3'),async(page,size,excluded)=>{called++;assert.equal(page,1);assert.ok(excluded.includes('one'));assert.ok(!excluded.includes('draft'));return [{slug:'two',title:{rendered:'Nurse'},content:{rendered:'Care'}}];});
 assert.equal(called,1);assert.deepEqual(jobs.map(j=>j.slug),['one','two']);
});
test('ranking preserves exact, prefix, substring, company and description matches across pages',async()=>{
 const make=(slug,title,company='',description='nurse care')=>({slug,title,company,description,status:'publish',publishedDate:'2026-10-01',updatedAt:'2026-10-01',categories:['Nursing'],locations:['Dubai'],types:['Full Time']});
 const rows=[make('text','Role','Other'),make('company-partial','Role','The nurse clinic'),make('company-exact','Role','nurse'),make('title-partial','Senior nurse role'),make('title-prefix','Nurse role'),make('title-exact','Nurse')];
 const params=new URLSearchParams('q=nurse&category=Nursing&location=Dubai&job_type=Full+Time&per_page=3');
 const one=await publicDirectory(rows,params,()=>assert.fail('local page filled'));
 params.set('page','2');const two=await publicDirectory(rows,params,()=>assert.fail('local page filled'));
 assert.deepEqual([...one,...two].map(job=>job.slug),['title-exact','title-prefix','title-partial','company-exact','company-partial','text']);
});
test('empty query, blank titles, date ties and duplicate slugs preserve legacy ordering',async()=>{
 const rows=[{slug:'older',title:'Role',publishedDate:'2025-01-01'}, {slug:'tie-one',title:'Role',publishedDate:'2026-01-01',updatedAt:'2026-01-02'}, {slug:'tie-two',title:'Role',publishedDate:'2026-01-01',updatedAt:'2026-01-02'}, {slug:'blank',title:'',publishedDate:'2020-01-01'}, {slug:'duplicate',title:'Old',updatedAt:'2025-01-01'}, {slug:'duplicate',title:'New',updatedAt:'2026-01-01',publishedDate:'2026-01-01'}];
 const result=await publicDirectory(rows,new URLSearchParams('per_page=6'),async()=>[]);
 assert.deepEqual(result.map(job=>job.slug),['blank','tie-one','tie-two','duplicate','older']);
 assert.equal(result.find(job=>job.slug==='duplicate').title,'New');
});
test('memoized text is scoped to one call so edits are searchable immediately',async()=>{
 const job={slug:'edited',title:'Role',description:'Rare old skill',publishedDate:'2026-01-01'};
 assert.equal((await publicDirectory([job],new URLSearchParams('q=Rare+old'),async()=>[])).length,1);
 job.description='New skill';
 assert.equal((await publicDirectory([job],new URLSearchParams('q=Rare+old'),async()=>[])).length,0);
 assert.equal((await publicDirectory([job],new URLSearchParams('q=New+skill'),async()=>[])).length,1);
});
test('remote pagination begins after locally matching jobs and excludes all public local identities',async()=>{
 const local=[{slug:'match',title:'Nurse',description:'Nurse care'},{slug:'nonmatch',title:'Engineer',description:'Design'},{slug:'draft',title:'Nurse',status:'draft'}];
 const calls=[];
 const remote=async(page,size,excluded)=>{calls.push({page,size,excluded});return page===1?[{slug:'remote-1',title:{rendered:'Nurse'}},{slug:'remote-2',title:{rendered:'Nurse'}}]:[];};
 const result=await publicDirectory(local,new URLSearchParams('q=nurse&page=2&per_page=2'),remote);
 assert.deepEqual(result.map(job=>job.slug),['remote-2']);
 assert.equal(calls.length,2);assert.equal(calls[0].page,1);assert.equal(calls[0].size,2);
 assert.ok(calls[0].excluded.includes('match'));assert.ok(calls[0].excluded.includes('nonmatch'));assert.ok(!calls[0].excluded.includes('draft'));
});
