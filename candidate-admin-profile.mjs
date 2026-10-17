export function adminCandidateProfile(record,user){
 if(!user)return record;
 const p=user.profile||{};
 return {...record,...p,id:user.id,userId:user.id,name:user.name||p.name||record.name,email:user.email,
 jobTitle:p.role??p.currentDesignation??record.jobTitle,
 location:p.currentLocation??(Array.isArray(p.locations)?p.locations.join(', '):undefined)??record.location,
 bio:p.summary??record.bio,photo:p.photo||user.avatar||record.photo||'',createdAt:user.createdAt||record.createdAt};
}
export function candidateEditProfile(record){
 const profile={};
 for(const key of ['name','phone','category','experience','qualification','photo'])if(Object.hasOwn(record,key))profile[key]=record[key];
 for(const [key,target] of [['jobTitle','role'],['location','currentLocation'],['bio','summary']])if(Object.hasOwn(record,key))profile[target]=record[key];
 return profile;
}
