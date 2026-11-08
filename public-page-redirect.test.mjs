import test from 'node:test';
import assert from 'node:assert/strict';
import {publicPageRedirect} from './public-page-redirect.mjs';

test('shared API company and job URLs reach website crawler metadata', () => {
  for (const path of ['/employer/german-dentallee-clinic', '/job/dental-nurse', '/jobs/dental-nurse/', '/employer/clinic-%E2%80%93-dubai?share=true']) {
    for (const method of ['GET', 'HEAD']) {
      assert.equal(publicPageRedirect(method, new URL(path, 'https://api.trikonet.com')), `https://www.trikonet.com${path}`);
    }
  }
});

test('API endpoints, admin pages, listings and writes stay on the backend', () => {
  for (const path of ['/api/local/employers/clinic', '/api/wp/job_listing', '/admin/jobs', '/jobs', '/employers', '/', '/employer//test', '/employer/test/edit']) {
    assert.equal(publicPageRedirect('GET', new URL(path, 'https://api.trikonet.com')), null);
  }
  assert.equal(publicPageRedirect('POST', new URL('https://api.trikonet.com/job/test')), null);
});
