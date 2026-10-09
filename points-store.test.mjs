import test from 'node:test';import assert from 'node:assert/strict';import {createPointsStore} from './points-store.mjs';
test('wallet survives unrelated catalogue writes and only changed wallets are persisted',async()=>{
 const rows=new Map();let writes=0;const sql={query:async(query,args)=>{if(query.startsWith('SELECT'))return[[...rows].map(([user_id,payload])=>({user_id,payload}))];if(query.startsWith('INSERT')){writes++;rows.set(args[0],args[1]);}return[[]]}};
 let catalogue={users:[{id:'u',resumeRewards:{points:45,challenges:[]}}]};const store=createPointsStore(sql,{readLocalDb:async()=>structuredClone(catalogue)});
 const prepared=await store.readLocalDb();prepared.users[0].resumeRewards.challenges.push({token:'ad-token'});await store.writeLocalDb(prepared);
 catalogue=structuredClone({users:[{id:'u',resumeRewards:{points:45,challenges:[]}}]});
 const complete=await store.readLocalDb();assert.equal(complete.users[0].resumeRewards.challenges[0].token,'ad-token');complete.users[0].resumeRewards.points+=5;await store.writeLocalDb(complete);
 assert.equal((await store.readLocalDb()).users[0].resumeRewards.points,50);const count=writes;await store.writeLocalDb(await store.readLocalDb());assert.equal(writes,count);
});
