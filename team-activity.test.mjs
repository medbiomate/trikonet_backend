import test from 'node:test';
import assert from 'node:assert/strict';
import {teamActivity} from './team-activity.mjs';
const hasna={id:'hasna',name:'Hasna'}, sahana={id:'sahana',name:'Sahana'};
const job=(extra={})=>({id:'1',slug:'nurse',status:'publish',createdBy:hasna,createdAt:'2026-10-18T05:00:00Z',emsFirstPublishedAt:'2026-10-18T05:00:00Z',...extra});
test('uses real editor rather than original creator or refreshed display date',()=>{
 const result=teamActivity({jobs:[job({datePosted:'2026-10-19',updatedBy:{...sahana,at:'2026-10-19T05:00:00Z'}})]},'2026-10-19');
 assert.deepEqual(result.rows.map(r=>[r.name,r.jobsAdded,r.jobsEdited]),[['Sahana',0,1]]);
});
test('counts first publication once, excludes drafts and autosaves, and respects IST midnight',()=>{
 const fresh=job({emsFirstPublishedAt:'2026-10-18T18:31:00Z',updatedBy:{...hasna,at:'2026-10-19T09:00:00Z'}});
 const result=teamActivity({jobs:[fresh,fresh,job({id:'draft',status:'draft'}),job({id:'auto',slug:'autosave-x'}),job({id:'earlier',emsFirstPublishedAt:'2026-10-18T18:29:00Z'})]},'2026-10-19');
 assert.equal(result.totals.jobsAdded,1);assert.equal(result.totals.jobsEdited,0);
});
test('includes both new and edited employers in operator and overall totals',()=>{
 const employers=[job({id:'company',emsFirstPublishedAt:'2026-10-19T05:00:00Z'}),job({id:'company2',updatedBy:{...hasna,at:'2026-10-19T06:00:00Z'}})];
 const result=teamActivity({employers,jobs:[job({updatedBy:{...hasna,at:'2026-10-19T07:00:00Z'}})]},'2026-10-19');
 assert.equal(result.totals.employersAdded,1);assert.equal(result.totals.employersEdited,1);assert.equal(result.totals.total,3);assert.equal(result.rows[0].total,3);
});
test('does not invent attribution for legacy records',()=>{
 const result=teamActivity({jobs:[job({createdBy:null,emsFirstPublishedAt:'2026-10-19T05:00:00Z'})]},'2026-10-19');
 assert.equal(result.rows.length,0);assert.equal(result.totals.total,0);
});
