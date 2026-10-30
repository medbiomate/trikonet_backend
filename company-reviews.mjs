import {randomUUID} from 'node:crypto';
export function createCompanyReviews({readLocalDb,writeLocalDb}){
 let writes=Promise.resolve();
 return async(method,companyId,session,body={})=>{
  if(!/^[a-zA-Z0-9_-]{1,160}$/.test(companyId))return[400,{error:'Invalid company.'}];
  const publicReview=(r,session)=>({id:r.id,rating:r.rating,text:r.text,name:r.name,createdAt:r.createdAt,updatedAt:r.updatedAt,status:r.status||'pending',mine:Boolean(session&&String(r.userId)===String(session.userId))});
  const task=async()=>{
   const db=await readLocalDb();db.companyReviews||=[];db.reviewReports||=[];db.reviewBlocks||=[];
   const user=session&&(db.users||[]).find(u=>String(u.id)===String(session.userId));
   const staff=user&&['administrator','editor','content editor'].includes(String(user.role||'').toLowerCase());
   if(method==='MODERATION'){
    if(!staff||user.status==='inactive')return[403,{error:'Administrator access required.'}];
    if(body.action==='list')return[200,{reviews:db.companyReviews.filter(r=>r.status!=='approved'||db.reviewReports.some(report=>report.reviewId===r.id&&!report.resolvedAt)),reports:db.reviewReports.filter(r=>!r.resolvedAt)}];
    const review=db.companyReviews.find(r=>r.id===body.reviewId);if(!review)return[404,{error:'Review not found.'}];
    if(!['approve','reject','suspend-author','restore-author'].includes(body.action))return[400,{error:'Choose a moderation action.'}];
    if(body.action==='suspend-author'||body.action==='restore-author'){const author=db.users.find(u=>String(u.id)===String(review.userId));if(author)author.reviewPostingSuspended=body.action==='suspend-author'}
    if(body.action==='approve'||body.action==='reject'){review.status=body.action==='approve'?'approved':'rejected';review.moderatedAt=Date.now();review.moderatedBy=user.id;db.reviewReports.forEach(r=>{if(r.reviewId===review.id)r.resolvedAt=Date.now()})}
    await writeLocalDb(db);return[200,{success:true}];
   }
   if(method==='GET'){
    const unavailable=new Set(db.users.filter(u=>u.accountDeletionPending||u.reviewPostingSuspended||u.status==='inactive').map(u=>String(u.id)));
    const blocked=new Set(db.reviewBlocks.filter(b=>session&&String(b.userId)===String(session.userId)).map(b=>String(b.blockedUserId)));
    const all=db.companyReviews.filter(r=>r.companyId===companyId&&r.status==='approved'&&!unavailable.has(String(r.userId))&&!blocked.has(String(r.userId))).sort((a,b)=>b.updatedAt-a.updatedAt);
    const own=session?db.companyReviews.filter(r=>r.companyId===companyId&&String(r.userId)===String(session.userId)&&r.status!=='approved'):[];
    return[200,{reviews:[...own,...all].slice(0,100).map(r=>publicReview(r,session)),count:all.length,average:all.length?all.reduce((s,r)=>s+r.rating,0)/all.length:0}];
   }
   if(method!=='POST')return[405,{error:'Method not allowed.'}];
   if(!user)return[401,{error:'Sign in to continue.'}];
   if(user.accountDeletionPending||user.status==='inactive')return[403,{error:'This account cannot post or report reviews.'}];
   if(body.action==='report'||body.action==='block'){
    const review=db.companyReviews.find(r=>r.id===body.reviewId&&r.companyId===companyId&&r.status==='approved');if(!review||String(review.userId)===String(user.id))return[400,{error:'Choose another member’s published review.'}];
    if(body.action==='block'){if(!db.reviewBlocks.some(b=>String(b.userId)===String(user.id)&&String(b.blockedUserId)===String(review.userId)))db.reviewBlocks.push({userId:user.id,blockedUserId:review.userId,at:Date.now()});}
    else {const reason=String(body.reason||'').trim();if(reason.length<5||reason.length>1000)return[400,{error:'Describe the concern in 5–1,000 characters.'}];if(!db.reviewReports.some(r=>r.reviewId===review.id&&String(r.userId)===String(user.id)&&!r.resolvedAt))db.reviewReports.push({id:randomUUID(),reviewId:review.id,companyId,userId:user.id,reason,at:Date.now()})}
    await writeLocalDb(db);return[200,{success:true,message:body.action==='block'?'This member’s reviews are now hidden from your account.':'Report received for moderation.'}];
   }
   if(user.reviewPostingSuspended)return[403,{error:'Review posting is suspended. Contact support to appeal.'}];
   const rating=Number(body.rating),text=String(body.text||'').trim();
   if(!Number.isInteger(rating)||rating<1||rating>5||text.length<20||text.length>2000)return[400,{error:'Choose 1–5 stars and write 20–2,000 characters.'}];
   if(body.acceptGuidelines!==true)return[400,{error:'Agree to the community guidelines before submitting.'}];
   const existing=db.companyReviews.find(r=>r.companyId===companyId&&String(r.userId)===String(user.id));
   if(existing&&Date.now()-existing.updatedAt<60000)return[429,{error:'Wait a minute before updating your review.'}];
   const review={id:existing?.id||randomUUID(),companyId,userId:user.id,name:String(user.name||'Trikonet member').trim().split(/\s+/)[0].slice(0,60),rating,text,status:'pending',createdAt:existing?.createdAt||Date.now(),updatedAt:Date.now()};
   if(existing)Object.assign(existing,review);else db.companyReviews.push(review);
   await writeLocalDb(db);return[200,{review:publicReview(review,session),message:'Your review is awaiting moderation. It is not public yet.'}];
  };
  // Serialize reads with writes so a report/block cannot overwrite a queued review.
  const result=writes.then(task);writes=result.catch(()=>{});return result;
 };
}
