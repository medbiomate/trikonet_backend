import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeoRepository} from './seo-job-pages.mjs';
import {mergeStateChanges} from './state-changes.mjs';

test('repeated startup registration skips catalogue loading and preserves manual settings',async()=>{
 const saved={id:'main',pageType:'main_category',category:'Accounting or Finance',slug:'custom-accounting',status:'Draft',seoTitle:'Manual title'};
 let catalogueReads=0;
 const pool={query:async sql=>{if(sql.startsWith('CREATE'))return [[]];if(sql.startsWith('SELECT'))return [[{payload:JSON.stringify(saved)}]];throw Error('Unexpected write');}};
 const repo=createSeoRepository(pool,async()=>{throw Error('Unexpected full-state read');},async()=>{catalogueReads++;throw Error('Catalogue should not load');});
 for(let i=0;i<3;i++)assert.deepEqual(await repo.createMain({category:'Accounting or Finance',slug:'replacement',onlyIfMissing:true}),saved);
 assert.equal(catalogueReads,0);
});
test('serialized baseline preserves concurrent account and catalogue edits',()=>{
 const db={users:[{id:'u',profile:{role:'Nurse'},lastSeen:1}],jobs:[{id:'j',title:'Old'}],resumes:[{id:'r',userId:'u',state:{text:'CV'}}]};
 const snapshot=JSON.stringify(db);
 db.users[0].lastSeen=2;
 const current=JSON.parse(snapshot);current.users[0].profile.role='Doctor';current.jobs[0].title='New';current.users.push({id:'new',profile:{}});
 const merged=mergeStateChanges(current,JSON.parse(snapshot),db);
 assert.equal(merged.users[0].lastSeen,2);assert.equal(merged.users[0].profile.role,'Doctor');assert.equal(merged.jobs[0].title,'New');assert.equal(merged.users.length,2);
 assert.equal(merged.resumes[0].state.text,'CV');
});
