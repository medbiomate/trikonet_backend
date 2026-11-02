// Authentication needs only credentials and identity, never resumes or catalogue state.
export async function readAdminLoginAccount(pool, ensure, identity) {
  await ensure();
  const fields=['id','username','email','name','role','status','passwordSalt','salt','passwordHash','hash'];
  const projection=fields.map(key=>`'${key}',JSON_EXTRACT(s.payload,CONCAT('$.users[',u.position-1,'].${key}'))`).join(',');
  const [rows]=await pool.query(`SELECT CAST(JSON_OBJECT(${projection}) AS CHAR) AS account
    FROM trikonet_app_state s, JSON_TABLE(s.payload,'$.users[*]' COLUMNS(
      position FOR ORDINALITY,email VARCHAR(320) PATH '$.email',username VARCHAR(320) PATH '$.username'
    )) u WHERE s.state_key='main' AND (LOWER(u.email)=? OR LOWER(u.username)=?) LIMIT 1`,[identity,identity]);
  if(!rows.length)return null;
  return typeof rows[0].account==='string'?JSON.parse(rows[0].account):rows[0].account;
}
