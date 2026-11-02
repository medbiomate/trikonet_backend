/** Password login must not load or rewrite the jobs/media catalogue. */
export async function findPasswordAccount(db,email){
 const [rows]=await db.query(`SELECT CAST(JSON_EXTRACT(s.payload,CONCAT('$.users[',u.position-1,']')) AS CHAR) AS account,u.position-1 AS account_index
 FROM trikonet_app_state s, JSON_TABLE(s.payload,'$.users[*]' COLUMNS(position FOR ORDINALITY,email VARCHAR(320) PATH '$.email')) u
 WHERE s.state_key='main' AND BINARY LOWER(TRIM(u.email))=BINARY ? ORDER BY u.position LIMIT 1`,[email]);
 if(!rows.length)return null;
 const user=typeof rows[0].account==='string'?JSON.parse(rows[0].account):rows[0].account;
 return user?{user,index:Number(rows[0].account_index)}:null;
}
export async function savePasswordSignIn(db,{user,index}){
 const path=`$.users[${index}]`;
 const [result]=await db.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload,?,JSON_EXTRACT(?,'$')),updated_at=CURRENT_TIMESTAMP WHERE state_key='main' AND JSON_UNQUOTE(JSON_EXTRACT(payload,?))=?",[`${path}.signInPlatforms`,JSON.stringify(user.signInPlatforms||[]),`${path}.id`,String(user.id)]);
 if(!result.affectedRows)throw new Error('Account changed during sign-in. Please try again.');
}
