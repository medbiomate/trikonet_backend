// Keep point balances separate from unrelated whole-catalogue writes.
export function createPointsStore(sql,{readLocalDb}){
 let ready;const snapshots=new WeakMap();
 const ensure=()=>ready ||= sql.query('CREATE TABLE IF NOT EXISTS trikonet_point_wallets (user_id VARCHAR(191) PRIMARY KEY, payload LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4').catch(error=>{ready=undefined;throw error});
 return {
  async readLocalDb(){
   await ensure();const db=await readLocalDb();const [rows]=await sql.query('SELECT user_id,payload FROM trikonet_point_wallets');const wallets=new Map(rows.map(row=>[String(row.user_id),JSON.parse(row.payload)]));
   for(const user of db.users){if(wallets.has(String(user.id)))user.resumeRewards=wallets.get(String(user.id));}
   snapshots.set(db,new Map(db.users.map(user=>[String(user.id),JSON.stringify(user.resumeRewards)])));return db;
  },
  async writeLocalDb(db){
   await ensure();
   for(const user of db.users){if(user.resumeRewards&&snapshots.get(db)?.get(String(user.id))!==JSON.stringify(user.resumeRewards))await sql.query('INSERT INTO trikonet_point_wallets (user_id,payload) VALUES (?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)',[String(user.id),JSON.stringify(user.resumeRewards)]);}
  }
 };
}
