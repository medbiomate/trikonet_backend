import crypto from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from 'node:fs/promises';

export function createMediaStore(pool) {
  let ready;
  const ensure=()=>ready ||= pool.query(`CREATE TABLE IF NOT EXISTS trikonet_media (id CHAR(64) PRIMARY KEY, filename VARCHAR(191) NOT NULL, mime VARCHAR(64) NOT NULL, bytes LONGBLOB NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`).catch(error=>{ready=null;throw error;});
  const extensions={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/avif':'avif'};
  const cache=new Map();
  const resolved=new Map();
  const publicSources=new Map();
  const r2Enabled=['R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET','R2_PUBLIC_URL'].every(key=>process.env[key]);
  const r2=r2Enabled?new S3Client({region:'auto',endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY},maxAttempts:2}):null;
  let mappingReady;
  const ensureMapping=()=>mappingReady ||= pool.query(`CREATE TABLE IF NOT EXISTS trikonet_public_media (attachment_id BIGINT PRIMARY KEY, object_key VARCHAR(255) NOT NULL, public_url VARCHAR(512) NOT NULL, checksum CHAR(64) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`).catch(error=>{mappingReady=null;throw error;});
  // Only WordPress public attachments enter this bucket. Generic data URLs may
  // contain private profile/resume images and must remain in the existing store.
  async function publishAttachment(row,bytes){
    if(!r2)return null;
    const checksum=crypto.createHash('sha256').update(bytes).digest('hex');
    const name=String(row.post_name||`image-${row.ID}`).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'image';
    const key=`images/${name}-${row.ID}-${checksum.slice(0,12)}.${extensions[row.post_mime_type]}`;
    const base=new URL(process.env.R2_PUBLIC_URL);
    if(base.protocol!=='https:' || base.hostname!=='media.trikonet.com')throw Error('Invalid public media domain');
    const url=new URL(key,`${base.origin}/`).href;
    await r2.send(new PutObjectCommand({Bucket:process.env.R2_BUCKET,Key:key,Body:bytes,ContentType:row.post_mime_type,CacheControl:'public, max-age=31536000, immutable'}),{abortSignal:AbortSignal.timeout(30000)});
    const check=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(10000),redirect:'error'});
    if(!check.ok)throw Error(`CDN verification failed: ${check.status}`);
    await ensureMapping();
    await pool.query('INSERT INTO trikonet_public_media (attachment_id,object_key,public_url,checksum) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE object_key=VALUES(object_key),public_url=VALUES(public_url),checksum=VALUES(checksum)',[row.ID,key,url,checksum]);
    return url;
  }
  async function attachment(id){
    if(resolved.has(id))return resolved.get(id);
    if(cache.has(id))return cache.get(id);
    const task=(async()=>{
      const [rows]=publicSources.has(id)?[[publicSources.get(id)]]:await pool.query("SELECT p.ID,p.post_name,p.post_mime_type, p.guid,f.meta_value attached_file FROM wp_posts p LEFT JOIN wp_postmeta f ON f.post_id=p.ID AND f.meta_key='_wp_attached_file' WHERE p.ID=? AND p.post_type='attachment' LIMIT 1",[id]);
      const row=rows[0];if(!row || !extensions[row.post_mime_type])throw Error('Image attachment unavailable');
      const relative=String(row.attached_file||'').replace(/^\/+/, '');
      const url=row.sourceUrl || (relative?`https://www.trikonet.com/wp-content/uploads/${relative.split('/').map(encodeURIComponent).join('/')}`:row.guid);
      const parsed=new URL(url);
      if(!['www.trikonet.com','trikonet.com','dev.trikonet.com'].includes(parsed.hostname))throw Error('Untrusted media source');
      const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'error'});
      if(!response.ok)throw Error(`Image source returned ${response.status}`);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length>10*1024*1024)throw Error('Image too large');
      const stored=await normalize(`data:${row.post_mime_type};base64,${bytes.toString('base64')}`,row.post_name||`image-${id}`);
      let location=stored;
      try{location=await publishAttachment(row,bytes)||stored;}catch(error){console.error(`Public image ${id} retained on origin:`,error.message);}
      resolved.set(id,location);
      return location;
    })().catch(error=>{cache.delete(id);throw error;});
    cache.set(id,task);return task;
  }
  async function normalize(value, label='image') {
    if(typeof value==='string'){
      const old=value.match(/^\/uploads\/(?:employers|media)\/(\d+)\.[a-z]+$/i);
      // Never hold a public API response while downloading a legacy image.
      // Background migration fills this mapping; existing static URLs stay usable.
      if(old)return resolved.get(Number(old[1])) || value;
      const match=value.match(/^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([A-Za-z0-9+/=\s]+)$/);
      if(!match)return value;
      const bytes=Buffer.from(match[2],'base64');
      if(!bytes.length || bytes.length>10*1024*1024)return value;
      const id=crypto.createHash('sha256').update(bytes).digest('hex');
      const name=String(label).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'image';
      const filename=`${name}-${id.slice(0,12)}.${extensions[match[1]]}`;
      await ensure();
      await pool.query('INSERT IGNORE INTO trikonet_media (id,filename,mime,bytes) VALUES (?,?,?,?)',[id,filename,match[1],bytes]);
      return `https://api.trikonet.com/media/images/${id}/${filename}`;
    }
    if(Array.isArray(value))return Promise.all(value.map(item=>normalize(item,label)));
    if(value && typeof value==='object'){
      const title=value.slug || value.name || value.title?.rendered || (typeof value.title==='string'?value.title:label);
      const result={};
      for(const [key,item] of Object.entries(value))result[key]=await normalize(item,`${title}-${key.replace(/^_/, '')}`);
      return result;
    }
    return value;
  }
  return {normalize,attachment,async migrate(){
    await ensureMapping();
    const [existing]=await pool.query('SELECT attachment_id,public_url FROM trikonet_public_media');
    for(const row of existing)resolved.set(Number(row.attachment_id),row.public_url);
    let rows;
    try{[rows]=await pool.query("SELECT ID FROM wp_posts WHERE post_type='attachment' AND post_mime_type IN ('image/png','image/jpeg','image/webp','image/gif','image/avif')");}
    catch(error){
      if(error.code!=='ER_NO_SUCH_TABLE')throw error;
      try {
        const [sources]=await pool.query("SELECT payload FROM trikonet_imported_data WHERE dataset_key='public_media_sources'");
        for(const row of sources.length?JSON.parse(sources[0].payload):[]) publicSources.set(Number(row.ID),row);
      } catch(sourceError) {
        if(sourceError.code!=='ER_NO_SUCH_TABLE')throw sourceError;
      }
      const employers=JSON.parse(await readFile(new URL('./data/employers.json',import.meta.url),'utf8'));
      const mimes={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',avif:'image/avif'};
      for(const employer of employers){
        const match=String(employer.logo||'').match(/^\/uploads\/employers\/(\d+)\.(png|jpe?g|webp|gif|avif)$/i);
        if(!match)continue;
        const id=Number(match[1]);
        if(publicSources.has(id))continue;
        publicSources.set(id,{ID:id,post_name:`${employer.slug}-logo`,post_mime_type:mimes[match[2].toLowerCase()],sourceUrl:`https://dev.trikonet.com${employer.logo}`});
      }
      rows=[...publicSources.keys()].map(ID=>({ID}));
    }
    let migrated=0,failed=0,cursor=0;
    await Promise.all(Array.from({length:2},async()=>{while(cursor<rows.length){const row=rows[cursor++];if(r2 && resolved.has(Number(row.ID))){migrated++;continue;}try{await attachment(row.ID);migrated++;}catch{failed++;}}}));
    return {total:rows.length,migrated,failed,cdn:[...resolved.values()].filter(url=>url.startsWith('https://media.trikonet.com/')).length,r2Enabled};
  }, async get(id){await ensure();const [rows]=await pool.query('SELECT filename,mime,bytes FROM trikonet_media WHERE id=?',[id]);return rows[0];}};
}
