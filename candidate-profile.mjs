const fields=['name','email','phone','photo','nationality','currentLocation','industry','category','role','currentDesignation','experience','qualification','degree','specialization','licenses','licenseDetails','licenseStatus','accomplishments','languages','languageDetails','currentSalary','salaryExpectation','availability','noticePeriod','hospitalType','locations','summary','skills','education','educationEntries','workExperience','socialLinks','website','linkedin','gender','maritalStatus','workPermit','permanentAddress','hometown','postalCode','dateOfBirth','address','previousEmployers','visaStatus','university','certifications','departmentExperience','preferredDepartment','relocationPreference','age','preferredDistance','workType','shiftPreference','licenseExpiry'];
export function updateCandidateProfile(existing={},body={},now=Date.now()){
 const incoming=Number(body.profileUpdatedAt)||now;
 if(incoming<Number(existing.profileUpdatedAt||0))return existing;
 const next={...existing};
 for(const key of fields)if(Object.hasOwn(body,key))next[key]=body[key];
 return {...next,profileUpdatedAt:incoming,updatedAt:new Date(now).toISOString()};
}

export function calculateCandidateCompletion(p) {
  if (!p || typeof p !== 'object') return 0;
  const values = [p.name, p.email, p.phone, p.currentLocation, p.role || p.currentDesignation, p.experience, p.qualification || p.degree, p.category, p.skills, p.locations];
  const filled = value => Array.isArray(value) ? value.some(item => String(item).trim()) : Boolean(String(value || '').trim());
  return Math.round(values.filter(filled).length / values.length * 100);
}

export function grantProfileCompletionReward(user){
 const completion=calculateCandidateCompletion({...user.profile,name:user.name,email:user.email});
 const wallet=user.resumeRewards ||= {points:0,challenges:[],transactions:[],downloads:[]};
 wallet.profileMilestones ||= [];
 let changed=false;
 for(const [threshold,amount] of [[50,20],[80,30],[100,50]]){
  if(completion<threshold||wallet.profileMilestones.includes(threshold))continue;
  // Apply the earlier ten-point completion bonus toward the new final reward.
  const credit=threshold===100&&wallet.profileCompletionRewardGranted?amount-10:amount;
  wallet.points=(Number(wallet.points)||0)+credit;
  wallet.profileMilestones.push(threshold);
  wallet.history ||= [];
  wallet.history.push({id:`profile-${threshold}`,amount:credit,label:`Profile ${threshold}% completion reward`,at:Date.now()});
  changed=true;
 }
 return changed;
}
