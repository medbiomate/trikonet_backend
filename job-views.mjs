export function createJobViews(pool) {
  let ready;
  async function ensure() {
    if (!ready) ready = pool.query('CREATE TABLE IF NOT EXISTS trikonet_job_views (slug VARCHAR(191) PRIMARY KEY, views BIGINT UNSIGNED NOT NULL DEFAULT 0)').catch(error => { ready = null; throw error; });
    await ready;
  }
  return {
    async record(slug) {
      await ensure();
      await pool.query('INSERT INTO trikonet_job_views (slug,views) VALUES (?,1) ON DUPLICATE KEY UPDATE views=views+1', [slug]);
    },
    async counts(slugs) {
      if (!slugs.length) return {};
      await ensure();
      const [rows] = await pool.query(`SELECT slug,views FROM trikonet_job_views WHERE slug IN (${slugs.map(() => '?').join(',')})`, slugs);
      return Object.fromEntries(rows.map(row => [row.slug, Number(row.views)]));
    }
  };
}
