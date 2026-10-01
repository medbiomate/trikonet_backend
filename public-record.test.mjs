import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublicRecord } from './public-record.mjs';
test('unpublished and autosaved records cannot be public', () => {
  for (const status of ['draft','pending','private','trash','expired']) assert.equal(isPublicRecord({status}),false);
  assert.equal(isPublicRecord({status:'publish',autosaved:true}),false);
  assert.equal(isPublicRecord({status:'publish',slug:'autosave-job-123'}),false);
});
test('published and legacy records remain public', () => {
  for (const status of ['publish','published','active','']) assert.equal(isPublicRecord({status,slug:'english-teacher'}),true);
});
