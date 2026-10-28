import test from 'node:test';import assert from 'node:assert/strict';
import {auditCompanyProfiles,repairCompanyProfiles,normalizedCompanyDraft} from './company-profile-audit.mjs';
const draft={title:'Insights Psychology DMCC',slug:'autosave-employer-one',autosaved:true,status:'draft',description:'Full saved company description',logo:'/uploaded.png',categories:['Medical Clinic'],locations:['Dubai'],createdAt:'2026-10-28T01:00:00Z'};
const job={id:'job-one',title:'Clinic Coordinator',company:'Insights Psychology DMCC',employerSlug:'insights-psychology-dmcc',employerUrl:'/employer/insights-psychology-dmcc',status:'publish'};
const who={userId:'admin',name:'Admin'};
test('audit detects complete saved recovery profile behind published job',()=>{const report=auditCompanyProfiles({jobs:[job],employers:[draft]});assert.equal(report.length,1);assert.equal(report[0].action,'recover');assert.equal(report[0].slug,'insights-psychology-dmcc');});
test('repair restores full original data and intended URL, archives original and is idempotent',()=>{
 const db=structuredClone({jobs:[job],employers:[draft]});
 const result=repairCompanyProfiles(db,[],who,'2026-10-28T06:00:00Z',()=> 'new-company-id');
 assert.equal(result.recovered,1);assert.equal(result.remaining.length,0);const company=db.employers[0];
 assert.equal(company.slug,job.employerSlug);assert.equal(company.status,'publish');assert.equal(company.autosaved,undefined);assert.equal(company.description,draft.description);assert.equal(company.logo,draft.logo);
 assert.deepEqual(db.employerRepairArchive[draft.slug].original,draft);assert.equal(repairCompanyProfiles(db,[],who,'later',()=> 'unused').recovered,0);
});
test('incomplete, unreferenced, and intentionally saved drafts are never published',()=>{
 const incomplete={...draft,logo:''};const unrelated={...draft,title:'Other',slug:'autosave-other'};
 const db={jobs:[{...job}],employers:[incomplete,unrelated]};
 assert.equal(repairCompanyProfiles(db,[],who,'now',()=> 'id').recovered,0);assert.ok(db.employers.every(e=>e.status==='draft'));
 const reserved={...draft,slug:job.employerSlug,autosaved:false};
 assert.equal(auditCompanyProfiles({jobs:[job],employers:[draft,reserved]})[0].action,'review');
});
test('legacy FormData company terms are restored without substituting job categories',()=>{
 const old={...draft,categories:[],locations:[],employer_categories:'Medical Clinic',employer_locations:'Dubai'};
 assert.deepEqual(normalizedCompanyDraft(old).categories,['Medical Clinic']);assert.deepEqual(normalizedCompanyDraft(old).locations,['Dubai']);
 assert.equal(auditCompanyProfiles({jobs:[job],employers:[old]})[0].action,'recover');
});
test('ambiguous public companies require review; unique real company relinks without modifying content',()=>{
 const one={title:draft.title,slug:'actual-company',status:'publish'};
 assert.equal(auditCompanyProfiles({jobs:[job],employers:[one,{...one,slug:'different'}]})[0].action,'review');
 const db=structuredClone({jobs:[job],employers:[one]});const result=repairCompanyProfiles(db,[],who,'now',()=> 'id');
 assert.equal(result.relinked,1);assert.equal(result.recovered,0);assert.equal(db.jobs[0].employerSlug,'actual-company');
});
import {resolvePublishedCompany} from './company-profile-audit.mjs';
test('publication resolves real renamed company and rejects snapshot-only employer',()=>{
 assert.equal(resolvePublishedCompany(job,[draft]),null);
 const company={title:draft.title,slug:'actual-profile',status:'publish'};
 assert.equal(resolvePublishedCompany(job,[company]),company);
 assert.equal(resolvePublishedCompany(job,[{...company,status:'draft'}]),null);
});
test('description-only gap uses factual listing introduction without invented company claims',()=>{
 const db={jobs:[{...job}],employers:[{...draft,description:''}]};
 const report=auditCompanyProfiles(db);assert.equal(report[0].action,'recover');assert.match(report[0].draft.description,/Browse job opportunities/);assert.ok(!report[0].draft.description.includes('leading'));
 repairCompanyProfiles(db,[],who,'now',()=> 'id');assert.equal(db.employers[0].descriptionSource,'recovery-listing-introduction');
});
test('older matching recovery description is reused before a neutral introduction',()=>{
 const latest={...draft,description:'',updatedAt:'2026-10-28T06:00:00Z',autosaveOwner:'owner'};
 const older={...draft,slug:'autosave-employer-older',updatedAt:'2026-10-28T05:00:00Z',autosaveOwner:'owner'};
 const report=auditCompanyProfiles({jobs:[job],employers:[latest,older]});assert.equal(report[0].draft.description,draft.description);assert.equal(report[0].draft.descriptionSource,undefined);
});

import {publishedCompanyDependents} from './company-profile-audit.mjs';
test('company cannot disappear while published jobs use its slug, old URL or name',()=>{
 const company={title:'Insights Psychology DMCC',slug:'new-profile',urlAliases:['/employer/old-profile']};
 const jobs=[{status:'publish',employerSlug:'new-profile'},{status:'publish',employerUrl:'https://www.trikonet.com/employer/old-profile'},{status:'publish',company:'Insights Psychology DMCC'},{status:'draft',employerSlug:'new-profile'},{status:'publish',company:'Unrelated'}];
 assert.equal(publishedCompanyDependents(company,jobs).length,3);
});
