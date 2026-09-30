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
test('verified public R2 copies replace origin URLs without exposing private uploads',async()=>{
  const keys=['R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET','R2_PUBLIC_URL'];
  const saved=keys.map(key=>process.env[key]);const originalFetch=globalThis.fetch;
  try {
    keys.forEach(key=>process.env[key]='test');
    const checksum='a'.repeat(64),public_url='https://media.trikonet.com/images/company-logo.webp';
    globalThis.fetch=async()=>({ok:true});
    const store=createMediaStore({query:async sql=>[sql.startsWith('SELECT attachment_id')?[{attachment_id:1,checksum,public_url}]:[]]});
    assert.equal(await store.normalize(`https://api.trikonet.com/media/images/${checksum}/logo.webp`),public_url);
    const privateUrl=`https://api.trikonet.com/media/images/${'b'.repeat(64)}/profile.webp`;
    assert.equal(await store.normalize(privateUrl),privateUrl);
  } finally {globalThis.fetch=originalFetch;keys.forEach((key,i)=>{if(saved[i]===undefined)delete process.env[key];else process.env[key]=saved[i];});}
});
