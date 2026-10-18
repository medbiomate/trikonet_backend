import test from 'node:test';
import assert from 'node:assert/strict';
import {jobNotification,createGoogleIndexing,readIndexingCredentials} from './google-indexing.mjs';
const job={slug:'nurse',publicPath:'/jobs/nurse-dubai-hospital',title:'Nurse',description:'Nursing duties',status:'publish',updatedAt:'2026-10-19'};
test('only public job publications and withdrawals produce notifications',()=>{
 assert.deepEqual(jobNotification(null,job),{url:'https://www.trikonet.com/jobs/nurse-dubai-hospital',type:'URL_UPDATED'});
 assert.equal(jobNotification(null,{...job,status:'draft'}),null);
 assert.equal(jobNotification(null,{...job,autosaved:true}),null);
 assert.equal(jobNotification(null,{...job,publicPath:'https://example.com/job/nurse'}),null);
 assert.equal(jobNotification(null,{...job,description:''}),null);
 assert.equal(jobNotification(null,{...job,deadline:'2020-01-01'}),null);
 assert.equal(jobNotification(job,null).type,'URL_DELETED');
 assert.equal(jobNotification(job,{...job,status:'draft'}).type,'URL_DELETED');
});
test('missing credentials disable the feature without affecting publishing',async()=>{
 const queue=createGoogleIndexing({pool:{query(){throw Error('must not touch database');}},env:{}});
 assert.deepEqual(await queue.enqueue(null,job),{enabled:false});await queue.tick();assert.deepEqual(await queue.status(),{enabled:false});
 assert.throws(()=>readIndexingCredentials({GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON:'{}'}),/Invalid/);
});
test('durable queue retries transient failures and keeps newer revisions',async()=>{
 const calls=[];const pool={async query(sql,values){calls.push([sql,values]);if(sql.startsWith('SELECT attempts'))return [[{attempts:0}]];if(sql.startsWith('SELECT *'))return [[{url_hash:'hash',url:'https://www.trikonet.com/job/nurse',notification_type:'URL_UPDATED',revision:'r1',attempts:0}]];return [[]];}};
 const queue=createGoogleIndexing({pool,env:{GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON:'configured'},now:()=>1000,publish:async()=>{throw {status:429};}});
 await queue.tick();const retry=calls.find(([sql])=>sql.includes('next_attempt_at=?'));assert.equal(retry[1][0],86401000);assert.match(retry[0],/AND revision=\?/);
});
test('daily project cap stops submissions',async()=>{
 let sent=false;const pool={async query(sql){if(sql.startsWith('SELECT attempts'))return [[{attempts:200}]];return [[]];}};
 await createGoogleIndexing({pool,env:{GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON:'configured'},publish:async()=>{sent=true;}}).tick();assert.equal(sent,false);
});
