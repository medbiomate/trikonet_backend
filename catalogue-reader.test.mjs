import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalogueReader} from './catalogue-reader.mjs';
test('concurrent reads share SQL, omit private fields, and return independent objects', async()=>{
 let count=0,release;const gate=new Promise(resolve=>release=resolve);
 const read=createCatalogueReader({query:async sql=>{count++;assert.match(sql,/'jobs', JSON_EXTRACT/);assert.ok(!sql.includes('users'));assert.ok(!sql.includes('$.employers'));await gate;return [[{payload:'{"jobs":[{"id":1}]}'}]];}},async()=>{});
 const a=read(['jobs']),b=read(['jobs']);release();const [first,second]=await Promise.all([a,b]);assert.equal(count,1);first.jobs[0].id=9;assert.equal(second.jobs[0].id,1);
 await read(['jobs']);assert.equal(count,2);
});
test('database errors retry and private-field requests are rejected',async()=>{
 let fail=true;const read=createCatalogueReader({query:async()=>{if(fail)throw Error('offline');return [[{payload:'{"employers":[]}'}]];}},async()=>{});
 await assert.rejects(read(['jobs']),/offline/);fail=false;assert.deepEqual((await read(['employers'])).employers,[]);await assert.rejects(read(['users']),/Invalid/);
});
