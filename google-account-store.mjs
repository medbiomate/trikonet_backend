/** Read account data without transferring the jobs, employers, or media catalogue. */
export async function findGoogleAccount(db,subject){
 const [rows]=await db.query("SELECT JSON_EXTRACT(payload,'$.users') AS users FROM trikonet_app_state WHERE state_key='main' LIMIT 1");
 const raw=rows[0]?.users;
 const users=typeof raw==='string'?JSON.parse(raw):raw;
 if(!Array.isArray(users))return null;
 const index=users.findIndex(user=>user.googleSubject===subject);
 return index<0?null:{user:users[index],index};
}
export async function saveGoogleAccount(db,entry){
 const path=`$.users[${entry.index}]`;
 const [result]=await db.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload,?,JSON_EXTRACT(?, '$')),updated_at=CURRENT_TIMESTAMP WHERE state_key='main' AND JSON_UNQUOTE(JSON_EXTRACT(payload,?))=?",[path,JSON.stringify(entry.user),`${path}.id`,String(entry.user.id)]);
 if(!result.affectedRows)throw new Error('Account changed during sign-in. Please retry.');
}
