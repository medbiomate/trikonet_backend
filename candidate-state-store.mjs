// Candidate requests (résumé, saved jobs, résumé library) used to parse and rewrite
// the whole app state, about 60 MB with every account and job, for one person's
// data. These helpers move only the selected account or field.
//
// Writes keep updated_at unchanged: it versions the public job catalogue, and an
// account edit must not make every API process reload the catalogue.
const ACCOUNT=`SELECT CAST(JSON_EXTRACT(s.payload,CONCAT('$.users[',u.position-1,']')) AS CHAR) AS account,u.position-1 AS account_index
 FROM trikonet_app_state s,JSON_TABLE(s.payload,'$.users[*]' COLUMNS(position FOR ORDINALITY,id VARCHAR(191) PATH '$.id')) u
 WHERE s.state_key='main' AND BINARY u.id=BINARY ? ORDER BY u.position LIMIT 1`;
const FIELDS=new Set(['resumes','emailCampaigns']);
const fieldPath=key=>{if(!FIELDS.has(key))throw Error('Invalid state field');return `$.${key}`;};

export function createCandidateStateStore(pool,{ensure=async()=>{},isDeleted=async()=>false}={}){
 // Returns the account, or null when it does not exist or was deleted.
 async function readAccount(userId){
  await ensure();
  if(await isDeleted(userId))return null;
  const [rows]=await pool.query(ACCOUNT,[String(userId)]);
  return rows.length?JSON.parse(rows[0].account):null;
 }
 // change(user) edits the account in place and returns {save, ...result}.
 async function updateAccount(userId,change){
  await ensure();
  if(await isDeleted(userId))return null;
  const connection=await pool.getConnection();
  try{
   await connection.beginTransaction();
   const [rows]=await connection.query(ACCOUNT+' FOR UPDATE',[String(userId)]);
   if(!rows.length){await connection.rollback();return null;}
   const user=JSON.parse(rows[0].account);
   const outcome=await change(user)||{};
   if(outcome.save)await connection.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload,?,JSON_EXTRACT(?,'$')),updated_at=updated_at WHERE state_key='main'",[`$.users[${Number(rows[0].account_index)}]`,JSON.stringify(user)]);
   await connection.commit();
   return {...outcome,user};
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
 }
 async function readField(key){
  await ensure();
  const [rows]=await pool.query(`SELECT CAST(JSON_EXTRACT(payload,?) AS CHAR) AS value FROM trikonet_app_state WHERE state_key='main' LIMIT 1`,[fieldPath(key)]);
  const value=rows[0]?.value?JSON.parse(rows[0].value):null;
  return Array.isArray(value)?value:[];
 }
 // change(list) returns {list, save, ...result}.
 async function updateField(key,change){
  await ensure();
  const path=fieldPath(key);
  const connection=await pool.getConnection();
  try{
   await connection.beginTransaction();
   const [rows]=await connection.query(`SELECT CAST(JSON_EXTRACT(payload,?) AS CHAR) AS value FROM trikonet_app_state WHERE state_key='main' LIMIT 1 FOR UPDATE`,[path]);
   if(!rows.length)throw Error('Account storage unavailable');
   const current=rows[0].value?JSON.parse(rows[0].value):null;
   const outcome=await change(Array.isArray(current)?current:[])||{};
   if(outcome.save)await connection.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload,?,JSON_EXTRACT(?,'$')),updated_at=updated_at WHERE state_key='main'",[path,JSON.stringify(outcome.list)]);
   await connection.commit();
   return outcome;
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
 }
 return {readAccount,updateAccount,readField,updateField};
}
