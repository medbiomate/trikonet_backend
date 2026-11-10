import test from 'node:test';
import assert from 'node:assert/strict';
import {assertUniqueCompany,employerIdentity} from './employer-identity.mjs';
import {indexWhere} from './admin-employer-index.mjs';
test('available company URL is preserved exactly',()=>{
 const result=employerIdentity({title:'The Britnurse Home Health Care Center LLC',slug:'the-britnurse-home-health-care-center-llc'},[]);
 assert.equal(result.slug,'the-britnurse-home-health-care-center-llc');assert.equal(result.index,-1);
});
test('recovery identity cannot become the published URL',()=>{
 const draft={slug:'autosave-employer-uuid',title:'Clinic',autosaved:true,requestedSlug:'my-exact-clinic-url'};
 const result=employerIdentity({...draft,originalSlug:draft.slug},[draft]);
 assert.equal(result.slug,'my-exact-clinic-url');assert.equal(result.existing,draft);assert.equal(result.snapshot,true);
});
test('legacy recovery copy without requested slug uses company name',()=>{
 assert.equal(employerIdentity({title:'The Britnurse Home Health Care Center LLC',slug:'autosave-employer-uuid'},[]).slug,'the-britnurse-home-health-care-center-llc');
});
test('URL collision returns 409 and never chooses an unrelated company to update',()=>{
 const existing={slug:'clinic',title:'Original Clinic'};
 assert.throws(()=>employerIdentity({title:'New Clinic',slug:'clinic'},[existing]),e=>e.status===409);
 assert.throws(()=>employerIdentity({title:'New Clinic',slug:'clinic'},[],[existing]),e=>e.status===409);
 assert.equal(existing.title,'Original Clinic');
});
test('editing existing company retains identity while changing to available URL',()=>{
 const existing={slug:'clinic',title:'Clinic'};
 const result=employerIdentity({title:'Clinic',slug:'new-clinic',originalSlug:'clinic'},[existing],[{slug:'clinic'}]);
 assert.equal(result.existing,existing);assert.equal(result.slug,'new-clinic');
});
test('all employer index tabs and counts exclude recovery copies',()=>{
 for(const status of ['all','draft','publish'])for(const enabled of [true,false]){
  const {sql}=indexWhere(new URLSearchParams({status,period:'all'}),{userId:'one'},{status:enabled});
  assert.ok(sql.includes("slug NOT LIKE 'autosave-%'"));assert.ok(sql.includes("JSON_UNQUOTE(JSON_EXTRACT(card,'$.autosaved'))"));
 }
});

test('company saves reject imported name duplicates and concurrent same-slug creates',()=>{
 const imported={id:42,slug:'clinic',title:{rendered:' City  Clinic '}};
 const company={id:'new',slug:'different',title:'City Clinic'};
 assert.throws(()=>assertUniqueCompany(company,[],[imported]),e=>e.status===409 && e.existingSlug==='clinic');
 assert.throws(()=>assertUniqueCompany(company,[{...company,id:'other'},company],[]),e=>e.status===409);
 assert.doesNotThrow(()=>assertUniqueCompany({...company,slug:'clinic',id:42},[],[imported],imported));
 assert.doesNotThrow(()=>assertUniqueCompany(company,[{...imported,status:'trash'}],[imported]));
});
test('manual company save promotes only its own recovery record',()=>{
 const saved={id:'mine',slug:'autosave-employer-mine',title:'City Clinic',autosaved:true};
 const unrelated={...saved,id:'other',slug:'autosave-employer-other'};
 const record={title:'City Clinic',slug:'city-clinic',draftId:'mine'};
 assert.equal(employerIdentity(record,[unrelated,saved]).existing,saved);
});
