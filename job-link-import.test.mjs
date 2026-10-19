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

test('LinkedIn hiring posts map employer role city experience and email independently of the author',async()=>{
 const {extractLinkedInPost,isLinkedInPost}=await import('./job-link-import.mjs');
 const body='📢 WE ARE HIRING | OPERATIONS COORDINATOR\\n\\nDr. Firas Dental &amp; Orthodontic Center is looking for an Operations Coordinator.\\nLocation: Al Rahba, Abu Dhabi, UAE\\nQualifications:\\n-Bachelors degree in Healthcare Administration.\\n-Minimum 4 years of progressive experience in hospital front office or healthcare operations.\\nSend your CV to careers@firasdoc.com';
 const result=extractLinkedInPost(`<meta property="og:description" content="${body}"><meta property="og:title" content="Hiring | Ghyrlyn B.">`,'https://www.linkedin.com/posts/example');
 assert.equal(result.job.title,'OPERATIONS COORDINATOR');assert.equal(result.job.company,'Dr. Firas Dental & Orthodontic Center');assert.deepEqual(result.job.locations,['Abu Dhabi']);assert.equal(result.job.applyType,'By Email');assert.equal(result.job.applyEmail,'careers@firasdoc.com');assert.match(result.job.experience,/4 years/);assert.match(result.job.qualification,/Bachelors/);assert.equal(result.job.minSalary,undefined);
 assert.equal(isLinkedInPost('https://www.linkedin.com/posts/example'),true);assert.equal(isLinkedInPost('https://linkedin.com.evil.test/posts/example'),false);
 assert.throws(()=>extractLinkedInPost('<meta property="og:description" content="Sign in">','https://linkedin.com/posts/x'),/Paste job text/);
});

test('ATS JSON with literal line breaks and apostrophe escapes is parsed as data',async()=>{
 const {parseJobJson}=await import('./job-link-import.mjs');
 assert.equal(parseJobJson('{"description":"<p>Academy\\\'s responsibilities\nNext paragraph</p>"}').description,"<p>Academy's responsibilities\nNext paragraph</p>");
 assert.throws(()=>parseJobJson('arbitrary()'));
});
test('SuccessFactors microdata supports nested descriptions and explicit dates',async()=>{
 const {extractMicrodataJob}=await import('./job-link-import.mjs');
 const html='<div itemtype="http://schema.org/JobPosting"><meta itemprop="hiringOrganization" content="Al Futtaim"><meta itemprop="validThrough" content="2026-10-29"><h1 itemprop="title">Registered Nurse, Dubai</h1><span itemprop="description"><p>Provide nursing care and support to patients.</p><span>Qualifications</span><ul><li>Bachelors degree</li></ul></span></div>';
 const r=extractMicrodataJob(html,'https://example.com/job');assert.equal(r.job.company,'Al Futtaim');assert.equal(r.job.addressLocality,'Dubai');assert.equal(r.job.deadline,'2026-10-29');assert.match(r.job.description,/<ul><li>Bachelors degree/);
});
test('encoded descriptions become safe formatting instead of literal tags',async()=>{
 const {formatImportedDescription}=await import('./job-link-import.mjs');
 assert.equal(formatImportedDescription('&lt;p&gt;&lt;strong&gt;Responsibilities&lt;/strong&gt;&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Care&lt;/li&gt;&lt;/ul&gt;'),'<p><strong>Responsibilities</strong></p><ul><li>Care</li></ul>');
});
