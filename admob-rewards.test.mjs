import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createAdmobRewards} from './admob-rewards.mjs';
test('verified reward credits five once; download charges five and failure refunds once',async()=>{
 const {publicKey,privateKey}=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 let db={users:[{id:'stable-user',name:'Candidate',resumeRewards:{points:0,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value},fetcher:async()=>({ok:true,json:async()=>({keys:[{keyId:1,pem:publicKey.export({type:'spki',format:'pem'})}]})})});
 const session={userId:'stable-user'};
 assert.equal((await service.account(session,'POST',{action:'download'}))[0],402);
 const [,prepared]=await service.account(session,'POST',{action:'prepare'});
 const data=new URLSearchParams({ad_unit:'4074617507',custom_data:prepared.token,reward_amount:'5',transaction_id:'transaction-1'}).toString();
 const signature=crypto.sign('sha256',Buffer.from(data),privateKey).toString('base64url');
 const url='/api/admob/reward?'+data+'&signature='+signature+'&key_id=1';
 assert.equal((await service.callback(url))[0],200);await service.callback(url);
 assert.equal((await service.account(session,'GET'))[1].points,5);
 const [,download]=await service.account(session,'POST',{action:'download'});
 assert.equal(download.points,0);
 await service.account(session,'POST',{action:'refund',id:download.id});await service.account(session,'POST',{action:'refund',id:download.id});
 assert.equal((await service.account(session,'GET'))[1].points,5);
 assert.equal((await service.callback(url.replace('reward_amount=5','reward_amount=50')))[0],403);
 assert.equal((await service.account(null,'GET'))[0],401);
});
test('first five email reveals are free, later reveals cost one once',async()=>{
 let db={users:[{id:'u',resumeRewards:{points:20,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 const session={userId:'u'};
 for(let i=0;i<5;i++)assert.equal((await service.account(session,'POST',{action:'reveal-email',email:`contact${i}@example.com`}))[0],200);
 assert.equal((await service.account(session,'GET'))[1].points,20);
 assert.equal((await service.account(session,'POST',{action:'reveal-email',email:'contact0@example.com'}))[1].points,20);
 assert.equal((await service.account(session,'POST',{action:'reveal-email',email:'extra@example.com'}))[1].points,19);
});
test('requested owner balance is initialized to 100 only once',async()=>{
 let db={users:[{id:'owner',email:'saneensane007@gmail.com',resumeRewards:{points:0,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 const session={userId:'owner'};
 assert.equal((await service.account(session,'GET'))[1].points,100);
 await service.account(session,'POST',{action:'download'});
 assert.equal((await service.account(session,'GET'))[1].points,95);
});
test('profile completion earns all three milestones only once',async()=>{
 let db={users:[{id:'complete',resumeRewards:{points:0,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]},name:'Candidate',email:'candidate@example.com',profile:{phone:'1',currentLocation:'Dubai',role:'Developer',experience:'2 years',qualification:'Degree',category:'IT',skills:'JavaScript',locations:['Dubai']}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 assert.equal((await service.account({userId:'complete'},'GET'))[1].points,100);
 assert.equal((await service.account({userId:'complete'},'GET'))[1].points,100);
});

test('welcome bonus earns ten points once per account',async()=>{
 let db={users:[{id:'new-user',email:'new@example.com'}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 const session={userId:'new-user'};
 assert.equal((await service.account(session,'GET'))[1].points,10);
 await service.account(session,'POST',{action:'download'});
 assert.equal((await service.account(session,'GET'))[1].points,5);
});
test('referral credits both accounts fifty once and rejects self referral',async()=>{
 const createdAt=new Date().toISOString();let db={users:[{id:'a',createdAt},{id:'b',createdAt}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 const first=(await service.account({userId:'a'},'GET'))[1];
 assert.equal((await service.account({userId:'a'},'POST',{action:'claim-referral',code:first.referralCode}))[0],400);
 assert.equal((await service.account({userId:'b'},'POST',{action:'claim-referral',code:first.referralCode}))[1].points,60);
 assert.equal((await service.account({userId:'a'},'GET'))[1].points,60);
 assert.equal((await service.account({userId:'b'},'POST',{action:'claim-referral',code:first.referralCode}))[0],409);
});

test('employer contacts cost one each, repeat and concurrent reveals charge only once',async()=>{
 let db={users:[{id:'u',resumeRewards:{points:2,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}}),session={userId:'u'};
 const phone={action:'reveal-contact',kind:'phone',value:'+971 55 123 4567'};
 const results=await Promise.all([service.account(session,'POST',phone),service.account(session,'POST',phone)]);
 assert.equal(results[0][1].points,1);assert.equal(results[1][1].points,1);
 assert.equal((await service.account(session,'POST',{...phone,value:'+971551234567'}))[1].points,1);
 assert.equal((await service.account(session,'POST',{action:'reveal-contact',kind:'email',value:'hr@example.com'}))[1].points,0);
 assert.equal((await service.account(session,'POST',{...phone,value:'123456'}))[0],402);
 assert.equal((await service.account(session,'GET'))[1].contactReveals.length,2);
 assert.equal((await service.account(session,'POST',{...phone,value:'bad'}))[0],400);
 assert.equal((await service.account(null,'POST',phone))[0],401);
});

test('wallet and spending remain responsive while ATS analysis is pending',async()=>{
 let db={users:[{id:'u',resumeRewards:{points:25,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 let finish,start;const started=new Promise(resolve=>{start=resolve});
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value},atsAnalyzer:async()=>{start();await new Promise(resolve=>{finish=resolve});return {overallScore:75}}});
 const session={userId:'u'};
 const analysis=service.account(session,'POST',{action:'ats-check',requestId:'responsive-check-001',text:'Candidate resume with software development skills and several years of experience. Managed projects, delivered applications and improved customer workflows.'});
 await started;
 try{
  const wallet=await Promise.race([service.account(session,'GET'),new Promise((_,reject)=>setTimeout(()=>reject(Error('Wallet blocked behind analysis')),200))]);
  assert.equal(wallet[1].points,25);
  assert.equal((await service.account(session,'POST',{action:'download'}))[1].points,20);
 }finally{finish()}
 assert.equal((await analysis)[1].points,20);
});

test('SDK completion credits once and signed SSV reconciles without duplicate credit',async()=>{
 const {publicKey,privateKey}=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 let db={users:[{id:'u',resumeRewards:{points:0,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value},fetcher:async()=>({ok:true,json:async()=>({keys:[{keyId:1,pem:publicKey.export({type:'spki',format:'pem'})}]})})});
 const session={userId:'u'};
 const [,prepared]=await service.account(session,'POST',{action:'prepare'});
 const claim={action:'complete-reward',token:prepared.token};
 const results=await Promise.all([service.account(session,'POST',claim),service.account(session,'POST',claim)]);
 assert.equal(results[0][1].points,5);assert.equal(results[1][1].points,5);
 const data=new URLSearchParams({ad_unit:'4074617507',custom_data:prepared.token,reward_amount:'5',transaction_id:'sdk-ssv'}).toString();
 const signature=crypto.sign('sha256',Buffer.from(data),privateKey).toString('base64url');
 assert.equal((await service.callback('/api/admob/reward?'+data+'&signature='+signature+'&key_id=1'))[0],200);
 assert.equal((await service.account(session,'GET'))[1].points,5);
 assert.equal((await service.account(session,'POST',{action:'complete-reward',token:'unknown'}))[0],400);
 assert.equal((await service.account(null,'POST',claim))[0],401);
});

test('foreground time earns one per five minutes, pauses in background, and rejects duplicate heartbeats',async()=>{
 let clock=1000000;let db={users:[{id:'u',resumeRewards:{points:0,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value},now:()=>clock});const session={userId:'u'};let sequence=0;
 const beat=async(active=true,elapsedMs=30000,id='activity-session-one')=>service.account(session,'POST',{action:'foreground-time',activityId:id,sequence:++sequence,active,elapsedMs});
 await beat();for(let i=0;i<9;i++){clock+=30000;await beat();}
 assert.equal((await service.account(session,'GET'))[1].points,0);
 clock+=30000;await beat();assert.equal((await service.account(session,'GET'))[1].points,1);
 await service.account(session,'POST',{action:'foreground-time',activityId:'activity-session-one',sequence,active:true,elapsedMs:30000});assert.equal((await service.account(session,'GET'))[1].points,1);
 await beat(false,0);clock+=600000;await beat(true,600000);assert.equal((await service.account(session,'GET'))[1].points,1);
 clock+=600000;await beat(true,600000);assert.equal((await service.account(session,'GET'))[1].points,1);
 clock+=30000;await beat(true,30000,'another-device-session');assert.equal((await service.account(session,'GET'))[1].points,1);
});

test('point ledger records contact spending once',async()=>{
 let db={users:[{id:'u',resumeRewards:{points:10,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});const session={userId:'u'},action={action:'reveal-contact',kind:'phone',value:'+971 501234567'};
 await service.account(session,'POST',action);await service.account(session,'POST',action);const wallet=(await service.account(session,'GET'))[1];assert.equal(wallet.points,9);assert.equal(wallet.history.length,1);assert.equal(wallet.history[0].amount,-1);
});

test('profile milestones persist through edits and migrate earlier completion credit',async()=>{
 const {grantProfileCompletionReward}=await import('./candidate-profile.mjs');
 const user={name:'Candidate',email:'test@example.com',profile:{phone:'1',currentLocation:'Dubai',role:'Developer'},resumeRewards:{points:0}};
 assert.equal(grantProfileCompletionReward(user),true);assert.equal(user.resumeRewards.points,20);
 Object.assign(user.profile,{experience:'2',qualification:'Degree',category:'IT'});
 grantProfileCompletionReward(user);assert.equal(user.resumeRewards.points,50);
 Object.assign(user.profile,{skills:'JS',locations:['Dubai']});
 grantProfileCompletionReward(user);assert.equal(user.resumeRewards.points,100);
 user.profile.skills='';grantProfileCompletionReward(user);user.profile.skills='JS';grantProfileCompletionReward(user);
 assert.equal(user.resumeRewards.points,100);assert.equal(user.resumeRewards.history.length,3);
 const legacy={...user,resumeRewards:{points:10,profileCompletionRewardGranted:true}};
 grantProfileCompletionReward(legacy);assert.equal(legacy.resumeRewards.points,100);
});
