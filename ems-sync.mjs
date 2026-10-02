import { createHash } from 'node:crypto';
const cutoff = Date.parse('2026-10-01T18:30:00Z');
export function emsJobPayload(job, creator) {
  if (!['publish','published','active'].includes(String(job.status).toLowerCase())) return null;
  const firstPublishedAt = job.emsFirstPublishedAt || job.createdAt;
  if (!firstPublishedAt || Date.parse(firstPublishedAt) < cutoff || !Number.isFinite(Date.parse(firstPublishedAt))) return null;
  if (!job.id || !job.slug || !creator?.email) return null;
  return {
    postId: String(job.id), type: 'job', uploaderId: String(creator.userId || creator.id),
    uploaderEmail: creator.email.trim().toLowerCase(), title: String(job.title || ''),
    url: `https://www.trikonet.com/job/${encodeURIComponent(job.slug)}/`,
    companyName: String(job.company || job.companyName || ''),
    companyUrl: job.employerSlug ? `https://www.trikonet.com/employer/${encodeURIComponent(job.employerSlug)}/` : '',
    categories: (job.categories || []).map(value => typeof value === 'string' ? value : value.name).filter(Boolean),
    location: String(job.location || ''), status: 'publish', createdAt: new Date(job.createdAt || firstPublishedAt).toISOString(), uploadedAt: firstPublishedAt,
    updatedAt: job.updatedAt || firstPublishedAt
  };
}

export function emsEmployerPayload(employer, creator) {
  if (employer.autosaved || String(employer.slug || '').startsWith('autosave-')) return null;
  const payload = emsJobPayload({ ...employer, status: employer.status || 'publish', company: employer.title,
    location: (employer.locations || []).join(', ') }, creator);
  if (!payload) return null;
  const url = `https://www.trikonet.com/employer/${encodeURIComponent(employer.slug)}/`;
  return { ...payload, type: 'company', url, companyUrl: url };
}

export function createEmsSync(db, { secret = process.env.EMS_TRIKONET_SYNC_SECRET, fetchImpl = fetch } = {}) {
  let ready, running = false;
  const ensure = () => ready ||= db.query(`CREATE TABLE IF NOT EXISTS trikonet_ems_outbox (
    job_id VARCHAR(100) PRIMARY KEY, payload LONGTEXT NOT NULL, revision VARCHAR(80) NOT NULL,
    delivered_revision VARCHAR(80), attempts INT NOT NULL DEFAULT 0, last_error VARCHAR(300),
    next_attempt_at BIGINT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB`).catch(error => { ready = null; throw error; });
  return {
    async queue(job, creator, type = 'job') {
      const payload = type === 'company' ? emsEmployerPayload(job, creator) : emsJobPayload(job, creator);
      if (!payload) return false;
      await ensure();
      await db.query(`INSERT INTO trikonet_ems_outbox (job_id,payload,revision) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE next_attempt_at=IF(revision<>VALUES(revision),0,next_attempt_at),payload=VALUES(payload),revision=VALUES(revision)`,
        [payload.type === 'company' ? `company:${payload.postId}` : payload.postId, JSON.stringify(payload), createHash('sha256').update(JSON.stringify(payload)).digest('hex')]);
      return true;
    },
    async flush() {
      if (running || !secret) return;
      running = true;
      try {
        await ensure();
        const [rows] = await db.query(`SELECT * FROM trikonet_ems_outbox WHERE
          (delivered_revision IS NULL OR delivered_revision <> revision) AND next_attempt_at <= ? LIMIT 25`, [Date.now()]);
        for (const row of rows) {
          try {
            const response = await fetchImpl('https://api.secondtales.com/api/wordpress/trikonet/uploads', {
              method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${secret}`},
              body:row.payload, signal:AbortSignal.timeout(15000)
            });
            if (!response.ok) throw new Error(`EMS returned HTTP ${response.status}`);
            await db.query('UPDATE trikonet_ems_outbox SET delivered_revision=?,last_error=NULL,attempts=0 WHERE job_id=? AND revision=?', [row.revision,row.job_id,row.revision]);
          } catch (error) {
            await db.query('UPDATE trikonet_ems_outbox SET attempts=attempts+1,last_error=?,next_attempt_at=? WHERE job_id=? AND revision=?',
              [String(error.message).slice(0,300),Date.now()+Math.min(3600000,30000*2**Math.min(row.attempts,7)),row.job_id,row.revision]);
          }
        }
      } finally { running = false; }
    }
  };
}
