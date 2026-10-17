import {test} from 'node:test';import assert from 'node:assert/strict';
import {candidateProfileRequest} from './candidate-profile-store.mjs';
test('entered name persists canonically with setup fields without rewriting catalogue',async()=>{
 const queries=[];let saved,committed=false;
 const connection={beginTransaction:async()=>{},commit:async()=>{committed=true},rollback:async()=>{},release:()=>{},query:async(sql,args)=>{queries.push(sql);if(sql.startsWith('SELECT'))return [[{users:JSON.stringify([{id:7,name:'Emailname',email:'email@example.com',profile:{}}])}]];saved=JSON.parse(args[1]);return[{affectedRows:1}]}};
 const [status,result]=await candidateProfileRequest({getConnection:async()=>connection},'POST',7,{name:'Chosen Name',role:'Accountant',setupCompletedAt:100,needsInitialSetup:false,profileUpdatedAt:100});
 assert.equal(status,200);assert.equal(result.saved,true);assert.equal(saved.name,'Chosen Name');assert.equal(saved.profile.name,'Chosen Name');assert.equal(saved.profile.setupCompletedAt,100);assert.equal(saved.email,'email@example.com');assert.equal(committed,true);assert.match(queries[0],/JSON_EXTRACT.*users/);assert.match(queries[0],/FOR UPDATE/);
});
