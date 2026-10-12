import test from 'node:test';import assert from 'node:assert/strict';
import {repairEmployerSnapshots} from './employer-repair.mjs';
test('recovery duplicate merges missing details, retains archive and relinks jobs idempotently',()=>{
 const db={employers:[{slug:'clinic',title:'Good Care',description:'Published details',locations:['Dubai']},{slug:'autosave-employer-1',title:' GOOD  CARE ',description:'Older',logo:'logo.webp',locations:['UAE'],autosaved:true}],jobs:[{employerSlug:'autosave-employer-1',employerUrl:'https://www.trikonet.com/employer/autosave-employer-1'}]};
 assert.equal(repairEmployerSnapshots(db),true);assert.equal(db.employers.length,1);assert.equal(db.employers[0].description,'Published details');assert.equal(db.employers[0].logo,'logo.webp');assert.equal(db.jobs[0].employerSlug,'clinic');assert.ok(db.jobs[0].employerUrl.endsWith('/clinic'));assert.equal(db.employerMergeArchive.length,1);assert.equal(repairEmployerSnapshots(db),false);
});
test('independent companies and unmatched recovery work are preserved',()=>{
 const db={employers:[{slug:'one',title:'Same'},{slug:'two',title:'Same'},{slug:'autosave-employer-1',title:'Same'},{slug:'autosave-employer-2',title:'New'}]};assert.equal(repairEmployerSnapshots(db),false);assert.equal(db.employers.length,4);
});
