import {uniqueJobs} from './job-list-identity.js';
export async function publicJobPage(local, page, size, fetchRemote, excludedSlugs=[]) {
  const saved=uniqueJobs(local);
  const excluded=new Set([...excludedSlugs,...saved.flatMap(job=>[job.slug,...(job.urlAliases || []).map(path=>path.split('/').pop())])]);
  const offset=(page-1)*size;
  const result=saved.slice(offset,offset+size);
  if(result.length===size)return result;
  const skip=Math.max(0,offset-saved.length);
  let accepted=Math.floor(skip/size)*size,remotePage=Math.floor(skip/size)+1;
  const seen=new Set();
  while(result.length<size){
    const batch=await fetchRemote(remotePage++,size,[...excluded]);
    for(const job of batch){
      if(excluded.has(job.slug)||seen.has(job.slug))continue;
      seen.add(job.slug);
      if(accepted++<skip)continue;
      result.push(job);
      if(result.length===size)break;
    }
    if(batch.length<size)break;
  }
  return result;
}
