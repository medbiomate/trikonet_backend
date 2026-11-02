import test from 'node:test';import assert from 'node:assert/strict';
import {readAdminLoginAccount} from './admin-login-account.mjs';
test('admin login transfers credential projection only, never entire account state',async()=>{
 let sql,params,ensured=false;
 const result=await readAdminLoginAccount({query:async(q,p)=>{sql=q;params=p;return [[{account:JSON.stringify({id:'1',role:'Editor',passwordHash:'hash'})}]];}},async()=>{ensured=true;},'editor@example.com');
 assert.ok(ensured);assert.equal(result.id,'1');assert.deepEqual(params,['editor@example.com','editor@example.com']);
 assert.match(sql,/JSON_TABLE/);assert.match(sql,/passwordHash/);assert.doesNotMatch(sql,/SELECT payload|resume|profile|\.jobs/);
});
test('missing account stays unauthenticated and storage errors propagate',async()=>{
 assert.equal(await readAdminLoginAccount({query:async()=>[[]]},async()=>{},'unknown'),null);
 await assert.rejects(readAdminLoginAccount({query:async()=>{throw Error('offline');}},async()=>{},'editor'),/offline/);
});
