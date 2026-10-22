import {normalizeJobEmployer} from './job-employer.mjs';
const allowed = new Set(['jobs','employers','taxonomies']);
// Share only the in-flight SQL read, never mutable records or stale account data.
export function createCatalogueReader(pool, ensure) {
  const pending = new Map();
  return async function readCatalogueDb(fields = ['jobs','employers','taxonomies']) {
    const keys = [...new Set(fields)].sort();
    if (!keys.length || keys.some(key => !allowed.has(key))) throw new Error('Invalid catalogue fields');
    const key = keys.join(',');
    let task = pending.get(key);
    if (!task) {
      task = (async () => {
        await ensure();
        const projection = keys.map(name => `'${name}', JSON_EXTRACT(payload, '$.${name}')`).join(', ');
        const [rows] = await pool.query(`SELECT CAST(JSON_OBJECT(${projection}) AS CHAR) AS payload FROM trikonet_app_state WHERE state_key='main' LIMIT 1`);
        return rows[0]?.payload || '{}';
      })().finally(() => pending.delete(key));
      pending.set(key, task);
    }
    const data = JSON.parse(await task);
    return {jobs:(data.jobs || []).map(normalizeJobEmployer), employers:data.employers || [], taxonomies:data.taxonomies || {}};
  };
}
