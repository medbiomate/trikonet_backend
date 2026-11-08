import test from 'node:test';
import assert from 'node:assert/strict';
import {boundedResponseBytes} from './bounded-response.mjs';

test('rejects a declared oversized download without reading it',async()=>{
  let cancelled=false;
  const response={headers:new Headers({'content-length':'1000'}),body:{cancel:async()=>{cancelled=true;}}};
  await assert.rejects(boundedResponseBytes(response,10),/too large/);assert.ok(cancelled);
});
test('cancels chunked oversized bodies while reading, even with a false size header',async()=>{
  let cancelled=false;
  const stream=new ReadableStream({pull(c){c.enqueue(new Uint8Array(8));},cancel(){cancelled=true;}});
  await assert.rejects(boundedResponseBytes(new Response(stream,{headers:{'content-length':'1'}}),10),/too large/);
  assert.ok(cancelled);
});
test('valid bytes survive exactly at the limit',async()=>{
  const bytes=await boundedResponseBytes(new Response(Uint8Array.from([0,255,128,1])),4);
  assert.deepEqual([...bytes],[0,255,128,1]);
});
