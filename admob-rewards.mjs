import {grantProfileCompletionReward} from './candidate-profile.mjs';
import crypto from 'node:crypto';
export function createAdmobRewards({readLocalDb,writeLocalDb,fetcher=fetch,now=Date.now}){
 let keys={},keysAt=0,queue=Promise.resolve();
 const serial=fn=>{const task=queue.then(fn,fn);queue=task.catch(()=>{});return task;};
 const wallet=user=>user.resumeRewards ||= {points:0,challenges:[],transactions:[],downloads:[]};
 return {
  account:(session,method,body={})=>serial(async()=>{
   if(!session)return[401,{error:'Sign in to use resume points.'}];
   const db=await readLocalDb(),user=db.users.find(u=>String(u.id)===String(session.userId));if(!user)return[401,{error:'Account not found.'}];
   const w=wallet(user);
   // One-time account credit explicitly requested by the owner.
   if(String(user.email||'').toLowerCase()==='saneensane007@gmail.com'&&!w.ownerCredit100Granted){w.points=100;w.ownerCredit100Granted=true;await writeLocalDb(db);}
   if(!w.welcomeBonusGranted){w.points+=10;w.welcomeBonusGranted=true;await writeLocalDb(db);}
   if(grantProfileCompletionReward(user))await writeLocalDb(db);
   if(!w.referralCode){w.referralCode=crypto.randomBytes(6).toString('hex').toUpperCase();await writeLocalDb(db);}
   if(method==='GET')return[200,{points:w.points,emailReveals:w.emailReveals||[],referralCode:w.referralCode,referralClaimed:Boolean(w.referredBy),referralEligible:!w.referredBy&&Date.parse(user.createdAt||'')>=now()-7*86400000}];
   if(body.action==='claim-referral'){
    if(w.referredBy)return[409,{error:'You have already claimed a referral bonus.'}];
    const created=Date.parse(user.createdAt||'');if(!Number.isFinite(created)||created<now()-7*86400000)return[403,{error:'Referral codes can be claimed during your first 7 days.'}];
    const code=String(body.code||'').trim().toUpperCase();const referrer=db.users.find(u=>u.resumeRewards?.referralCode===code);
    if(!referrer)return[400,{error:'Referral code not found.'}];if(String(referrer.id)===String(user.id))return[400,{error:'You cannot use your own referral code.'}];
    const other=wallet(referrer);w.points+=20;other.points+=20;w.referredBy=String(referrer.id);w.referralClaimedAt=new Date(now()).toISOString();other.referralRewards ||= [];other.referralRewards.push({userId:String(user.id),at:w.referralClaimedAt,points:20});await writeLocalDb(db);
    return[200,{points:w.points,referralClaimed:true,referralCode:w.referralCode}];
   }
   if(body.action==='reveal-email'){
    const email=String(body.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return[400,{error:'Invalid email.'}];
    w.emailReveals ||= [];if(w.emailReveals.includes(email))return[200,{points:w.points,emailReveals:w.emailReveals}];
    const cost=w.emailReveals.length<5?0:1;
    if(w.points<cost)return[402,{error:'Watch an ad to earn points. Each email reveal costs 1 point.'}];
    w.points-=cost;w.emailReveals.push(email);await writeLocalDb(db);return[200,{points:w.points,emailReveals:w.emailReveals}];
   }
   if(body.action==='prepare'){
    w.challenges=w.challenges.filter(c=>c.expires>now());
    if(w.challenges.length>=10)return[429,{error:'Please finish your current ad or try again later.'}];
    const token=crypto.randomBytes(24).toString('hex');w.challenges.push({token,expires:now()+3600000});await writeLocalDb(db);return[200,{token,points:w.points}];
   }
   if(body.action==='download'){
    if(w.points<5)return[402,{error:'A resume download needs 5 points.',points:w.points}];
    const id=crypto.randomUUID();w.points-=5;w.downloads.push({id,at:now(),refunded:false});await writeLocalDb(db);return[200,{id,points:w.points}];
   }
   if(body.action==='refund'){
    const item=w.downloads.find(d=>d.id===body.id);if(!item||now()-item.at>300000)return[400,{error:'Download refund expired.'}];
    if(!item.refunded){item.refunded=true;w.points+=5;await writeLocalDb(db);}return[200,{points:w.points}];
   }
   return[400,{error:'Invalid reward action.'}];
  }),
  callback:async(raw)=>{
   const query=raw.split('?')[1]||'',marker=query.indexOf('&signature=');if(marker<0)return[400,{error:'Missing signature.'}];
   const data=query.slice(0,marker),p=new URLSearchParams(query);
   if(!keysAt||now()-keysAt>3600000){const response=await fetcher('https://www.gstatic.com/admob/reward/verifier-keys.json',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Verification keys unavailable');const result=await response.json();keys=Object.fromEntries(result.keys.map(k=>[String(k.keyId),k.pem]));keysAt=now();}
   const pem=keys[p.get('key_id')];if(!pem||!crypto.verify('sha256',Buffer.from(data),pem,Buffer.from(p.get('signature')||'','base64url')))return[403,{error:'Invalid signature.'}];
   return serial(async()=>{
    const db=await readLocalDb(),token=p.get('custom_data'),transaction=p.get('transaction_id');if(!transaction||!token)return[400,{error:'Missing reward details.'}];
    const user=db.users.find(u=>u.resumeRewards?.challenges?.some(c=>c.token===token));if(!user)return[200,{ok:true,ignored:true}];
   if(!['4074617507','ca-app-pub-4310822705633659/4074617507'].includes(p.get('ad_unit'))||Number(p.get('reward_amount'))!==5)return[400,{error:'Unexpected reward unit or amount.'}];
    const w=wallet(user);if(w.transactions.includes(transaction))return[200,{ok:true}];
    const challenge=w.challenges.find(c=>c.token===token);if(challenge.expires<now())return[200,{ok:true,expired:true}];
    w.points+=5;w.transactions.push(transaction);w.challenges=w.challenges.filter(c=>c.token!==token);await writeLocalDb(db);return[200,{ok:true}];
   });
  }
 };
}
