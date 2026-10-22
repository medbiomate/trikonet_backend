import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeJobEmployer} from './job-employer.mjs';
import {createCatalogueReader} from './catalogue-reader.mjs';
import {saveJobRecord} from './job-identity.mjs';
const conflicting = () => ({id:142898,slug:'general-practitioner-emergency',company:'Yas Clinic',employerSlug:'yas-clinic',logo:'yas.png',metas:{_job_employer_name:'Sheikh Khalifa Medical City Ajman',_job_employer_url:'https://trikonet.com/employer/sheikh-khalifa-medical-city-ajman',_job_employer_posted_by:'33788',_job_logo:'other.png',_job_apply_url:'mailto:careers@adscc.ae'}});
test('selected employer overrides imported identity without changing application details',()=>{
 const original=conflicting();const job=normalizeJobEmployer(original);
 assert.equal(job.metas._job_employer_name,'Yas Clinic');
 assert.equal(job.metas._job_employer_url,'https://www.trikonet.com/employer/yas-clinic');
 assert.equal(job.metas._job_logo,'yas.png');
 assert.equal(job.metas._job_employer_posted_by,undefined);
 assert.equal(job.metas._job_apply_url,'mailto:careers@adscc.ae');
 assert.equal(original.metas._job_employer_posted_by,'33788');
 assert.deepEqual(normalizeJobEmployer(job),job);
});
test('imported records without an editor employer remain unchanged',()=>{
 const job={metas:{_job_employer_name:'Original'}};assert.equal(normalizeJobEmployer(job),job);
});
test('catalogue repairs already-saved conflicts and future saves persist the repair',async()=>{
 const pool={query:async()=>[[{payload:JSON.stringify({jobs:[conflicting()]})}]]};
 const state=await createCatalogueReader(pool,async()=>{})(['jobs']);
 assert.equal(state.jobs[0].metas._job_employer_name,'Yas Clinic');
 const jobs=[conflicting()];const saved=saveJobRecord(jobs,{id:142898,slug:'general-practitioner-emergency',company:'Yas Clinic',employerSlug:'yas-clinic'},()=>1,'2026-10-22');
 assert.equal(saved.metas._job_employer_posted_by,undefined);
 assert.equal(jobs[0].metas._job_employer_name,'Yas Clinic');
});
