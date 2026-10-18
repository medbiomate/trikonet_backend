import {GoogleAuth} from 'google-auth-library';
import {createHash} from 'node:crypto';
const origin='https://www.trikonet.com';
export function jobNotification(before,after,now=Date.now()) {
  const published=job=>job&&!job.autosaved&&['publish','published','active',''].includes(String(job.status||'').toLowerCase());
  const url=job=>new URL(job.publicPath||`/job/${encodeURIComponent(job.slug)}`,origin).href;
  if(after&&published(after)) {
    const deadline=Date.parse(after.deadline||after.expiryDate||'');
    if(Number.isFinite(deadline)&&deadline+86400000<now)return before&&published(before)?{url:url(before),type:'URL_DELETED'}:null;
    if(!after.slug||!String(after.title?.rendered||after.title||'').trim()||!String(after.description||after.content?.rendered||'').trim())return null;
    const target=url(after);
    if(!target.startsWith(origin+'/job/')&&!target.startsWith(origin+'/jobs/'))return null;
    return {url:target,type:'URL_UPDATED'};
  }
  if(before&&published(before)&&before.slug){const target=url(before);if(target.startsWith(origin+'/job/')||target.startsWith(origin+'/jobs/'))return {url:target,type:'URL_DELETED'};}
  return null;
}
export function readIndexingCredentials(env=process.env) {
  if(!env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON)return null;
  const value=JSON.parse(env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON);
  if(value.type!=='service_account'||!value.client_email||!value.private_key)throw Error('Invalid Google Indexing service account configuration');
  return value;
}
export function createGoogleIndexing({pool,env=process.env,now=Date.now,publish}) {
  let ready;
  const configured=()=>Boolean(env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON);
  async function init(){
    if(!configured())return;
    ready ||= (async()=>{
      await pool.query(`CREATE TABLE IF NOT EXISTS trikonet_google_indexing_queue (
        url_hash CHAR(64) PRIMARY KEY, url VARCHAR(2048) NOT NULL, notification_type VARCHAR(16) NOT NULL,
        revision CHAR(64) NOT NULL, state VARCHAR(16) NOT NULL DEFAULT 'pending', attempts INT NOT NULL DEFAULT 0,
        next_attempt_at BIGINT NOT NULL DEFAULT 0, updated_at BIGINT NOT NULL, last_http_status INT NULL
      ) ENGINE=InnoDB`);
      await pool.query(`CREATE TABLE IF NOT EXISTS trikonet_google_indexing_usage (day_key VARCHAR(10) PRIMARY KEY, attempts INT NOT NULL DEFAULT 0) ENGINE=InnoDB`);
    })().catch(error=>{ready=null;throw error;});
    return ready;
  }
  const digest=value=>createHash('sha256').update(value).digest('hex');
  async function enqueue(before,after){
    if(!configured())return {enabled:false};
    const event=jobNotification(before,after,now());if(!event)return {queued:false};
    await init();
    const revision=digest(JSON.stringify([event,after?.updatedAt,after?.description,after?.title]));
    await pool.query(`INSERT INTO trikonet_google_indexing_queue (url_hash,url,notification_type,revision,updated_at) VALUES (?,?,?,?,?)
      ON DUPLICATE KEY UPDATE state=IF(revision<>VALUES(revision),'pending',state), attempts=IF(revision<>VALUES(revision),0,attempts),
      next_attempt_at=IF(revision<>VALUES(revision),0,next_attempt_at), notification_type=VALUES(notification_type),updated_at=VALUES(updated_at),revision=VALUES(revision)`,
      [digest(event.url),event.url,event.type,revision,now()]);
    return {queued:true};
  }
  async function tick(){
    if(!configured())return;
    await init();
    // The caller uses the database-backed coordinated worker to avoid duplicate
    // submissions and enforce a project-wide daily limit across server processes.
    const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now()));
    const limit=Math.min(200,Math.max(1,Number(env.GOOGLE_INDEXING_DAILY_LIMIT)||200));
    await pool.query('INSERT IGNORE INTO trikonet_google_indexing_usage (day_key) VALUES (?)',[day]);
    const [usage]=await pool.query('SELECT attempts FROM trikonet_google_indexing_usage WHERE day_key=?',[day]);
    if(Number(usage[0]?.attempts||0)>=limit)return;
    const [rows]=await pool.query("SELECT * FROM trikonet_google_indexing_queue WHERE state='pending' AND next_attempt_at<=? ORDER BY updated_at ASC LIMIT 1",[now()]);
    const item=rows[0];if(!item)return;
    await pool.query('UPDATE trikonet_google_indexing_usage SET attempts=attempts+1 WHERE day_key=?',[day]);
    try{
      const send=publish||asyncPublish;
      await send({url:item.url,type:item.notification_type});
      await pool.query("UPDATE trikonet_google_indexing_queue SET state='sent',attempts=attempts+1,last_http_status=200 WHERE url_hash=? AND revision=?",[item.url_hash,item.revision]);
    }catch(error){
      const status=Number(error.response?.status||error.status)||0;
      const delay=status===429?86400000:Math.min(86400000,60000*2**Math.min(Number(item.attempts)||0,10));
      await pool.query('UPDATE trikonet_google_indexing_queue SET attempts=attempts+1,next_attempt_at=?,last_http_status=? WHERE url_hash=? AND revision=?',[now()+delay,status,item.url_hash,item.revision]);
      // Never log credential material, tokens or raw Google request/response objects.
      console.warn('Google Indexing notification deferred; HTTP status:',status);
    }
  }
  async function asyncPublish(event){
    const auth=new GoogleAuth({credentials:readIndexingCredentials(env),scopes:['https://www.googleapis.com/auth/indexing']});
    const client=await auth.getClient();
    await client.request({url:'https://indexing.googleapis.com/v3/urlNotifications:publish',method:'POST',data:event,headers:{'Content-Type':'application/json'},timeout:15000});
  }
  async function status(){
    if(!configured())return {enabled:false};
    await init();const [rows]=await pool.query('SELECT state,COUNT(*) AS count FROM trikonet_google_indexing_queue GROUP BY state');
    return {enabled:true,queue:rows};
  }
  return {enqueue,tick,status,configured};
}
