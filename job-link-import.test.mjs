import test from 'node:test';import assert from 'node:assert/strict';
import {extractJobPage,publicAddress} from './job-link-import.mjs';
test('extracts source fields and sanitizes descriptions',()=>{
 const p={'@context':'https://schema.org','@type':'JobPosting',title:'Nurse',description:'<p>Care &amp; support</p><img src=x onerror=alert(1)>',hiringOrganization:{name:'Hospital'},jobLocation:{address:{addressLocality:'Dubai',addressCountry:'AE'}},baseSalary:{currency:'AED',value:{minValue:5000,maxValue:7000,unitText:'MONTH'}}};
 const result=extractJobPage(`<script type="application/ld+json">${JSON.stringify(p)}</script>`,'https://example.com/job');assert.equal(result.job.company,'Hospital');assert.equal(result.job.minSalary,'5000');assert.equal(result.job.addressLocality,'Dubai');assert.ok(!result.job.description.includes('<img'));assert.equal(result.job.applyUrl,'https://example.com/job');assert.equal(result.job.streetAddress,undefined);
});
test('rejects ambiguous pages and missing data',()=>{
 assert.throws(()=>extractJobPage('<html>blocked</html>','https://example.com'),/No structured/);
 assert.throws(()=>extractJobPage('<script type="application/ld+json">[{"@type":"JobPosting"},{"@type":"JobPosting"}]</script>','https://example.com'),/multiple/);
});
test('blocks private and local network targets',()=>{
 for(const ip of ['127.0.0.1','10.1.2.3','172.16.0.1','192.168.1.1','169.254.169.254','::1','::ffff:127.0.0.1','fc00::1','0.0.0.0'])assert.equal(publicAddress(ip),false,ip);
 assert.equal(publicAddress('8.8.8.8'),true);
});

test('Oracle preview and redirected URLs resolve to the same public job API',async()=>{
 const {oracleJobRequest}=await import('./job-link-import.mjs');
 const base='https://eiby.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/';
 assert.equal(oracleJobRequest(base+'jobs/preview/12765'),oracleJobRequest(base+'job/12765'));
 assert.ok(oracleJobRequest(base+'job/12765').includes('recruitingCEJobRequisitionDetails'));
 assert.equal(oracleJobRequest('https://example.com/job/12765'),null);
});

test('requirements and salary use the editor field names without invented amounts',async()=>{
 const {extractJobRequirements}=await import('./job-link-import.mjs');
 const p=extractJobRequirements("Bachelor's degree required. Minimum 2 years experience. Salary AED 5,000 - 7,000 per month.");
 assert.equal(p.minSalary,'5000');assert.equal(p.maxSalary,'7000');assert.equal(p.salaryType,'Monthly');assert.match(p.experience,/2 years/);assert.match(p.qualification,/Bachelor/);
 assert.equal(extractJobRequirements('Minimum 1 year experience').minSalary,undefined);
});

test('LinkedIn public markup fills title employer and description',async()=>{
 const {extractLinkedInJob,isLinkedInJob,importPastedJob}=await import('./job-link-import.mjs');
 const html='<h1 class="top-card-layout__title">Nurse</h1><a class="topcard__org-name-link">Hospital</a><span class="topcard__flavor--bullet">Dubai, UAE</span><div class="show-more-less-html__markup"><p>Minimum 2 years experience.</p></div>';
 const r=extractLinkedInJob(html,'https://www.linkedin.com/jobs/view/123/');assert.equal(r.job.title,'Nurse');assert.equal(r.job.company,'Hospital');assert.match(r.job.experience,/2 years/);
 assert.equal(isLinkedInJob('https://evil.com/jobs/view/123'),false);
 assert.throws(()=>extractLinkedInJob('Sign in','https://www.linkedin.com/jobs/view/123'),/Paste job text/);
 assert.equal(importPastedJob('Nurse\nMinimum 2 years experience.').job.title,'Nurse');
});

test('description keeps bullets paragraphs and emphasis without unsafe markup',async()=>{
 const {formatImportedDescription}=await import('./job-link-import.mjs');
 const result=formatImportedDescription('<strong>Hospital</strong> is hiring.<br><ul onclick="bad()"><li>First benefit</li><li>Second benefit</li></ul><script>alert(1)</script>');
 assert.match(result,/<strong>Hospital<\/strong> is hiring/);assert.match(result,/<ul><li>First benefit<\/li><li>Second benefit<\/li><\/ul>/);assert.doesNotMatch(result,/onclick|script|alert/);
});
