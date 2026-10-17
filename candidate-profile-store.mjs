import {applyAccountProfile} from './account-identity.mjs';
import {updateCandidateProfile,calculateCandidateCompletion,grantProfileCompletionReward} from './candidate-profile.mjs';
export async function candidateProfileRequest(pool,method,userId,body={}){
 if(!['GET','POST','PUT'].includes(method))return[405,{error:'Method not allowed'}];
 const connection=await pool.getConnection();const writing=method!=='GET';
 try{
  if(writing)await connection.beginTransaction();
  const [rows]=await connection.query("SELECT JSON_EXTRACT(payload,'$.users') AS users FROM trikonet_app_state WHERE state_key='main' LIMIT 1"+(writing?' FOR UPDATE':''));
  const raw=rows[0]?.users,users=typeof raw==='string'?JSON.parse(raw):raw;
  const index=Array.isArray(users)?users.findIndex(user=>String(user.id)===String(userId)):-1;
  if(index<0){if(writing)await connection.rollback();return[404,{error:'Account not found'}]}
  const user=users[index];
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
