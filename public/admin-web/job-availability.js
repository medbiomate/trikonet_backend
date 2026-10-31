// Use only explicit employer dates; a missing deadline is not an expiry date.
export function explicitDeadline(record) {
 const m=record?.metas||{};
 return record?.deadline||record?.expiryDate||m._job_application_deadline_date||m._job_expiry_date||'';
}
export function isClosedJob(record,now=Date.now()) {
 const m=record?.metas||{};
 if(record?.filled===true||record?.active===false||String(m._filled)==='1'||['expired','closed','filled'].includes(String(record?.status||'').toLowerCase()))return true;
 const dates=[record?.deadline,record?.expiryDate,m._job_application_deadline_date,m._job_expiry_date].filter(Boolean);
 return dates.some(value=>{const text=String(value);const timestamp=Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(text)?`${text}T23:59:59+04:00`:text);return Number.isFinite(timestamp)&&timestamp<now;});
}
