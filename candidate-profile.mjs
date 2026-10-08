const fields=['name','email','phone','photo','nationality','currentLocation','industry','category','role','currentDesignation','experience','qualification','degree','specialization','licenses','licenseStatus','languages','salaryExpectation','availability','noticePeriod','hospitalType','locations','summary','skills','education','workExperience','socialLinks','website','linkedin','gender','dateOfBirth','address','previousEmployers','visaStatus','university','certifications','departmentExperience','preferredDepartment','relocationPreference','age','preferredDistance','workType','shiftPreference','licenseExpiry'];
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
