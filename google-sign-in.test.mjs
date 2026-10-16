import {test} from 'node:test';import assert from 'node:assert/strict';import {googleAccount,googleIdentity} from './google-sign-in.mjs';
test('Google-managed address links existing candidate and preserves password',async()=>{const db={users:[{id:'a',email:'test@gmail.com',role:'Candidate',passwordHash:'unchanged'}]};const user=await googleAccount({sub:'google-a',email:'test@gmail.com',name:'Test'}, {readLocalDb:async()=>db,writeLocalDb:async()=>{}});assert.equal(user.id,'a');assert.equal(user.passwordHash,'unchanged');assert.equal(db.users.length,1)});
test('third party email cannot take over an existing account',async()=>{const db={users:[{id:'a',email:'test@example.com',role:'Candidate'}]};await assert.rejects(()=>googleAccount({sub:'google-a',email:'test@example.com'},{readLocalDb:async()=>db,writeLocalDb:async()=>assert.fail()}));});
test('unconfigured and forged tokens are rejected',async()=>{await assert.rejects(()=>googleIdentity('fake',''));await assert.rejects(()=>googleIdentity('fake','client-id'));});
test('Google cannot attach itself to an administrator account',async()=>{const db={users:[{id:'admin',email:'admin@gmail.com',role:'Admin'}]};await assert.rejects(()=>googleAccount({sub:'google-admin',email:'admin@gmail.com'},{readLocalDb:async()=>db,writeLocalDb:async()=>assert.fail()}));assert.equal(db.users[0].googleSubject,undefined);});
test('local server creates a candidate and reuses its Google identity',async()=>{const db={users:[]};const options={readLocalDb:async()=>db,writeLocalDb:async()=>{},candidateRole:'candidate'};const identity={sub:'google-new',email:'new@gmail.com',name:'New Candidate'};const user=await googleAccount(identity,options);assert.equal(user.role,'candidate');assert.equal((await googleAccount(identity,options)).id,user.id);assert.equal(db.users.length,1);});

test('Google sign-in accepts legacy and normalized candidate roles',async()=>{
 for(const role of [undefined,'candidate','Subscriber','Job Seeker']){
  const db={users:[{id:'a',email:'legacy@gmail.com',role,passwordHash:'preserved',profile:{skills:'Excel'}}]};
  const user=await googleAccount({sub:'legacy',email:'legacy@gmail.com'}, {readLocalDb:async()=>db,writeLocalDb:async()=>{}});
  assert.equal(user.id,'a');assert.equal(user.passwordHash,'preserved');assert.equal(user.profile.skills,'Excel');
 }
});
test('Google cannot attach itself to a privileged or inactive account',async()=>{
 for(const fields of [{role:'Administrator'},{role:'Employer'},{role:'Candidate',status:'inactive'}]){
  const user={id:'a',email:'blocked@gmail.com',...fields};const db={users:[user]};
  await assert.rejects(()=>googleAccount({sub:'other',email:user.email},{readLocalDb:async()=>db,writeLocalDb:async()=>assert.fail('Must not write blocked account')}));assert.equal(user.googleSubject,undefined);
 }
});
test('sign-in records metadata and links identity with one database read and write',async()=>{
 let reads=0,writes=0;const db={users:[{id:'one',email:'once@gmail.com',role:'Candidate',profile:{role:'Accountant'}}]};
 const user=await googleAccount({sub:'once',email:'once@gmail.com'},{readLocalDb:async()=>{reads++;return db},writeLocalDb:async()=>{writes++},onSignIn:user=>{user.lastSignInPlatform='app'}});
 assert.equal(reads,1);assert.equal(writes,1);assert.equal(user.lastSignInPlatform,'app');assert.equal(user.profile.role,'Accountant');
});
test('a blocked Google account cannot record a successful sign-in',async()=>{
 const db={users:[{id:'one',email:'blocked@gmail.com',googleSubject:'blocked',role:'Employer'}]};
 await assert.rejects(()=>googleAccount({sub:'blocked',email:'blocked@gmail.com'},{readLocalDb:async()=>db,writeLocalDb:async()=>assert.fail(),onSignIn:()=>assert.fail()}));
});
test('returning Google account bypasses full catalogue reads and writes',async()=>{
 const user={id:'fast',googleSubject:'fast-google',email:'fast@gmail.com',role:'Candidate',profile:{role:'Developer'}};let saved=0;
 const result=await googleAccount({sub:'fast-google',email:user.email},{readLocalDb:async()=>assert.fail('No catalogue read'),writeLocalDb:async()=>assert.fail('No catalogue write'),findExisting:async()=>({user,index:2}),saveExisting:async entry=>{saved++;assert.equal(entry.user.id,'fast')},onSignIn:user=>{user.lastSignInPlatform='app'}});
 assert.equal(result,user);assert.equal(saved,1);
});
