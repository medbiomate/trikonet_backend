import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import http from 'node:http';
import {createSeoRepository} from './seo-job-pages.mjs';
import {handleSeoRequest} from './seo-api.mjs';

test('MySQL persistence, API permissions, threshold, sitemap and draft routing',async()=>{
  const db=await mysql.createConnection({socketPath:'/tmp/mysql.sock',user:process.env.USER,database:'trikonet_html_test'});
  const table='seo_job_pages_test_'+Date.now();
  const pool={query:(sql,args)=>db.query(sql.replaceAll('seo_job_pages',table),args)};
  let jobs=Array.from({length:9},(_,i)=>({slug:`seo-test-${i}`,title:`Nurse ${i}`,status:'publish',categories:['Nurse'],locations:['Dubai']}));
  const load=async()=>({jobs,taxonomies:{categories:[{id:1,name:'Nurse'}],locations:[{id:2,name:'Dubai'}]}});
  let repo=createSeoRepository(pool,async()=>({jobs:[]}),load);
  const server=http.createServer(async(req,res)=>{
    const url=new URL(req.url,'http://localhost');
    const sendJson=(_req,r,status,value)=>{r.writeHead(status,{'Content-Type':'application/json'});r.end(JSON.stringify(value));};
    await handleSeoRequest(req,res,url.pathname,url,{seoRepository:repo,currentAdminSession:r=>r.headers['x-test-role']?{role:r.headers['x-test-role'],expiresAt:Date.now()+60000}:null,sendJson,readJsonBody:async r=>{let body='';for await(const part of r)body+=part;return body?JSON.parse(body):{};}});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const call=(path,method='GET',body,role='Administrator')=>fetch(origin+path,{method,headers:{'x-test-role':role,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  try{
    assert.equal((await call('/api/admin/seo-job-pages','GET',null,'Content Editor')).status,403);
    assert.equal((await call('/api/admin/seo-job-pages/main-categories','POST',{category:'Nurse',slug:'nurse-jobs'})).status,200);
    assert.equal((await (await call('/api/admin/seo-job-pages')).json()).length,0);
    jobs.push({...jobs[0],slug:'seo-test-9'});
    let pages=await (await call('/api/admin/seo-job-pages')).json();assert.equal(pages.length,1);const id=pages[0].id;
    const publicPage=await (await call('/api/seo-job-pages/nurse-jobs-in-dubai')).json();assert.equal(publicPage.total,10);assert.equal(publicPage.jobs.length,10);
    assert.match(await (await call('/sitemap-seo-job-pages.xml')).text(),/nurse-jobs-in-dubai/);
    await call(`/api/admin/seo-job-pages/${id}`,'PUT',{seoTitle:'My title',indexingStatus:'Noindex'});
    assert.equal((await call('/api/seo-job-pages/nurse-jobs-in-dubai')).status,200);
    assert.doesNotMatch(await (await call('/sitemap-seo-job-pages.xml')).text(),/nurse-jobs-in-dubai/);
    await call('/api/admin/seo-job-pages/bulk','POST',{ids:[id],action:'draft'});
    assert.equal((await call('/api/seo-job-pages/nurse-jobs-in-dubai')).status,404);
    repo=createSeoRepository(pool,async()=>({jobs:[]}),load);
    pages=await (await call('/api/admin/seo-job-pages')).json();assert.equal(pages[0].status,'Draft');assert.equal(pages[0].seoTitle,'My title');
    await call('/api/admin/seo-job-pages/bulk','POST',{ids:[id],action:'publish'});
    jobs=jobs.slice(0,8);
    pages=await (await call('/api/admin/seo-job-pages')).json();assert.equal(pages[0].status,'Published');assert.equal(pages[0].activeJobCount,8);
    await call('/api/admin/seo-job-pages/bulk','POST',{ids:[id],action:'auto'});
    pages=await (await call('/api/admin/seo-job-pages')).json();assert.equal(pages[0].eligibilityStatus,'Below Threshold');
  }finally{await new Promise(resolve=>server.close(resolve));await db.query(`DROP TABLE ${table}`);await db.end();}
});
