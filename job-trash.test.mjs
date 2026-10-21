import test from 'node:test';import assert from 'node:assert/strict';
import {trashJobRecord} from './job-trash.mjs';
function fixture({local=true,fail=false}={}){
 const calls=[];let committed=false,rolledBack=false;
 const job={id:12,slug:'test-job',status:'publish',title:'Test Job'};
 const c={async beginTransaction(){},async commit(){committed=true;},async rollback(){rolledBack=true;},release(){},async query(sql,args){calls.push({sql,args});if(sql.includes('JSON_SEARCH'))return [[{jobPath:local?'$.jobs[3].slug':null}]];if(sql.startsWith('SELECT'))return [[{job:JSON.stringify(job)}]];return [{}];}};
 const index={async ensure(){},async sync(conn,before,after){assert.equal(after[0].status,'trash');if(fail)throw Error('index failed');}};
 return {pool:{getConnection:async()=>c},index,job,calls,get committed(){return committed;},get rolledBack(){return rolledBack;}};
}
test('local trash updates only one JSON path and index in the same transaction',async()=>{
 const f=fixture();await trashJobRecord(f.pool,f.index,'test-job',()=>{throw Error('unexpected import')});
 assert.equal(f.committed,true);assert.equal(f.calls.filter(c=>c.sql.startsWith('UPDATE')).length,1);
 assert.equal(f.calls.some(c=>/SELECT payload/.test(c.sql)),false);
 assert.equal(f.calls.at(-1).args[0],'$.jobs[3]');
});
test('imported trash appends an override and rollback protects index failures',async()=>{
 for(const fail of [false,true]){const f=fixture({local:false,fail});const action=trashJobRecord(f.pool,f.index,'test-job',async()=>f.job);
 if(fail){await assert.rejects(action,/index failed/);assert.equal(f.rolledBack,true);assert.equal(f.committed,false);}else{await action;assert.equal(f.committed,true);}
 assert.match(f.calls.at(-1).sql,/JSON_ARRAY_APPEND/);}
});
