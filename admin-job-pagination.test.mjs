import test from 'node:test';
import assert from 'node:assert/strict';
import { adminJobConditions, localJobMatches, pagePlan, importedJobPage } from './admin-job-pagination.mjs';

test('migrated jobs paginate, filter and preserve local overrides without WordPress tables', () => {
  const imported = Array.from({ length: 45 }, (_, id) => ({ id, slug: `job-${id}`, title: { rendered: 'Nurse' }, status: 'publish', date: '2026-10-01', metas: { _job_employer_name: 'Clinic', _job_category: { 1: 'Healthcare' }, _job_type: { 2: 'Full Time' } } }));
  const page = importedJobPage(imported, [], new URLSearchParams({ page: '2', per_page: '20', q: 'clinic', category: 'Healthcare', job_type: 'Full Time' }));
  assert.equal(page.total, 45);
  assert.equal(page.jobs.length, 20);
  assert.equal(page.page, 2);
  const override = { slug: 'job-1', title: 'Updated', status: 'draft' };
  const draft = importedJobPage(imported, [override], new URLSearchParams({ status: 'draft' }));
  assert.equal(draft.total, 1);
  assert.equal(draft.jobs[0].local, true);
  assert.equal(importedJobPage(imported, [override], new URLSearchParams({ status: 'mine' })).total, 1);
});

test('each page requests only its 20 rows', () => {
  assert.deepEqual(pagePlan([], 13846, 3, 20), { total: 13846, page: 3, local: [], remoteOffset: 40, remoteLimit: 20 });
});
test('clamps page numbers and handles the final partial page', () => {
  assert.equal(pagePlan([], 45, 999, 20).page, 3);
  assert.equal(pagePlan([], 0, 3, 20).page, 1);
});
test('local overrides occupy page slots without skipping remote rows', () => {
  const local = Array.from({ length: 25 }, (_, id) => ({ id }));
  const second = pagePlan(local, 100, 2, 20);
  assert.equal(second.local.length, 5);
  assert.equal(second.remoteOffset, 0);
  assert.equal(second.remoteLimit, 15);
  assert.equal(pagePlan(local, 100, 3, 20).remoteOffset, 15);
});
test('status and search apply to local jobs before calculating pages', () => {
  const job = { title: 'Nurse', company: 'Clinic', categories: ['Healthcare'], types: ['Full Time'], status: 'active' };
  assert.equal(localJobMatches(job, new URLSearchParams({ status: 'publish', q: 'clinic', category: 'Healthcare', job_type: 'Full Time' })), true);
  assert.equal(localJobMatches(job, new URLSearchParams({ status: 'draft' })), false);
  assert.equal(localJobMatches(job, new URLSearchParams({ q: 'accountant' })), false);
});
test('private status and overrides use bound SQL values', () => {
  const where = [], values = [];
  adminJobConditions(where, values, new URLSearchParams({ status: 'draft' }), ["a' OR 1=1"]);
  assert.deepEqual(where, ['post_status = ?', 'post_name NOT IN (?)']);
  assert.deepEqual(values, ['draft', "a' OR 1=1"]);
});

// Exercise the actual SQL record loader: page offsets must reach LIMIT/OFFSET.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
test('record query honors the admin offset without changing public pagination', async () => {
  const source = readFileSync(new URL('./server.mjs', import.meta.url), 'utf8');
  const start = source.indexOf('async function wordpressRecords(');
  const code = source.slice(start, source.indexOf('async function wordpressCount(', start));
  const calls = [];
  const context = vm.createContext({ adminJobConditions, wpDb: { query: async (sql, values) => { calls.push({ sql, values }); return [[]]; } } });
  vm.runInContext(code, context);
  await context.wordpressRecords('job_listing', new URLSearchParams({ per_page: '20', status: 'all' }), { excludedSlugs: [], offset: 40 });
  assert.deepEqual(Array.from(calls[0].values.slice(-2)), [20, 40]);
  await context.wordpressRecords('job_listing', new URLSearchParams({ per_page: '20', page: '4' }));
  assert.deepEqual(Array.from(calls[1].values.slice(-2)), [20, 60]);
  assert.match(calls[1].sql, /post_status = 'publish'/);
});
