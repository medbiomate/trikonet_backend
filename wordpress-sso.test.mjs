import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createHmac} from 'node:crypto';
import {createWordPressSso} from './wordpress-sso.mjs';
const config={origin:'https://wordpress.example.com',frontendOrigin:'https://www.trikonet.com',siteId:'trikonet-staging',secret:'test-only-secret-with-at-least-32-characters'};
const state='a'.repeat(64);
function harness(){
 const tickets=new Map();let suspended=false;
 const ctx={sendJson:(_req,res,status,body)=>Object.assign(res,{status,body}),currentSession:()=>({userId:'candidate-1',name:'Candidate',email:'candidate@example.com'}),cookieValue:()=> 'session-token',accountDeletion:{suspended:async()=>suspended},sessions:new Map([['session-token',{userId:'candidate-1',name:'Candidate',email:'candidate@example.com'}]]),getSessionCookieHeader:()=> 'trikonet_session=session-token; Secure; HttpOnly',wpDb:{query:async(sql,args)=>{
  if(sql.startsWith('INSERT'))tickets.set(args[0],{session_token:args[1],state:args[2],origin:args[3],expires_at:args[4]});
  if(sql.startsWith('SELECT')){const row=tickets.get(args[0]);return [[...(row&&row.expires_at>args[1]?[row]:[])]];}
  if(sql.startsWith('DELETE')&&sql.includes('ticket_hash=?'))return [{affectedRows:tickets.delete(args[0])?1:0}];
  return [[]];
 }}};
 const handler=createWordPressSso({getConfig:async()=>config});
 return {ctx,tickets,suspend:()=>suspended=true,send:async(route,body,options={})=>{
  const raw=JSON.stringify(body),stamp=String(Date.now()),req=Readable.from([Buffer.from(raw)]);req.method=options.method||'POST';req.headers={origin:options.origin||config.frontendOrigin,'x-trikonet-timestamp':stamp,...(options.signed?{'x-trikonet-signature':'sha256='+createHmac('sha256',config.secret).update(stamp+'.'+raw).digest('hex')}:{})};const res={headers:{},setHeader(name,value){this.headers[name]=value}};await handler(req,res,new URL('https://api.trikonet.com/api/auth/wordpress-'+route),ctx);return res;
 }};
}
test('authenticated ticket can be exchanged only once with the correct signature',async()=>{const h=harness(),issue=await h.send('ticket',{state,origin:config.origin});assert.equal(issue.status,200);const body={state,origin:config.origin,ticket:issue.body.ticket};assert.equal(h.tickets.has(issue.body.ticket),false);assert.equal((await h.send('exchange',body)).status,401);const accepted=await h.send('exchange',body,{signed:true});assert.equal(accepted.status,200);assert.match(accepted.headers['Set-Cookie'],/HttpOnly/);assert.equal((await h.send('exchange',body,{signed:true})).status,401);});
test('ticket rejects untrusted browser and destination origins',async()=>{const h=harness();assert.equal((await h.send('ticket',{state,origin:'https://attacker.example'})).status,400);assert.equal((await h.send('ticket',{state,origin:config.origin},{origin:'https://attacker.example'})).status,403);});
test('state mismatch does not consume the ticket',async()=>{const h=harness(),issue=await h.send('ticket',{state,origin:config.origin});const body={state:'b'.repeat(64),origin:config.origin,ticket:issue.body.ticket};assert.equal((await h.send('exchange',body,{signed:true})).status,401);body.state=state;assert.equal((await h.send('exchange',body,{signed:true})).status,200);});
test('suspended and revoked sessions cannot exchange tickets',async()=>{const h=harness(),issue=await h.send('ticket',{state,origin:config.origin});h.suspend();assert.equal((await h.send('exchange',{state,origin:config.origin,ticket:issue.body.ticket},{signed:true})).status,401);assert.equal((await h.send('ticket',{state,origin:config.origin})).status,401);});
test('expired tickets and wrong methods are rejected',async()=>{const h=harness(),issue=await h.send('ticket',{state,origin:config.origin});for(const row of h.tickets.values())row.expires_at=0;assert.equal((await h.send('exchange',{state,origin:config.origin,ticket:issue.body.ticket},{signed:true})).status,401);assert.equal((await h.send('ticket',{}, {method:'GET'})).status,405);});
