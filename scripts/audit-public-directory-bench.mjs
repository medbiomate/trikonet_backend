// Synthetic CPU benchmark; no database, HTTP requests or production records.
// Usage: node scripts/audit-public-directory-bench.mjs [baseline-git-ref] [record-count] [runs]
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {fileURLToPath} from 'node:url';
import {publicDirectory as candidate} from '../public-directory.mjs';
const root=new URL('../',import.meta.url);
const baselineRef=process.argv[2]||'c49024a';
const count=Number(process.argv[3]||10000),runs=Number(process.argv[4]||7);
if(!Number.isInteger(count)||count<1||!Number.isInteger(runs)||runs<1)throw Error('Use positive integer counts');
const source=execFileSync('git',['show',`${baselineRef}:public-directory.mjs`],{cwd:fileURLToPath(root),encoding:'utf8'});
const moduleSource=source.replace(/from '(\.\/[^']+)'/g,(_,relative)=>`from '${new URL(relative,root).href}'`);
const {publicDirectory:baseline}=await import('data:text/javascript;base64,'+Buffer.from(moduleSource).toString('base64'));
const jobs=Array.from({length:count},(_,i)=>({id:i,slug:'job-'+i,title:i%5===0?'Registered Nurse':'Staff Position',company:'Hospital '+(i%31),description:'<p>Registered nurse patient care medical role '+('requirements health clinical experience '.repeat(100))+'</p>',status:'publish',categories:['Nursing'],locations:['Dubai'],types:['Full Time'],postedDate:new Date(Date.UTC(2026,9,1+(i*7)%31)).toISOString(),updatedAt:new Date(Date.UTC(2026,9,1+(i*11)%31)).toISOString()}));
const remote=async()=>[];
const results=[];
for(const query of ['', 'q=registered+nurse+patient+care', 'q=Registered+Nurse&location=Dubai&category=Nursing']){
 const params=new URLSearchParams(query);
 assert.deepEqual(await candidate(jobs,params,remote),await baseline(jobs,params,remote));
 const before=[],after=[];
 for(let i=0;i<runs;i++){
  // Alternate order to reduce systematic JIT/GC bias.
  for(const [fn,values] of i%2?[[candidate,after],[baseline,before]]:[[baseline,before],[candidate,after]]){
   const started=performance.now();await fn(jobs,params,remote);values.push(performance.now()-started);
  }
 }
 const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
 const row={query,baselineMedianMs:median(before),candidateMedianMs:median(after),baselineRunsMs:before,candidateRunsMs:after,equivalent:true};
 results.push(row);
}
console.log(JSON.stringify({benchmark:'public-directory-synthetic',node:process.version,baselineRef,records:count,descriptionBytes:Buffer.byteLength(jobs[0].description),runs,results},null,2));
