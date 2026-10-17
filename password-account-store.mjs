/** Password login must not load or rewrite the jobs/media catalogue. */
export async function findPasswordAccount(db,email){
 const [rows]=await db.query("SELECT JSON_EXTRACT(payload,'$.users') AS users FROM trikonet_app_state WHERE state_key='main' LIMIT 1");
 const raw=rows[0]?.users,users=typeof raw==='string'?JSON.parse(raw):raw;
 if(!Array.isArray(users))return null;
 const index=users.findIndex(user=>String(user.email||'').trim().toLowerCase()===email);
 return index<0?null:{user:users[index],index};
}
export async function savePasswordSignIn(db,{user,index}){
 const path=`$.users[${index}]`;
 const [result]=await db.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload,?,JSON_EXTRACT(?,'$')),updated_at=CURRENT_TIMESTAMP WHERE state_key='main' AND JSON_UNQUOTE(JSON_EXTRACT(payload,?))=?",[`${path}.signInPlatforms`,JSON.stringify(user.signInPlatforms||[]),`${path}.id`,String(user.id)]);
 if(!result.affectedRows)throw new Error('Account changed during sign-in. Please try again.');
}
