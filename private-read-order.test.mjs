import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const source=readFileSync(new URL('./server.mjs',import.meta.url),'utf8');
for(const [marker,path] of [["  if (path === '/api/local/jobs' && req.method === 'GET') {",'/api/local/jobs'],["  if (path.startsWith('/api/local/jobs/') && req.method === 'GET') {",'/api/local/jobs/fixture']])test(`unauthenticated admin read rejects before catalogue SQL: ${path}`,async()=>{
 const start=source.indexOf(marker),body=source.slice(start,source.indexOf('\n  }',start)+4);let reads=0,response;
 const context={path,req:{method:'GET'},res:{},requestUrl:new URL('https://fixture.invalid'+path+'?admin=1'),currentAdminSession:async()=>null,readCatalogueDb:async()=>{reads++;throw Error('Must not query jobs');},sendJson:(_req,_res,status,data)=>{response={status,data};},decodeURIComponent};
 vm.createContext(context);await vm.runInContext('(async()=>{'+body+'})()',context);
 assert.equal(reads,0);assert.equal(response.status,401);
});
