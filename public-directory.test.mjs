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
