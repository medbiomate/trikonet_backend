import {createHash} from 'node:crypto';
import {jobDay,selectedDay} from './admin-job-filters.mjs';
const table='trikonet_admin_employer_index';
const text=value=>String(value?.rendered??value??'');
const names=value=>Array.isArray(value)?value.map(v=>text(v?.name??v)):value&&typeof value==='object'?Object.values(value).map(text):value?[text(value)]:[];
export function indexEmployer(job){
 const m=job.metas||{};
 job={...job,postedDate:undefined,datePosted:undefined,publishedDate:undefined,publishedAt:job.createdAt||job.date};
 const status=['','active','published'].includes(job.status||'')?'publish':job.status;
 const categories=names(job.categories||m._employer_category),types=names(job.types||m._employer_type);
 const {description,content,recoveryDraft,logoBackup,profilePhotos,photoUrl,banner,...card}=job;
 card.title=text(job.title);card.categories=categories;card.locations=names(job.locations||m._employer_location);card.logo=job.logo||m._employer_logo||m._employer_featured_image||'';
 card.metas=Object.fromEntries(['_employer_name','_employer_category','_employer_location','_employer_type','_job_expiry_date','_job_application_deadline_date','_job_date_posted'].filter(k=>m[k]!==undefined).map(k=>[k,m[k]]));
 const date=job.publishedAt||job.createdAt||job.date||'';
 const parsed=Date.parse(date);
 return [String(job.slug),status,jobDay(job)||null,Number.isFinite(parsed)?parsed:0,String(job.createdBy?.id||''),String(job.createdBy?.email||'').toLowerCase(),String(job.createdBy?.name||''),Boolean(job.local),`${text(job.title)} ${text(job.company||m._employer_name)} ${categories.join(' ')} ${card.locations.join(' ')}`.toLowerCase(),JSON.stringify(categories.map(v=>v.toLowerCase())),JSON.stringify(types.map(v=>v.toLowerCase())),JSON.stringify(card)];
}
export function indexWhere(params,admin,{status=true}={}){
 const where=["status IN ('publish','draft','pending','expired')"],values=[];
 const day=selectedDay(params.get('period')||'today');
 if(day){where.push('job_day=?');values.push(day);}
 if(params.get('creator')){where.push('creator_id=?');values.push(params.get('creator'));}
 const owner=()=>{where.push('(creator_id=? OR (creator_email<>\'\' AND creator_email=?))');values.push(String(admin.userId),String(admin.email||'').toLowerCase());};
 if(status){const tab=params.get('status')||'all';if(tab==='mine')owner();else if(tab!=='all'){where.push('status=?');values.push(tab);}}
 const q=(params.get('q')||'').trim().toLowerCase();
 if(q){where.push("search_text LIKE ? ESCAPE '='");values.push('%'+q.replace(/[=%_]/g,c=>'='+c)+'%');}
 for(const [param,column]of [['category','categories'],['job_type','types']])if(params.get(param)){where.push(`JSON_CONTAINS(${column},JSON_QUOTE(?))`);values.push(params.get(param).toLowerCase());}
 return {sql:where.join(' AND '),values,day};
}
export function createAdminEmployerIndex(pool,loadImported,ensureState){
 let ready;let imported=new Map();
 async function put(connection,jobs){
  for(let offset=0;offset<jobs.length;offset+=100){
   const batch=jobs.slice(offset,offset+100).filter(j=>j.slug);if(!batch.length)continue;
   await connection.query(`INSERT INTO ${table} (slug,status,job_day,posted_ms,creator_id,creator_email,creator_name,is_local,search_text,categories,types,card) VALUES ${batch.map(()=>'(?,?,?,?,?,?,?,?,?,?,?,?)').join(',')} ON DUPLICATE KEY UPDATE status=VALUES(status),job_day=VALUES(job_day),posted_ms=VALUES(posted_ms),creator_id=VALUES(creator_id),creator_email=VALUES(creator_email),creator_name=VALUES(creator_name),is_local=VALUES(is_local),search_text=VALUES(search_text),categories=VALUES(categories),types=VALUES(types),card=VALUES(card)`,batch.flatMap(indexEmployer));
  }
 }
 async function ensure(){
  return ready ||= (async()=>{
   await ensureState();
   await pool.query(`CREATE TABLE IF NOT EXISTS ${table} (slug VARCHAR(255) PRIMARY KEY,status VARCHAR(16) NOT NULL,job_day DATE NULL,posted_ms BIGINT NOT NULL,creator_id VARCHAR(191) NOT NULL,creator_email VARCHAR(320) NOT NULL,creator_name VARCHAR(191) NOT NULL,is_local BOOLEAN NOT NULL,search_text TEXT NOT NULL,categories JSON NOT NULL,types JSON NOT NULL,card LONGTEXT NOT NULL,INDEX day_status_order(job_day,status,posted_ms),INDEX day_creator_order(job_day,creator_id,posted_ms),INDEX status_order(status,posted_ms),INDEX creator_order(creator_id,posted_ms)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
   await pool.query('CREATE TABLE IF NOT EXISTS trikonet_admin_employer_index_meta (id INT PRIMARY KEY,source_hash CHAR(64) NOT NULL) ENGINE=InnoDB');
   const source=await loadImported();imported=new Map(source.filter(j=>j.slug).map(j=>[j.slug,{...j,local:false}]));
   const sourceHash=createHash('sha256').update('schema-v1').update(JSON.stringify(source.map(indexEmployer))).digest('hex');
   const connection=await pool.getConnection();
   try{
    // Same lock order as job writers: state first, then index. Readers see an
    // atomic catalogue; a job saved during initialization cannot disappear.
    await connection.beginTransaction();
    const [rows]=await connection.query("SELECT CAST(JSON_EXTRACT(payload,'$.employers') AS CHAR) jobs FROM trikonet_app_state WHERE state_key='main' FOR UPDATE");
    const [meta]=await connection.query('SELECT source_hash FROM trikonet_admin_employer_index_meta WHERE id=1');
    if(meta[0]?.source_hash===sourceHash){await connection.commit();return;}
    const local=JSON.parse(rows[0]?.jobs||'[]');const effective=new Map(imported);
    for(const job of local)effective.set(job.slug,{...job,local:true});
    await connection.query(`DELETE FROM ${table}`);
    await put(connection,[...effective.values()]);
    await connection.query('INSERT INTO trikonet_admin_employer_index_meta (id,source_hash) VALUES (1,?) ON DUPLICATE KEY UPDATE source_hash=VALUES(source_hash)',[sourceHash]);
    await connection.commit();
   }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  })().catch(error=>{ready=null;throw error;});
 }
 async function sync(connection,before=[],next=[]){
  const old=new Map(before.map(j=>[j.slug,j])),current=new Map(next.map(j=>[j.slug,j]));const changed=[];
  for(const job of next)if(JSON.stringify(old.get(job.slug))!==JSON.stringify(job))changed.push({...job,local:true});
  for(const slug of old.keys())if(!current.has(slug)){
   if(imported.has(slug))changed.push(imported.get(slug));else await connection.query(`DELETE FROM ${table} WHERE slug=?`,[slug]);
  }
  await put(connection,changed);
 }
 async function page(params,admin){
  await ensure();
  const filter=indexWhere(params,admin),base=indexWhere(params,admin,{status:false});
  const size=Math.min(100,Math.max(1,Math.floor(Number(params.get('per_page'))||20)));
  const connection=await pool.getConnection();
  try{
   await connection.beginTransaction();
   const [stats]=await connection.query(`SELECT status,COUNT(*) total,SUM(creator_id=? OR (creator_email<>'' AND creator_email=?)) mine FROM ${table} WHERE ${base.sql} GROUP BY status`,[String(admin.userId),String(admin.email||'').toLowerCase(),...base.values]);
   const counts={all:0,publish:0,draft:0,pending:0,expired:0,mine:0};
   for(const row of stats){counts[row.status]=Number(row.total);counts.all+=Number(row.total);counts.mine+=Number(row.mine||0);}
   const total=counts[params.get('status')||'all']||0;
   const page=Math.min(Math.max(1,Math.floor(Number(params.get('page'))||1)),Math.max(1,Math.ceil(total/size)));
   const [rows]=await connection.query(`SELECT card FROM ${table} WHERE ${filter.sql} ORDER BY posted_ms DESC,slug LIMIT ? OFFSET ?`,[...filter.values,size,(page-1)*size]);
   const [creators]=await connection.query(`SELECT creator_id id,MAX(creator_name) name FROM ${table} WHERE creator_id<>'' GROUP BY creator_id ORDER BY name`);
   await connection.commit();
   return {jobs:rows.map(row=>JSON.parse(row.card)),total,page,perPage:size,counts,creators,day:filter.day};
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
 }
 return {ensure,sync,page};
}
