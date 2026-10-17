import test from 'node:test';
import assert from 'node:assert/strict';
import {createAccountDeletion,RECOVERY_MS,deletionView,removeAccountData,unreferencedPrivateMedia} from './account-deletion.mjs';
function fixture(){
 let time=1_800_000_000_000;
 const original={users:[{id:'alice',email:'alice@example.test',role:'Candidate',uploadedResume:{base64:'private'},profile:{name:'Alice'}},{id:'bob',email:'bob@example.test',role:'Candidate'},{id:'admin',role:'Administrator'}],resumes:[{userId:'alice',id:'cv-a'},{userId:'bob',id:'cv-b'}],companyReviews:[{userId:'alice',text:'private'},{userId:'bob',text:'keep'}],applications:[{candidateId:'alice'}],jobs:[{id:7}]};
 let state=structuredClone(original);let records=new Map();const sideDeletes=[];let failDelete=false;
 const sessions=new Map([['a1',{userId:'alice'}],['a2',{userId:'alice'}],['b',{userId:'bob'}]]);sessions.flush=async()=>{};
 async function query(sql,args=[]){
  if(sql.startsWith('CREATE TABLE'))return [{}];
  if(sql.startsWith('SELECT payload'))return [[{payload:JSON.stringify(state)}]];
  if(sql.startsWith('SELECT * FROM trikonet_account_deletions WHERE user_id'))return [[records.get(args[0])].filter(Boolean)];
  if(sql.startsWith("SELECT * FROM trikonet_account_deletions WHERE status"))return [[...records.values()].filter(row=>row.status==='pending'&&row.delete_after<=args[0])];
  if(sql.startsWith('INSERT IGNORE')){if(!records.has(args[0]))records.set(args[0],{user_id:args[0],status:'pending',requested_at:args[1],delete_after:args[2]});return [{}];}
  if(sql.startsWith('DELETE FROM trikonet_account_deletions')){records.delete(args[0]);return [{}];}
  if(sql.startsWith('UPDATE trikonet_app_state')){state=JSON.parse(args[0]);return [{}];}
  if(sql.startsWith('UPDATE trikonet_account_deletions')){records.get(args[0]).status='deleted';return [{}];}
  if(sql.startsWith('DELETE FROM ')){if(failDelete)throw new Error('Storage failure');sideDeletes.push({sql,id:args[0]});return [{}];}
  throw new Error(`Unexpected SQL: ${sql}`);
 }
 const pool={query,async getConnection(){let snapshot;return {query,async beginTransaction(){snapshot={state:structuredClone(state),records:structuredClone(records)}},async commit(){},async rollback(){state=snapshot.state;records=snapshot.records},release(){}}}};
 const api=createAccountDeletion({pool,sessions,now:()=>time});
 return {api,sessions,original,state:()=>state,records:()=>records,sideDeletes,advance:ms=>time+=ms,fail:()=>failDelete=true};
}
test('request requires explicit confirmation, authenticated candidate ID; does not remove unrelated users',async()=>{
 const f=fixture();assert.equal((await f.api.request('alice',''))[0],400);assert.equal((await f.api.request('missing','DELETE'))[0],403);assert.equal((await f.api.request('admin','DELETE'))[0],403);assert.equal(f.records().size,0);
});
test('30-day request is durable, idempotent and revokes every existing session',async()=>{
 const f=fixture();const [code,result]=await f.api.request('alice','DELETE');assert.equal(code,200);assert.equal(result.deletion.status,'pending');assert.equal(Date.parse(result.deletion.deleteAfter)-Date.parse(result.deletion.requestedAt),RECOVERY_MS);
 assert.deepEqual([...f.sessions.keys()],['b']);f.advance(1000);const again=await f.api.request('alice','DELETE');assert.deepEqual(again[1].deletion,result.deletion);assert.deepEqual(f.state(),f.original);
});
test('explicit recovery before deadline restores account without losing profile or CV',async()=>{
 const f=fixture();await f.api.request('alice','DELETE');f.advance(RECOVERY_MS-1);assert.equal((await f.api.recover('alice'))[0],200);assert.equal((await f.api.status('alice')).status,'active');f.advance(10000);assert.equal(await f.api.sweep(),0);assert.deepEqual(f.state(),f.original);
});
test('deadline is exclusive; cannot recover at or after 30 days even before worker executes',async()=>{
 const f=fixture();await f.api.request('alice','DELETE');f.advance(RECOVERY_MS);assert.equal((await f.api.status('alice')).status,'deleted');assert.equal((await f.api.recover('alice'))[0],410);assert.equal(f.records().get('alice').status,'pending');
});
test('worker permanently erases owned account data, wallet, alerts and sessions; keeps other accounts',async()=>{
 const f=fixture();await f.api.request('alice','DELETE');assert.equal(await f.api.sweep(),0);f.advance(RECOVERY_MS);assert.equal(await f.api.sweep(),1);assert.equal(await f.api.sweep(),0);
 assert.deepEqual(f.state().users.map(user=>user.id),['bob','admin']);assert.deepEqual(f.state().resumes,[{userId:'bob',id:'cv-b'}]);assert.deepEqual(f.state().companyReviews,[{userId:'bob',text:'keep'}]);assert.deepEqual(f.state().applications,[]);assert.deepEqual(f.state().jobs,[{id:7}]);assert.equal(f.sideDeletes.length,5);assert.ok(f.sideDeletes.every(item=>item.id==='alice'));assert.equal((await f.api.recover('alice'))[0],410);
 assert.deepEqual(Object.keys(f.records().get('alice')).sort(),['delete_after','requested_at','status','user_id']);
});
test('storage failure rolls deletion back and leaves it pending for a safe retry',async()=>{
 const f=fixture();await f.api.request('alice','DELETE');f.advance(RECOVERY_MS);f.fail();await assert.rejects(f.api.sweep(),/Storage failure/);assert.deepEqual(f.state(),f.original);assert.equal(f.records().get('alice').status,'pending');
});
test('tombstone filtering prevents a stale snapshot from resurrecting account data',()=>{
 const f=fixture();const stale=structuredClone(f.original);removeAccountData(stale,['alice']);assert.equal(stale.users.some(user=>user.id==='alice'),false);assert.equal(stale.resumes.some(resume=>resume.userId==='alice'),false);assert.equal(stale.companyReviews.length,1);
 assert.deepEqual(deletionView({status:'deleted',delete_after:Infinity}),{status:'deleted'});
});

test('private image cleanup retains images still referenced by another account',()=>{
 const privateUrl=`https://api.trikonet.com/media/images/${'a'.repeat(64)}/photo.png`;
 const sharedUrl=`https://api.trikonet.com/media/images/${'b'.repeat(64)}/photo.png`;
 const before={users:[{id:'alice',profile:{photo:privateUrl,other:sharedUrl}},{id:'bob',profile:{photo:sharedUrl}}]};
 const after=removeAccountData(structuredClone(before),['alice']);
 assert.deepEqual(unreferencedPrivateMedia(before,after),['a'.repeat(64)]);
});
