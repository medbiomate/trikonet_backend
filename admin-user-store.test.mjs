import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdminUserStore} from './admin-user-store.mjs';
function fixture(){
 let users=[{id:'a',name:'Original',role:'Editor'}];const sql=[];let released=false,rolledBack=false;
 const query=async(statement,args)=>{sql.push(statement);if(statement.startsWith('SELECT'))return [[{users:JSON.stringify(users)}]];users=JSON.parse(args[0]);return [{}];};
 const connection={query,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{rolledBack=true;},release(){released=true;}};
 const store=createAdminUserStore({query,getConnection:async()=>connection},async()=>{});
 return {store,sql,get users(){return users;},set users(value){users=value;},connection,get released(){return released;},get rolledBack(){return rolledBack;}};
}
test('account writes update only users and preserve concurrent registrations',async()=>{
 const f=fixture();const db=await f.store.read();db.users[0].name='Edited';f.users.push({id:'b',name:'Concurrent'});await f.store.write(db);
 assert.equal(f.users[0].name,'Edited');assert.equal(f.users[1].id,'b');assert.equal(f.released,true);
 assert.ok(f.sql.every(sql=>sql.includes("'$.users'")));assert.ok(f.sql.some(sql=>sql.includes('FOR UPDATE')));assert.ok(f.sql.some(sql=>sql.includes('JSON_SET')));
});
test('deletion persists and stale edits cannot resurrect removed accounts',async()=>{
 const f=fixture();const stale=await f.store.read();const deletion=await f.store.read();deletion.users=[];await f.store.write(deletion);stale.users[0].name='Late edit';await f.store.write(stale);assert.equal(f.users.length,0);
});
test('failed writes roll back and release the connection',async()=>{
 const f=fixture();const db=await f.store.read();f.connection.query=async()=>{throw new Error('Database unavailable');};await assert.rejects(f.store.write(db),/Database unavailable/);assert.equal(f.rolledBack,true);assert.equal(f.released,true);
});
