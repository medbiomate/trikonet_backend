import {normalizeJobEmployer} from './job-employer.mjs';
const allowed = new Set(['jobs','employers','taxonomies']);
// TIMESTAMP has one-second resolution, so a row written in the last couple of
// seconds may change again without updated_at moving. Never trust it from cache.
const SETTLE_SECONDS = 2;
const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
};
const shape = data => ({jobs:(data.jobs || []).map(normalizeJobEmployer), employers:data.employers || [], taxonomies:data.taxonomies || {}});
// The catalogue is one large JSON row. Extracting it costs seconds in MySQL, so the
// raw text is kept per updated_at version and re-read only after a write.
// read() still returns independent, mutable objects on every call.
// read.shared() returns one deep-frozen snapshot per version for read-only public
// routes; frozen records throw on mutation instead of leaking edits between requests.
export function createCatalogueReader(pool, ensure, {maxAgeMs = 10 * 60_000, now = Date.now} = {}) {
  const pending = new Map();
  const cache = new Map();
  let versionTask = null;
  const version = () => {
    versionTask ||= (async () => {
      await ensure();
      const [rows] = await pool.query(`SELECT CAST(updated_at AS CHAR) AS version, TIMESTAMPDIFF(SECOND, updated_at, NOW()) AS age FROM trikonet_app_state WHERE state_key='main' LIMIT 1`);
      const row = rows?.[0];
      return row && row.version != null && Number(row.age) >= SETTLE_SECONDS ? String(row.version) : null;
    })().catch(() => null).finally(() => { versionTask = null; });
    return versionTask;
  };
  const fieldsKey = fields => {
    const keys = [...new Set(fields)].sort();
    if (!keys.length || keys.some(key => !allowed.has(key))) throw new Error('Invalid catalogue fields');
    return keys;
  };
  const load = async keys => {
    const key = keys.join(',');
    const current = await version();
    const hit = cache.get(key);
    if (current && hit && hit.version === current && now() - hit.at < maxAgeMs) return hit;
    let task = pending.get(key);
    if (!task) {
      task = (async () => {
        await ensure();
        const projection = keys.map(name => `'${name}', JSON_EXTRACT(payload, '$.${name}')`).join(', ');
        const [rows] = await pool.query(`SELECT CAST(JSON_OBJECT(${projection}) AS CHAR) AS payload FROM trikonet_app_state WHERE state_key='main' LIMIT 1`);
        const entry = {version: current, at: now(), text: rows[0]?.payload || '{}', snapshot: null};
        if (current) cache.set(key, entry); else cache.delete(key);
        return entry;
      })().finally(() => pending.delete(key));
      pending.set(key, task);
    }
    return task;
  };
  async function readCatalogueDb(fields = ['jobs','employers','taxonomies'], {fresh = false} = {}) {
    const keys = fieldsKey(fields);
    if (fresh) cache.delete(keys.join(','));
    return shape(JSON.parse((await load(keys)).text));
  }
  readCatalogueDb.shared = async (fields = ['jobs','employers','taxonomies']) => {
    const entry = await load(fieldsKey(fields));
    entry.snapshot ||= deepFreeze(shape(JSON.parse(entry.text)));
    return entry.snapshot;
  };
  readCatalogueDb.clear = () => cache.clear();
  return readCatalogueDb;
}
