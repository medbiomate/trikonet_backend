// Counts application starts, not externally completed submissions.
export function createJobApplicationStarts(pool) {
  let ready;
  const ensure = () => ready ||= pool.query('CREATE TABLE IF NOT EXISTS trikonet_job_application_starts (slug VARCHAR(191) NOT NULL, account_id VARCHAR(191) NOT NULL, PRIMARY KEY(slug,account_id))').catch(error => { ready = null; throw error; });
  return {
    async count(slug) { await ensure(); const [rows] = await pool.query('SELECT COUNT(*) AS total FROM trikonet_job_application_starts WHERE slug=?',[slug]); return Number(rows[0]?.total || 0); },
    async record(slug, accountId) { await ensure(); await pool.query('INSERT IGNORE INTO trikonet_job_application_starts (slug,account_id) VALUES (?,?)',[slug,String(accountId)]); }
  };
}
