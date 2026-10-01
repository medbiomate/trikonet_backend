import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminSessionStore } from './admin-session-store.mjs';

function database() {
  const rows = new Map();
  return { rows, async query(sql, values = []) {
    if (sql.startsWith('INSERT')) rows.set(values[0], { payload: values[1], expiresAt: values[2] });
    if (sql.startsWith('SELECT')) {
      const row = rows.get(values[0]);
      return [[...(row && row.expiresAt > values[1] ? [{ payload: row.payload }] : [])]];
    }
    if (sql.includes('WHERE token_hash = ?') && sql.startsWith('DELETE')) rows.delete(values[0]);
    if (sql.includes('WHERE expires_at <= ?')) for (const [key, row] of rows) if (row.expiresAt <= values[0]) rows.delete(key);
    return [[]];
  } };
}
const token = '12345678-1234-1234-1234-123456789abc';
const admin = { role: 'Administrator', name: 'Admin', expiresAt: Date.now() + 60000 };
test('sessions survive a new server instance and tokens are stored hashed', async () => {
  const db = database();
  await createAdminSessionStore(db).set(token, admin);
  assert.deepEqual(await createAdminSessionStore(db).get(token), admin);
  assert.equal(db.rows.has(token), false);
});
test('logout revokes access across workers', async () => {
  const db = database(), first = createAdminSessionStore(db), second = createAdminSessionStore(db);
  await first.set(token, admin);
  await second.delete(token);
  assert.equal(await first.get(token), null);
});
test('expired, missing, malformed and non-admin sessions are rejected', async () => {
  const store = createAdminSessionStore(database());
  assert.equal(await store.get(''), null);
  assert.equal(await store.get('bad'), null);
  assert.equal(await store.get(token), null);
  await store.set(token, { ...admin, expiresAt: Date.now() - 1 });
  assert.equal(await store.get(token), null);
  await store.set(token, { ...admin, role: 'Candidate' });
  assert.equal(await store.get(token), null);
});
