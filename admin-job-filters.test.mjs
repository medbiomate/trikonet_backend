import test from 'node:test';
import assert from 'node:assert/strict';
import {selectedDay,jobDay} from './admin-job-filters.mjs';
import {importedJobPage,adminJobConditions} from './admin-job-pagination.mjs';
test('India midnight determines today and yesterday across UTC and month boundaries',()=>{
 const now=new Date('2026-10-31T20:00:00Z');assert.equal(selectedDay('today',now),'2026-11-01');assert.equal(selectedDay('yesterday',now),'2026-10-31');assert.equal(selectedDay('all',now),'');assert.equal(jobDay({publishedAt:now.toISOString()}),'2026-11-01');
});
test('date and creator filter before pagination and counts',()=>{
 const jobs=[{slug:'today-a',status:'publish',postedDate:'2026-10-21',createdBy:{id:'a'}},{slug:'today-b',status:'publish',postedDate:'2026-10-21',createdBy:{id:'b'}},{slug:'yesterday',status:'publish',postedDate:'2026-10-20',createdBy:{id:'a'}}];
 const result=importedJobPage([],jobs,new URLSearchParams({day:'2026-10-21',creator:'a',per_page:'1'}));assert.equal(result.total,1);assert.equal(result.jobs[0].slug,'today-a');assert.equal(importedJobPage([],jobs,new URLSearchParams({day:'2026-10-20'})).total,1);assert.equal(importedJobPage([],jobs,new URLSearchParams()).total,3);
});
test('legacy SQL dates are bound and creator is never guessed',()=>{
 const where=[],values=[];adminJobConditions(where,values,new URLSearchParams({day:'2026-10-21',creator:'a'}));assert.ok(where.includes('DATE(post_date) = ?'));assert.ok(values.includes('2026-10-21'));assert.ok(where.includes('1=0'));
});
