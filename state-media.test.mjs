import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareStateMedia} from './state-media.mjs';
test('saving one draft in a large catalogue processes only that draft and never publishes media',async()=>{
 const before={jobs:Array.from({length:15000},(_,id)=>({id,title:'Job',logo:'/logo.png'})),employers:[{id:'e',logo:'/existing.png'}],users:[]};
 const next=structuredClone(before);next.jobs[100].title='Edited';
 const normalized=[];
 const result=await prepareStateMedia(next,before,{normalize:async record=>{normalized.push(record);return record;},publish:()=>{throw Error('must not upload catalogue');}});
 assert.equal(normalized.length,1);assert.equal(normalized[0].id,100);
 assert.equal(result.jobs.length,15000);assert.deepEqual(result.employers,before.employers);
});
test('account-only writes leave job and employer media untouched',async()=>{
 const before={jobs:[{id:'j'}],employers:[{id:'e'}],users:[]};
 const next={...before,users:[{id:'user'}]};const processed=[];
 await prepareStateMedia(next,before,{normalize:async value=>{processed.push(value);return value;}});
 assert.deepEqual(processed,[next.users]);
});
