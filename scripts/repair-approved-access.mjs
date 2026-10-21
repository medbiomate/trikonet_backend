import {readFile,writeFile,rename} from 'node:fs/promises';
const target='/home/u304645447/domains/api.trikonet.com/public_html/.htaccess';
const marker='### HOSTINGER LITESHIELD RECAPTCHA, DO NOT REMOVE THIS LINE ###';
const block=[marker,'RewriteEngine On','LsRecaptcha 100','RewriteRule .* - [E=verifycaptcha:drop]',marker].join('\n')+'\n';
export function repairAccess(source){
 if(!source.startsWith(block))throw Error('Expected approved rule block was not found; no changes made');
 const next=source.slice(block.length);
 if(!next.startsWith('PassengerAppRoot /home/u304645447/domains/api.trikonet.com/hbuilds/current/nodejs\n'))throw Error('Unexpected application configuration; no changes made');
 return next;
}
if(process.argv.includes('--apply')){
 const source=await readFile(target,'utf8');
 const next=repairAccess(source);
 await writeFile(target+'.before-approved-repair-20261021',source,{flag:'wx',mode:0o600});
 await writeFile(target+'.approved-repair',next,{mode:0o644});
 await rename(target+'.approved-repair',target);
 console.log('Approved LiteShield drop block removed; backup saved; application directives retained.');
}
