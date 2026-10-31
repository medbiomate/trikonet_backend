const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const columns = ['jobsAdded','jobsEdited','employersAdded','employersEdited','total'];
const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const cards = [['jobsAdded','Jobs added','green'],['jobsEdited','Jobs edited','blue'],['employersAdded','Employers added','teal'],['employersEdited','Employers edited','purple']];
export const teamActivityView = () => `<div class="admin-view" id="view-team-activity">
<link rel="stylesheet" href="/admin-team-activity.css?v=2">
<header class="report-heading"><div><span class="report-eyebrow">TRIKONET · REPORTS</span><h1>Team performance</h1><p>Daily publishing activity across your jobs and employer profiles.</p></div><button type="button" id="report-export" class="report-button" disabled>↓ Export CSV</button></header>
<form id="team-activity-filter" class="report-toolbar"><label>Date <input type="date" name="date" required aria-label="Report date (IST)"></label><button type="button" id="report-today" class="report-button">Today</button><button class="report-button report-primary" type="submit">Refresh report</button><span>India time · IST</span></form>
<div class="report-cards">${cards.map(([key,label,color])=>`<div class="report-card ${color}"><span>${label}</span><strong data-report-count="${key}">—</strong><small>${key.endsWith('Added')?'New published records':'Updated existing records'}</small></div>`).join('')}</div>
<section class="report-panel"><div class="report-panel-heading"><div><h2>Employee breakdown</h2><p id="team-activity-status" role="status" aria-live="polite">Choose a date to view activity.</p></div><span id="report-total" class="report-total">— total</span></div>
<div class="report-table-scroll"><table class="report-table"><caption class="report-sr-only">Daily employee job and employer activity</caption><thead><tr><th scope="col">Team member</th><th scope="col">Jobs added</th><th scope="col">Jobs edited</th><th scope="col">Employers added</th><th scope="col">Employers edited</th><th scope="col">Total</th></tr></thead><tbody id="team-activity-rows"></tbody><tfoot id="team-activity-totals"></tfoot></table></div></section>
<details class="report-notes"><summary>How this report is counted</summary><p>Published records with saved team attribution are included. Drafts and autosaves are excluded. Repeated edits count once per record; a creator’s same-day revisions remain one new record. Historical edits reflect the latest saved editor, so this is a record summary rather than a complete activity log.</p></details></div>`;
export function initTeamActivity() {
 const form=document.getElementById('team-activity-filter'), exportButton=document.getElementById('report-export');
 form.elements.date.value=today();let request=0, report=null, controller;
 async function load(){
  if(!form.reportValidity())return;
  controller?.abort();controller=new AbortController();const activeController=controller;const current=++request;
  const status=document.getElementById('team-activity-status'),rows=document.getElementById('team-activity-rows'),totals=document.getElementById('team-activity-totals');
  rows.replaceChildren();totals.replaceChildren();report=null;exportButton.disabled=true;status.textContent='Loading report…';
  document.querySelectorAll('[data-report-count]').forEach(el=>el.textContent='—');document.getElementById('report-total').textContent='— total';
  const timer=setTimeout(()=>activeController.abort(),20000);
  try{
   const response=await fetch(`/api/admin/team-activity?date=${encodeURIComponent(form.elements.date.value)}`,{cache:'no-store',signal:activeController.signal});
   if(!response.ok)throw Error('Unable to load the report. Please try Refresh report.');
   const data=await response.json();if(current!==request)return;report=data;
   rows.innerHTML=data.rows.length?data.rows.map(row=>`<tr><th scope="row"><span class="report-person"><span class="report-avatar">${escape(row.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</span>${escape(row.name)}</span></th>${columns.map(key=>`<td class="${key==='total'?'report-number-total':''}">${Number(row[key])||0}</td>`).join('')}</tr>`).join(''):'<tr><td colspan="6" class="report-empty">No published activity recorded for this date.</td></tr>';
   totals.innerHTML=`<tr><th scope="row">Team total</th>${columns.map(key=>`<td>${Number(data.totals[key])||0}</td>`).join('')}</tr>`;
   document.querySelectorAll('[data-report-count]').forEach(el=>el.textContent=Number(data.totals[el.dataset.reportCount])||0);
   document.getElementById('report-total').textContent=`${data.totals.total} total`;
   status.textContent=`${data.date} · ${data.rows.length} team members with recorded activity`;exportButton.disabled=false;
  }catch(error){if(current===request)status.textContent=error.name==='AbortError'?'The report took too long. Please try Refresh report.':error.message;}finally{clearTimeout(timer);}
 }
 form.addEventListener('submit',event=>{event.preventDefault();void load();});
 document.getElementById('report-today').onclick=()=>{form.elements.date.value=today();void load();};
 exportButton.onclick=()=>{if(!report)return;const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"';const safe=x=>/^[=+@\-\t\r]/.test(String(x))?"'"+x:x;const lines=[['Date (IST)','Team member','Jobs added','Jobs edited','Employers added','Employers edited','Total'],...report.rows.map(r=>[report.date,safe(r.name),...columns.map(k=>r[k])]),[report.date,'Team total',...columns.map(k=>report.totals[k])]];const url=URL.createObjectURL(new Blob(['\ufeff'+lines.map(row=>row.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`trikonet-team-report-${report.date}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return load;
}
