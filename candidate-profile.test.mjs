import test from 'node:test';import assert from 'node:assert/strict';import {updateCandidateProfile} from './candidate-profile.mjs';
test('section edits keep previously saved fields and persist all recommendation settings',()=>{
 const existing={name:'User',role:'Accountant',locations:['Dubai'],skills:'Excel',profileUpdatedAt:100};
 const saved=updateCandidateProfile(existing,{skills:'Excel, Payroll',preferredDepartment:'Finance',workType:'Full Time',shiftPreference:'Day',licenseExpiry:'2027-01-01',university:'University',certifications:'CPA',profileUpdatedAt:200},250);
 assert.equal(saved.role,'Accountant');assert.deepEqual(saved.locations,['Dubai']);assert.equal(saved.skills,'Excel, Payroll');assert.equal(saved.preferredDepartment,'Finance');assert.equal(saved.workType,'Full Time');assert.equal(saved.shiftPreference,'Day');assert.equal(saved.university,'University');assert.equal(saved.certifications,'CPA');assert.equal(saved.licenseExpiry,'2027-01-01');
});
test('late autosaves cannot undo a newer edit; deliberate clears and website updates persist',()=>{
 const current={skills:'Excel, Payroll',profileUpdatedAt:300};assert.deepEqual(updateCandidateProfile(current,{skills:'Excel',profileUpdatedAt:200},400),current);
 assert.equal(updateCandidateProfile(current,{skills:'',profileUpdatedAt:500},600).skills,'');
 assert.equal(updateCandidateProfile(current,{skills:'SQL'},700).profileUpdatedAt,700);
 assert.equal(updateCandidateProfile(current,{userId:'other',password:'secret'},700).password,undefined);
});

test('completion counts core career details consistently and ignores optional fields', async()=>{
 const {calculateCandidateCompletion}=await import('./candidate-profile.mjs');
 const profile={name:'Candidate',email:'candidate@example.com',phone:'123',currentLocation:'Dubai',role:'SEO Specialist',experience:'3 years',category:'Digital Marketing',skills:'SEO',locations:[],qualification:''};
 assert.equal(calculateCandidateCompletion(profile),80);
 assert.equal(calculateCandidateCompletion({...profile,degree:'Bachelor',locations:['Dubai']}),100);
 assert.equal(calculateCandidateCompletion({...profile,nationality:'UAE',salaryExpectation:'10000',photo:'photo'}),80);
 assert.equal(calculateCandidateCompletion({...profile,role:'',currentDesignation:'SEO Specialist',skills:' ',locations:[' ']}),70);
});
