import crypto from 'node:crypto';

export function createMediaStore(pool) {
  let ready;
  const ensure=()=>ready ||= pool.query(`CREATE TABLE IF NOT EXISTS trikonet_media (id CHAR(64) PRIMARY KEY, filename VARCHAR(191) NOT NULL, mime VARCHAR(64) NOT NULL, bytes LONGBLOB NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`).catch(error=>{ready=null;throw error;});
  const extensions={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/avif':'avif'};
  async function normalize(value, label='image') {
    if(typeof value==='string'){
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
  return {normalize, async get(id){await ensure();const [rows]=await pool.query('SELECT filename,mime,bytes FROM trikonet_media WHERE id=?',[id]);return rows[0];}};
}
