import test from 'node:test';
import assert from 'node:assert/strict';
import {jobCreator,withoutTeamAttribution} from './job-attribution.mjs';
test('creator is assigned once, preserved on edits and never invented for legacy jobs',()=>{
 const admin={userId:1,name:'Team member'};const createdBy=jobCreator(null,admin);
 assert.deepEqual(createdBy,{id:'1',name:'Team member'});
 assert.equal(jobCreator({createdBy},{userId:2,name:'Editor'}),createdBy);
 assert.equal(jobCreator({slug:'legacy'},admin),null);
});
test('public nested responses contain no team attribution',()=>assert.deepEqual(withoutTeamAttribution({jobs:[{slug:'job',createdBy:{name:'Private'}}]}),{jobs:[{slug:'job'}]}));
