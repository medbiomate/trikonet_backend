import crypto from 'node:crypto';

// Store only token hashes, shared across API workers and deployments.
export function createAdminSessionStore(db) {
  let ready;
  const ensure = () => ready ||= db.query(`CREATE TABLE IF NOT EXISTS trikonet_admin_sessions (
    token_hash CHAR(64) PRIMARY KEY, payload LONGTEXT NOT NULL, expires_at BIGINT NOT NULL
  ) ENGINE=InnoDB`).catch(error => { ready = null; throw error; });
  const hash = token => crypto.createHash('sha256').update(token).digest('hex');
  return {
    async set(token, admin) {
      await ensure();
      await db.query('INSERT INTO trikonet_admin_sessions (token_hash,payload,expires_at) VALUES (?,?,?)',
        [hash(token), JSON.stringify(admin), admin.expiresAt]);
      await db.query('DELETE FROM trikonet_admin_sessions WHERE expires_at <= ?', [Date.now()]);
    },
    async get(token) {
      if (!token || !/^[a-f0-9-]{36}$/.test(token)) return null;
      await ensure();
      const [rows] = await db.query('SELECT payload FROM trikonet_admin_sessions WHERE token_hash = ? AND expires_at > ?', [hash(token), Date.now()]);
      if (!rows.length) return null;
      const admin = JSON.parse(rows[0].payload);
      return ['Administrator', 'Editor', 'Content Editor'].includes(admin.role) && admin.expiresAt > Date.now() ? admin : null;
    },
    async delete(token) {
      if (!token) return;
      await ensure();
      await db.query('DELETE FROM trikonet_admin_sessions WHERE token_hash = ?', [hash(token)]);
    }
  };
}
