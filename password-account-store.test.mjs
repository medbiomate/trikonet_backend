import {test} from 'node:test';import assert from 'node:assert/strict';
import {findPasswordAccount,savePasswordSignIn} from './password-account-store.mjs';
test('password lookup transfers only matching account using a bound normalized email',async()=>{
 let sql,params;const entry=await findPasswordAccount({query:async(q,p)=>{sql=q;params=p;return [[{account:JSON.stringify({id:1,email:'User@Example.com',profile:{role:'Nurse'}}),account_index:4}]];}},'user@example.com');
 assert.equal(entry.user.id,1);assert.equal(entry.user.profile.role,'Nurse');assert.equal(entry.index,4);assert.deepEqual(params,['user@example.com']);assert.match(sql,/JSON_TABLE/);assert.match(sql,/LOWER\(TRIM\(u.email\)\)=BINARY \?/);assert.doesNotMatch(sql,/AS users/);
});
test('unknown email stays unauthenticated',async()=>{assert.equal(await findPasswordAccount({query:async()=>[[]]},'missing@example.com'),null);});
test('login persistence updates platforms only and guards account ID',async()=>{let args;await savePasswordSignIn({query:async(...values)=>{args=values;return [{affectedRows:1}]}},{index:2,user:{id:7,signInPlatforms:['app'],profile:{role:'Do not overwrite'}}});assert.equal(args[1][0],'$.users[2].signInPlatforms');assert.equal(args[1][3],'7');assert.ok(!args[1].join('').includes('Do not overwrite'))});
test('stale index fails without updating another account',async()=>{await assert.rejects(savePasswordSignIn({query:async()=>[{affectedRows:0}]},{index:0,user:{id:7}}),/Account changed/)});
