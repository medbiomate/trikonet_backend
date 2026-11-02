import {applyAccountProfile} from './account-identity.mjs';
import {updateCandidateProfile,calculateCandidateCompletion,grantProfileCompletionReward} from './candidate-profile.mjs';
export async function candidateProfileRequest(pool,method,userId,body={}){
 if(!['GET','POST','PUT'].includes(method))return[405,{error:'Method not allowed'}];
 const connection=await pool.getConnection();const writing=method!=='GET';
 try{
  if(writing)await connection.beginTransaction();
  // Keep the row lock for writes, but transfer only the selected account.
  const [rows]=await connection.query(`SELECT CAST(JSON_EXTRACT(s.payload,CONCAT('$.users[',u.position-1,']')) AS CHAR) AS account,u.position-1 AS account_index
    FROM trikonet_app_state s,JSON_TABLE(s.payload,'$.users[*]' COLUMNS(position FOR ORDINALITY,id VARCHAR(191) PATH '$.id')) u
    WHERE s.state_key='main' AND BINARY u.id=BINARY ? ORDER BY u.position LIMIT 1`+(writing?' FOR UPDATE':''),[String(userId)]);
  if(!rows.length){if(writing)await connection.rollback();return[404,{error:'Account not found'}]}
  const index=Number(rows[0].account_index);
  const user=typeof rows[0].account==='string'?JSON.parse(rows[0].account):rows[0].account;
  if(writing){
   applyAccountProfile(user,body,updateCandidateProfile);grantProfileCompletionReward(user);
   const path=`$.users[${index}]`;
   await connection.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload,?,JSON_EXTRACT(?,'$')),updated_at=CURRENT_TIMESTAMP WHERE state_key='main'",[path,JSON.stringify(user)]);
   await connection.commit();
  }
  const profile={...user.profile,name:user.profile?.name||user.name,email:user.email,accountId:user.id};
  return[200,{profile,completionPercentage:calculateCandidateCompletion(profile),...(writing?{saved:true}: {})}];
 }catch(error){if(writing)await connection.rollback();throw error}finally{connection.release()}
}
