import test from 'node:test';import assert from 'node:assert/strict';
import {adminPageRedirect} from './admin-page-access.mjs';
test('signed out users cannot load dashboard pages',()=>{
 for(const path of ['/','/admin','/admin/jobs'])assert.equal(adminPageRedirect(path,false),'/admin-login');
 assert.equal(adminPageRedirect('/admin-login',false),null);
});
test('existing authenticated accounts use same dashboard and API remains accessible',()=>{
 assert.equal(adminPageRedirect('/',true),'/admin');assert.equal(adminPageRedirect('/admin-login',true),'/admin');
 assert.equal(adminPageRedirect('/admin',true),null);assert.equal(adminPageRedirect('/api/health',false),null);
});
