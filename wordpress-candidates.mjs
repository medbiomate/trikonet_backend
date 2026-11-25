import {readWordPressConfig} from './wordpress-config.mjs';
import {validSignature} from './wordpress-bridge.mjs';
import {candidateProfileFields} from './candidate-profile.mjs';
export function createWordPressCandidates({getConfig=readWordPressConfig}={}){return async(req,res,url,ctx)=>{
 if(url.pathname!=='/api/integrations/wordpress/candidates')return false;
 const reply=async(status,body)=>{res.setHeader('Cache-Control','private, no-store');await ctx.sendJson(req,res,status,body);return true;};
 if(req.method!=='POST')return reply(405,{error:'POST required.'});
 try{
  const config=await getConfig();let size=0;const chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>8192)return reply(413,{error:'Request too large.'});chunks.push(chunk);}
  const raw=Buffer.concat(chunks);
  if(!validSignature(config,raw,req.headers['x-trikonet-timestamp'],req.headers['x-trikonet-signature']))return reply(401,{error:'Invalid account administration signature.'});
  const body=JSON.parse(raw.toString('utf8'));if(body.siteId!==config.siteId||!['list','detail'].includes(body.action))return reply(400,{error:'Invalid candidate request.'});
  if(body.action==='detail'&&(typeof body.id!=='string'||!body.id||body.id.length>191))return reply(400,{error:'Invalid candidate identity.'});
  await ctx.accountDeletion.ensure();
  const page=Math.max(1,Math.floor(Number(body.page)||1)),limit=30,search=String(body.query||'').trim().slice(0,200);
  const projection=`JSON_TABLE(s.payload,'$.users[*]' COLUMNS(id VARCHAR(191) PATH '$.id',name VARCHAR(255) PATH '$.name',email VARCHAR(255) PATH '$.email',role VARCHAR(100) PATH '$.role',createdAt VARCHAR(100) PATH '$.createdAt',idx FOR ORDINALITY)) j`;
  let where="s.state_key='main' AND LOWER(COALESCE(j.role,'')) IN ('','candidate','subscriber','job seeker','jobseeker') AND NOT EXISTS(SELECT 1 FROM trikonet_account_deletions d WHERE d.user_id=j.id)";
  const values=[];
  if(body.action==='detail'){where+=' AND j.id=?';values.push(body.id);}
  else if(search){where+=" AND (LOWER(j.name) LIKE LOWER(?) OR LOWER(j.email) LIKE LOWER(?))";const literal=search.replace(/[\\%_]/g,'\\$&');values.push('%'+literal+'%','%'+literal+'%');}
  const columns=body.action==='detail'?"j.id,j.name,j.email,j.createdAt,JSON_EXTRACT(s.payload,CONCAT('$.users[',j.idx-1,'].profile')) AS profile":'j.id,j.name,j.email,j.createdAt';
  const [rows]=await ctx.wpDb.query(`SELECT ${columns} FROM trikonet_app_state s JOIN ${projection} ON TRUE WHERE ${where} ORDER BY j.createdAt DESC LIMIT ? OFFSET ?`,[...values,body.action==='detail'?1:limit,body.action==='detail'?0:(page-1)*limit]);
  if(body.action==='detail'){
   if(!rows[0])return reply(404,{error:'Candidate not found.'});
   const {profile,...account}=rows[0],data=typeof profile==='string'?JSON.parse(profile):profile||{};
   return reply(200,{candidate:{...account,profile:Object.fromEntries(candidateProfileFields.filter(field=>Object.hasOwn(data,field)).map(field=>[field,data[field]]))}});
  }
  const [[count]]=await ctx.wpDb.query(`SELECT COUNT(*) total FROM trikonet_app_state s JOIN ${projection} ON TRUE WHERE ${where}`,values);
  return reply(200,{candidates:rows,total:Number(count.total),page,perPage:limit});
 }catch(error){return reply(503,{error:'Candidate administration is temporarily unavailable.'});}
};}
export const handleWordPressCandidates=createWordPressCandidates();
