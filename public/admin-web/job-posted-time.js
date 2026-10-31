const postedTimeFormatter=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'numeric',minute:'2-digit',hour12:true});
export function jobPostedTime(job) {
  const value = job.updatedBy?.at || job.updatedAt || job.createdAt || job.sourceTimestamp;
  if (!value || !/\d{2}:\d{2}/.test(value)) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return postedTimeFormatter.format(date) + ' IST';
}
