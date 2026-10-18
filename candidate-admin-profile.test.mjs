import {test} from 'node:test';import assert from 'node:assert/strict';
import {adminCandidateProfile,candidateEditProfile} from './candidate-admin-profile.mjs';
import {updateCandidateProfile} from './candidate-profile.mjs';
test('admin rows use current account data instead of stale candidate copies',()=>{const row=adminCandidateProfile({id:7,jobTitle:'Old',location:'Old'}, {id:7,email:'a@example.com',name:'Name',profile:{role:'SEO Manager',currentLocation:'Dubai',skills:'SEO'}});assert.equal(row.userId,7);assert.equal(row.jobTitle,'SEO Manager');assert.equal(row.location,'Dubai');assert.equal(row.email,'a@example.com')});
test('admin edits map to app profile without overwriting email or ID',()=>{const patch=candidateEditProfile({id:99,email:'wrong',jobTitle:'Accountant',location:'Abu Dhabi',bio:'Summary'});assert.deepEqual(patch,{role:'Accountant',currentLocation:'Abu Dhabi',summary:'Summary'})});
test('completion is persisted and cannot be reset by later partial edits',()=>{const p=updateCandidateProfile({}, {setupCompletedAt:100,needsInitialSetup:false,profileUpdatedAt:100},100);assert.equal(p.setupCompletedAt,100);assert.equal(updateCandidateProfile(p,{needsInitialSetup:true,profileUpdatedAt:200},200).needsInitialSetup,false)});

test('all app profile fields survive admin save and account reload',async()=>{
 const {candidateProfileFields}=await import('./candidate-profile.mjs');
 const {applyAccountProfile}=await import('./account-identity.mjs');
 const profile=Object.fromEntries(candidateProfileFields.filter(k=>k!=='email').map(k=>[k,`value-${k}`]));
 Object.assign(profile,{educationEntries:[{id:'ed1',course:'Engineering',institution:'College'}],licenses:['DHA'],licenseDetails:{DHA:{number:'123',status:'Active'}},languages:['English'],languageDetails:{English:{abilities:['Speak','Read'],level:'Native'}},locations:['Dubai'],accomplishments:[{id:'a1',title:'Award',ongoing:false}],nationality:'India',gender:'',skills:'Updated skills'});
 const user={id:'cand-101',email:'verified@example.com',name:'Candidate',profile:{...profile,setupCompletedAt:100,needsInitialSetup:false}};
 const record=adminCandidateProfile({},user);
 record.nationality='UAE';record.educationEntries[0].course='Computer Science';
 applyAccountProfile(user,candidateEditProfile(record),updateCandidateProfile);
 const reloaded=adminCandidateProfile({},user);
 for(const key of candidateProfileFields.filter(k=>k!=='email'))assert.deepEqual(reloaded[key],record[key],key);
 assert.equal(user.id,'cand-101');assert.equal(user.email,'verified@example.com');assert.equal(user.profile.setupCompletedAt,100);
});

test('older nested app profile payloads remain supported',()=>{assert.equal(candidateEditProfile({appProfile:{nationality:'India',languages:['English']}}).nationality,'India');assert.equal(candidateEditProfile({appProfile:{nationality:'Old'},nationality:'New'}).nationality,'New')});
