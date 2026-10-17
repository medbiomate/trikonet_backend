import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import {createCatalogueReader} from './catalogue-reader.mjs';
import {createEmsStateReader} from './ems-state-reader.mjs';
import {createCoordinatedTask} from './coordinated-task.mjs';

// Opt-in integration test; creates and removes only its own fixture database.
test('worker projections and cross-instance scheduling', {skip:!process.env.MEMORY_TEST_SOCKET}, async () => {
  const database=`trikonet_memory_test_${process.pid}`;
  const admin=await mysql.createConnection({socketPath:process.env.MEMORY_TEST_SOCKET,user:'root'});
  let pool;
  try {
    await admin.query(`CREATE DATABASE ${database}`);
    pool=mysql.createPool({socketPath:process.env.MEMORY_TEST_SOCKET,user:'root',database,connectionLimit:5});
    await pool.query('CREATE TABLE trikonet_app_state (state_key VARCHAR(64) PRIMARY KEY,payload LONGTEXT)');
    await pool.query('CREATE TABLE trikonet_account_deletions (user_id VARCHAR(191),status VARCHAR(20),delete_after BIGINT)');
    const payload=JSON.stringify({jobs:[{id:1,createdBy:{id:7}}],employers:[],users:[{id:7,email:'creator@example.com',profile:{resume:'x'.repeat(5_000_000)}},{id:'deleted',email:'gone@example.com'},{id:'pending',email:'pending@example.com'}],resumes:['x'.repeat(5_000_000)]});
    await pool.query("INSERT INTO trikonet_app_state VALUES ('main',?)",[payload]);
    await pool.query("INSERT INTO trikonet_account_deletions VALUES ('deleted','deleted',0),('pending','pending',?)",[Date.now()+86400000]);
    const read=createEmsStateReader(pool,createCatalogueReader(pool,async()=>{}),async()=>{});
    const data=await read();
    assert.deepEqual(data.users,[{id:'7',email:'creator@example.com'},{id:'pending',email:'pending@example.com'}]);
    assert.equal(data.jobs[0].id,1);
    assert.ok(JSON.stringify(data).length<500,'private multi-megabyte state stays in SQL');
    let calls=0,time=1000,release;
    const gate=new Promise(resolve=>release=resolve);
    const first=createCoordinatedTask(pool,'ems-test',30000,async()=>{calls++;await gate;},()=>time);
    const second=createCoordinatedTask(pool,'ems-test',30000,async()=>{calls++;},()=>time);
    const pending=first();
    while(!calls)await new Promise(resolve=>setTimeout(resolve,5));
    await second();assert.equal(calls,1,'another process cannot overlap the task');
    release();await pending;await second();assert.equal(calls,1,'staggered process respects cooldown');
    time+=30001;await second();assert.equal(calls,2);
    const fail=createCoordinatedTask(pool,'failure-test',1,async()=>{throw Error('expected');},()=>time);
    await assert.rejects(fail(),/expected/);
    time+=2;let recovered=false;
    await createCoordinatedTask(pool,'failure-test',1,async()=>{recovered=true;},()=>time)();
    assert.ok(recovered,'failed task releases the lock and can retry');
  } finally {
    await pool?.end();
    await admin.query(`DROP DATABASE IF EXISTS ${database}`);
    await admin.end();
  }
});
