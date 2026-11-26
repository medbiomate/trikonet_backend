import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalogueReader} from './catalogue-reader.mjs';
const tick=()=>new Promise(r=>setTimeout(r,2));
// Lets background refreshes run: each shared read starts at most one.
const settle=async(read,fields)=>{for(let i=0;i<5;i++){await read.shared(fields);await tick();}return read.shared(fields);};
const isVersion=sql=>sql.includes('updated_at');
test('concurrent reads share SQL, omit private fields, and return independent objects', async()=>{
 let count=0,release;const gate=new Promise(resolve=>release=resolve);
 const read=createCatalogueReader({query:async sql=>{if(isVersion(sql))return [[]];count++;assert.match(sql,/'jobs', JSON_EXTRACT/);assert.ok(!sql.includes('users'));assert.ok(!sql.includes('$.employers'));await gate;return [[{payload:'{"jobs":[{"id":1}]}'}]];}},async()=>{});
 const a=read(['jobs']),b=read(['jobs']);release();const [first,second]=await Promise.all([a,b]);assert.equal(count,1);first.jobs[0].id=9;assert.equal(second.jobs[0].id,1);
 await read(['jobs']);assert.equal(count,2);
});
test('database errors retry and private-field requests are rejected',async()=>{
 let fail=true;const read=createCatalogueReader({query:async sql=>{if(isVersion(sql))return [[]];if(fail)throw Error('offline');return [[{payload:'{"employers":[]}'}]];}},async()=>{});
 await assert.rejects(read(['jobs']),/offline/);fail=false;assert.deepEqual((await read(['employers'])).employers,[]);await assert.rejects(read(['users']),/Invalid/);
 await assert.rejects(read.shared(['users']),/Invalid/);
});
function versioned(options){
 const state={version:'2026-11-25 10:00:00',age:60,payload:'{"jobs":[{"id":1,"slug":"a"}]}',reads:0};
 const pool={query:async sql=>isVersion(sql)?[[{version:state.version,age:state.age}]]:(state.reads++,[[{payload:state.payload}]])};
 return {state,read:createCatalogueReader(pool,async()=>{},options)};
}
test('unchanged versions reuse the cached catalogue and still return independent objects',async()=>{
 const {state,read}=versioned();
 const first=await read(['jobs']);first.jobs[0].id=9;first.jobs.push({id:2});
 const second=await read(['jobs']);
 assert.equal(state.reads,1);assert.deepEqual(second.jobs,[{id:1,slug:'a'}]);
});
test('a new updated_at reloads the catalogue',async()=>{
 const {state,read}=versioned();
 await read(['jobs']);state.version='2026-11-25 10:05:00';state.payload='{"jobs":[{"id":3}]}';
 assert.deepEqual((await read(['jobs'])).jobs,[{id:3}]);assert.equal(state.reads,2);
});
test('rows written in the last seconds are never served from cache',async()=>{
 const {state,read}=versioned();state.age=0;
 await read(['jobs']);await read(['jobs']);assert.equal(state.reads,2);
 state.age=5;await read(['jobs']);await read(['jobs']);assert.equal(state.reads,3);
});
test('fresh reads bypass the cache and the age limit expires entries',async()=>{
 let clock=0;const state={reads:0};
 const read=createCatalogueReader({query:async sql=>isVersion(sql)?[[{version:'v',age:60}]]:(state.reads++,[[{payload:'{"jobs":[]}'}]])},async()=>{},{maxAgeMs:1000,now:()=>clock});
 await read(['jobs']);await read(['jobs']);assert.equal(state.reads,1);
 await read(['jobs'],{fresh:true});assert.equal(state.reads,2);
 clock=5000;await read(['jobs']);assert.equal(state.reads,3);
});
test('shared snapshots are reused per version and deep-frozen',async()=>{
 const {state,read}=versioned({refreshIntervalMs:0});
 const a=await read.shared(['jobs']),b=await read.shared(['jobs']);
 assert.equal(a,b);assert.equal(state.reads,1);
 assert.ok(Object.isFrozen(a.jobs[0]));assert.throws(()=>{a.jobs[0].id=5;},TypeError);assert.throws(()=>a.jobs.push({}),TypeError);
 const copy=await read(['jobs']);copy.jobs[0].id=7;assert.equal(a.jobs[0].id,1);
 state.version='next';state.payload='{"jobs":[{"id":2}]}';
 // The old snapshot is served while the new version loads in the background.
 assert.equal(await read.shared(['jobs']),a);
 const next=await settle(read,['jobs']);assert.notEqual(next,a);assert.deepEqual(next.jobs,[{id:2}]);
});
test('shared reads never wait for a slow rebuild once a snapshot exists',async()=>{
 let release,slow=false;const gate=new Promise(r=>release=r);let version='v1';
 const read=createCatalogueReader({query:async sql=>{if(isVersion(sql))return [[{version,age:60}]];if(slow)await gate;return [[{payload:'{"jobs":[{"id":"'+version+'"}]}'}]];}},async()=>{},{refreshIntervalMs:0});
 const a=await read.shared(['jobs']);
 version='v2';slow=true;
 const started=Date.now();assert.equal(await read.shared(['jobs']),a);assert.equal(await read.shared(['jobs']),a);assert.ok(Date.now()-started<50);
 release();
 assert.equal((await settle(read,['jobs'])).jobs[0].id,'v2');
});
test('a failed background refresh keeps serving the last snapshot',async()=>{
 let fail=false,version='v1';
 const read=createCatalogueReader({query:async sql=>{if(isVersion(sql))return [[{version,age:60}]];if(fail)throw Error('offline');return [[{payload:'{"jobs":[]}'}]];}},async()=>{},{refreshIntervalMs:0});
 const a=await read.shared(['jobs']);version='v2';fail=true;
 assert.equal(await read.shared(['jobs']),a);assert.equal(await settle(read,['jobs']),a);
});
test('concurrent first shared reads share one load',async()=>{
 let reads=0;const read=createCatalogueReader({query:async sql=>isVersion(sql)?[[{version:'v',age:60}]]:(reads++,[[{payload:'{"jobs":[]}'}]])},async()=>{});
 const [a,b]=await Promise.all([read.shared(['jobs']),read.shared(['jobs'])]);assert.equal(a,b);assert.equal(reads,1);
});
test('a failing version check falls back to a direct read',async()=>{
 let reads=0;const read=createCatalogueReader({query:async sql=>{if(isVersion(sql))throw Error('lock');reads++;return [[{payload:'{"jobs":[]}'}]];}},async()=>{});
 assert.deepEqual((await read(['jobs'])).jobs,[]);await read(['jobs']);assert.equal(reads,2);
});
