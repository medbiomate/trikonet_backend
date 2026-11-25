import {readFile} from 'node:fs/promises';
export async function readWordPressConfig(){
 const path=process.env.TRIKONET_WORDPRESS_CONFIG||new URL('./wordpress-publisher.json',import.meta.url);
  const config=JSON.parse(process.env.TRIKONET_WORDPRESS_CONNECTION_JSON||await readFile(path,'utf8'));
 const origin=new URL(config.origin);
 if(origin.protocol!=='https:'||origin.origin!==config.origin||!config.siteId||(!/^[a-f0-9]{64}$/.test(config.publicKey||'')&&(typeof config.secret!=='string'||config.secret.length<32)))throw Error('Invalid WordPress connection configuration.');
 const frontend=new URL(config.frontendOrigin||'https://www.trikonet.com');
 if(frontend.protocol!=='https:'||frontend.origin!==frontend.href.replace(/\/$/,''))throw Error('Invalid frontend origin.');
 return {...config,frontendOrigin:frontend.origin};
}
// Connection-scoped lock serializes revisions across backend processes.
export function createWordPressLock(pool){return async()=>{
 const connection=await pool.getConnection();
 try{const [rows]=await connection.query("SELECT GET_LOCK('trikonet-wordpress-publisher',10) acquired");if(Number(rows[0]?.acquired)!==1)throw Error('Publisher is busy. Please retry.');}
 catch(error){connection.release();throw error;}
 return async()=>{try{await connection.query("SELECT RELEASE_LOCK('trikonet-wordpress-publisher')");}finally{connection.release();}};
};}
