import test from 'node:test';
import assert from 'node:assert/strict';
import { retryDisconnectedReads } from './database-read-retry.mjs';

test('disconnected reads reacquire once with the original arguments', async () => {
  const calls = [];
  const result = [[{ payload: 'saved' }], []];
  const pool = retryDisconnectedReads({ async query(...args) {
    calls.push(args);
    if (calls.length === 1) throw Object.assign(new Error('reset'), { code: 'ECONNRESET' });
    return result;
  } });
  const args = ['SELECT payload FROM trikonet_app_state WHERE state_key=?', ['main']];
  assert.equal(await pool.query(...args), result);
  assert.deepEqual(calls, [args, args]);
});

test('persistent disconnection stops after two attempts', async () => {
  let calls = 0;
  const pool = retryDisconnectedReads({ async query() { calls++; throw Object.assign(new Error('reset'), { code: 'EPIPE' }); } });
  await assert.rejects(pool.query('SELECT payload FROM trikonet_app_state'), { code: 'EPIPE' });
  assert.equal(calls, 2);
});

test('writes, locking reads, multiple statements and other failures are not replayed', async () => {
  for (const sql of ['INSERT INTO records VALUES (?)', 'UPDATE records SET id=1', 'SELECT id FROM records FOR UPDATE', 'SELECT GET_LOCK("lock", 1)', 'SELECT id INTO OUTFILE "file" FROM records', 'SELECT 1; DELETE FROM records']) {
    let calls = 0;
    const pool = retryDisconnectedReads({ async query() { calls++; throw Object.assign(new Error('reset'), { code: 'ECONNRESET' }); } });
    await assert.rejects(pool.query(sql));
    assert.equal(calls, 1, sql);
  }
  let calls = 0;
  const pool = retryDisconnectedReads({ async query() { calls++; throw Object.assign(new Error('access'), { code: 'ER_ACCESS_DENIED_ERROR' }); } });
  await assert.rejects(pool.query('SELECT 1'));
  assert.equal(calls, 1);
});
