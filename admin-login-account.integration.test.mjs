import test from 'node:test';import assert from 'node:assert/strict';import mysql from 'mysql2/promise';
import {findPasswordAccount} from './password-account-store.mjs';
import {candidateProfileRequest} from './candidate-profile-store.mjs';
import {readAdminLoginAccount} from './admin-login-account.mjs';
test('projected login matches stored numeric and string identities without profiles',{skip:!process.env.AUDIT_MYSQL_SOCKET},async()=>{
 const socket=process.env.AUDIT_MYSQL_SOCKET;
 assert.ok(socket.startsWith('/tmp/trikonet-audit-mysql.'),'Only isolated fixture sockets are allowed');
 const db=await mysql.createConnection({socketPath:socket,user:'root'});const name='trikonet_login_fixture_'+process.pid;
 try{
  await db.query(`CREATE DATABASE ${name}`);await db.query(`USE ${name}`);await db.query('CREATE TABLE trikonet_app_state (state_key VARCHAR(64) PRIMARY KEY,payload LONGTEXT,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
  const users=[{id:42,username:'Editor',email:'EDITOR@example.invalid',name:'Éditor',role:'Editor',status:'active',passwordSalt:'salt',passwordHash:'hash',profile:{resume:'private'}},{id:'uuid-fixture',username:'Admin',email:'admin@example.invalid',role:'Administrator',status:'inactive',salt:'legacy',hash:'legacyhash'}];
  await db.query("INSERT INTO trikonet_app_state (state_key,payload) VALUES ('main',?)",[JSON.stringify({users,resumes:['large private data']})]);
  for(const [identity,expected] of [['editor',users[0]],['editor@example.invalid',users[0]],['admin',users[1]]]){
   const value=await readAdminLoginAccount(db,async()=>{},identity);
   for(const key of ['id','username','email','name','role','status','passwordSalt','salt','passwordHash','hash'])assert.deepEqual(value[key]??null,expected[key]??null);
   assert.equal(value.profile,undefined);
  }
  const matched=await findPasswordAccount(db,'editor@example.invalid');assert.equal(matched.index,0);assert.equal(matched.user.id,42);assert.equal(matched.user.profile.resume,'private');
  const pool={getConnection:async()=>({query:db.query.bind(db),beginTransaction:db.beginTransaction.bind(db),commit:db.commit.bind(db),rollback:db.rollback.bind(db),release(){}})};
  assert.equal((await candidateProfileRequest(pool,'GET','uuid-fixture'))[0],200);
  assert.equal((await candidateProfileRequest(pool,'GET','missing'))[0],404);
  const saved=await candidateProfileRequest(pool,'POST',42,{name:'Updated Fixture'});assert.equal(saved[0],200);
  const [state]=await db.query("SELECT payload FROM trikonet_app_state WHERE state_key='main'");const actual=JSON.parse(state[0].payload);assert.equal(actual.users[0].name,'Updated Fixture');assert.deepEqual(actual.users[1],users[1]);assert.deepEqual(actual.resumes,['large private data']);
  assert.equal(await readAdminLoginAccount(db,async()=>{},'missing'),null);
 }finally{await db.query(`DROP DATABASE IF EXISTS ${name}`);await db.end();}
});
