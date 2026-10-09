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
export function createJobEmailAlerts({pool,loadJobs,readUsers,env=process.env,fetcher=fetch}) {
  let ready,running=false;
  const setup=()=>ready ||= (async()=>{
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_subscribers (user_id VARCHAR(100) PRIMARY KEY, token CHAR(64) NOT NULL UNIQUE, enabled BOOLEAN NOT NULL DEFAULT 0)');
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_seen (job_id VARCHAR(100) PRIMARY KEY)');
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_outbox (id CHAR(64) PRIMARY KEY, job_id VARCHAR(100) NOT NULL, user_id VARCHAR(100) NOT NULL, payload LONGTEXT NOT NULL, sent BOOLEAN NOT NULL DEFAULT 0, attempts INT NOT NULL DEFAULT 0, next_attempt DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    await pool.query('CREATE TABLE IF NOT EXISTS trikonet_alert_state (id INT PRIMARY KEY)');
  })().catch(error=>{ready=null;throw error});
  async function preferences(userId,enabled) {
    await setup();
    if(enabled!==undefined) {
      if(typeof enabled!=='boolean')throw new Error('Enabled must be true or false.');
      await pool.query('INSERT INTO trikonet_alert_subscribers (user_id,token,enabled) VALUES (?,?,?) ON DUPLICATE KEY UPDATE enabled=VALUES(enabled)',[String(userId),crypto.randomBytes(32).toString('hex'),enabled]);
    }
    if(enabled===undefined)await pool.query('INSERT IGNORE INTO trikonet_alert_subscribers (user_id,token,enabled) VALUES (?,?,1)',[String(userId),crypto.randomBytes(32).toString('hex')]);
    const [rows]=await pool.query('SELECT enabled FROM trikonet_alert_subscribers WHERE user_id=?',[String(userId)]);
    return {enabled:Boolean(rows[0]?.enabled)};
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
      const jobs=(await loadJobs()).filter(job=>isActiveJob(job));
      const users=await readUsers();
      const [subscribers]=await connection.query('SELECT * FROM trikonet_alert_subscribers WHERE enabled=1');
      await connection.beginTransaction();
      try {
        const [state]=await connection.query('SELECT id FROM trikonet_alert_state WHERE id=1');
        for(const job of jobs) {
          const jobId=String(job.id||job.slug);
          const [insert]=await connection.query('INSERT IGNORE INTO trikonet_alert_seen (job_id) VALUES (?)',[jobId]);
          if(!insert.affectedRows||!state.length)continue;
          for(const subscriber of subscribers) {
            const user=users.find(user=>String(user.id)===subscriber.user_id);
            if(!user?.email)continue;
            const id=crypto.createHash('sha256').update(`${jobId}:${subscriber.user_id}`).digest('hex');
            await connection.query('INSERT IGNORE INTO trikonet_alert_outbox (id,job_id,user_id,payload) VALUES (?,?,?,?)',[id,jobId,subscriber.user_id,JSON.stringify({from:env.JOB_ALERT_FROM||env.PASSWORD_RESET_FROM,to:[user.email],...jobEmail(job,subscriber.token,env.JOB_ALERT_API_ORIGIN||'https://api.trikonet.com')})]);
          }
        }
        await connection.query('INSERT IGNORE INTO trikonet_alert_state (id) VALUES (1)');
        await connection.commit();
      }catch(error){await connection.rollback();throw error;}
      const [pending]=await connection.query('SELECT * FROM trikonet_alert_outbox WHERE sent=0 AND (next_attempt IS NULL OR next_attempt<=NOW()) ORDER BY created_at LIMIT 50');
      for(const item of pending) {
        const [active]=await connection.query('SELECT token FROM trikonet_alert_subscribers WHERE user_id=? AND enabled=1',[item.user_id]);
        const user=users.find(user=>String(user.id)===item.user_id);
        const message=JSON.parse(item.payload);
        if(!active.length||!user?.email||message.to[0]!==user.email||!jobs.some(job=>String(job.id||job.slug)===item.job_id)||Date.now()-new Date(item.created_at).getTime()>23*3600000) {
          await connection.query('UPDATE trikonet_alert_outbox SET sent=1 WHERE id=?',[item.id]);continue;
        }
        try {
          const response=await fetcher('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`job-alert-${item.id}`},body:item.payload});
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
