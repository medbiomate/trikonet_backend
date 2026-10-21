// The email worker needs identity and job title only, never CVs or profile photos.
export function createAlertUserReader(pool,ensureDeletions){
 return async()=>{
  await ensureDeletions();
  const [rows]=await pool.query(`SELECT u.id,u.name,u.email,u.currentDesignation,u.profileRole
    FROM trikonet_app_state s, JSON_TABLE(s.payload,'$.users[*]' COLUMNS (
      id VARCHAR(191) PATH '$.id', name VARCHAR(191) PATH '$.name', email VARCHAR(320) PATH '$.email',
      role VARCHAR(40) PATH '$.role', currentDesignation VARCHAR(255) PATH '$.profile.currentDesignation', profileRole VARCHAR(255) PATH '$.profile.role'
    )) u WHERE s.state_key='main' AND LOWER(TRIM(COALESCE(u.role,''))) IN ('','candidate','subscriber','job seeker','jobseeker')
    AND NOT EXISTS (SELECT 1 FROM trikonet_account_deletions d WHERE d.user_id=u.id) `);
  return rows.map(({currentDesignation,profileRole,...user})=>({...user,profile:{currentDesignation,role:profileRole}}));
 };
}
