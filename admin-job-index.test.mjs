import test from 'node:test';
import assert from 'node:assert/strict';
import {indexJob,indexWhere,createAdminJobIndex} from './admin-job-index.mjs';
import {createEditorState} from './editor-state.mjs';
import mysql from 'mysql2/promise';
test('compact rows retain identity and attribution without full job descriptions',()=>{
 const row=indexJob({id:'stable',slug:'job',title:'Nurse',status:'active',publishedAt:'2026-10-21T04:00:00Z',createdBy:{id:'a',name:'Author'},description:'Large HTML',recoveryDraft:{description:'private draft'},local:true,categories:['Healthcare']});
 assert.equal(row[1],'publish');assert.equal(row[2],'2026-10-21');assert.equal(row[4],'a');assert.equal(JSON.parse(row[11]).description,undefined);assert.equal(JSON.parse(row[11]).id,'stable');
});
test('filters bind date, creator and literal search terms, with no unbounded SQL interpolation',()=>{
 const p=new URLSearchParams({period:'2026-10-20',creator:"a'",status:'mine',q:'50%_test',category:'Healthcare'});
 const where=indexWhere(p,{userId:'a',email:'A@EXAMPLE.COM'});
 assert.ok(where.sql.includes('job_day=?'));assert.ok(!where.sql.includes("a'"));assert.ok(where.values.includes('%50=%=_test%'));assert.ok(where.values.includes('healthcare'));assert.ok(where.values.includes('a@example.com'));
});
test('real database: indexed pages, filtered counts and transactional saves across 15,000 jobs',{skip:!process.env.TEST_MYSQL_SOCKET},async()=>{
 const dbName='trikonet_index_test_'+Date.now();
 const admin=await mysql.createConnection({socketPath:process.env.TEST_MYSQL_SOCKET,user:'root'});
 await admin.query(`CREATE DATABASE ${dbName}`);
 const pool=mysql.createPool({socketPath:process.env.TEST_MYSQL_SOCKET,user:'root',database:dbName,connectionLimit:5,dateStrings:true});
 try{
  await pool.query('CREATE TABLE trikonet_app_state(state_key VARCHAR(64) PRIMARY KEY,payload LONGTEXT,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
  const locals=[{id:'one',slug:'import-1',title:'Latest override',status:'publish',postedDate:'2026-10-21',publishedAt:'2026-10-21T08:00:00Z',createdBy:{id:'a',email:'a@test.com',name:'A'},local:true},{id:'two',slug:'draft',title:'Draft',status:'draft',createdAt:'2026-10-21T07:00:00Z',createdBy:{id:'b',name:'B'},local:true}];
  await pool.query("INSERT INTO trikonet_app_state VALUES('main',?,CURRENT_TIMESTAMP)",[JSON.stringify({jobs:locals,users:[{id:'private'}]})]);
  const imported=Array.from({length:15000},(_,i)=>({id:i,slug:'import-'+i,title:{rendered:'Imported '+i},status:'publish',date:'2026-10-20T10:00:00',metas:{_job_category:{one:'Healthcare'},_job_type:{one:'Full Time'}}}));
  const index=createAdminJobIndex(pool,async()=>imported,async()=>{});await index.ensure();
  const who={userId:'a',email:'a@test.com'};
  const today=await index.page(new URLSearchParams({period:'2026-10-21',status:'all'}),who);
  assert.equal(today.total,2);assert.equal(today.counts.publish,1);assert.equal(today.counts.draft,1);assert.equal(today.counts.mine,1);
  assert.equal(today.jobs[0].title,'Latest override');
  const yesterday=await index.page(new URLSearchParams({period:'2026-10-20',status:'all',page:'2',per_page:'20'}),who);
  assert.equal(yesterday.total,14999);assert.equal(yesterday.jobs.length,20);assert.equal(yesterday.page,2);
  const creator=await index.page(new URLSearchParams({period:'all',creator:'b',status:'draft'}),who);assert.equal(creator.total,1);
  const category=await index.page(new URLSearchParams({period:'all',category:'healthcare'}),who);assert.equal(category.total,14999);
  // On ready reads the application state is never selected or transferred.
  const queries=[];const original=pool.getConnection.bind(pool);
  pool.getConnection=async()=>{const c=await original();const q=c.query.bind(c);c.query=(sql,...args)=>{queries.push(sql);return q(sql,...args);};return c;};
  const start=performance.now();await Promise.all(Array.from({length:5},()=>index.page(new URLSearchParams({period:'2026-10-21'}),who)));
  assert.ok(!queries.some(sql=>sql.includes('trikonet_app_state')));console.log('Five indexed list reads (ms):',Math.round(performance.now()-start));
  // Two editors save independently, and both rows become immediately visible.
  const editor=createEditorState(pool,async()=>{}, {normalize:async x=>x},index);
  const a=await editor.read(),b=await editor.read();
  a.jobs.push({id:'a-new',slug:'a-new',title:'A new',status:'publish',postedDate:'2026-10-21',local:true});
  b.jobs.push({id:'b-new',slug:'b-new',title:'B new',status:'draft',createdAt:'2026-10-21T08:00:00Z',local:true});
  await Promise.all([editor.write(a),editor.write(b)]);
  assert.equal((await index.page(new URLSearchParams({period:'2026-10-21'}),who)).total,4);
  const [state]=await pool.query("SELECT payload FROM trikonet_app_state WHERE state_key='main'");assert.equal(JSON.parse(state[0].payload).users[0].id,'private');
  // An index failure rolls back the authoritative save too: no stale list.
  const failing=createEditorState(pool,async()=>{}, {normalize:async x=>x},{ensure:()=>index.ensure(),sync:async()=>{throw Error('index write failed');}});
  const failState=await failing.read();failState.jobs.push({id:'rollback',slug:'rollback',title:'Must not save',status:'draft'});
  await assert.rejects(failing.write(failState),/index write failed/);
  const [rolledBack]=await pool.query("SELECT payload FROM trikonet_app_state WHERE state_key='main'");assert.equal(JSON.parse(rolledBack[0].payload).jobs.some(j=>j.slug==='rollback'),false);
  // Deleting a local override restores the imported original in the index.
  const next=await editor.read();next.jobs=next.jobs.filter(j=>j.slug!=='import-1');await editor.write(next);
  assert.equal((await index.page(new URLSearchParams({period:'2026-10-20',q:'Imported 1'}),who)).total>0,true);
 }finally{await pool.end();await admin.query(`DROP DATABASE ${dbName}`);await admin.end();}
});
