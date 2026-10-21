// Local edits override imported identities, including deletion markers.
export function employerOptions(imported=[],local=[]) {
 const merged=new Map(imported.map(item=>[item.slug,item]));
 for(const item of local)merged.set(item.slug,item);
 return [...merged.values()].filter(item=>item.slug&&!item.autosaved&&!item.slug.startsWith('autosave-')&&!['trash','deleted'].includes(item.status)).map(item=>({
  id:item.id,slug:item.slug,title:{rendered:String(item.title?.rendered??item.title??'').trim()},status:item.status,
  metas:{_employer_logo:item.logo||item.metas?._employer_logo||item.metas?._employer_featured_image||'',_employer_featured_image:item.metas?._employer_featured_image||''}
 })).filter(item=>item.title.rendered);
}
