import {test} from 'node:test';
import assert from 'node:assert/strict';
import {employerJobPage} from './employer-jobs.mjs';
test('counts beyond 100, sorts published jobs newest first and pages by ten', () => {
  const jobs = Array.from({length:123}, (_,i) => ({id:i,slug:`job-${i}`,status:'publish',date:'2026-09-01',metas:{_job_employer_posted_by:42}}));
  const fresh = {slug:'new',status:'publish',company:'NMC',datePosted:'2026-10-01'};
  const draft = {slug:'draft',status:'draft',company:'NMC'};
  const result = employerJobPage(jobs,[fresh,draft],{id:42,slug:'nmc',title:'NMC'});
  assert.equal(result.total,124); assert.equal(result.jobs.length,10); assert.equal(result.jobs[0].slug,'new');
  const last = employerJobPage(jobs,[fresh,draft],{id:42,title:'NMC'},99);
  assert.equal(last.page,13); assert.equal(last.jobs.length,4);
});
test('draft overrides hide an imported published copy without duplicate counting', () => {
  assert.equal(employerJobPage([{slug:'a',status:'publish',company:'NMC'}],[{slug:'a',status:'draft',company:'NMC'}],{title:'NMC'}).total,0);
});
