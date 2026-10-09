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
test('profile completion earns ten points only once',async()=>{
 let db={users:[{id:'complete',resumeRewards:{points:0,welcomeBonusGranted:true,challenges:[],transactions:[],downloads:[]},name:'Candidate',email:'candidate@example.com',profile:{phone:'1',currentLocation:'Dubai',role:'Developer',experience:'2 years',qualification:'Degree',category:'IT',skills:'JavaScript',locations:['Dubai']}}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 assert.equal((await service.account({userId:'complete'},'GET'))[1].points,10);
 assert.equal((await service.account({userId:'complete'},'GET'))[1].points,10);
});

test('welcome bonus earns ten points once per account',async()=>{
 let db={users:[{id:'new-user',email:'new@example.com'}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 const session={userId:'new-user'};
 assert.equal((await service.account(session,'GET'))[1].points,10);
 await service.account(session,'POST',{action:'download'});
 assert.equal((await service.account(session,'GET'))[1].points,5);
});
test('referral credits both accounts twenty once and rejects self referral',async()=>{
 const createdAt=new Date().toISOString();let db={users:[{id:'a',createdAt},{id:'b',createdAt}]};
 const service=createAdmobRewards({readLocalDb:async()=>structuredClone(db),writeLocalDb:async value=>{db=value}});
 const first=(await service.account({userId:'a'},'GET'))[1];
 assert.equal((await service.account({userId:'a'},'POST',{action:'claim-referral',code:first.referralCode}))[0],400);
 assert.equal((await service.account({userId:'b'},'POST',{action:'claim-referral',code:first.referralCode}))[1].points,30);
 assert.equal((await service.account({userId:'a'},'GET'))[1].points,30);
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
