import test from 'node:test';
import assert from 'node:assert/strict';
import { emsJobPayload, createEmsSync } from './ems-sync.mjs';
const job = { id:'uuid-job', slug:'nurse', title:'Nurse', company:'Hospital', employerSlug:'hospital', categories:['Nursing'], status:'publish', createdAt:'2026-10-02T05:00:00Z', updatedAt:'2026-10-02T06:00:00Z' };
const creator = { id:'user-uuid', email:'OPERATOR@example.com' };
test('new coded jobs use stable IDs, matching email and live metadata', () => {
  const payload = emsJobPayload(job, creator);
  assert.equal(payload.postId, 'uuid-job');
  assert.equal(payload.uploaderEmail, 'operator@example.com');
  assert.equal(payload.companyName, 'Hospital');
  assert.deepEqual(payload.categories, ['Nursing']);
  assert.equal(payload.url, 'https://www.trikonet.com/job/nurse/');
  assert.equal(payload.uploadedAt, job.createdAt);
});
test('cutoff is midnight India time; drafts and old edited jobs stay excluded', () => {
  assert.equal(emsJobPayload({...job,createdAt:'2026-10-01T18:29:59Z'},creator),null);
  assert.ok(emsJobPayload({...job,createdAt:'2026-10-01T18:30:00Z'},creator));
  assert.equal(emsJobPayload({...job,status:'draft'},creator),null);
  assert.equal(emsJobPayload({...job,emsFirstPublishedAt:'2026-09-01T00:00:00Z'},creator),null);
  assert.equal(emsJobPayload(job,{}),null);
});
test('failed delivery remains pending; successful delivery marks the exact revision', async () => {
  const writes=[];
  const row={job_id:job.id,payload:JSON.stringify(emsJobPayload(job,creator)),revision:job.updatedAt,attempts:0};
  const db={query:async(sql,args)=>{writes.push({sql,args});return sql.startsWith('SELECT') ? [[row]] : [[]];}};
  let succeeds=false;
  const sync=createEmsSync(db,{secret:'test-only-secret',fetchImpl:async()=>({ok:succeeds,status:503})});
  await sync.flush();
  assert.ok(writes.some(write=>write.sql.includes('attempts=attempts+1')));
  succeeds=true;
  await sync.flush();
  assert.ok(writes.some(write=>write.sql.includes('delivered_revision=?') && write.args[0]===job.updatedAt));
});
