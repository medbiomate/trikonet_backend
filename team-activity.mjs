const day = value => {
  const date = new Date(value || '');
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(date) : '';
};
export function teamActivity(catalogue, date) {
  const people = new Map(), seen = new Set();
  const fields = ['jobsAdded','jobsEdited','employersAdded','employersEdited'];
  function add(actor, field) {
    if (!actor?.id) return;
    const id = String(actor.id);
    if (!people.has(id)) people.set(id, {id,name:String(actor.name || 'Team member'),...Object.fromEntries(fields.map(key=>[key,0]))});
    people.get(id)[field]++;
  }
  for (const [kind, records] of [['jobs',catalogue.jobs],['employers',catalogue.employers]]) {
    for (const record of records || []) {
      if (record.autosaved || String(record.slug || '').startsWith('autosave-') || !['publish','published','active'].includes(String(record.status || '').toLowerCase())) continue;
      const identity = `${kind}:${record.id || record.slug}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      const first = record.emsFirstPublishedAt || record.createdAt;
      const addedToday = day(first) === date && record.createdBy?.id;
      if (addedToday) add(record.createdBy, `${kind}Added`);
      // Same-day revisions of a new record remain one new record for its creator.
      // A different editor is credited independently; only the latest editor is available.
      if (day(record.updatedBy?.at) === date && Date.parse(record.updatedBy.at) > Date.parse(first || '1970-01-01') && (!addedToday || String(record.updatedBy.id) !== String(record.createdBy.id))) add(record.updatedBy, `${kind}Edited`);
    }
  }
  const rows = [...people.values()].map(row=>({...row,total:fields.reduce((sum,key)=>sum+row[key],0)})).sort((a,b)=>b.total-a.total || a.name.localeCompare(b.name));
  const totals = Object.fromEntries([...fields,'total'].map(key=>[key,rows.reduce((sum,row)=>sum+row[key],0)]));
  return {date,timeZone:'Asia/Kolkata',rows,totals};
}
