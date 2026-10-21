const indiaFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'});
export function jobDay(job){
 const value=job.publishedAt||job.postedDate||job.datePosted||job.publishedDate||job.date||job.createdAt||'';
 if(/^\d{4}-\d{2}-\d{2}(?:$|[ T]\d{2}:\d{2}:\d{2}$)/.test(value))return value.slice(0,10);
 const date=new Date(value);return Number.isFinite(date.getTime())?indiaDay(date):'';
}
export function indiaDay(date=new Date()){return indiaFormatter.format(date);}
export function selectedDay(period,now=new Date()){
 return period==='all'?'':indiaDay(new Date(now.getTime()-(period==='yesterday'?86400000:0)));
}
export function jobFilterMatch(job,params){
 const date=params.get('day');if(date&&jobDay(job)!==date)return false;
 const creator=params.get('creator');return !creator||String(job.createdBy?.id||'')===creator;
}
