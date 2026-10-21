import test from 'node:test';
import assert from 'node:assert/strict';
import {createEditorState} from './editor-state.mjs';
function fixture(){
 const state={jobs:[],employers:[],jobRecoveryById:{},employerJobAddresses:{},users:[{id:'private',profile:{name:'Retain'}}],resumes:[{id:'resume',content:'private CV'}]};
 const calls=[];let failed=false;
 const connection={async beginTransaction(){},async commit(){},async rollback(){failed=true;},release(){},async query(sql,args){
  calls.push(sql);
  if(sql.startsWith('SELECT')){
   assert.ok(!sql.includes('SELECT payload'));
   const keys=[...sql.matchAll(/JSON_EXTRACT\(payload,'\$\.([A-Za-z]+)'\)/g)].map(m=>m[1]);
   return [[{payload:JSON.stringify(Object.fromEntries(keys.map(key=>[key,state[key]])))}]];
  }
  assert.match(sql,/JSON_SET\(payload/);
  for(let i=0;i<args.length;i+=2)state[args[i].slice(2)]=JSON.parse(args[i+1]);return [{}];
 }};
 const store=createEditorState({query:connection.query,getConnection:async()=>connection},async()=>{}, {normalize:async value=>value});
 return {state,store,calls,get failed(){return failed;}};
}
test('editor reads never load private records and saves preserve simultaneous account changes',async()=>{
 const f=fixture(),db=await f.store.read();
 assert.equal(db.users,undefined);assert.equal(db.resumes,undefined);
 f.state.users.push({id:'new-account'});db.jobs.push({id:'job',title:'Ready',status:'publish'});
 await f.store.write(db);
 assert.equal(f.state.users.length,2);assert.equal(f.state.resumes[0].content,'private CV');assert.equal(f.state.jobs[0].title,'Ready');
 assert.equal(f.calls.some(sql=>sql.includes('FOR UPDATE')),true);
});
test('two editors retain both jobs and independent saved company addresses',async()=>{
 const f=fixture(),a=await f.store.read(),b=await f.store.read();
 a.jobs.push({id:'a',title:'A',status:'publish'});b.jobs.push({id:'b',title:'B',status:'publish'});
 a.employerJobAddresses.a={address:'A'};b.employerJobAddresses.b={address:'B'};
 await f.store.write(a);await f.store.write(b);
 assert.deepEqual(f.state.jobs.map(j=>j.id),['a','b']);assert.deepEqual(Object.keys(f.state.employerJobAddresses),['a','b']);
});
test('late autosave cannot demote a published job through scoped writes',async()=>{
 const f=fixture(),draft=await f.store.read(),published=await f.store.read();
 draft.jobs.push({id:'one',title:'Old draft',status:'draft',autosaved:true});published.jobs.push({id:'one',title:'Published',status:'publish'});
 await f.store.write(published);await f.store.write(draft);
 assert.equal(f.state.jobs.length,1);assert.equal(f.state.jobs[0].title,'Published');
});
test('private state scopes are rejected and unrelated writers fall through',async()=>{
 const f=fixture();await assert.rejects(f.store.read(['users']),/Invalid/);assert.equal(await f.store.write({users:[]}),false);
});
