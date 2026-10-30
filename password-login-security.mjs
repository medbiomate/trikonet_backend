import crypto from 'node:crypto';
const DAY=86400000;
export function passwordAttemptState(row,matched,time=Date.now()){
 const lockedUntil=Number(row?.locked_until||0);
 if(lockedUntil>time)return {allowed:false,failures:Number(row.failures),lockedUntil};
 if(matched)return {allowed:true,failures:0,lockedUntil:0};
 const failures=(lockedUntil||Number(row?.window_start||0)+DAY<=time?0:Number(row?.failures||0))+1;
 return {allowed:false,failures,lockedUntil:failures>=3?time+DAY:0};
}
export function createPasswordLoginSecurity(db,{now=Date.now}={}){
 let ready;
 const init=()=>ready||(ready=db.query('CREATE TABLE IF NOT EXISTS trikonet_password_attempts (account_key CHAR(64) PRIMARY KEY,failures INT NOT NULL DEFAULT 0,window_start BIGINT NOT NULL,locked_until BIGINT NOT NULL DEFAULT 0)').catch(error=>{ready=null;throw error}));
 const key=email=>crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
 return {
  async check(email,verify){
   await init();const connection=await db.getConnection();const accountKey=key(email);const time=now();
   try{
    await connection.beginTransaction();
    await connection.query('INSERT IGNORE INTO trikonet_password_attempts(account_key,window_start) VALUES (?,?)',[accountKey,time]);
    const [rows]=await connection.query('SELECT * FROM trikonet_password_attempts WHERE account_key=? FOR UPDATE',[accountKey]);
    const row=rows[0];let result;
    if(Number(row.locked_until)>time)result=passwordAttemptState(row,false,time);
    else result=passwordAttemptState(row,await verify(),time);
    if(result.allowed)await connection.query('DELETE FROM trikonet_password_attempts WHERE account_key=?',[accountKey]);
    else await connection.query('UPDATE trikonet_password_attempts SET failures=?,window_start=?,locked_until=? WHERE account_key=?',[result.failures,result.failures===1?time:row.window_start,result.lockedUntil,accountKey]);
    await connection.commit();return result;
   }catch(error){await connection.rollback();throw error}finally{connection.release()}
  },
  async clear(email){await init();await db.query('DELETE FROM trikonet_password_attempts WHERE account_key=?',[key(email)])}
 }
}
