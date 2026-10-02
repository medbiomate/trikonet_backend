import test from 'node:test';
import assert from 'node:assert/strict';
import {generatedJobSlug,applyJobUrl,publicJobPath,uniqueJobSlug,shortenGeneratedJobUrls} from './job-urls.mjs';
const job={title:'Senior_Accountant & Finance!',locations:['Dubai','Sharjah'],company:'Al Futtaim',slug:'old',status:'publish'};
test('clean title location company numeric ID; punctuation and dates excluded',()=>{
 assert.equal(generatedJobSlug(job,18345),'senior-accountant-finance-dubai-al-futtaim');
 assert.throws(()=>generatedJobSlug(job,'uuid'));
 assert.equal(generatedJobSlug(job,18345),generatedJobSlug(job,18346));
});
test('new publication generates canonical path and freezes it during content edits',()=>{
 const first=applyJobUrl(job,null,18345,false);
 assert.equal(publicJobPath(first),'/jobs/senior-accountant-finance-dubai-al-futtaim');
 const edited=applyJobUrl({...first,title:'Chief Accountant',company:'Other'},first,999,false);
 assert.equal(edited.publicPath,first.publicPath);assert.equal(edited.urlJobId,18345);
 assert.throws(()=>applyJobUrl({...first,slug:'new'},first,18345,false),/administrators/);
});
test('legacy URLs stay canonical until administrator changes URL; aliases go directly to current',()=>{
 const old={...job,id:18345};
 const preserved=applyJobUrl({...old,title:'New title'},old,18345,false);
 assert.equal(preserved.publicPath,'/job/old');
 const migrated=applyJobUrl({...preserved,slug:'senior-accountant-dubai-al-futtaim'},preserved,18345,true);
 assert.equal(migrated.publicPath,'/jobs/senior-accountant-dubai-al-futtaim');
 assert.deepEqual(migrated.urlAliases,['/job/old']);
 const next=applyJobUrl({...migrated,slug:'accountant-sharjah-al-futtaim-18345'},migrated,999,true);
 assert.equal(next.urlJobId,18345);assert.equal(next.urlAliases.length,2);
});

test('short suffixes only resolve actual collisions; existing large URLs redirect',()=>{
 assert.equal(uniqueJobSlug('nurse-dubai-nmc',[], 'a'),'nurse-dubai-nmc');
 assert.equal(uniqueJobSlug('nurse-dubai-nmc',[{id:'b',slug:'nurse-dubai-nmc'},{id:'c',slug:'nurse-dubai-nmc-1'}],'a'),'nurse-dubai-nmc-2');
 const records=[{id:'a',slug:'nurse-dubai-nmc-1000000000',urlJobId:'1000000000',publicPath:'/jobs/nurse-dubai-nmc-1000000000'}];
 assert.equal(shortenGeneratedJobUrls(records),1);
 assert.equal(records[0].publicPath,'/jobs/nurse-dubai-nmc');
 assert.deepEqual(records[0].urlAliases,['/jobs/nurse-dubai-nmc-1000000000']);
 assert.equal(shortenGeneratedJobUrls(records),0);
});
