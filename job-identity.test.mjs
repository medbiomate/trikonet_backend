import test from 'node:test';
import assert from 'node:assert/strict';
import { findJobIndex, saveJobRecord } from './job-identity.mjs';
test('a title or slug change updates the same stable ID',()=>{
 const jobs=[];
 const first=saveJobRecord(jobs,{title:'Nurse',slug:'nurse',status:'draft',id:'job-1'},()=> 'unused','2026-10-01');
 saveJobRecord(jobs,{id:first.id,title:'Senior Nurse',slug:'senior-nurse',status:'publish'},()=> 'unused','2026-10-02');
 assert.equal(jobs.length,1);assert.equal(jobs[0].id,'job-1');assert.equal(jobs[0].createdAt,'2026-10-01');assert.equal(jobs[0].slug,'senior-nurse');
});
test('legacy records get an ID once and retain it across repeated saves',()=>{
 const jobs=[{slug:'old',title:'Old'}];
 const saved=saveJobRecord(jobs,{originalSlug:'old',slug:'renamed',title:'New'},()=> 'stable','today');
 saveJobRecord(jobs,{id:saved.id,slug:'again',title:'Again'},()=> 'wrong','later');
 assert.equal(jobs.length,1);assert.equal(jobs[0].id,'stable');
});
test('autosave draft is promoted in place and recovery removed',()=>{
 const jobs=[{id:'draft-id',slug:'autosave-job-draft-id',recoveryDraft:{title:'X'},autosaved:true}];
 saveJobRecord(jobs,{id:'draft-id',slug:'real-job',title:'Real',status:'publish'},()=> 'wrong','today');
 assert.equal(jobs.length,1);assert.equal(jobs[0].recoveryDraft,undefined);assert.equal(jobs[0].autosaved,undefined);
});
test('slug collisions cannot overwrite a different job ID',()=>{
 const jobs=[{id:'a',slug:'first'},{id:'b',slug:'second'}];
 assert.throws(()=>saveJobRecord(jobs,{id:'a',slug:'second'},()=> 'unused','today'),/another job/);
 assert.equal(jobs.length,2);assert.equal(findJobIndex(jobs,{id:'b',originalSlug:'first'}),1);
});
