import {mergeStateChanges} from './state-changes.mjs';

// User administration must not load media or rebuild the jobs/employers indexes.
export function createAdminUserStore(pool, ensureState) {
  const snapshots = new WeakMap();
  const parse = value => {
    const users = typeof value === 'string' ? JSON.parse(value) : value;
    if (users == null) return [];
    if (!Array.isArray(users)) throw new Error('Invalid users data');
    return users;
  };
  return {
    async read() {
      await ensureState();
      const [rows] = await pool.query("SELECT JSON_EXTRACT(payload, '$.users') AS users FROM trikonet_app_state WHERE state_key='main'");
      if (!rows.length) throw new Error('Account storage is unavailable');
      const db = {users: parse(rows[0].users)};
      snapshots.set(db, structuredClone(db.users));
      return db;
    },
    async write(db) {
      const before = snapshots.get(db);
      if (!before) throw new Error('Read accounts before saving');
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.query("SELECT JSON_EXTRACT(payload, '$.users') AS users FROM trikonet_app_state WHERE state_key='main' FOR UPDATE");
        if (!rows.length) throw new Error('Account storage is unavailable');
        const users = mergeStateChanges(parse(rows[0].users), before, db.users);
        await connection.query("UPDATE trikonet_app_state SET payload=JSON_SET(payload, '$.users', JSON_EXTRACT(?, '$')),updated_at=CURRENT_TIMESTAMP WHERE state_key='main'", [JSON.stringify(users)]);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  };
}
