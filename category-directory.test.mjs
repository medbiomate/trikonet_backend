import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeoRepository} from './seo-job-pages.mjs';
test('directory uses active jobs, 20-job boundary, and only existing published destinations',async()=>{
 const jobs=[...Array.from({length:20},(_,id)=>({id,slug:`a-${id}`,categories:['Healthcare'],locations:['Dubai']})),...Array.from({length:19},(_,id)=>({id:id+20,slug:`b-${id}`,categories:['Engineering'],locations:['Dubai']})),{slug:'expired',categories:['Engineering'],locations:['Dubai'],expiryDate:'2020-01-01'},{slug:'filled',categories:['Engineering'],locations:['Dubai'],filled:true},{slug:'draft',categories:['Engineering'],locations:['Dubai'],status:'draft'}];
 const pages=[{slug:'health-in-dubai',title:'Healthcare Jobs in Dubai',category:'Healthcare',pageType:'category_location',location:'Dubai',status:'Published',indexingStatus:'Index'},{slug:'health-in-ajman',category:'Healthcare',pageType:'category_location',location:'Ajman',status:'Published',indexingStatus:'Index'},{slug:'draft-health',category:'Healthcare',pageType:'main_category',status:'Draft',indexingStatus:'Index'}];
 const pool={query:async sql=>sql.startsWith('SELECT')?[pages.map(page=>({payload:JSON.stringify(page)}))]:[[]]};
 const repo=createSeoRepository(pool,async()=>({jobs:[]}),async()=>({jobs,taxonomies:{categories:[{id:1,name:'Healthcare',slug:'healthcare'},{id:2,name:'Engineering',slug:'engineering'}],locations:[{id:3,name:'Dubai'}]}}));
 const links=await repo.directory();
 assert.deepEqual(links.map(link=>link.href).sort(),['/category/healthcare','/health-in-dubai']);
 assert.ok(links.every(link=>link.activeJobCount===20));
});
