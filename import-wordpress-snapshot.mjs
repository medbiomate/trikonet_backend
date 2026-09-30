// Add-only WordPress migration. Never writes application/editor state.
import mysql from 'mysql2/promise';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import crypto from 'node:crypto';

const snapshot = process.argv[2];
const reportPath = process.argv[3];
if (!snapshot || !reportPath) throw Error('Usage: node import-wordpress-snapshot.mjs SNAPSHOT_DIRECTORY PRIVATE_REPORT_PATH');
const db = await mysql.createConnection({host:process.env.TRIKONET_DB_HOST || '127.0.0.1',user:process.env.TRIKONET_DB_USER,password:process.env.TRIKONET_DB_PASSWORD,database:process.env.TRIKONET_DB_NAME});
const read = async path => JSON.parse(await readFile(path,'utf8'));
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const report = {date:new Date().toISOString(), mode:'add-only', datasets:{}};
try {
  await db.query(`CREATE TABLE IF NOT EXISTS trikonet_imported_data (dataset_key VARCHAR(64) PRIMARY KEY, payload LONGTEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB`);
  await db.beginTransaction();
  const [stateBefore] = await db.query("SELECT payload FROM trikonet_app_state WHERE state_key='main' FOR UPDATE");
  const state = JSON.parse(stateBefore[0].payload);
  report.applicationStateChecksum = digest(stateBefore[0].payload);
  for (const key of ['jobs','employers','posts','taxonomies']) {
    const [stored] = await db.query('SELECT payload FROM trikonet_imported_data WHERE dataset_key=? FOR UPDATE',[key]);
    const previous = stored.length ? JSON.parse(stored[0].payload) : await read(new URL(`./data/${key}.json`,import.meta.url));
    const latest = await read(join(snapshot,`${key}.json`));
    const stats = {added:0,conflicts:[],unpublishedRetained:[]};
    const merge = (oldRows,newRows,localRows=[]) => {
      const ids = new Set([...oldRows,...localRows].map(row=>String(row.id)));
      const slugs = new Set([...oldRows,...localRows].map(row=>row.slug).filter(Boolean));
      const byId = new Map(oldRows.map(row=>[String(row.id),row]));
      const result = [...oldRows];
      for (const row of newRows) {
        if(ids.has(String(row.id)) || (row.slug && slugs.has(row.slug))) {
          const old = byId.get(String(row.id));
          if(old && JSON.stringify(old)!==JSON.stringify(row)) stats.conflicts.push({id:row.id,slug:row.slug});
          continue;
        }
        result.push(row);ids.add(String(row.id));if(row.slug)slugs.add(row.slug);stats.added++;
      }
      const liveIds=new Set(newRows.map(row=>String(row.id)));
      stats.unpublishedRetained.push(...oldRows.filter(row=>!liveIds.has(String(row.id))).map(row=>row.id));
      return result;
    };
    let merged;
    if(key==='taxonomies') {
      merged={...previous};
      for(const [group,rows] of Object.entries(latest)) {
        if(!Array.isArray(rows))throw Error(`Unexpected taxonomy shape: ${group}`);
        merged[group]=merge(previous[group] || [],rows);
      }
    } else merged=merge(previous,latest,state[key] || []);
    await db.query('INSERT INTO trikonet_imported_data (dataset_key,payload) VALUES (?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)',[key,JSON.stringify(merged)]);
    report.datasets[key]={...stats,total:Array.isArray(merged)?merged.length:Object.values(merged).reduce((n,rows)=>n+rows.length,0)};
  }
  // Keep raw pages separate: they must not overwrite redesigned CMS/SEO pages.
  for(const key of ['wordpress-pages','public_media_sources']) {
    const value=await read(join(snapshot,`${key}.json`));
    await db.query('INSERT INTO trikonet_imported_data (dataset_key,payload) VALUES (?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)',[key,JSON.stringify(value)]);
    report.datasets[key]={archived:value.length};
  }
  const [stateAfter]=await db.query("SELECT payload FROM trikonet_app_state WHERE state_key='main'");
  if(digest(stateAfter[0].payload)!==report.applicationStateChecksum)throw Error('Application state changed during migration');
  // Persist private review report before committing, to retain every conflict.
  await writeFile(reportPath,JSON.stringify(report,null,2),{mode:0o600});
  await db.commit();
  console.log(JSON.stringify({committed:true,applicationStateUnchanged:true,datasets:Object.fromEntries(Object.entries(report.datasets).map(([key,value])=>[key,{...value,conflicts:value.conflicts?.length,unpublishedRetained:value.unpublishedRetained?.length}]))}));
} catch(error) {
  await db.rollback();
  throw error;
} finally { await db.end(); }
