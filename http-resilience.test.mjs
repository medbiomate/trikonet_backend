import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {EventEmitter} from 'node:events';
import {createResilientHandler} from './http-resilience.mjs';

test('real HTTP failures return 503 and the next request still succeeds', async t=>{
  const logs=[];
  const handler=createResilientHandler(async(req,res)=>{
    if(req.url==='/fail')throw Error('SECRET must not appear in logs');
    if(req.url==='/partial'){res.writeHead(200);res.write('partial');throw Error('stream failed');}
    res.end('ok');
  },{logger:line=>logs.push(line)});
  const server=http.createServer(handler);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
  const base=`http://127.0.0.1:${server.address().port}`;
  const failed=await fetch(base+'/fail');assert.equal(failed.status,503);await failed.text();
  await assert.rejects(async()=>{const partial=await fetch(base+'/partial');await partial.text();});
  const good=await fetch(base+'/ok');assert.equal(await good.text(),'ok');
  assert.equal(logs.length,2);assert.ok(logs.every(line=>!line.includes('SECRET')));
  assert.equal(handler.metrics().requestFailures,2);
});

class Response extends EventEmitter {
  destroyed=false;writableEnded=false;writableFinished=false;headersSent=false;
  writeHead(status,headers){this.status=status;this.headers=headers;this.headersSent=true;}
  end(body){this.body=body;this.writableEnded=true;this.writableFinished=true;this.emit('finish');}
  destroy(){this.destroyed=true;this.emit('close');}
}

test('overload has no waiting queue, keeps liveness available and recovers',async()=>{
  let release;const blocked=new Promise(resolve=>release=resolve);
  const handler=createResilientHandler(async(req,res)=>{await blocked;res.end('done');},{maxActive:2});
  const first=new Response(),second=new Response();
  const a=handler({method:'GET',url:'/jobs'},first),b=handler({method:'GET',url:'/jobs'},second);
  for(let i=0;i<100;i++){const res=new Response();handler({method:'GET',url:'/jobs'},res);assert.equal(res.status,503);assert.equal(res.headers['Retry-After'],'5');}
  assert.equal(handler.metrics().activeRequests,2);
  const live=new Response();handler({method:'GET',url:'/api/live'},live);assert.equal(live.status,200);
  // Closing the socket must not permit more work while its task still runs.
  first.destroy();assert.equal(handler.metrics().activeRequests,2);
  release();await Promise.all([a,b]);assert.equal(handler.metrics().activeRequests,0);
  const recovered=new Response();await handler({method:'GET',url:'/jobs'},recovered);assert.equal(recovered.body,'done');
  assert.equal(handler.metrics().peakRequests,2);assert.equal(handler.metrics().rejectedRequests,100);
});

test('an error after headers closes the response and logger failure cannot escape',async()=>{
  const handler=createResilientHandler(async(req,res)=>{res.writeHead(200,{});throw Error('failure');},{logger:()=>{throw Error('logger failed');}});
  const res=new Response();await handler({method:'GET',url:'/partial'},res);assert.ok(res.destroyed);assert.equal(handler.metrics().activeRequests,0);
});
