// Change one job under the state lock without transferring the full catalogue.
export async function trashJobRecord(pool,index,slug,loadImported) {
 await index.ensure();
 const connection=await pool.getConnection();
 try {
  await connection.beginTransaction();
  const [rows]=await connection.query("SELECT JSON_UNQUOTE(JSON_SEARCH(payload,'one',?,NULL,'$.jobs[*].slug')) jobPath FROM trikonet_app_state WHERE state_key='main' FOR UPDATE",[slug.replace(/[\\%_]/g,'\\$&')]);
  if(!rows[0])throw Error('Job storage unavailable');
  const path=rows[0].jobPath?.replace(/\.slug$/,'');
  let before;
  if(path){
   if(!/^\$\.jobs\[\d+\]$/.test(path))throw Error('Invalid job path');
   const [records]=await connection.query("SELECT JSON_EXTRACT(payload,?) job FROM trikonet_app_state WHERE state_key='main'",[path]);
   before=typeof records[0].job==='string'?JSON.parse(records[0].job):records[0].job;
  } else before=await loadImported();
  if(!before){await connection.rollback();return null;}
  const after={...before,status:'trash',updatedAt:new Date().toISOString(),local:true};
  if(path)await connection.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload,?,JSON_EXTRACT(?,'$')),updated_at=CURRENT_TIMESTAMP WHERE state_key='main'",[path,JSON.stringify(after)]);
  else await connection.query("UPDATE trikonet_app_state SET payload=JSON_ARRAY_APPEND(payload,'$.jobs',JSON_EXTRACT(?,'$')),updated_at=CURRENT_TIMESTAMP WHERE state_key='main'",[JSON.stringify(after)]);
  await index.sync(connection,path?[before]:[],[after]);
  await connection.commit();
  return before;
 } catch(error){await connection.rollback();throw error;} finally {connection.release();}
}
