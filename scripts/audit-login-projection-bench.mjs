// Isolated local fixture only. Supply socket; never point this at production.
import mysql from 'mysql2/promise';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {readAdminLoginAccount} from '../admin-login-account.mjs';
const socket=process.argv[2]||(await readFile('/tmp/trikonet-audit-mysql-path','utf8')).trim()+'/mysql.sock';
if(!socket.startsWith('/tmp/trikonet-audit-mysql.'))throw Error('Use an isolated audit fixture socket.');
const db=await mysql.createConnection({socketPath:socket,user:'root',multipleStatements:false});
const database='trikonet_projection_fixture_'+process.pid;const results=[];
const oldSource=execFileSync('git',['show','c49024a:admin-login-account.mjs'],{cwd:fileURLToPath(new URL('../',import.meta.url)),encoding:'utf8'});
const {readAdminLoginAccount:baseline}=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
try{
 await db.query(`CREATE DATABASE ${database}`);await db.query(`USE ${database}`);
 await db.query('CREATE TABLE trikonet_app_state (state_key VARCHAR(64) PRIMARY KEY,payload LONGTEXT)');
 const users=Array.from({length:120},(_,i)=>({id:String(i),email:`fixture${i}@example.invalid`,username:'fixture'+i,name:'Fixture '+i,role:i===50?'Editor':'Candidate',passwordHash:'fixture-hash',passwordSalt:'fixture-salt',profile:{resume:'x'.repeat(64000)}}));
 const payload=JSON.stringify({users,jobs:[{description:'x'.repeat(1000000)}],resumes:['x'.repeat(1000000)]});
 await db.query("INSERT INTO trikonet_app_state VALUES ('main',?)",[payload]);
 for(let run=0;run<5;run++){
  const start=performance.now();const [rows]=await db.query("SELECT payload FROM trikonet_app_state WHERE state_key='main' LIMIT 1");const old=JSON.parse(rows[0].payload).users.find(user=>user.email==='fixture50@example.invalid');const before=performance.now()-start;
  const baseStart=performance.now();const oldProjection=await baseline(db,async()=>{},'fixture50@example.invalid');const baselineProjectionMs=performance.now()-baseStart;
  const afterStart=performance.now();const projected=await readAdminLoginAccount(db,async()=>{},'fixture50@example.invalid');const after=performance.now()-afterStart;
  assert.deepEqual(projected,oldProjection);assert.equal(projected.id,old.id);assert.equal(projected.role,old.role);assert.equal(projected.passwordHash,old.passwordHash);assert.equal(projected.profile,undefined);
  results.push({run,beforeMs:before,baselineProjectionMs,afterMs:after,fullPayloadBytes:Buffer.byteLength(payload),projectedBytes:Buffer.byteLength(JSON.stringify(projected))});
 }
 console.log(JSON.stringify({fixture:'local MariaDB; synthetic users only; no production connection',results},null,2));
}finally{await db.query(`DROP DATABASE IF EXISTS ${database}`);await db.end();}
