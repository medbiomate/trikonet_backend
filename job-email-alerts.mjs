import {alertSlot,selectDigestJobs,selectGeneralJobs,hasJobTitle,matchesRole,digestEmail} from './job-digest.mjs';
import crypto from 'node:crypto';
import {isActiveJob,values} from './seo-job-pages.mjs';
import {publicJobPath} from './job-urls.mjs';

const plain=value=>String(value?.rendered ?? value ?? '').replace(/<[^>]*>/g,'').replace(/[\r\n]/g,' ').trim();
const escape=value=>plain(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function jobEmail(job,token,origin='https://api.trikonet.com') {
  const title=plain(job.title),company=plain(job.company||job.companyName||job.metas?._job_employer_name);
  const location=values(job,'locations','_job_location').join(', ');
  const url=new URL(publicJobPath(job),'https://trikonet.com').href;
  if(!url.startsWith('https://trikonet.com/'))throw new Error('Invalid job URL');
  const unsubscribe=`${origin}/api/job-alerts/unsubscribe?token=${encodeURIComponent(token)}`;
  return {subject:`New job on Trikonet: ${title}`.slice(0,200),text:`${title}\n${company}\n${location}\nView and apply: ${url}\n\nManage your email alerts: ${unsubscribe}`,html:`<h2>${escape(title)}</h2><p>${escape(company)}</p><p>${escape(location)}</p><p><a href="${escape(url)}">View job and apply</a></p><hr><p>You subscribed to new-job emails on Trikonet. <a href="${escape(unsubscribe)}">Unsubscribe</a></p>`};
}
export function createJobEmailAlerts({pool,loadJobs,readUsers,env=process.env,fetcher=fetch,now=()=>new Date()}) {
  let ready,running=false;
  const setup=()=>ready ||= (async()=>{
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_subscribers (user_id VARCHAR(100) PRIMARY KEY, token CHAR(64) NOT NULL UNIQUE, enabled BOOLEAN NOT NULL DEFAULT 0)');
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_seen (job_id VARCHAR(100) PRIMARY KEY)');
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_outbox (id CHAR(64) PRIMARY KEY, job_id VARCHAR(100) NOT NULL, user_id VARCHAR(100) NOT NULL, payload LONGTEXT NOT NULL, sent BOOLEAN NOT NULL DEFAULT 0, attempts INT NOT NULL DEFAULT 0, next_attempt DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_state (id INT PRIMARY KEY)');
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_digest_jobs (user_id VARCHAR(100) NOT NULL, job_id VARCHAR(100) NOT NULL, PRIMARY KEY(user_id,job_id))');
  })().catch(error=>{ready=null;throw error});
  async function preferences(userId,enabled) {
    await setup();
    if(enabled!==undefined) {
      if(typeof enabled!=='boolean')throw new Error('Enabled must be true or false.');
      await pool.query('INSERT INTO trikonet_alert_subscribers (user_id,token,enabled) VALUES (?,?,?) ON DUPLICATE KEY UPDATE enabled=VALUES(enabled)',[String(userId),crypto.randomBytes(32).toString('hex'),enabled]);
    }
    if(enabled===undefined)await pool.query('INSERT IGNORE INTO trikonet_alert_subscribers (user_id,token,enabled) VALUES (?,?,0)',[String(userId),crypto.randomBytes(32).toString('hex')]);
    const [rows]=await pool.query('SELECT enabled FROM trikonet_alert_subscribers WHERE user_id=?',[String(userId)]);
    return {enabled:Boolean(rows[0]?.enabled),frequency:'digest',timezone:'Asia/Dubai',schedule:['08:00','12:00','16:00'],maxEmailsPerDay:3};
  }
  async function unsubscribe(token) {
    await setup();
    if(!/^[a-f0-9]{64}$/.test(token||''))return false;
    const [result]=await pool.query('UPDATE trikonet_alert_subscribers SET enabled=0 WHERE token=?',[token]);
    return result.affectedRows>0;
  }
  async function tick() {
    if(running||!env.RESEND_API_KEY||!(env.JOB_ALERT_FROM||env.PASSWORD_RESET_FROM))return;
    running=true;let connection,locked=false;
    try {
      await setup();connection=await pool.getConnection();
      const [lock]=await connection.query("SELECT GET_LOCK('trikonet_job_email_alerts',0) acquired");
      if(!lock[0].acquired)return;
      locked=true;
      // Retire the old single-job backlog before doing any catalogue work.
      await connection.query("UPDATE trikonet_alert_outbox SET sent=1 WHERE sent=0 AND job_id NOT LIKE 'digest:%'");
      const window=alertSlot(now());
      if(!window.slot)return;
      const jobs=(await loadJobs()).filter(job=>isActiveJob(job));
      const users=await readUsers();
      const [subscribers]=await connection.query('SELECT * FROM trikonet_alert_subscribers WHERE enabled=1');
      if(window.slot)for(const subscriber of subscribers){
        const user=users.find(user=>String(user.id)===String(subscriber.user_id));
        if(!user?.email)continue;
        const slotKey=`digest:${window.day}:${window.slot}`;
        const id=crypto.createHash('sha256').update(`${slotKey}:${user.email.trim().toLowerCase()}`).digest('hex');
        const [existing]=await connection.query('SELECT id FROM trikonet_alert_outbox WHERE id=?',[id]);
        if(existing.length)continue;
        const [used]=await connection.query('SELECT job_id FROM trikonet_digest_jobs WHERE user_id=?',[subscriber.user_id]);
        const excluded=new Set(used.map(row=>String(row.job_id)));
        const recent=jobs.filter(job=>{const published=Date.parse(job.publishedDate||job.datePosted||job.postedDate||job.date||job.createdAt||'');return Number.isFinite(published)&&published<=now().getTime()&&now().getTime()-published<=7*86400000;});
        const matched=selectDigestJobs(recent,user.profile||{},excluded);
        const general=!hasJobTitle(user.profile||{});
        const selected=general?selectGeneralJobs(recent,excluded):matched;
        if(!selected.length)continue;
        const payload={from:env.JOB_ALERT_FROM||env.PASSWORD_RESET_FROM,to:[user.email],...digestEmail(selected,user,subscriber.token,window.slot,env.JOB_ALERT_API_ORIGIN||'https://api.trikonet.com',{general})};
        await connection.beginTransaction();
        try{
          await connection.query('INSERT IGNORE INTO trikonet_alert_outbox (id,job_id,user_id,payload) VALUES (?,?,?,?)',[id,slotKey,subscriber.user_id,JSON.stringify({...payload,general,digestJobs:selected.map(job=>String(job.id||job.slug))})]);
          for(const job of selected)await connection.query('INSERT IGNORE INTO trikonet_digest_jobs (user_id,job_id) VALUES (?,?)',[subscriber.user_id,String(job.id||job.slug)]);
          await connection.commit();
        }catch(error){await connection.rollback();throw error;}
      }
      const [pending]=await connection.query('SELECT * FROM trikonet_alert_outbox WHERE sent=0 AND (next_attempt IS NULL OR next_attempt<=NOW()) ORDER BY created_at LIMIT 50');
      for(const item of pending) {
        const [active]=await connection.query('SELECT token FROM trikonet_alert_subscribers WHERE user_id=? AND enabled=1',[item.user_id]);
        const user=users.find(user=>String(user.id)===String(item.user_id));
        const message=JSON.parse(item.payload);
        if(!active.length||!user?.email||message.to[0]!==user.email||item.job_id!==`digest:${window.day}:${window.slot}`||!message.digestJobs?.length||(message.general&&hasJobTitle(user.profile||{}))||!message.digestJobs.every(id=>jobs.some(job=>String(job.id||job.slug)===id&&(message.general||matchesRole(job,user.profile||{}))))||!alertSlot(now()).slot||alertSlot(now()).slot!==window.slot) {
          await connection.query('UPDATE trikonet_alert_outbox SET sent=1 WHERE id=?',[item.id]);continue;
        }
        try {
          const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`job-alert-${item.id}`},body:JSON.stringify(Object.fromEntries(Object.entries(message).filter(([key])=>!['digestJobs','general'].includes(key))))});
          if(!response.ok)throw new Error(`Email provider returned ${response.status}`);
          await connection.query('UPDATE trikonet_alert_outbox SET sent=1 WHERE id=?',[item.id]);
        }catch(error){
          await connection.query('UPDATE trikonet_alert_outbox SET attempts=attempts+1,next_attempt=DATE_ADD(NOW(),INTERVAL ? SECOND) WHERE id=?',[Math.min(3600,60*2**Math.min(item.attempts,6)),item.id]);
          console.error('Job email delivery failed:',error.message);break;
        }
      }
    }finally{
      if(locked)await connection.query("SELECT RELEASE_LOCK('trikonet_job_email_alerts')").catch(()=>{});
      connection?.release();running=false;
    }
  }
  return {preferences,unsubscribe,tick};
}
