import test from 'node:test';
import assert from 'node:assert/strict';
import {mapLimited} from './map-limited.mjs';
test('large catalogues preserve order and never start more than eight transforms',async()=>{
  let active=0,peak=0;
  const items=Array.from({length:1000},(_,i)=>i);
  const output=await mapLimited(items,async value=>{
    active++;peak=Math.max(peak,active);
    await new Promise(resolve=>setImmediate(resolve));
    active--;return value*2;
  });
  assert.equal(peak,8);assert.deepEqual(output,items.map(i=>i*2));
});
test('empty catalogues and failed transforms settle correctly',async()=>{
  assert.deepEqual(await mapLimited([],()=>{throw Error('unused');}),[]);
  await assert.rejects(mapLimited([1,2,3],async value=>{if(value===2)throw Error('storage unavailable');return value;}),/storage unavailable/);
});
