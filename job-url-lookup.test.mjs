import test from 'node:test';
import assert from 'node:assert/strict';
import {findJobByPath} from './job-url-lookup.mjs';
import {isPublicRecord} from './public-record.mjs';
const job={id:'a',slug:'accountant-dubai-clinic',publicPath:'/jobs/accountant-dubai-clinic',status:'publish',urlAliases:['/job/old-accountant']};
test('current slug resolves under both job URL prefixes and trailing slash',()=>{
 for(const path of ['/jobs/accountant-dubai-clinic','/job/accountant-dubai-clinic','/jobs/accountant-dubai-clinic/'])assert.equal(findJobByPath([job],path),job);
});
test('renamed job aliases resolve under either historical prefix',()=>{
 for(const path of ['/job/old-accountant','/jobs/old-accountant','/jobs/old-accountant/'])assert.equal(findJobByPath([job],path),job);
});
test('current canonical record wins over another records historical alias',()=>{
 const other={id:'b',slug:'other',urlAliases:[job.publicPath]};
 assert.equal(findJobByPath([other,job],job.publicPath),job);
});
test('ambiguous aliases never redirect to an unrelated job',()=>{
 assert.equal(findJobByPath([job,{id:'b',slug:'other',urlAliases:['/jobs/old-accountant']}],'/jobs/old-accountant'),null);
});
test('missing job stays missing and draft visibility is unchanged',()=>{
 assert.equal(findJobByPath([job],'/jobs/nonexistent'),null);
 const draft={...job,status:'draft'};
 assert.equal(isPublicRecord(findJobByPath([draft],job.publicPath)),false);
 assert.equal(findJobByPath([job],'/employer/old-accountant'),null);
});
