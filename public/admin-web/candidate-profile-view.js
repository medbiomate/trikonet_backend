const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=k=>k.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
const date=v=>v&&!Number.isNaN(new Date(v).getTime())?new Date(v).toLocaleString('en-GB',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}):'Not recorded';
function fields(value){
 if(Array.isArray(value))return value.length?value.map(x=>typeof x==='object'?`<article class="cp-record">${fields(x)}</article>`:esc(x)).join(' · '):'';
 if(value&&typeof value==='object')return `<dl class="cp-fields">${Object.entries(value).filter(([k,v])=>!['id','userId','photo','previewImage','password','passwordHash','passwordSalt'].includes(k)&&v!==null&&v!==''&&v!==undefined&&(!Array.isArray(v)||v.length)).map(([k,v])=>`<div class="${typeof v==='object'?'cp-wide':''}"><dt>${esc(label(k))}</dt><dd>${typeof v==='object'?fields(v):esc(/(?:At|Date)$/.test(k)?date(v):typeof v==='boolean'?(v?'Yes':'No'):v)}</dd></div>`).join('')}</dl>`;
 return esc(value);
}
const empty=text=>`<div class="cp-empty">${esc(text)}</div>`;
export function candidateProfileView(payload){
 const p=payload.profile||{},profile={...p,...payload.submittedProfile};
 const initials=(p.name||'Candidate').split(/\s+/).slice(0,2).map(s=>s[0]).join('');
 const resumes=payload.resumes||[],activity=payload.activity||{};
 const activityGroups=[['saved_jobs','Saved jobs'],['applied_jobs','Applied jobs'],['followed_companies','Followed companies']];
 const profileFields=Object.fromEntries(Object.entries(profile).filter(([k])=>!['name','createdAt','updatedAt','email'].includes(k)));
 return `<header class="cp-header"><div class="cp-avatar">${profile.photo?`<img src="${esc(profile.photo)}" alt="">`:esc(initials)}</div><div><span class="cp-eyebrow">Candidate profile</span><h2 id="cp-title">${esc(p.name||'Candidate')}</h2><p>${esc(p.email||'No email recorded')}</p><small>Joined ${esc(date(p.createdAt))}</small>${payload.account?.id?`<p class="cp-account-id">User ID: ${esc(payload.account.id)}</p>`:''}</div><button class="cp-close" type="button" data-close aria-label="Close profile">✕</button></header>
 <nav class="cp-tabs" aria-label="Profile sections"><button type="button" data-cp-tab="overview" aria-pressed="true">Overview</button><button type="button" data-cp-tab="resumes" aria-pressed="false">Resumes <span>${resumes.length}</span></button><button type="button" data-cp-tab="activity" aria-pressed="false">Activity <span>${activityGroups.reduce((n,[k])=>n+(activity[k]||[]).length,0)}</span></button></nav>
 <div class="cp-body"><section data-cp-panel="overview"><div class="cp-section"><h3>Personal &amp; professional details</h3>${Object.keys(profileFields).length?fields(profileFields):empty('This candidate has not completed their profile yet.')}</div><div class="cp-section"><h3>Account information</h3>${fields(payload.account||{email:p.email,createdAt:p.createdAt})}</div></section>
 <section data-cp-panel="resumes" hidden>${resumes.length?resumes.map(r=>`<details class="cp-section cp-resume"><summary><strong>${esc(r.name||'Resume')}</strong><small>Updated ${esc(date(r.updatedAt))}</small></summary>${r.previewImage?`<img class="cp-preview" src="${esc(r.previewImage)}" alt="Resume preview">`:''}${fields(r.state||{})}</details>`).join(''):empty('No resumes have been saved to this account.')}</section>
 <section data-cp-panel="activity" hidden>${activityGroups.map(([k,title])=>`<div class="cp-section"><h3>${title} <span>${(activity[k]||[]).length}</span></h3>${activity[k]?.length?fields(activity[k]):empty(`No ${title.toLowerCase()} recorded.`)}</div>`).join('')}<div class="cp-section"><h3>Submitted applications</h3>${payload.applications?.length?fields(payload.applications):empty('No submitted applications recorded.')}</div></section></div>`;
}
