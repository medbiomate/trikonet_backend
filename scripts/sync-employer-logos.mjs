import { mkdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import mysql from 'mysql2/promise';

const output=join(process.cwd(),'public','uploads','employers');
const db=await mysql.createConnection({socketPath:'/tmp/mysql.sock',user:process.env.TRIKONET_DB_USER||process.env.USER,database:process.env.TRIKONET_DB_NAME||'trikonet_html_test',dateStrings:true});
const [rows]=await db.query(`SELECT DISTINCT a.ID attachment_id,a.guid,f.meta_value attached_file FROM wp_posts e JOIN wp_postmeta t ON t.post_id=e.ID AND t.meta_key='_thumbnail_id' JOIN wp_posts a ON a.ID=CAST(t.meta_value AS UNSIGNED) LEFT JOIN wp_postmeta f ON f.post_id=a.ID AND f.meta_key='_wp_attached_file' WHERE e.post_type='employer' AND e.post_status='publish' AND a.post_mime_type LIKE 'image/%'`);
await db.end();
await mkdir(output,{recursive:true});

let copied=0,skipped=0,failed=0,cursor=0;
const urlFor=row=>{
  const relative=String(row.attached_file||'').replace(/^\/+/, '');
  if(relative)return `https://www.trikonet.com/wp-content/uploads/${relative.split('/').map(encodeURIComponent).join('/')}`;
  const guid=String(row.guid||'');
  if(/^https?:\/\//i.test(guid))return guid;
  const marker='/wp-content/uploads/';
  const index=guid.indexOf(marker);
  return index>=0?`https://www.trikonet.com${guid.slice(index)}`:'';
};
async function worker(){
  while(cursor<rows.length){
    const row=rows[cursor++],source=urlFor(row),suffix=extname(String(row.attached_file||row.guid||'').split('?')[0])||'.jpg',target=join(output,`${row.attachment_id}${suffix.toLowerCase()}`);
    try{await stat(target);skipped++;continue}catch{}
    if(!source){failed++;continue}
    try{
      const response=await fetch(source,{headers:{'User-Agent':'Mozilla/5.0 Trikonet local media migration'}});
      if(!response.ok)throw new Error(String(response.status));
      await writeFile(target,Buffer.from(await response.arrayBuffer()));
      copied++;
      if((copied+failed)%100===0)console.log(`Processed ${copied+skipped+failed}/${rows.length}`);
    }catch(error){failed++;console.error(`Failed ${row.attachment_id}: ${source} (${error.message})`)}
  }
}
await Promise.all(Array.from({length:12},worker));
console.log(JSON.stringify({total:rows.length,copied,skipped,failed,output},null,2));
