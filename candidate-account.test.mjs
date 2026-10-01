import test from 'node:test';
import assert from 'node:assert/strict';
import { isCandidateAccount } from './candidate-account.mjs';
test('new and existing public registrations appear as candidates', () => {
  assert.equal(isCandidateAccount({ email: 'test@example.com' }), true);
  assert.equal(isCandidateAccount({ role: 'Candidate' }), true);
});
test('console and employer accounts are excluded', () => {
  for (const role of ['Administrator', 'Editor', 'Content Editor', 'Employer']) {
    assert.equal(isCandidateAccount({ role }), false);
  }
});
