// Only one hosting instance performs a periodic task per interval. The lock is
// connection-scoped, so a crash releases it; the timestamp avoids staggered
// instances repeating the same scan immediately after it completes.
export function createCoordinatedTask(pool, name, intervalMs, task, now = Date.now) {
  let running = false, ready;
  return async function run() {
    if (running) return;
    running = true;
    let connection, locked = false, lockName;
    try {
      ready ||= pool.query(`CREATE TABLE IF NOT EXISTS trikonet_worker_runs (
        task_name VARCHAR(64) PRIMARY KEY, next_run_at BIGINT NOT NULL
      ) ENGINE=InnoDB`).catch(error => { ready = null; throw error; });
      await ready;
      connection = await pool.getConnection();
      const [names] = await connection.query('SELECT SHA2(CONCAT(DATABASE(), ?),256) AS name', [`:worker:${name}`]);
      lockName = names[0].name;
      const [locks] = await connection.query('SELECT GET_LOCK(?,0) AS acquired', [lockName]);
      if (Number(locks[0]?.acquired) !== 1) return;
      locked = true;
      const [rows] = await connection.query('SELECT next_run_at FROM trikonet_worker_runs WHERE task_name=?', [name]);
      if (Number(rows[0]?.next_run_at || 0) > now()) return;
      await connection.query('INSERT INTO trikonet_worker_runs (task_name,next_run_at) VALUES (?,?) ON DUPLICATE KEY UPDATE next_run_at=VALUES(next_run_at)', [name, now() + intervalMs]);
      await task();
    } finally {
      if (locked) await connection.query('SELECT RELEASE_LOCK(?)', [lockName]).catch(() => {});
      connection?.release();
      running = false;
    }
  };
}
