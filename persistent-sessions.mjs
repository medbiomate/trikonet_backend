import crypto from 'node:crypto';
export async function createPersistentSessions(db,{now=Date.now,ttl=604800000}={}){
 await db.query(`CREATE TABLE IF NOT EXISTS trikonet_candidate_sessions (token_hash CHAR(64) PRIMARY KEY,payload TEXT NOT NULL,expires_at BIGINT NOT NULL)`);
 const [rows]=await db.query('SELECT token_hash,payload,expires_at FROM trikonet_candidate_sessions WHERE expires_at > ?',[now()]);
 const entries=new Map(rows.map(row=>[row.token_hash,{value:JSON.parse(row.payload),expires:Number(row.expires_at)}]));
 let nextPrune=now()+Math.min(ttl,60000);
 const prune=(force=false)=>{const time=now();if(!force&&time<nextPrune)return;for(const [key,item] of entries)if(item.expires<=time)entries.delete(key);nextPrune=time+Math.min(ttl,60000);};
 const hash=token=>crypto.createHash('sha256').update(String(token)).digest('hex');
 let pending=Promise.resolve();
 const enqueue=fn=>{pending=pending.then(fn,fn);pending.catch(()=>{})};
 return {
 get(token){if(!token)return undefined;const key=hash(token),item=entries.get(key);if(item&&item.expires<=now()){entries.delete(key);return undefined;}return item?.value},
 set(token,value){prune();const key=hash(token),expires=now()+ttl;entries.set(key,{value,expires});enqueue(()=>db.query('INSERT INTO trikonet_candidate_sessions (token_hash,payload,expires_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload),expires_at=VALUES(expires_at)',[key,JSON.stringify(value),expires]));return this},
 delete(token){const key=entries.has(token)?token:hash(token);const result=entries.delete(key);enqueue(()=>db.query('DELETE FROM trikonet_candidate_sessions WHERE token_hash=?',[key]));return result},
 get size(){prune(true);return entries.size},
 *[Symbol.iterator](){prune(true);for(const [key,item] of entries)yield [key,item.value]},
 flush(){return pending}
 };
}
