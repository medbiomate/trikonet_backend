export function jobCreator(existing, admin) {
  // Never assign an editor as the creator of a legacy record.
  return existing ? existing.createdBy || null : {id:String(admin.userId),name:String(admin.name || 'Administrator')};
}
export function withoutTeamAttribution(value) {
  if(Array.isArray(value))return value.map(withoutTeamAttribution);
  if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!['createdBy','createdByName','updatedBy'].includes(key)).map(([key,item])=>[key,withoutTeamAttribution(item)]));
  return value;
}
