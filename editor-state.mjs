import {mergeStateChanges} from './state-changes.mjs';
import {prepareStateMedia} from './state-media.mjs';
const allowed=new Set(['jobs','employers','jobRecoveryById','employerJobAddresses']);
// Never transfer account profiles, CVs or resumes into an editor request.
export function createEditorState(pool,ensure,media,index){
 const snapshots=new WeakMap();
 const projection=keys=>keys.map(key=>`'${key}',JSON_EXTRACT(payload,'$.${key}')`).join(',');
 async function read(keys=['jobs','employers','jobRecoveryById','employerJobAddresses']){
  if(!keys.length||keys.some(key=>!allowed.has(key)))throw Error('Invalid editor state fields');
  await ensure();
  if(index)await index.ensure();
  const [rows]=await pool.query(`SELECT CAST(JSON_OBJECT(${projection(keys)}) AS CHAR) payload FROM trikonet_app_state WHERE state_key='main' LIMIT 1`);
  if(!rows[0])throw Error('Editor storage unavailable');
  const state=JSON.parse(rows[0].payload);
  for(const key of keys)state[key] ||= ['jobs','employers'].includes(key)?[]:{};
  snapshots.set(state,{keys,before:structuredClone(state)});return state;
 }
 async function write(state){
  const snapshot=snapshots.get(state);if(!snapshot)return false;
  const next=await prepareStateMedia(state,snapshot.before,media);
  const changed=snapshot.keys.filter(key=>JSON.stringify(next[key])!==JSON.stringify(snapshot.before[key]));
  if(!changed.length)return true;
  const connection=await pool.getConnection();
  try{
   await connection.beginTransaction();
   const [rows]=await connection.query(`SELECT CAST(JSON_OBJECT(${projection(changed)}) AS CHAR) payload FROM trikonet_app_state WHERE state_key='main' FOR UPDATE`);
   if(!rows[0])throw Error('Editor storage unavailable');
   const current=JSON.parse(rows[0].payload);
   let mergedJobs;
   const values=[];
   const updates=changed.map(key=>{
    const merged=mergeStateChanges(current[key]??snapshot.before[key],snapshot.before[key],next[key]);
    if(key==='jobs')mergedJobs=merged;
    values.push(`$.${key}`,JSON.stringify(merged));return '?,JSON_EXTRACT(?,\'$\')';
   });
   await connection.query(`UPDATE trikonet_app_state SET payload=JSON_SET(payload,${updates.join(',')}),updated_at=CURRENT_TIMESTAMP WHERE state_key='main'`,values);
   if(index&&mergedJobs)await index.sync(connection,current.jobs||[],mergedJobs);
   await connection.commit();return true;
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
 }
 return {read,write};
}
