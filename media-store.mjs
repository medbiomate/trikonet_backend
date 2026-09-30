import crypto from 'node:crypto';

export function createMediaStore(pool) {
  let ready;
  const ensure=()=>ready ||= pool.query(`CREATE TABLE IF NOT EXISTS trikonet_media (id CHAR(64) PRIMARY KEY, filename VARCHAR(191) NOT NULL, mime VARCHAR(64) NOT NULL, bytes LONGBLOB NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`).catch(error=>{ready=null;throw error;});
  const extensions={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/avif':'avif'};
  const cache=new Map();
  async function attachment(id){
    if(cache.has(id))return cache.get(id);
    const task=(async()=>{
      const [rows]=await pool.query("SELECT p.ID,p.post_name,p.post_mime_type, p.guid,f.meta_value attached_file FROM wp_posts p LEFT JOIN wp_postmeta f ON f.post_id=p.ID AND f.meta_key='_wp_attached_file' WHERE p.ID=? AND p.post_type='attachment' LIMIT 1",[id]);
      const row=rows[0];if(!row || !extensions[row.post_mime_type])throw Error('Image attachment unavailable');
      const relative=String(row.attached_file||'').replace(/^\/+/, '');
      const url=relative?`https://www.trikonet.com/wp-content/uploads/${relative.split('/').map(encodeURIComponent).join('/')}`:row.guid;
      const parsed=new URL(url);
      if(!['www.trikonet.com','trikonet.com'].includes(parsed.hostname))throw Error('Untrusted media source');
      const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'error'});
      if(!response.ok)throw Error(`Image source returned ${response.status}`);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length>10*1024*1024)throw Error('Image too large');
      return normalize(`data:${row.post_mime_type};base64,${bytes.toString('base64')}`,row.post_name||`image-${id}`);
    })().catch(error=>{cache.delete(id);throw error;});
    cache.set(id,task);return task;
  }
  async function normalize(value, label='image') {
    if(typeof value==='string'){
      const old=value.match(/^\/uploads\/(?:employers|media)\/(\d+)\.[a-z]+$/i);
      if(old){try{return await attachment(Number(old[1]));}catch{return value;}}
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
    const [rows]=await pool.query("SELECT ID FROM wp_posts WHERE post_type='attachment' AND post_mime_type IN ('image/png','image/jpeg','image/webp','image/gif','image/avif')");
    let migrated=0,failed=0,cursor=0;
    await Promise.all(Array.from({length:4},async()=>{while(cursor<rows.length){const row=rows[cursor++];try{await attachment(row.ID);migrated++;}catch{failed++;}}}));
    return {total:rows.length,migrated,failed};
  }, async get(id){await ensure();const [rows]=await pool.query('SELECT filename,mime,bytes FROM trikonet_media WHERE id=?',[id]);return rows[0];}};
}
