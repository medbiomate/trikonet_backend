const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function logoFor(record, type) {
  const m=record?.metas || {};
  return type==='employer' ? record?.logo || m._employer_logo || m._employer_featured_image_img || m._employer_featured_image || '' : record?.logo || m._job_logo || '';
}
export function socialHead(record,type,path,image) {
  const title=record.title?.rendered || record.title || 'Trikonet';
  const description=String(record.description || record.excerpt?.rendered || record.content?.rendered || '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,200);
  let url;
  try {url=new URL(image,'https://api.trikonet.com');if(!['http:','https:'].includes(url.protocol))url=null;} catch {}
  const tags=[['og:type','website'],['og:site_name','Trikonet'],['og:title',title],['og:description',description],['og:url',`https://www.trikonet.com${path}`]];
  if(url)tags.push(['og:image',url.href],['og:image:alt',`${type==='job_listing'?(record.company || record.metas?._job_employer_name || title):title} logo`]);
  return `<title>${escape(title)} | Trikonet</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="https://www.trikonet.com${escape(path)}">`+tags.map(([property,value])=>`<meta property="${property}" content="${escape(value)}">`).join('')+`<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)}">`+(url?`<meta name="twitter:image" content="${escape(url.href)}">`:'');
}
