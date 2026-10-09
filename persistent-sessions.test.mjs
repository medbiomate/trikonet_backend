import test from 'node:test';import assert from 'node:assert/strict';import {createPersistentSessions} from './persistent-sessions.mjs';
test('sessions survive restart, expire, and remain revoked after logout',async()=>{
 const rows=new Map();let time=1000;
 const db={query:async(sql,values=[])=>{if(sql.startsWith('SELECT'))return [[...rows.values()].filter(row=>row.expires_at>values[0])];if(sql.startsWith('INSERT'))rows.set(values[0],{token_hash:values[0],payload:values[1],expires_at:values[2]});if(sql.startsWith('DELETE'))rows.delete(values[0]);return [[]]}};
 let sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});sessions.set('secret',{userId:'u'});await sessions.flush();assert.equal(rows.has('secret'),false);
 sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});assert.equal(sessions.get('secret').userId,'u');sessions.delete('secret');await sessions.flush();sessions=await createPersistentSessions(db,{now:()=>time,ttl:100});assert.equal(sessions.get('secret'),undefined);
 sessions.set('next',{userId:'u'});await sessions.flush();time=1101;assert.equal(sessions.get('next'),undefined);
});
