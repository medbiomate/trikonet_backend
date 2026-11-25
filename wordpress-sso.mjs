import {readWordPressConfig} from './wordpress-config.mjs';import {randomBytes,createHash} from 'node:crypto';import {validSignature} from './wordpress-bridge.mjs';
export function validSsoRequest(body,config){return body?.origin===config.origin&&/^[a-f0-9]{64}$/.test(body?.state||'');}
export function createWordPressSso({getConfig=readWordPressConfig}={}){return async function(req,res,url,ctx){
 if(!['/api/auth/wordpress-ticket','/api/auth/wordpress-exchange'].includes(url.pathname))return false;
 const reply=async(status,body)=>{await ctx.sendJson(req,res,status,body);return true;};
 if(req.method!=='POST')return reply(405,{error:'POST required.'});
 try{
  const config=await getConfig();let chunks=[],size=0;for await(const part of req){size+=part.length;if(size>4096)return reply(413,{error:'Request too large.'});chunks.push(part);}const raw=Buffer.concat(chunks),body=JSON.parse(raw.toString('utf8'));
  if(!validSsoRequest(body,config))return reply(400,{error:'Invalid sign-in destination.'});
  await ctx.wpDb.query('CREATE TABLE IF NOT EXISTS trikonet_wordpress_tickets (ticket_hash CHAR(64) PRIMARY KEY,session_token VARCHAR(200) NOT NULL,state CHAR(64) NOT NULL,origin VARCHAR(255) NOT NULL,expires_at BIGINT NOT NULL) ENGINE=InnoDB');
  if(url.pathname.endsWith('/wordpress-ticket')){
   if(req.headers.origin!==config.frontendOrigin)return reply(403,{error:'Invalid sign-in origin.'});
   const session=ctx.currentSession(req);if(!session||await ctx.accountDeletion.suspended(session.userId))return reply(401,{error:'Sign in to continue.'});
   const token=ctx.cookieValue(req,'trikonet_session');if(!token)return reply(401,{error:'Sign in to continue.'});
   const ticket=randomBytes(32).toString('hex'),hash=createHash('sha256').update(ticket).digest('hex');
   await ctx.wpDb.query('DELETE FROM trikonet_wordpress_tickets WHERE expires_at<?',[Date.now()]);
   await ctx.wpDb.query('INSERT INTO trikonet_wordpress_tickets (ticket_hash,session_token,state,origin,expires_at) VALUES (?,?,?,?,?)',[hash,token,body.state,body.origin,Date.now()+90000]);
   return reply(200,{ticket,state:body.state,origin:body.origin});
  }
  if(!validSignature(config,raw,req.headers['x-trikonet-timestamp'],req.headers['x-trikonet-signature']))return reply(401,{error:'Invalid account connection signature.'});
  if(!/^[a-f0-9]{64}$/.test(body.ticket||''))return reply(400,{error:'Invalid sign-in code.'});
  const hash=createHash('sha256').update(body.ticket).digest('hex');const [rows]=await ctx.wpDb.query('SELECT * FROM trikonet_wordpress_tickets WHERE ticket_hash=? AND expires_at>?',[hash,Date.now()]);const row=rows[0];
  if(!row||row.origin!==body.origin||row.state!==body.state)return reply(401,{error:'This sign-in code has expired. Please try again.'});
  const session=ctx.sessions.get(row.session_token);if(!session||await ctx.accountDeletion.suspended(session.userId))return reply(401,{error:'Your session is no longer available.'});
  const [removed]=await ctx.wpDb.query('DELETE FROM trikonet_wordpress_tickets WHERE ticket_hash=? AND expires_at>?',[hash,Date.now()]);if(removed.affectedRows!==1)return reply(401,{error:'This sign-in code has already been used.'});
  res.setHeader('Set-Cookie',ctx.getSessionCookieHeader(req,row.session_token));return reply(200,{user:{id:session.userId,name:session.name,email:session.email}});
 }catch{return reply(503,{error:'Sign-in connection is temporarily unavailable. Please try again.'});}
};
}
export const handleWordPressSso=createWordPressSso();
