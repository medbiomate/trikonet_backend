import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeStateChanges} from './state-changes.mjs';
test('stale catalogue refresh preserves a newly registered account',()=>{
 const before={users:[{id:'a',name:'A'}],jobs:[{id:'j',title:'Old'}]};
 const next=structuredClone(before);next.jobs[0].title='New';
 const current=structuredClone(before);current.users.push({id:'b',name:'New account'});
 assert.deepEqual(mergeStateChanges(current,before,next),{users:current.users,jobs:next.jobs});
});
test('sign-in telemetry cannot revert a concurrent career profile update',()=>{
 const before={users:[{id:'a',lastSignIn:1,profile:{role:'Old'}}]};
 const next=structuredClone(before);next.users[0].lastSignIn=2;
 const current=structuredClone(before);current.users[0].profile.role='New';
 assert.deepEqual(mergeStateChanges(current,before,next).users[0],{id:'a',lastSignIn:2,profile:{role:'New'}});
});
test('intentional removals apply, while stale edits never recreate removed accounts',()=>{
 const before={users:[{id:'a'},{id:'b'}]};
 assert.deepEqual(mergeStateChanges(before,before,{users:[{id:'b'}]}).users,[{id:'b'}]);
 assert.deepEqual(mergeStateChanges({users:[{id:'b'}]},before,{users:[{id:'a',name:'Stale'},{id:'b'}]}).users,[{id:'b'}]);
});
test('unrelated concurrent resumes are retained and explicit field removal works',()=>{
 const before={resumes:[{id:'one',name:'Old',preview:'remove'}]};
 const next={resumes:[{id:'one',name:'New'}]};
 const current={resumes:[...before.resumes,{id:'two',name:'Keep'}]};
 assert.deepEqual(mergeStateChanges(current,before,next),{resumes:[{id:'one',name:'New'},{id:'two',name:'Keep'}]});
});
