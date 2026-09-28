import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import mysql from 'mysql2/promise';

const root=process.cwd(),output=join(root,'public','uploads','media'),employerLogos=join(root,'public','uploads','employers');
const db=await mysql.createConnection({socketPath:'/tmp/mysql.sock',user:process.env.TRIKONET_DB_USER||process.env.USER,database:process.env.TRIKONET_DB_NAME||'trikonet_html_test',dateStrings:true});
const [rows]=await db.query(`SELECT a.ID attachment_id,a.guid,a.post_mime_type,f.meta_value attached_file FROM wp_posts a LEFT JOIN wp_postmeta f ON f.post_id=a.ID AND f.meta_key='_wp_attached_file' WHERE a.post_type='attachment' AND a.post_mime_type LIKE 'image/%'`);
await db.end();
await mkdir(output,{recursive:true});
let copied=0,downloaded=0,skipped=0,failed=0,cursor=0;
const exists=async path=>{try{await stat(path);return true}catch{return false}};
const sourceUrl=row=>{const relative=String(row.attached_file||'').replace(/^\/+/, '');if(relative)return `https://www.trikonet.com/wp-content/uploads/${relative.split('/').map(encodeURIComponent).join('/')}`;const guid=String(row.guid||'');if(/^https?:\/\//i.test(guid))return guid;const marker='/wp-content/uploads/',index=guid.indexOf(marker);return index>=0?`https://www.trikonet.com${guid.slice(index)}`:''};
async function worker(){while(cursor<rows.length){const row=rows[cursor++],suffix=extname(String(row.attached_file||row.guid||'').split('?')[0])||'.jpg',name=`${row.attachment_id}${suffix.toLowerCase()}`,target=join(output,name),logo=join(employerLogos,name);if(await exists(target)){skipped++;continue}try{if(await exists(logo)){await copyFile(logo,target);copied++}else{const url=sourceUrl(row);if(!url)throw new Error('No source URL');const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Trikonet local media migration'}});if(!response.ok)throw new Error(String(response.status));await writeFile(target,Buffer.from(await response.arrayBuffer()));downloaded++}}catch(error){failed++;console.error(`Failed ${row.attachment_id}: ${error.message}`)}if((copied+downloaded+skipped+failed)%200===0)console.log(`Processed ${copied+downloaded+skipped+failed}/${rows.length}`)}}
await Promise.all(Array.from({length:12},worker));
console.log(JSON.stringify({total:rows.length,copiedFromLogos:copied,downloaded,skipped,failed,output},null,2));
