import test from 'node:test';
import assert from 'node:assert/strict';
import {createCandidateStateStore} from './candidate-state-store.mjs';
function fakePool(state){
 const log=[];
 const run=async(sql,args=[])=>{
  log.push(sql);
  if(sql.includes("JSON_TABLE(s.payload,'$.users[*]'")){const i=state.users.findIndex(u=>u.id===args[0]);return [i<0?[]:[{account:JSON.stringify(state.users[i]),account_index:i}]];}
  if(sql.startsWith('SELECT CAST(JSON_EXTRACT(payload,?)')){const v=state[args[0].slice(2)];return [[{value:v===undefined?null:JSON.stringify(v)}]];}
  if(sql.startsWith('UPDATE trikonet_app_state')){
   assert.match(sql,/updated_at=updated_at/);
   const m=args[0].match(/^\$\.users\[(\d+)\]$/);
   if(m)state.users[Number(m[1])]=JSON.parse(args[1]);else state[args[0].slice(2)]=JSON.parse(args[1]);
   return [{}];
  }
  return [[]];
 };
 const connection={query:run,beginTransaction:async()=>log.push('BEGIN'),commit:async()=>log.push('COMMIT'),rollback:async()=>log.push('ROLLBACK'),release(){}};
 return {pool:{query:run,getConnection:async()=>connection},log};
}
test('reads and updates one account without touching others',async()=>{
 const state={users:[{id:'a',name:'A'},{id:'b',name:'B',memberActivity:{}}]};
 const {pool,log}=fakePool(state);const store=createCandidateStateStore(pool);
 assert.equal((await store.readAccount('b')).name,'B');
 const result=await store.updateAccount('b',user=>{user.memberActivity.saved_jobs=['x'];return {save:true};});
 assert.deepEqual(result.user.memberActivity.saved_jobs,['x']);
 assert.deepEqual(state.users[1].memberActivity.saved_jobs,['x']);assert.equal(state.users[0].name,'A');
 assert.ok(log.some(sql=>String(sql).includes('FOR UPDATE')));assert.ok(log.includes('COMMIT'));
});
test('unsaved changes write nothing and missing or deleted accounts return null',async()=>{
 const state={users:[{id:'a'}]};const {pool,log}=fakePool(state);
 const store=createCandidateStateStore(pool,{isDeleted:async id=>id==='gone'});
 await store.updateAccount('a',()=>({save:false}));
 assert.ok(!log.some(sql=>String(sql).startsWith('UPDATE')));
 assert.equal(await store.readAccount('missing'),null);
 assert.equal(await store.updateAccount('missing',()=>({save:true})),null);
 assert.equal(await store.readAccount('gone'),null);
});
test('fields are read and replaced as a whole list; other keys are refused',async()=>{
 const state={users:[],resumes:[{id:'r1',userId:'a'},{id:'r2',userId:'b'}]};const {pool}=fakePool(state);
 const store=createCandidateStateStore(pool);
 assert.equal((await store.readField('resumes')).length,2);
 await store.updateField('resumes',list=>({list:list.filter(r=>r.id!=='r1'),save:true}));
 assert.deepEqual(state.resumes,[{id:'r2',userId:'b'}]);
 await assert.rejects(store.readField('users'),/Invalid/);
 const failing=createCandidateStateStore(fakePool({users:[]}).pool);
 assert.deepEqual(await failing.readField('resumes'),[]);
});
test('a failed change rolls back',async()=>{
 const {pool,log}=fakePool({users:[{id:'a'}]});const store=createCandidateStateStore(pool);
 await assert.rejects(store.updateAccount('a',()=>{throw Error('bad');}),/bad/);
 assert.ok(log.includes('ROLLBACK'));
});
