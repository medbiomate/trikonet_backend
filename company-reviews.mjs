import { randomUUID } from 'node:crypto';
export function createCompanyReviews({readLocalDb,writeLocalDb}){
 let writes=Promise.resolve();
 return async(method,companyId,session,body={})=>{
  if(!/^[a-zA-Z0-9_-]{1,160}$/.test(companyId))return[400,{error:'Invalid company.'}];
  const publicReview=r=>({id:r.id,rating:r.rating,text:r.text,name:r.name,createdAt:r.createdAt,updatedAt:r.updatedAt,mine:Boolean(session&&String(r.userId)===String(session.userId))});
  if(method==='GET'){
   const db=await readLocalDb();const all=(db.companyReviews||[]).filter(r=>r.companyId===companyId).sort((a,b)=>b.updatedAt-a.updatedAt);
   return[200,{reviews:all.slice(0,100).map(publicReview),count:all.length,average:all.length?all.reduce((sum,r)=>sum+r.rating,0)/all.length:0}];
  }
  if(method!=='POST')return[405,{error:'Method not allowed.'}];
  if(!session)return[401,{error:'Sign in to write a review.'}];
  const rating=Number(body.rating),text=String(body.text||'').trim();
  if(!Number.isInteger(rating)||rating<1||rating>5||text.length<20||text.length>2000)return[400,{error:'Choose 1–5 stars and write a review of 20–2,000 characters.'}];
  const task=writes.then(async()=>{
   const db=await readLocalDb();const user=(db.users||[]).find(u=>String(u.id)===String(session.userId));
   if(!user)return[401,{error:'Sign in again to write a review.'}];
   db.companyReviews||=[];const existing=db.companyReviews.find(r=>r.companyId===companyId&&String(r.userId)===String(user.id));
   const review={id:existing?.id||randomUUID(),companyId,userId:user.id,name:String(user.name||'Trikonet member').trim().split(/\s+/)[0].slice(0,60),rating,text,createdAt:existing?.createdAt||Date.now(),updatedAt:Date.now()};
   if(existing)Object.assign(existing,review);else db.companyReviews.push(review);
   await writeLocalDb(db);return[200,{review:publicReview(review)}];
  });writes=task.catch(()=>{});return task;
 };
}
