import test from 'node:test';import assert from 'node:assert/strict';
import {findGoogleAccount,saveGoogleAccount} from './google-account-store.mjs';
test('account lookup handles SQL JSON text and finds the correct index',async()=>{
 const entry=await findGoogleAccount({query:async sql=>{assert.ok(sql.includes("'$.users'"));return [[{users:JSON.stringify([{id:'a'},{id:'b',googleSubject:'match'}])}]]}},'match');
 assert.equal(entry.index,1);assert.equal(entry.user.id,'b');
});
test('missing identity falls back to account linking',async()=>{assert.equal(await findGoogleAccount({query:async()=>[[{users:[]}]]},'missing'),null)});
test('targeted update checks account identity and preserves catalogue fields',async()=>{
 await saveGoogleAccount({query:async(sql,args)=>{assert.ok(sql.includes('JSON_SET(payload'));assert.equal(args[0],'$.users[3]');assert.equal(args[2],'$.users[3].id');assert.equal(args[3],'b');return [{affectedRows:1}]}},{index:3,user:{id:'b'}});
 await assert.rejects(()=>saveGoogleAccount({query:async()=>[{affectedRows:0}]},{index:3,user:{id:'b'}}),/Account changed/);
});
