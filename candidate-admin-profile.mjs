import {candidateProfileFields} from './candidate-profile.mjs';
export function adminCandidateProfile(record,user){
 if(!user)return record;
 const p=user.profile||{};
 return {...record,...p,appProfile:p,id:user.id,userId:user.id,name:p.name||user.name||record.name,email:user.email,
 jobTitle:p.role??p.currentDesignation??record.jobTitle,
 location:p.currentLocation??(Array.isArray(p.locations)?p.locations.join(', '):undefined)??record.location,
 bio:p.summary??record.bio,photo:p.photo||user.avatar||record.photo||'',createdAt:user.createdAt||record.createdAt};
}
export function candidateProfileData(record={}){return Object.fromEntries(candidateProfileFields.filter(key=>Object.hasOwn(record,key)).map(key=>[key,record[key]]));}
export function candidateEditProfile(record){
 record={...(record.appProfile||{}),...record};
 const profile={};
 for(const key of candidateProfileFields.filter(key=>!['email','role','currentLocation','summary'].includes(key)))if(Object.hasOwn(record,key))profile[key]=record[key];
 for(const [key,target] of [['jobTitle','role'],['location','currentLocation'],['bio','summary']])if(Object.hasOwn(record,key))profile[target]=record[key];
 return profile;
}
