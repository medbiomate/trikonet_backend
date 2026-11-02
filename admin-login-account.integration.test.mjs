import test from 'node:test';import assert from 'node:assert/strict';import mysql from 'mysql2/promise';
import {readAdminLoginAccount} from './admin-login-account.mjs';
test('projected login matches stored numeric and string identities without profiles',{skip:!process.env.AUDIT_MYSQL_SOCKET},async()=>{
 const socket=process.env.AUDIT_MYSQL_SOCKET;
 assert.ok(socket.startsWith('/tmp/trikonet-audit-mysql.'),'Only isolated fixture sockets are allowed');
 const db=await mysql.createConnection({socketPath:socket,user:'root'});const name='trikonet_login_fixture_'+process.pid;
 try{
  await db.query(`CREATE DATABASE ${name}`);await db.query(`USE ${name}`);await db.query('CREATE TABLE trikonet_app_state (state_key VARCHAR(64) PRIMARY KEY,payload LONGTEXT)');
  const users=[{id:42,username:'Editor',email:'EDITOR@example.invalid',name:'Éditor',role:'Editor',status:'active',passwordSalt:'salt',passwordHash:'hash',profile:{resume:'private'}},{id:'uuid-fixture',username:'Admin',email:'admin@example.invalid',role:'Administrator',status:'inactive',salt:'legacy',hash:'legacyhash'}];
  await db.query("INSERT INTO trikonet_app_state VALUES ('main',?)",[JSON.stringify({users,resumes:['large private data']})]);
  for(const [identity,expected] of [['editor',users[0]],['editor@example.invalid',users[0]],['admin',users[1]]]){
   const value=await readAdminLoginAccount(db,async()=>{},identity);
   for(const key of ['id','username','email','name','role','status','passwordSalt','salt','passwordHash','hash'])assert.deepEqual(value[key]??null,expected[key]??null);
   assert.equal(value.profile,undefined);
  }
  assert.equal(await readAdminLoginAccount(db,async()=>{},'missing'),null);
 }finally{await db.query(`DROP DATABASE IF EXISTS ${name}`);await db.end();}
});
