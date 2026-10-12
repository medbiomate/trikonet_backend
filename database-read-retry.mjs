const disconnected = new Set(['ECONNRESET', 'EPIPE', 'PROTOCOL_CONNECTION_LOST']);

// Retry only ordinary read statements; never replay writes or locking reads.
export function retryDisconnectedReads(pool) {
  const query = pool.query.bind(pool);
  pool.query = async (...args) => {
    try {
      return await query(...args);
    } catch (error) {
      const sql = typeof args[0] === 'string' ? args[0] : args[0]?.sql;
      const safeRead = typeof sql === 'string' && /^\s*SELECT\b/i.test(sql) &&
        !/;|\b(FOR\s+UPDATE|LOCK\s+IN\s+SHARE\s+MODE|INTO|GET_LOCK|RELEASE_LOCK)\b/i.test(sql);
      if (!safeRead || !disconnected.has(error.code)) throw error;
      // mysql2 removes broken pool connections; the next query reacquires one.
      return query(...args);
    }
  };
  return pool;
}
