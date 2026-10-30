/** Transfer only the matching account; keep catalogue and other users on the database. */
export async function findSocialAccount(db,provider,subject,email){
 if(!['apple','google'].includes(provider))throw Error('Invalid login provider');
 const field=provider+'Subject';
 const [rows]=await db.query(`SELECT CAST(JSON_EXTRACT(s.payload,CONCAT('$.users[',u.position-1,']')) AS CHAR) AS account,u.position-1 AS account_index
 FROM trikonet_app_state s, JSON_TABLE(s.payload,'$.users[*]' COLUMNS(position FOR ORDINALITY,subject VARCHAR(255) PATH '$.${field}',email VARCHAR(320) PATH '$.email')) u
 WHERE s.state_key='main' AND (u.subject=? OR LOWER(TRIM(u.email))=?) ORDER BY (u.subject=?) DESC LIMIT 1`,[subject,email||'',subject]);
 if(!rows.length)return null;
 return {user:typeof rows[0].account==='string'?JSON.parse(rows[0].account):rows[0].account,index:Number(rows[0].account_index)};
}
export async function saveSocialSignIn(db,entry,provider){
 if(!['apple','google'].includes(provider)||!Number.isInteger(entry.index)||entry.index<0)throw Error('Invalid account update');
 const path=`$.users[${entry.index}]`,field=provider+'Subject';
 const values={signInPlatforms:entry.user.signInPlatforms||[],lastSignInPlatform:entry.user.lastSignInPlatform||'',lastSignInAt:entry.user.lastSignInAt||'',[field]:entry.user[field]};
 if(provider==='apple')values.appleRefreshToken=entry.user.appleRefreshToken;
 const params=[];const setters=Object.entries(values).map(([key,value])=>{params.push(`${path}.${key}`,JSON.stringify(value));return "?,JSON_EXTRACT(?,'$')"}).join(',');
 const [result]=await db.query(`UPDATE trikonet_app_state SET payload=JSON_SET(payload,${setters}),updated_at=CURRENT_TIMESTAMP WHERE state_key='main' AND JSON_UNQUOTE(JSON_EXTRACT(payload,?))=? AND (JSON_EXTRACT(payload,?) IS NULL OR JSON_UNQUOTE(JSON_EXTRACT(payload,?))=?)`,[...params,`${path}.id`,String(entry.user.id),`${path}.${field}`,`${path}.${field}`,entry.user[field]]);
 if(!result.affectedRows)throw Error('Account changed during sign-in. Please retry.');
}
