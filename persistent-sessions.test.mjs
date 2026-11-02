import test from 'node:test';import assert from 'node:assert/strict';import {createPersistentSessions} from './persistent-sessions.mjs';
test('sessions survive restart, expire, and remain revoked after logout',async()=>{
 const rows=new Map();let time=1000;
 const db={query:async(sql,values=[])=>{if(sql.startsWith('SELECT'))return [[...rows.values()].filter(row=>row.expires_at>values[0])];if(sql.startsWith('INSERT'))rows.set(values[0],{token_hash:values[0],payload:values[1],expires_at:values[2]});if(sql.startsWith('DELETE'))rows.delete(values[0]);return [[]]}};
 let sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});sessions.set('secret',{userId:'u'});await sessions.flush();assert.equal(rows.has('secret'),false);
 sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});assert.equal(sessions.get('secret').userId,'u');sessions.delete('secret');await sessions.flush();sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});assert.equal(sessions.get('secret'),undefined);
 sessions.set('next',{userId:'u'});await sessions.flush();time=1101;assert.equal(sessions.get('next'),undefined);
});
test('expired session records are pruned from memory and cannot reappear in iteration',async()=>{
 let time=1000;
 const db={query:async sql=>sql.startsWith('SELECT')?[[]]:[[]]};
 const sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});
 for(let i=0;i<1000;i++)sessions.set('old-'+i,{userId:'old-'+i});
 await sessions.flush();time=1100;
 assert.equal(sessions.get('old-0'),undefined);
 sessions.set('live',{userId:'live'});await sessions.flush();
 assert.equal(sessions.size,1);assert.deepEqual([...sessions].map(([,value])=>value.userId),['live']);
 time=1200;assert.equal(sessions.size,0);assert.deepEqual([...sessions],[]);
});
test('pruning does not change active sessions or hashed-key revocation',async()=>{
 let time=1000;const deleted=[];
 const db={query:async(sql,values=[])=>{if(sql.startsWith('SELECT'))return [[]];if(sql.startsWith('DELETE'))deleted.push(values[0]);return [[]];}};
 const sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});
 sessions.set('a',{userId:'a'});time=1050;sessions.set('b',{userId:'b'});await sessions.flush();time=1100;
 const active=[...sessions];assert.equal(active.length,1);assert.equal(active[0][1].userId,'b');
 assert.equal(sessions.get('b').userId,'b');sessions.delete(active[0][0]);await sessions.flush();assert.equal(sessions.size,0);assert.equal(deleted[0],active[0][0]);
});
