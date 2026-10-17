export function adminCandidateProfile(record,user){
 if(!user)return record;
 const p=user.profile||{};
 return {...record,...p,appProfile:p,id:user.id,userId:user.id,name:p.name||user.name||record.name,email:user.email,
 jobTitle:p.role??p.currentDesignation??record.jobTitle,
 location:p.currentLocation??(Array.isArray(p.locations)?p.locations.join(', '):undefined)??record.location,
 bio:p.summary??record.bio,photo:p.photo||user.avatar||record.photo||'',createdAt:user.createdAt||record.createdAt};
}
export function candidateEditProfile(record){
 const allowed=['nationality','industry','currentDesignation','degree','specialization','previousEmployers','salaryExpectation','currentSalary','availability','noticePeriod','licenses','licenseDetails','licenseStatus','licenseExpiry','languages','languageDetails','hospitalType','university','departmentExperience','skills','certifications','preferredDepartment','visaStatus','relocationPreference','maritalStatus','dateOfBirth','workPermit','permanentAddress','hometown','postalCode','accomplishments','educationEntries','gender','age','preferredDistance','workType','shiftPreference','locations','workExperience','education','socialLinks','website','linkedin','address'];
 const profile={};
 for(const key of allowed)if(Object.hasOwn(record.appProfile||{},key))profile[key]=record.appProfile[key];
 for(const key of ['name','phone','category','experience','qualification','photo'])if(Object.hasOwn(record,key))profile[key]=record[key];
 for(const [key,target] of [['jobTitle','role'],['location','currentLocation'],['bio','summary']])if(Object.hasOwn(record,key))profile[target]=record[key];
 return profile;
}
