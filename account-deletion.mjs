import {isCandidateAccount} from './candidate-account.mjs';
export const RECOVERY_MS = 30 * 24 * 60 * 60 * 1000;
export function deletionView(row, now = Date.now()) {
  if (!row) return {status:'active'};
  if (row.status === 'deleted' || Number(row.delete_after) <= now) return {status:'deleted'};
  return {status:'pending',requestedAt:new Date(Number(row.requested_at)).toISOString(),deleteAfter:new Date(Number(row.delete_after)).toISOString()};
}
// Tombstones contain only an opaque account ID, preventing stale catalogue writes
// from restoring erased accounts. No email, profile or credentials are retained.
export function removeAccountData(db, ids) {
  const removed = new Set([...ids].map(String));
  const emails = new Set((db.users||[]).filter(user=>removed.has(String(user.id))).map(user=>String(user.email||'').trim().toLowerCase()).filter(Boolean));
  const owned = item => ['userId','user_id','candidateId','candidate_id','accountId'].some(key => removed.has(String(item?.[key]))) || (item?.email && emails.has(String(item.email).trim().toLowerCase()));
  db.users = (db.users || []).filter(user => !removed.has(String(user.id)));
  for (const key of ['resumes','applications','savedJobs','companyReviews','reviewReports','jobReports','employerClaims','emailCampaigns','notifications','searchHistory','activity','uploadedResumes','atsChecks']) {
    if (Array.isArray(db[key])) db[key] = db[key].filter(item => !owned(item));
  }
  if(Array.isArray(db.reviewBlocks))db.reviewBlocks=db.reviewBlocks.filter(item=>!removed.has(String(item.userId))&&!removed.has(String(item.blockedUserId)));
  if (Array.isArray(db.candidates)) db.candidates = db.candidates.filter(item => !removed.has(String(item.id)) && !removed.has(String(item.sourceAccountId)) && !owned(item));
  return db;
}
export function unreferencedPrivateMedia(before,after){
  const hashes=value=>new Set([...JSON.stringify(value).matchAll(/api\.trikonet\.com\/media\/images\/([a-f0-9]{64})\//g)].map(match=>match[1]));
  const remaining=hashes(after);return [...hashes(before)].filter(id=>!remaining.has(id));
}
export function createAccountDeletion({pool,sessions,now=Date.now,beforeErase=async()=>{}}) {
  let ready;
  const ensure = () => ready ||= pool.query(`CREATE TABLE IF NOT EXISTS trikonet_account_deletions (
    user_id VARCHAR(191) PRIMARY KEY, status VARCHAR(16) NOT NULL,
    requested_at BIGINT NOT NULL, delete_after BIGINT NOT NULL,
    INDEX due_deletions (status,delete_after)
  ) ENGINE=InnoDB`).catch(error=>{ready=undefined;throw error});
  async function status(userId) {
    await ensure();
    const [rows]=await pool.query('SELECT * FROM trikonet_account_deletions WHERE user_id=?',[String(userId)]);
    return deletionView(rows[0],now());
  }
  async function revoke(userId) {
    for (const [token,session] of sessions) if(String(session.userId)===String(userId))sessions.delete(token);
    await sessions.flush();
  }
  async function optionalDelete(connection,table,userId) {
    try { await connection.query(`DELETE FROM ${table} WHERE user_id=?`,[String(userId)]); }
    catch(error) { if(error.code!=='ER_NO_SUCH_TABLE')throw error; }
  }
  async function transaction(fn) {
    await ensure();const connection=await pool.getConnection();
    try {await connection.beginTransaction();const result=await fn(connection);await connection.commit();return result;}
    catch(error){await connection.rollback();throw error;}finally{connection.release();}
  }
  // All state writers lock this row before checking tombstones (see server.mjs).
  async function lockedState(connection) {
    const [rows]=await connection.query("SELECT payload FROM trikonet_app_state WHERE state_key='main' FOR UPDATE");
    if(!rows[0])throw new Error('Account storage unavailable. Please try again.');
    return JSON.parse(rows[0].payload);
  }
  async function request(userId, confirmation) {
    if(confirmation!=='DELETE')return [400,{error:'Confirm that you want to delete your account.'}];
    const result=await transaction(async connection=>{
      const db=await lockedState(connection);
      const user=db.users.find(user=>String(user.id)===String(userId));
      if(!user||!isCandidateAccount(user))return [403,{error:'This option is available for job-seeker accounts.'}];
      const time=now();
      await connection.query("INSERT IGNORE INTO trikonet_account_deletions (user_id,status,requested_at,delete_after) VALUES (?,'pending',?,?)",[String(userId),time,time+RECOVERY_MS]);
      const [rows]=await connection.query('SELECT * FROM trikonet_account_deletions WHERE user_id=? FOR UPDATE',[String(userId)]);
      return [200,{success:true,deletion:deletionView(rows[0],now())}];
    });
    if(result[0]===200)await revoke(userId);
    return result;
  }
  async function recover(userId) {
    return transaction(async connection=>{
      const db=await lockedState(connection);
      const [rows]=await connection.query('SELECT * FROM trikonet_account_deletions WHERE user_id=? FOR UPDATE',[String(userId)]);
      const deletion=deletionView(rows[0],now());
      if(deletion.status==='deleted'||!db.users.some(user=>String(user.id)===String(userId)))return [410,{error:'The recovery period has ended. This account cannot be restored.'}];
      await connection.query('DELETE FROM trikonet_account_deletions WHERE user_id=?',[String(userId)]);
      return [200,{success:true,deletion:{status:'active'}}];
    });
  }
  async function erase(connection,db,ids) {
      // Remove imported profile copies, rather than merely hiding them.
      try {
        const [datasets]=await connection.query("SELECT dataset_key,payload FROM trikonet_imported_data WHERE dataset_key IN ('candidates','candidate') FOR UPDATE");
        for(const dataset of datasets){
          const records=JSON.parse(dataset.payload);
          if(!Array.isArray(records))throw new Error('Invalid imported candidate data');
          const kept=removeAccountData({candidates:records,users:[]},ids).candidates;
          await connection.query('UPDATE trikonet_imported_data SET payload=? WHERE dataset_key=?',[JSON.stringify(kept),dataset.dataset_key]);
        }
      } catch(error){if(error.code!=='ER_NO_SUCH_TABLE')throw error;}
      for(const id of ids)if(/^\d+$/.test(id)){
        try {
          await connection.query("DELETE m FROM wp_postmeta m JOIN wp_posts p ON p.ID=m.post_id WHERE p.ID=? AND p.post_type='candidate'",[id]);
          await connection.query("DELETE r FROM wp_term_relationships r JOIN wp_posts p ON p.ID=r.object_id WHERE p.ID=? AND p.post_type='candidate'",[id]);
          await connection.query("DELETE FROM wp_posts WHERE ID=? AND post_type='candidate'",[id]);
        }catch(error){if(error.code!=='ER_NO_SUCH_TABLE')throw error;}
      }

      for(const user of db.users||[])if(ids.includes(String(user.id)))await beforeErase(user);
      const before=structuredClone(db);
      removeAccountData(db,ids);
      for(const hash of unreferencedPrivateMedia(before,db)){
        let shared=false;
        for(const table of ['trikonet_public_media','trikonet_uploaded_public_media']){
          try{const [rows]=await connection.query(`SELECT checksum FROM ${table} WHERE checksum=?`,[hash]);if(rows.length)shared=true;}
          catch(error){if(error.code!=='ER_NO_SUCH_TABLE')throw error;}
        }
        if(!shared)try{await connection.query('DELETE FROM trikonet_media WHERE id=?',[hash]);}catch(error){if(error.code!=='ER_NO_SUCH_TABLE')throw error;}
      }
      await connection.query("UPDATE trikonet_app_state SET payload=?,updated_at=CURRENT_TIMESTAMP WHERE state_key='main'",[JSON.stringify(db)]);
      for(const id of ids){
        for(const table of ['trikonet_point_wallets','trikonet_alert_subscribers','trikonet_alert_outbox','trikonet_digest_jobs'])await optionalDelete(connection,table,id);
        await connection.query("DELETE FROM trikonet_candidate_sessions WHERE JSON_UNQUOTE(JSON_EXTRACT(payload,'$.userId'))=?",[id]);
        await connection.query("UPDATE trikonet_account_deletions SET status='deleted' WHERE user_id=?",[id]);
      }
  }
  async function sweep() {
    // Skip loading and locking the complete state when cleanup has no work.
    // The due rows are checked again inside the transaction.
    await ensure();
    const [due]=await pool.query("SELECT user_id FROM trikonet_account_deletions WHERE status='pending' AND delete_after<=? LIMIT 1",[now()]);
    if(!due.length)return 0;
    const ids=await transaction(async connection=>{
      const db=await lockedState(connection);
      const [rows]=await connection.query("SELECT * FROM trikonet_account_deletions WHERE status='pending' AND delete_after<=? FOR UPDATE",[now()]);
      const ids=rows.map(row=>String(row.user_id));if(!ids.length)return [];
      await erase(connection,db,ids);
      return ids;
    });
    for(const id of ids)await revoke(id);
    return ids.length;
  }
  async function permanent(ids,confirmation) {
    if(confirmation!=='DELETE')return [400,{error:'Type DELETE to confirm permanent candidate deletion.'}];
    if(!Array.isArray(ids)||!ids.length||ids.length>100||ids.some(id=>typeof id!=='string'||!id.trim()||id.length>191))return [400,{error:'Select between 1 and 100 candidates.'}];
    const targets=[...new Set(ids)];
    const result=await transaction(async connection=>{
      const db=await lockedState(connection);
      let imported=[];
      try {const [rows]=await connection.query("SELECT payload FROM trikonet_imported_data WHERE dataset_key IN ('candidates','candidate') FOR UPDATE");imported=rows.flatMap(row=>JSON.parse(row.payload));}catch(error){if(error.code!=='ER_NO_SUCH_TABLE')throw error;}
      for(const id of targets){
        const user=(db.users||[]).find(user=>String(user.id)===id);
        if(user&&!isCandidateAccount(user))return [403,{error:'Only job-seeker accounts can be deleted here.'}];
        let found=user||(db.candidates||[]).some(candidate=>String(candidate.id)===id)||imported.some(candidate=>String(candidate.id)===id);
        if(!found&&/^\d+$/.test(id))try{const [rows]=await connection.query("SELECT ID FROM wp_posts WHERE ID=? AND post_type='candidate'",[id]);found=rows.length;}catch(error){if(error.code!=='ER_NO_SUCH_TABLE')throw error;}
        if(!found){const [rows]=await connection.query('SELECT * FROM trikonet_account_deletions WHERE user_id=? FOR UPDATE',[id]);found=rows[0]?.status==='deleted';}
        if(!found)return [404,{error:'Candidate not found. Refresh the list and try again.'}];
      }
      for(const id of targets)await connection.query("INSERT INTO trikonet_account_deletions (user_id,status,requested_at,delete_after) VALUES (?,'deleted',?,?) ON DUPLICATE KEY UPDATE status='deleted',delete_after=VALUES(delete_after)",[id,now(),now()]);
      await erase(connection,db,targets);
      return [200,{success:true,deleted:targets}];
    });
    if(result[0]===200)for(const id of targets)await revoke(id);
    return result;
  }
  return {ensure,status,request,recover,sweep,permanent};
}
