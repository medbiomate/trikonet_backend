// EMS needs catalogue records and creator emails, never CVs, resumes or media.
export function createEmsStateReader(pool, readCatalogue, ensureDeletions) {
  return async function readEmsState() {
    await ensureDeletions();
    const catalogue = await readCatalogue(['jobs', 'employers']);
    const [users] = await pool.query(`SELECT u.id, u.email
      FROM trikonet_app_state s,
      JSON_TABLE(s.payload, '$.users[*]' COLUMNS (
        id VARCHAR(191) PATH '$.id', email VARCHAR(320) PATH '$.email'
      )) AS u
      WHERE s.state_key='main' AND NOT EXISTS (
        SELECT 1 FROM trikonet_account_deletions d
        WHERE d.user_id=u.id AND (d.status='deleted' OR d.delete_after<=?)
      )`, [Date.now()]);
    return {...catalogue, users};
  };
}
