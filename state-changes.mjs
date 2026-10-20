const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
// Apply only fields changed since a read, preserving concurrent updates. In
// particular a catalogue refresh must never overwrite a newly registered user.
export function mergeStateChanges(current,before,next){
  if(equal(before,next))return structuredClone(current);
  if(Array.isArray(before)&&Array.isArray(next)&&Array.isArray(current)){
    const keyed=items=>items.every(item=>object(item)&&item.id!==undefined);
    if(keyed(before)&&keyed(next)&&keyed(current)){
      const old=new Map(before.map(item=>[String(item.id),item]));
      const outgoing=new Map(next.map(item=>[String(item.id),item]));
      const result=current.filter(item=>!old.has(String(item.id))||outgoing.has(String(item.id))).map(item=>{
        const id=String(item.id);
        if(item.status==='publish' && outgoing.get(id)?.autosaved && outgoing.get(id)?.status==='draft')return item;
        if(outgoing.has(id)&&old.has(id))return mergeStateChanges(item,old.get(id),outgoing.get(id));
        // A publish can race its first autosave, which shares the stable ID.
        // Promote the draft; a late autosave must never demote a saved job.
        const incoming=outgoing.get(id);
        if(incoming && !old.has(id) && item.status==='draft' && ['publish','published','active'].includes(incoming.status))return structuredClone(incoming);
        return item;
      });
      const present=new Set(current.map(item=>String(item.id)));
      for(const item of next)if(!old.has(String(item.id))&&!present.has(String(item.id)))result.push(structuredClone(item));
      // A concurrently removed record is not recreated by a stale edit.
      return result;
    }
  }
  if(object(before)&&object(next)&&object(current)){
    const result=structuredClone(current);
    for(const key of Object.keys(before))if(!Object.hasOwn(next,key))delete result[key];
    for(const [key,value] of Object.entries(next)){
      if(!Object.hasOwn(before,key))result[key]=structuredClone(value);
      else if(!equal(before[key],value))result[key]=mergeStateChanges(current[key],before[key],value);
    }
    return result;
  }
  return structuredClone(next);
}
