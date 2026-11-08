import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createPublicRequestGate} from './public-request-gate.mjs';

class Response extends EventEmitter {
  destroyed = false;
  writeHead(status, headers) { this.status=status; this.headers=headers; }
  end(body) { this.body=body; }
}

test('a burst shares one serialized buffer without duplicating response work', async () => {
  const gate=createPublicRequestGate(), owner=new Response();
  assert.equal(await gate.waitOrOwn('jobs|origin|gzip',owner),false);
  const responses=Array.from({length:30},()=>new Response());
  const waiting=responses.map(res=>gate.waitOrOwn('jobs|origin|gzip',res));
  const body=Buffer.from('compressed public response');
  const headers={'Content-Encoding':'gzip','Access-Control-Allow-Origin':'capacitor://localhost'};
  gate.complete(owner,200,body,headers);
  assert.ok((await Promise.all(waiting)).every(Boolean));
  for(const res of responses){assert.equal(res.body,body);assert.equal(res.headers,headers);assert.equal(res.status,200);}
  assert.equal(owner.listenerCount('close'),0);
  assert.equal(await gate.waitOrOwn('jobs|origin|gzip',new Response()),false);
});

test('different origin/encoding keys run independently; disconnected owners release waiters', async () => {
  const gate=createPublicRequestGate(),owner=new Response(),retry=new Response();
  await gate.waitOrOwn('jobs|a|gzip',owner);
  assert.equal(await gate.waitOrOwn('jobs|b|identity',new Response()),false);
  const waiting=gate.waitOrOwn('jobs|a|gzip',retry);
  owner.emit('close');
  assert.equal(await waiting,false);
  gate.complete(retry,200,Buffer.from('ok'),{});
});

test('failed responses are not reused and disconnected followers are not written', async () => {
  const gate=createPublicRequestGate(),owner=new Response(),retry=new Response(),gone=new Response();
  await gate.waitOrOwn('jobs',owner);
  const waiting=gate.waitOrOwn('jobs',retry);
  const abandoned=gate.waitOrOwn('jobs',gone);gone.destroyed=true;
  gate.complete(owner,503,Buffer.from('unavailable'),{});
  assert.equal(await waiting,false);
  assert.equal(await abandoned,true);
  assert.equal(gone.body,undefined);
  assert.equal(retry.body,undefined);
  gate.complete(retry,200,Buffer.from('recovered'),{});
});
