import test from 'node:test';
import assert from 'node:assert/strict';
import {jobImportLookup} from './job-import-lookup.mjs';
test('new local job UUID skips imported record lookup',()=>{
 assert.equal(jobImportLookup({id:'12345678-1234-1234-1234-123456789abc',slug:'new-job'}),null);
 assert.equal(jobImportLookup({}),null);
});
test('existing imports resolve by original slug or exact numeric ID',()=>{
 assert.equal(jobImportLookup({originalSlug:'saved-job',id:'local-uuid'}).get('slug'),'saved-job');
 assert.equal(jobImportLookup({id:123}).get('id'),'123');
});
