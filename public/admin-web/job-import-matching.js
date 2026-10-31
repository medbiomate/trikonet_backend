const normalize=value=>String(typeof value==='object'?value?.rendered||'':value||'').toLowerCase().replace(/&amp;/g,'&').replace(/[^a-z0-9]+/g,' ').trim();
export function matchImportedEmployer(company,employers){
 const query=normalize(company);if(!query)return null;
 employers=[...new Map(employers.filter(item=>item.slug).map(item=>[item.slug,item])).values(),...employers.filter(item=>!item.slug)];
 const exact=employers.filter(item=>normalize(item.title)===query);if(exact.length===1)return exact[0];
 const words=query.split(' ').filter(word=>!['the','llc','ltd','limited','inc','company','group'].includes(word));
 if(!words.length)return null;
 const matches=employers.map(item=>{const tokens=normalize(item.title).split(' ');const meaningful=tokens.filter(word=>!['the','llc','ltd','limited','inc','company','group'].includes(word));const overlap=words.filter(word=>meaningful.includes(word)).length;const contained=overlap===words.length||overlap===meaningful.length&&meaningful.join('').length>=4;return{item,score:contained?overlap/Math.max(words.length,meaningful.length):0};}).filter(item=>item.score>0).sort((a,b)=>b.score-a.score);
 // Avoid silently choosing between equally relevant employer records.
 return matches.length&&(!matches[1]||matches[0].score>matches[1].score)?matches[0].item:null;
}
