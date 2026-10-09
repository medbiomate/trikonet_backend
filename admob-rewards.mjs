import {grantProfileCompletionReward} from './candidate-profile.mjs';
import crypto from 'node:crypto';
import {analyzeWithGemini} from './gemini-ats.mjs';
import {extractResume} from './ats-upload.mjs';
import {analyzeResume,resumeText} from './ats-check.mjs';
export function createAdmobRewards({readLocalDb,writeLocalDb,fetcher=fetch,now=Date.now,atsAnalyzer=analyzeWithGemini}){
 let keys={},keysAt=0,queue=Promise.resolve();
 const serial=fn=>{const task=queue.then(fn,fn);queue=task.catch(()=>{});return task;};
 const record=(w,amount,label)=>{w.history ||= [];w.history.push({id:crypto.randomUUID(),amount,label,at:now()});};
 const wallet=user=>user.resumeRewards ||= {points:0,challenges:[],transactions:[],downloads:[]};
 return {
  account:async(session,method,body={})=>{
   // Slow document analysis must not block points reads or other users' rewards.
   let preparedReport;
   if(session&&method==='POST'&&body.action==='ats-check'){
    const requestId=String(body.requestId||'');if(!/^[a-zA-Z0-9-]{16,80}$/.test(requestId))return[400,{error:'Invalid check request.'}];
    const db=await readLocalDb(),user=db.users.find(u=>String(u.id)===String(session.userId));if(!user)return[401,{error:'Account not found.'}];
    if(!user.resumeRewards?.atsRequests?.some(item=>item.id===requestId)){
     let text=String(body.text||'');
     if(body.resumeId){const resume=db.resumes.find(item=>item.id===body.resumeId&&String(item.userId)===String(user.id));if(!resume)return[404,{error:'Saved resume not found.'}];text=resumeText(resume.state);}
     try{let document;if(body.file){const extracted=await extractResume(body.file);text=extracted.text;document=extracted.document;}preparedReport=analyzeResume(text,String(body.jobDescription||''));if(document)preparedReport.document=document;}catch(error){return[400,{error:error.message}];}
     try{preparedReport={...preparedReport,...await atsAnalyzer(text,{fetcher})};}catch(error){return[503,{error:error.message}];}
    }
   }
   return serial(async()=>{
   if(!session)return[401,{error:'Sign in to use resume points.'}];
   const db=await readLocalDb(),user=db.users.find(u=>String(u.id)===String(session.userId));if(!user)return[401,{error:'Account not found.'}];
   const w=wallet(user);
   let walletChanged=false;
   // One-time account credit explicitly requested by the owner.
   if(String(user.email||'').toLowerCase()==='saneensane007@gmail.com'&&!w.ownerCredit100Granted){w.points=100;w.ownerCredit100Granted=true;walletChanged=true;}
   if(!w.welcomeBonusGranted){w.points+=10;record(w,10,'Welcome bonus');w.welcomeBonusGranted=true;walletChanged=true;}
   const beforeProfile=w.points;if(grantProfileCompletionReward(user)){record(w,w.points-beforeProfile,'Profile completion bonus');walletChanged=true;}
   if(!w.referralCode){w.referralCode=crypto.randomBytes(6).toString('hex').toUpperCase();walletChanged=true;}
   if(walletChanged)await writeLocalDb(db);
   if(method==='GET')return[200,{atsFreeAvailable:!w.atsFreeUsed,atsLastCheck:w.atsLastCheck||null,atsHistory:[...(w.atsRequests||[])].reverse().slice(0,50),points:w.points,history:[...(w.history||[])].reverse().slice(0,200),emailReveals:w.emailReveals||[],contactReveals:w.contactReveals||[],referralCode:w.referralCode,referralClaimed:Boolean(w.referredBy),referralEligible:!w.referredBy&&Date.parse(user.createdAt||'')>=now()-7*86400000}];
   if(body.action==='ats-check'){
    const requestId=String(body.requestId||'');if(!/^[a-zA-Z0-9-]{16,80}$/.test(requestId))return[400,{error:'Invalid check request.'}];
    w.atsRequests ||= [];
    const prior=w.atsRequests.find(item=>item.id===requestId);if(prior)return[200,{...prior,points:w.points,atsFreeAvailable:!w.atsFreeUsed}];
    const cost=w.atsFreeUsed?20:0;if(w.points<cost)return[402,{error:'An ATS check needs 20 points. Earn more points to continue.',points:w.points}];
    const report=preparedReport;
    const result={id:requestId,cost,report,at:now()};w.points-=cost;record(w,-cost,'Resume analysis');w.atsFreeUsed=true;w.atsLastCheck=result;w.atsRequests.push(result);await writeLocalDb(db);
    return[200,{...result,points:w.points,atsFreeAvailable:false}];
   }
   if(body.action==='claim-referral'){
    if(w.referredBy)return[409,{error:'You have already claimed a referral bonus.'}];
    const created=Date.parse(user.createdAt||'');if(!Number.isFinite(created)||created<now()-7*86400000)return[403,{error:'Referral codes can be claimed during your first 7 days.'}];
    const code=String(body.code||'').trim().toUpperCase();const referrer=db.users.find(u=>u.resumeRewards?.referralCode===code);
    if(!referrer)return[400,{error:'Referral code not found.'}];if(String(referrer.id)===String(user.id))return[400,{error:'You cannot use your own referral code.'}];
    const other=wallet(referrer);w.points+=20;other.points+=20;record(w,20,'Referral bonus');record(other,20,'Referral bonus');w.referredBy=String(referrer.id);w.referralClaimedAt=new Date(now()).toISOString();other.referralRewards ||= [];other.referralRewards.push({userId:String(user.id),at:w.referralClaimedAt,points:20});await writeLocalDb(db);
    return[200,{points:w.points,referralClaimed:true,referralCode:w.referralCode}];
   }
   if(body.action==='reveal-contact'){
    const kind=String(body.kind||''),value=String(body.value||'').trim();
    if(!['email','phone'].includes(kind)||value.length>200||(kind==='email'?!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value):!/^[+\d][\d\s().-]{3,40}$/.test(value)))return[400,{error:'Invalid contact details.'}];
    const key=kind+':'+(kind==='email'?value.toLowerCase():value.replace(/[^+\d]/g,''));
    w.contactReveals ||= [];
    if(w.contactReveals.includes(key))return[200,{points:w.points,contactReveals:w.contactReveals}];
    if(w.points<1)return[402,{error:'You need 1 point to reveal this contact. Earn more points to continue.',points:w.points}];
    w.points-=1;record(w,-1,`Reveal ${kind}: ${value}`);w.contactReveals.push(key);await writeLocalDb(db);
    return[200,{points:w.points,contactReveals:w.contactReveals}];
   }
   if(body.action==='reveal-email'){
    const email=String(body.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return[400,{error:'Invalid email.'}];
    w.emailReveals ||= [];if(w.emailReveals.includes(email))return[200,{points:w.points,emailReveals:w.emailReveals}];
    const cost=w.emailReveals.length<5?0:1;
    if(w.points<cost)return[402,{error:'Watch an ad to earn points. Each email reveal costs 1 point.'}];
    w.points-=cost;record(w,-cost,`Reveal email: ${email}`);w.emailReveals.push(email);await writeLocalDb(db);return[200,{points:w.points,emailReveals:w.emailReveals}];
   }
   if(body.action==='prepare'){
    w.challenges=w.challenges.filter(c=>c.expires>now());
    if(w.challenges.length>=10)return[429,{error:'Please finish your current ad or try again later.'}];
    const token=crypto.randomBytes(24).toString('hex');w.challenges.push({token,expires:now()+3600000});await writeLocalDb(db);return[200,{token,points:w.points}];
   }
   if(body.action==='complete-reward'){
    const challenge=w.challenges.find(c=>c.token===body.token);
    if(!challenge||challenge.expires<now())return[400,{error:'Reward session expired. Please start a new ad.'}];
    if(!challenge.claimedAt){
     const recent=w.challenges.filter(c=>c.claimedAt&&c.claimedAt>now()-3600000);
     if(recent.length>=10)return[429,{error:'Reward limit reached. Please try again later.'}];
     challenge.claimedAt=now();w.points+=5;record(w,5,'Rewarded ad');await writeLocalDb(db);
    }
    return[200,{points:w.points,rewardToken:challenge.token,rewarded:true}];
   }
   if(body.action==='download'){
    if(w.points<5)return[402,{error:'A resume download needs 5 points.',points:w.points}];
    const id=crypto.randomUUID();w.points-=5;record(w,-5,'Resume download');w.downloads.push({id,at:now(),refunded:false});await writeLocalDb(db);return[200,{id,points:w.points}];
   }
   if(body.action==='refund'){
    const item=w.downloads.find(d=>d.id===body.id);if(!item||now()-item.at>300000)return[400,{error:'Download refund expired.'}];
    if(!item.refunded){item.refunded=true;w.points+=5;record(w,5,'Resume download refund');await writeLocalDb(db);}return[200,{points:w.points}];
   }
   return[400,{error:'Invalid reward action.'}];
  });
  },
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
    if(!challenge.claimedAt){w.points+=5;record(w,5,'Rewarded ad');challenge.claimedAt=now();}w.transactions.push(transaction);await writeLocalDb(db);return[200,{ok:true}];
   });
  }
 };
}
