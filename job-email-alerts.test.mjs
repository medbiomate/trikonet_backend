import test from 'node:test';import assert from 'node:assert/strict';
import {createJobEmailAlerts} from './job-email-alerts.mjs';
function fixture(){
 const outbox=new Map(),used=new Set(),sends=[];let fail=false,time=new Date('2026-10-11T04:00:00Z');
 const subscribers=[{user_id:'u',enabled:1,token:'a'.repeat(64)}],users=[{id:'u',name:'Candidate',email:'user@example.com',profile:{role:'SEO Specialist'}}];
 const jobs=[{id:'seo',slug:'seo',title:'SEO Specialist',status:'publish',date:'2026-10-11T00:00:00Z'},{id:'seo2',slug:'seo2',title:'SEO Manager',status:'publish',date:'2026-10-11T00:00:00Z'},{id:'nurse',slug:'nurse',title:'Nurse',status:'publish',date:'2026-10-11T00:00:00Z'}];
 const connection={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{},query:async(sql,args=[])=>{
 if(sql.startsWith('CREATE TABLE'))return [{}];if(sql.includes('GET_LOCK'))return [[{acquired:1}]];if(sql.includes('RELEASE_LOCK'))return [[{}]];
 if(sql.includes("job_id NOT LIKE")){for(const row of outbox.values())if(!row.job_id.startsWith("digest:"))row.sent=1;return [{}];}
 if(sql.startsWith('SELECT * FROM trikonet_alert_subscribers'))return [subscribers.filter(s=>s.enabled)];
 if(sql.startsWith('SELECT id FROM trikonet_alert_outbox'))return [outbox.has(args[0])?[{id:args[0]}]:[]];
 if(sql.startsWith('SELECT job_id FROM trikonet_digest_jobs'))return [[...used].map(job_id=>({job_id}))];
 if(sql.startsWith('INSERT IGNORE INTO trikonet_digest_jobs')){used.add(args[1]);return [{}]}
 if(sql.startsWith('INSERT IGNORE INTO trikonet_alert_outbox')){outbox.set(args[0],{id:args[0],job_id:args[1],user_id:args[2],payload:args[3],sent:0,attempts:0});return [{}]}
 if(sql.startsWith('SELECT * FROM trikonet_alert_outbox'))return [[...outbox.values()].filter(v=>!v.sent)];
 if(sql.startsWith('SELECT token FROM'))return [subscribers.filter(s=>s.enabled&&s.user_id===args[0])];
 if(sql.startsWith('UPDATE trikonet_alert_outbox SET sent')){outbox.get(args[0]).sent=1;return [{}]}
 if(sql.startsWith('UPDATE trikonet_alert_outbox SET attempts')){outbox.get(args[1]).attempts++;return [{}]}
 throw new Error(sql);
 }};
 const worker=createJobEmailAlerts({pool:{...connection,getConnection:async()=>connection},loadJobs:async()=>jobs,readUsers:async()=>users,env:{RESEND_API_KEY:'test',PASSWORD_RESET_FROM:'jobs@example.com'},now:()=>time,fetcher:async(_url,options)=>{sends.push(options);return {ok:!fail,status:fail?429:200}}});
 return {worker,sends,users,subscribers,jobs,outbox,setTime:v=>time=new Date(v),setFail:v=>fail=v};
}
test('one multi-job recommended digest per slot',async()=>{const f=fixture();await f.worker.tick();await f.worker.tick();assert.equal(f.sends.length,1);const message=JSON.parse(f.sends[0].body);assert.match(message.text,/SEO Specialist/);assert.doesNotMatch(message.text,/SEO Manager/);assert.doesNotMatch(message.text,/Nurse/);assert.equal(message.digestJobs,undefined)});
test('failed delivery retries with stable provider idempotency key',async()=>{const f=fixture();f.setFail(true);await f.worker.tick();f.setFail(false);await f.worker.tick();assert.equal(f.sends.length,2);assert.equal(f.sends[0].headers['Idempotency-Key'],f.sends[1].headers['Idempotency-Key'])});
test('unsubscribed candidates skipped, empty profiles receive clearly labeled general suggestions',async()=>{const f=fixture();f.users[0].profile={};await f.worker.tick();assert.equal(f.sends.length,1);assert.match(JSON.parse(f.sends[0].body).subject,/general opportunities/);f.users[0].profile={role:'SEO'};f.subscribers[0].enabled=0;await f.worker.tick();assert.equal(f.sends.length,1)});

test('no delivery outside the three UAE windows, including after restart',async()=>{const f=fixture();for(const time of ['2026-10-11T03:59:00Z','2026-10-11T05:00:00Z','2026-10-11T10:00:00Z','2026-10-11T14:00:00Z']){f.setTime(time);await f.worker.tick();}assert.equal(f.sends.length,0)});
test('at most one email in each slot, three emails for a full day',async()=>{const f=fixture();for(const hour of [4,8,12]){f.jobs.push({id:'new'+hour,slug:'new'+hour,title:'SEO Specialist',status:'publish',date:'2026-10-11T00:00:00Z'});f.setTime(`2026-10-11T${String(hour).padStart(2,'0')}:00:00Z`);await f.worker.tick();await f.worker.tick();}assert.equal(f.sends.length,3)});
test('duplicate accounts with the same mailbox receive one digest per slot',async()=>{const f=fixture();f.users.push({...f.users[0],id:'another'});f.subscribers.push({...f.subscribers[0],user_id:'another'});await f.worker.tick();assert.equal(f.sends.length,1)});
test('pending role match is not sent after a career preference change',async()=>{const f=fixture();f.setFail(true);await f.worker.tick();f.users[0].profile={role:'Nurse'};f.setFail(false);await f.worker.tick();assert.equal(f.sends.length,1)});
test('old catalog is not blasted to subscribers',async()=>{const f=fixture();f.jobs.forEach(job=>job.date='2025-01-01');await f.worker.tick();assert.equal(f.sends.length,0)});

test('legacy single-job backlog is retired even outside a delivery window',async()=>{const f=fixture();f.outbox.set('old',{id:'old',job_id:'nurse',user_id:'u',payload:'{}',sent:0});f.setTime('2026-10-11T20:00:00Z');await f.worker.tick();assert.equal(f.outbox.get('old').sent,1);assert.equal(f.sends.length,0)});
test('jobs removed before retry are never delivered',async()=>{const f=fixture();f.setFail(true);await f.worker.tick();f.jobs.splice(0,f.jobs.length);f.setFail(false);await f.worker.tick();assert.equal(f.sends.length,1)});

test('a supplied title never falls back to unrelated general jobs',async()=>{const f=fixture();f.users[0].profile={currentDesignation:'Senior SEO Specialist',role:'Professional'};f.jobs.splice(0,2);await f.worker.tick();assert.equal(f.sends.length,0)});
test('current designation takes priority over a stale role',async()=>{const f=fixture();f.users[0].profile={currentDesignation:'Senior SEO Specialist',role:'Nurse'};await f.worker.tick();assert.equal(f.sends.length,1);assert.match(JSON.parse(f.sends[0].body).text,/SEO Specialist/);assert.doesNotMatch(JSON.parse(f.sends[0].body).text,/Nurse/)});
test('pending general digest is cancelled after a title is added',async()=>{const f=fixture();f.users[0].profile={};f.setFail(true);await f.worker.tick();f.users[0].profile={role:'SEO Specialist'};f.setFail(false);await f.worker.tick();assert.equal(f.sends.length,1)});
