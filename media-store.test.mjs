import test from 'node:test';
import assert from 'node:assert/strict';
import {createMediaStore} from './media-store.mjs';
test('embedded uploads are saved as bytes and get a stable readable URL',async()=>{
  const calls=[];
  const store=createMediaStore({query:async(...args)=>{calls.push(args);return [[]];}});
  const url=await store.normalize('data:image/png;base64,iVBORw0KGgo=','Seha Clinics logo');
  assert.match(url,/^https:\/\/api\.trikonet\.com\/media\/images\/[a-f0-9]{64}\/seha-clinics-logo-[a-f0-9]{12}\.png$/);
  assert.ok(calls.some(([sql,args])=>sql.startsWith('INSERT IGNORE') && Buffer.isBuffer(args[3])));
});
test('failed durable storage rejects instead of falsely confirming upload',async()=>{
  const store=createMediaStore({query:async()=>{throw Error('unavailable');}});
  await assert.rejects(store.normalize('data:image/png;base64,iVBORw0KGgo='),/unavailable/);
});
