// Loaded only by account/profile routes; preserve the existing editor markup.
export function createCandidateProfile({ getCurrentUser, escapeAttr, calculateCandidateCompletion }) {
const CANDIDATE_QUALIFICATION_LEVELS = [
  "Doctorate / PhD",
  "Master's / Post Graduate Degree (PG)",
  "Post Graduate Diploma (PGD)",
  "Bachelor's Degree (UG)",
  "Fellowship / Super Specialty",
  "Board Certification / Residency",
  "Diploma / Advanced Diploma",
  "High School / Secondary",
  "Other Qualification"
];

const CANDIDATE_DEGREE_GROUPS = [
  {
    group: 'Computer Science, IT & Software',
    options: [
      'BTech / BE Computer Science',
      'BSc Information Technology (IT)',
      'BCA / MCA (Computer Applications)',
      'MTech / MS Computer Science',
      'MSc Data Science / Artificial Intelligence',
      'BSc Cybersecurity / Cloud Computing',
      'Diploma in Computer Engineering / IT',
      'Full Stack Software Development Certification'
    ]
  },
  {
    group: 'Business, Management & Finance',
    options: [
      'Bachelor of Commerce (B.Com)',
      'Bachelor of Business Administration (BBA)',
      'MBA (Master of Business Administration)',
      'Master of Commerce (M.Com)',
      'Chartered Accountant (CA / CPA)',
      'ACCA / CMA Certified',
      'BSc Finance & Banking',
      'Master in International Business'
    ]
  },
  {
    group: 'Engineering & Construction',
    options: [
      'BTech / BE Civil Engineering',
      'BTech / BE Mechanical Engineering',
      'BTech / BE Electrical Engineering',
      'BTech / BE Electronics & Communication',
      'Bachelor of Architecture (B.Arch)',
      'MTech / ME in Engineering',
      'Diploma in Engineering (Civil / Mech / Elec)',
      'Quantity Surveying Certification'
    ]
  },
  {
    group: 'Marketing, Media & Design',
    options: [
      'BA in Marketing / Public Relations',
      'BA in Mass Communication & Journalism',
      'BSc Graphic Design / Multimedia',
      'UI/UX Design Certification',
      'Digital Marketing Professional Diploma'
    ]
  },
  {
    group: 'Human Resources & Law',
    options: [
      'MBA in Human Resource Management',
      'Bachelor of Laws (LLB)',
      'Master of Laws (LLM)',
      'Diploma in Human Resources',
      'SHRM / CIPD Human Resources Certification'
    ]
  },
  {
    group: 'Hospitality, Tourism & Aviation',
    options: [
      'BSc Hotel Management & Catering (BHM)',
      'Diploma in Culinary Arts / F&B Operations',
      'Diploma in Aviation & Cabin Crew Training',
      'BSc Tourism & Travel Management'
    ]
  },
  {
    group: 'Education & Academics',
    options: [
      'Bachelor of Education (B.Ed)',
      'Master of Education (M.Ed)',
      'Bachelor of Arts (BA)',
      'Bachelor of Science (BSc)',
      'Master of Arts (MA)',
      'Master of Science (MSc)',
      'TEFL / TESOL Teaching Certification'
    ]
  },
  {
    group: 'Healthcare & Medicine',
    options: [
      'BSc Nursing / GNM',
      'Post Basic BSc Nursing / MSc Nursing',
      'MBBS (Bachelor of Medicine & Surgery)',
      'MD / MS (Medical Specialist)',
      'BDS / MDS (Dental Surgery)',
      'B.Pharm / M.Pharm / PharmD (Pharmacy)',
      'BPT / MPT (Physiotherapy)',
      'BSc Medical Laboratory Technology (MLT)',
      'Certified Medical Coder (CPC / CCS)',
      'BSc Radiography & Medical Imaging'
    ]
  },
  {
    group: 'Doctorate & Advanced Research',
    options: [
      'Doctor of Philosophy (PhD)',
      'Post-Doctoral Research Fellowship',
      'Executive Leadership Certification'
    ]
  }
];

const CANDIDATE_TRACKED_ROLES = [
  // Software & IT
  { role: 'Software Engineer', category: 'Software & IT' },
  { role: 'Frontend Developer', category: 'Software & IT' },
  { role: 'Backend Developer', category: 'Software & IT' },
  { role: 'Full Stack Developer', category: 'Software & IT' },
  { role: 'Mobile App Developer (iOS/Android)', category: 'Software & IT' },
  { role: 'DevOps / Cloud Engineer', category: 'Software & IT' },
  { role: 'Data Analyst / Data Scientist', category: 'Software & IT' },
  { role: 'UI/UX Designer', category: 'Software & IT' },
  { role: 'QA & Automation Test Engineer', category: 'Software & IT' },
  { role: 'Cybersecurity Analyst', category: 'Software & IT' },
  { role: 'IT Support Specialist / System Admin', category: 'Software & IT' },
  { role: 'Technical Product Manager', category: 'Software & IT' },

  // Engineering & Construction
  { role: 'Civil Engineer', category: 'Engineering & Technical' },
  { role: 'Mechanical Engineer', category: 'Engineering & Technical' },
  { role: 'Electrical Engineer', category: 'Engineering & Technical' },
  { role: 'MEP Project Engineer', category: 'Engineering & Technical' },
  { role: 'Site Engineer / Supervisor', category: 'Engineering & Technical' },
  { role: 'Project Manager (Construction)', category: 'Engineering & Technical' },
  { role: 'Architect / Interior Designer', category: 'Engineering & Technical' },
  { role: 'Quantity Surveyor (QS)', category: 'Engineering & Technical' },
  { role: 'HSE Safety Officer / Inspector', category: 'Engineering & Technical' },
  { role: 'Structural Engineer', category: 'Engineering & Technical' },

  // Finance & Accounting
  { role: 'Accountant / General Accountant', category: 'Finance & Accounting' },
  { role: 'Senior Accountant', category: 'Finance & Accounting' },
  { role: 'Finance Manager / CFO', category: 'Finance & Accounting' },
  { role: 'Financial Analyst', category: 'Finance & Accounting' },
  { role: 'Auditor / Tax Consultant (VAT)', category: 'Finance & Accounting' },
  { role: 'Payroll Specialist', category: 'Finance & Accounting' },
  { role: 'Accounts Payable / Receivable Clerk', category: 'Finance & Accounting' },
  { role: 'Credit Controller / Treasury Officer', category: 'Finance & Accounting' },

  // Sales & Marketing
  { role: 'Sales Executive / Business Development', category: 'Sales & Marketing' },
  { role: 'Sales Manager / Director', category: 'Sales & Marketing' },
  { role: 'Digital Marketing Specialist', category: 'Sales & Marketing' },
  { role: 'Social Media & Content Manager', category: 'Sales & Marketing' },
  { role: 'SEO / Performance Marketing Specialist', category: 'Sales & Marketing' },
  { role: 'Brand & Marketing Manager', category: 'Sales & Marketing' },
  { role: 'Public Relations (PR) Executive', category: 'Sales & Marketing' },
  { role: 'Real Estate Consultant / Broker', category: 'Sales & Marketing' },

  // Human Resources & Recruitment
  { role: 'HR Executive / Generalist', category: 'Human Resources (HR)' },
  { role: 'HR Manager / HR Director', category: 'Human Resources (HR)' },
  { role: 'Talent Acquisition / Recruiter', category: 'Human Resources (HR)' },
  { role: 'HR Operations & PRO Specialist', category: 'Human Resources (HR)' },
  { role: 'Training & Development Specialist', category: 'Human Resources (HR)' },
  { role: 'Compensation & Benefits Specialist', category: 'Human Resources (HR)' },

  // Administration & Support
  { role: 'Executive Assistant / Personal Assistant', category: 'Administration & Support' },
  { role: 'Office Administrator / Office Manager', category: 'Administration & Support' },
  { role: 'Receptionist / Front Desk Executive', category: 'Administration & Support' },
  { role: 'Data Entry Operator / Clerk', category: 'Administration & Support' },
  { role: 'Document Controller', category: 'Administration & Support' },
  { role: 'Customer Service Representative', category: 'Customer Service' },
  { role: 'Call Centre Team Leader', category: 'Customer Service' },

  // Hospitality & Catering
  { role: 'Hotel General Manager / Duty Manager', category: 'Hospitality & F&B' },
  { role: 'Front Office Executive / Supervisor', category: 'Hospitality & F&B' },
  { role: 'Executive Chef / Head Chef', category: 'Hospitality & F&B' },
  { role: 'Sous Chef / Line Cook', category: 'Hospitality & F&B' },
  { role: 'Restaurant Manager / F&B Supervisor', category: 'Hospitality & F&B' },
  { role: 'Barista / Bartender', category: 'Hospitality & F&B' },
  { role: 'Waiter / Waitress / Hostess', category: 'Hospitality & F&B' },
  { role: 'Housekeeping Supervisor', category: 'Hospitality & F&B' },

  // Logistics & Supply Chain
  { role: 'Supply Chain Manager', category: 'Logistics & Supply Chain' },
  { role: 'Logistics Coordinator / Specialist', category: 'Logistics & Supply Chain' },
  { role: 'Procurement / Purchasing Officer', category: 'Logistics & Supply Chain' },
  { role: 'Warehouse Supervisor / Manager', category: 'Logistics & Supply Chain' },
  { role: 'Inventory Controller', category: 'Logistics & Supply Chain' },
  { role: 'Fleet / Transport Supervisor', category: 'Logistics & Supply Chain' },

  // Education & Teaching
  { role: 'Primary / Kindergarten Teacher', category: 'Education & Training' },
  { role: 'Secondary / High School Teacher', category: 'Education & Training' },
  { role: 'English / ESL Teacher', category: 'Education & Training' },
  { role: 'Mathematics / Science Teacher', category: 'Education & Training' },
  { role: 'University Lecturer / Professor', category: 'Education & Training' },
  { role: 'Academic Counselor / Special Needs Educator', category: 'Education & Training' },

  // Healthcare & Nursing
  { role: 'Staff Nurse', category: 'Nursing & Clinical' },
  { role: 'Registered Nurse (RN)', category: 'Nursing & Clinical' },
  { role: 'Assistant Nurse', category: 'Nursing & Clinical' },
  { role: 'ICU / Critical Care Nurse', category: 'Nursing & Clinical' },
  { role: 'Emergency (ER) Nurse', category: 'Nursing & Clinical' },
  { role: 'Operating Theatre (OT) Nurse', category: 'Nursing & Clinical' },
  { role: 'Derma / Aesthetic Nurse', category: 'Nursing & Clinical' },
  { role: 'General Practitioner (GP)', category: 'Healthcare & Medical' },
  { role: 'Consultant / Specialist Doctor', category: 'Healthcare & Medical' },
  { role: 'Dentist / Dental Surgeon', category: 'Healthcare & Medical' },
  { role: 'Pharmacist / Clinical Pharmacist', category: 'Healthcare & Medical' },
  { role: 'Medical Coder / Billing Specialist', category: 'Healthcare & Medical' },
  { role: 'Medical Lab Technologist (MLT)', category: 'Healthcare & Medical' },
  { role: 'Physiotherapist', category: 'Healthcare & Medical' },
  { role: 'Radiographer / X-Ray Technologist', category: 'Healthcare & Medical' }
];

const CANDIDATE_INDUSTRIES = [
  'Information Technology & Software',
  'Healthcare & Medical',
  'Hospitality, Tourism & Catering',
  'Finance, Banking & Accounting',
  'Engineering & Construction',
  'Sales, Marketing & Advertising',
  'Human Resources & Recruitment',
  'Logistics, Supply Chain & Aviation',
  'Education & Teaching',
  'Administration & Office Support',
  'Customer Service & Call Centre',
  'Retail & FMCG',
  'Real Estate & Property',
  'Legal & Compliance'
];

const CANDIDATE_CATEGORIES = [
  'Software & IT',
  'Engineering & Technical',
  'Finance & Accounting',
  'Sales & Marketing',
  'Healthcare & Medical',
  'Nursing & Clinical',
  'Human Resources (HR)',
  'Hospitality & F&B',
  'Logistics & Supply Chain',
  'Education & Training',
  'Administration & Support',
  'Customer Service'
];

const CANDIDATE_EXPERIENCES = ['Student / Intern', 'Fresher', '1–3 years', '4–7 years', '8–12 years', '12+ years'];
const CANDIDATE_LICENSES = [
  'No license / General Career',
  'UAE Driving License',
  'AWS / Azure / GCP Cloud Certified',
  'PMP / Agile Scrum Certified',
  'CPA / ACCA / CMA Certified',
  'SHRM / CIPD HR Certified',
  'DHA License (Dubai)',
  'DOH / HAAD License (Abu Dhabi)',
  'MOH License (UAE)',
  'SCFHS License (Saudi Arabia)',
  'Other Professional License'
];
const CANDIDATE_AVAILABILITY = ['Immediately', 'Within 15 days', 'Within 30 days', 'Within 60 days', 'More than 60 days'];
const CANDIDATE_HOSPITAL_TYPES = ['Any Employer Type', 'Private Corporate Company', 'Government / Semi-Government', 'Multinational Corporation (MNC)', 'Hospital / Medical Centre', 'Startup / Tech Agency', 'Retail / Hospitality Chain', 'Educational Institution'];
const CANDIDATE_LOCATIONS = ['UAE', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'];
const CANDIDATE_COUNTRIES = [
  { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦' },
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭' },
  { name: 'Egypt', code: 'EG', dial: '+20', flag: '🇪🇬' },
  { name: 'Pakistan', code: 'PK', dial: '+92', flag: '🇵🇰' },
  { name: 'Jordan', code: 'JO', dial: '+962', flag: '🇯🇴' },
  { name: 'Oman', code: 'OM', dial: '+968', flag: '🇴🇲' },
  { name: 'Qatar', code: 'QA', dial: '+974', flag: '🇶🇦' },
  { name: 'Kuwait', code: 'KW', dial: '+965', flag: '🇰🇼' },
  { name: 'Bahrain', code: 'BH', dial: '+973', flag: '🇧🇭' },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
  { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦' },
  { name: 'Lebanon', code: 'LB', dial: '+961', flag: '🇱🇧' },
  { name: 'Syria', code: 'SY', dial: '+963', flag: '🇸🇾' },
  { name: 'Sudan', code: 'SD', dial: '+249', flag: '🇸🇩' },
  { name: 'Yemen', code: 'YE', dial: '+967', flag: '🇾🇪' },
  { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: 'KE', dial: '+254', flag: '🇰🇪' },
  { name: 'Nepal', code: 'NP', dial: '+977', flag: '🇳🇵' },
  { name: 'Sri Lanka', code: 'LK', dial: '+94', flag: '🇱🇰' },
  { name: 'Bangladesh', code: 'BD', dial: '+880', flag: '🇧🇩' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Turkey', code: 'TR', dial: '+90', flag: '🇹🇷' }
];

function candidateProfileWorkspace(profile) {
  if(getCurrentUser()?.profileLoadError)return `<main class="member-workspace member-workspace-locked"><section><h1>Your profile could not load</h1><p>Please reload to retrieve your saved details before editing.</p><button type="button" onclick="location.reload()">Reload profile</button></section></main>`;
  const p = profile || {};
  const currentPhoto = p.photo || getCurrentUser()?.avatar || '';
  const initial = escapeAttr((p.name || getCurrentUser()?.name || 'U').charAt(0).toUpperCase());
  const completion = calculateCandidateCompletion(p);

  const phoneStr = String(p.phone || '').trim();
  const matchedCountry = CANDIDATE_COUNTRIES.find(c => phoneStr.startsWith(c.dial)) || CANDIDATE_COUNTRIES[0];
  const nationalNumber = phoneStr.startsWith(matchedCountry.dial)
    ? phoneStr.slice(matchedCountry.dial.length).trim()
    : phoneStr;

  const currentNationality = CANDIDATE_COUNTRIES.find(c => c.name.toLowerCase() === (p.nationality || '').toLowerCase());
  const selectedLicenses = Array.isArray(p.licenses) ? p.licenses : [];
  const selectedLocations = Array.isArray(p.locations) ? p.locations : [];
  const allStandardDegrees = CANDIDATE_DEGREE_GROUPS.flatMap(g => g.options);
  const isCustomDegree = p.degree && !allStandardDegrees.includes(p.degree);
  const isCustomQual = p.qualification && !CANDIDATE_QUALIFICATION_LEVELS.includes(p.qualification);

  return `<main class="candidate-profile-shell">
    <!-- Top Hero Banner -->
    <section class="candidate-profile-hero">
      <div class="profile-hero-top">
        <div class="profile-hero-user">
          <label class="profile-avatar-wrap" title="Click to upload profile photo">
            ${currentPhoto ? `<img id="candAvatarImg" src="${escapeAttr(currentPhoto)}" alt="Candidate Avatar">` : `<span id="candAvatarInitial" class="profile-avatar-initial">${initial}</span>`}
            <span class="profile-avatar-camera" title="Upload Photo">📷</span>
            <input type="file" id="candPhotoInput" accept="image/*" style="display:none;">
          </label>
          <div class="profile-hero-info">
            <span class="profile-hero-kicker">Candidate Profile & Workspace</span>
            <h1>${escapeAttr(p.name || getCurrentUser()?.name || 'Candidate')} <span class="profile-hero-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Verified Candidate</span></h1>
            <div class="profile-hero-meta">
              <span>✉️ ${escapeAttr(p.email || getCurrentUser()?.email || '')}</span>
              <span id="heroRoleMeta">💼 ${escapeAttr(p.role || p.currentDesignation || 'Professional')}</span>
              <span id="heroLocationMeta">📍 ${escapeAttr(p.currentLocation || 'UAE')}</span>
            </div>
          </div>
        </div>
        <div class="profile-hero-actions">
          <button type="button" class="profile-btn-primary" id="saveProfileHeroBtn">
            <span>💾</span> Save Changes
          </button>
          <a href="/resume-library" class="profile-btn-secondary" title="Build ATS Resume">
            <span>📄</span> ATS CV Builder
          </a>
          <button type="button" class="profile-btn-secondary profile-btn-signout" id="dashboardLogoutBtn">
            Sign Out
          </button>
        </div>
      </div>
    </section>

    <!-- 2-Column Executive Dashboard -->
    <div class="candidate-dashboard-grid">
      <!-- Main Form Column -->
      <div class="candidate-main-content">
        <!-- Sticky Section Navigation Tabs -->
        <nav class="candidate-section-tabs" id="profileSectionTabs" aria-label="Profile Sections">
          <button type="button" class="tab-pill active" data-target="section-personal"><span>👤</span> Personal</button>
          <button type="button" class="tab-pill" data-target="section-career"><span>💼</span> Career & Role</button>
          <button type="button" class="tab-pill" data-target="section-education"><span>🎓</span> Education & Licenses</button>
          <button type="button" class="tab-pill" data-target="section-preferences"><span>⚙️</span> Preferences & Salary</button>
          <button type="button" class="tab-pill" data-target="section-locations"><span>📍</span> Locations & Bio</button>
        </nav>

        <!-- SECTION 1: Personal & Contact Information -->
        <section class="profile-section-card" id="section-personal">
          <div class="section-head">
            <span class="section-eyebrow">ABOUT YOU</span>
            <h2 class="section-title"><span>👤</span> Personal & Contact Details</h2>
            <p class="section-subtitle">Recruiters and HR coordinators will use these details to contact you directly.</p>
          </div>
      <div class="profile-grid-2">
        <div class="profile-field">
          <label for="candName">Full Name *</label>
          <input type="text" id="candName" value="${escapeAttr(p.name || getCurrentUser()?.name || '')}" placeholder="e.g. Sarah Jenkins">
        </div>
        <div class="profile-field">
          <label for="candEmail">Email Address (Registered)</label>
          <input type="email" id="candEmail" value="${escapeAttr(p.email || getCurrentUser()?.email || '')}" readonly style="background:#f8fafc;cursor:not-allowed;"><button type="button" data-change-account-email>Change email</button>
        </div>
        <div class="profile-field">
          <label for="candPhoneNumber">Phone Number *</label>
          <div class="phone-field-wrap">
            <button type="button" class="phone-code-btn" id="phoneCodeBtn" title="Choose country dial code">
              <span id="phoneCodeFlag">${matchedCountry.flag}</span>
              <strong id="phoneCodeDial">${matchedCountry.dial}</strong>
              <small>▼</small>
            </button>
            <input type="tel" id="candPhoneNumber" value="${escapeAttr(nationalNumber)}" placeholder="50 123 4567" style="flex:1;">
          </div>
        </div>
        <div class="profile-field">
          <label>Nationality *</label>
          <button type="button" class="picker-trigger-btn ${p.nationality ? '' : 'empty'}" id="candNationalityBtn">
            <span id="nationalityBtnText">${currentNationality ? `${currentNationality.flag} ${currentNationality.name}` : (p.nationality || 'Select your nationality')}</span>
            <small>▼</small>
          </button>
          <input type="hidden" id="candNationality" value="${escapeAttr(p.nationality || '')}">
        </div>
        <div class="profile-field">
          <label for="candCurrentLocation">Current City and Country *</label>
          <input type="text" id="candCurrentLocation" value="${escapeAttr(p.currentLocation || '')}" placeholder="e.g. Dubai, UAE">
        </div>
        <div class="profile-field">
          <label for="candGender">Gender</label>
          <select id="candGender">
            <option value="">Select gender</option>
            <option value="Female" ${p.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Male" ${p.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Prefer not to say" ${p.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
          </select>
        </div>
      </div>
    </section>

    <!-- SECTION 2: Career Field & Professional Level -->
    <section class="profile-section-card" id="section-career">
      <div class="section-head">
        <span class="section-eyebrow">YOUR CAREER</span>
        <h2 class="section-title"><span>💼</span> Career Field & Professional Level</h2>
        <p class="section-subtitle">Select your industry discipline, target role, and total experience.</p>
      </div>

      <div class="profile-grid-2 career-compact-selects">
        <div class="profile-field">
          <label for="candIndustry">Industry / Sector *</label>
          <select id="candIndustry">
            ${CANDIDATE_INDUSTRIES.map(item => `<option value="${escapeAttr(item)}" ${(p.industry || 'Information Technology & Software') === item ? 'selected' : ''}>${escapeAttr(item)}</option>`).join('')}
          </select>
        </div>
        <div class="profile-field">
          <label for="candCategory">Job Category *</label>
          <select id="candCategory">
            ${CANDIDATE_CATEGORIES.map(item => `<option value="${escapeAttr(item)}" ${(p.category || 'Software & IT') === item ? 'selected' : ''}>${escapeAttr(item)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="profile-grid-2" style="margin-bottom:18px;">
        <div class="profile-field">
          <label>Target Job Role *</label>
          <button type="button" class="picker-trigger-btn ${p.role ? '' : 'empty'}" id="candRoleBtn">
            <span id="candRoleBtnText">💼 ${escapeAttr(p.role || 'Select target job role')}</span>
            <small>🔍 Browse</small>
          </button>
          <input type="hidden" id="candRole" value="${escapeAttr(p.role || '')}">
        </div>
        <div class="profile-field">
          <label for="candDesignation">Current / Most Recent Designation *</label>
          <input type="text" id="candDesignation" value="${escapeAttr(p.currentDesignation || p.role || '')}" placeholder="e.g. Senior Software Engineer, Staff Nurse, Project Manager, Accountant">
          ${p.role ? `<button type="button" class="suggestion-chip" id="sameAsRoleChip">✓ Same as role: “${escapeAttr(p.role)}”</button>` : ''}
        </div>
      </div>

      <div class="profile-field">
        <label for="candExperience">Total Professional Experience Level *</label>
        <select id="candExperience">
          ${CANDIDATE_EXPERIENCES.map(item => `<option value="${escapeAttr(item)}" ${(p.experience || '1–3 years') === item ? 'selected' : ''}>${escapeAttr(item)}</option>`).join('')}
        </select>
      </div>
    </section>

    <!-- SECTION 3: Education, Degrees & Credentials -->
    <section class="profile-section-card" id="section-education">
      <div class="section-head">
        <span class="section-eyebrow">CREDENTIALS & EDUCATION</span>
        <h2 class="section-title"><span>🎓</span> Education, Degrees & Qualifications</h2>
        <p class="section-subtitle">Add your academic degrees, certifications, and professional credentials for UAE employers.</p>
      </div>

      <div class="profile-grid-2" style="margin-bottom:18px;">
        <div class="profile-field">
          <label for="candQualification">Highest Qualification Level *</label>
          <select id="candQualification">
            <option value="">Select qualification level</option>
            ${CANDIDATE_QUALIFICATION_LEVELS.map(level => `
              <option value="${escapeAttr(level)}" ${p.qualification === level ? 'selected' : ''}>${escapeAttr(level)}</option>
            `).join('')}
            <option value="Other Qualification" ${isCustomQual ? 'selected' : ''}>Other Qualification</option>
          </select>
          <input type="text" id="candCustomQual" value="${isCustomQual ? escapeAttr(p.qualification) : ''}" placeholder="Enter qualification" style="margin-top:6px;display:${isCustomQual ? 'block' : 'none'};">
        </div>

        <div class="profile-field">
          <label for="candDegreeSelect">Degree / Certification *</label>
          <select id="candDegreeSelect">
            <option value="">Select degree / major</option>
            ${CANDIDATE_DEGREE_GROUPS.map(g => `
              <optgroup label="${escapeAttr(g.group)}">
                ${g.options.map(opt => `
                  <option value="${escapeAttr(opt)}" ${p.degree === opt ? 'selected' : ''}>${escapeAttr(opt)}</option>
                `).join('')}
              </optgroup>
            `).join('')}
            <option value="Other" ${isCustomDegree ? 'selected' : ''}>Other / Custom Degree</option>
          </select>
          <input type="text" id="candCustomDegree" value="${isCustomDegree ? escapeAttr(p.degree) : ''}" placeholder="Enter custom degree (e.g. BSc Computer Science, MBA, MBBS)" style="margin-top:6px;display:${isCustomDegree ? 'block' : 'none'};">
        </div>

        <div class="profile-field">
          <label for="candSpecialization">Specialization / Major / Department</label>
          <input type="text" id="candSpecialization" value="${escapeAttr(p.specialization || '')}" placeholder="e.g. Cloud Computing, Corporate Finance, Civil Engineering, Cardiology">
        </div>

        <div class="profile-field">
          <label for="candUniversity">University / Institute / College</label>
          <input type="text" id="candUniversity" value="${escapeAttr(p.university || '')}" placeholder="e.g. University of Dubai, AUS, Heriot-Watt, Cairo University">
        </div>
      </div>

      <div class="profile-field" style="margin-bottom:18px;">
        <label>Professional Certifications & Licenses (Technical, Medical & Professional)</label>
        <div class="choice-pills-wrap" id="licensePillsWrap">
          ${CANDIDATE_LICENSES.map(item => {
            const isSel = selectedLicenses.includes(item);
            return `
              <button type="button" class="choice-pill ${isSel ? 'selected' : ''}" data-val="${escapeAttr(item)}">
                ${isSel ? '<span class="choice-pill-icon">✓</span>' : ''} ${escapeAttr(item)}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="profile-grid-2">
        <div class="profile-field">
          <label for="candLicenseStatus">License / Credential Verification Status</label>
          <select id="candLicenseStatus">
            <option value="">Select verification status</option>
            <option value="Active License / Certified" ${p.licenseStatus === 'Active License / Certified' || p.licenseStatus === 'Active License' ? 'selected' : ''}>Active License / Certified</option>
            <option value="Degree Attested (MoFA / UAE)" ${p.licenseStatus === 'Degree Attested (MoFA / UAE)' ? 'selected' : ''}>Degree Attested (MoFA / UAE)</option>
            <option value="Eligibility Letter" ${p.licenseStatus === 'Eligibility Letter' ? 'selected' : ''}>Eligibility Letter (Healthcare)</option>
            <option value="Dataflow Completed" ${p.licenseStatus === 'Dataflow Completed' ? 'selected' : ''}>Dataflow Completed</option>
            <option value="Exam Passed / In Process" ${p.licenseStatus === 'Exam Passed / In Process' || p.licenseStatus === 'Exam Passed' ? 'selected' : ''}>Exam Passed / In Process</option>
            <option value="Not Applicable / General Career" ${p.licenseStatus === 'Not Applicable / General Career' || p.licenseStatus === 'No license yet' ? 'selected' : ''}>Not Applicable / General Career</option>
          </select>
        </div>

        <div class="profile-field">
          <label for="candLanguages">Languages Known</label>
          <input type="text" id="candLanguages" value="${escapeAttr(Array.isArray(p.languages) ? p.languages.join(', ') : (p.languages || 'English'))}" placeholder="e.g. English, Arabic, Hindi, Tagalog, French">
        </div>
      </div>
    </section>

    <!-- SECTION 4: Work Preferences & Availability -->
    <section class="profile-section-card" id="section-preferences">
      <div class="section-head">
        <span class="section-eyebrow">JOB PREFERENCES</span>
        <h2 class="section-title"><span>⚙️</span> Availability & Career Expectations</h2>
        <p class="section-subtitle">Specify your employment status, expected salary, and employer preferences.</p>
      </div>

      <div class="profile-grid-2" style="margin-bottom:18px;">
        <div class="profile-field">
          <label for="candEmployers">Previous / Current Employers</label>
          <input type="text" id="candEmployers" value="${escapeAttr(p.previousEmployers || '')}" placeholder="e.g. Emirates Group, EMAAR, Mediclinic, Etisalat">
        </div>
        <div class="profile-field">
          <label for="candSalary">Expected Monthly Salary</label>
          <input type="text" id="candSalary" value="${escapeAttr(p.salaryExpectation || '')}" placeholder="e.g. AED 12,000 monthly">
        </div>
        <div class="profile-field">
          <label for="candAvailability">Availability to Join</label>
          <select id="candAvailability">
            <option value="">Select availability</option>
            ${CANDIDATE_AVAILABILITY.map(opt => `
              <option value="${escapeAttr(opt)}" ${p.availability === opt ? 'selected' : ''}>${escapeAttr(opt)}</option>
            `).join('')}
          </select>
        </div>
        <div class="profile-field">
          <label for="candNotice">Notice Period</label>
          <input type="text" id="candNotice" value="${escapeAttr(p.noticePeriod || '')}" placeholder="e.g. 30 days, Immediate">
        </div>
        <div class="profile-field">
          <label for="candHospitalType">Preferred Employer Sector / Type</label>
          <select id="candHospitalType">
            <option value="">Select employer type</option>
            ${CANDIDATE_HOSPITAL_TYPES.map(opt => `
              <option value="${escapeAttr(opt)}" ${p.hospitalType === opt ? 'selected' : ''}>${escapeAttr(opt)}</option>
            `).join('')}
          </select>
        </div>
        <div class="profile-field">
          <label for="candVisaStatus">UAE Visa Status</label>
          <select id="candVisaStatus">
            <option value="">Select visa status</option>
            <option value="Employment Visa" ${p.visaStatus === 'Employment Visa' ? 'selected' : ''}>Employment Visa</option>
            <option value="Visit / Tourist Visa" ${p.visaStatus === 'Visit / Tourist Visa' ? 'selected' : ''}>Visit / Tourist Visa</option>
            <option value="Residence / Golden Visa" ${p.visaStatus === 'Residence / Golden Visa' ? 'selected' : ''}>Residence / Golden Visa</option>
            <option value="Citizen / GCC National" ${p.visaStatus === 'Citizen / GCC National' ? 'selected' : ''}>Citizen / GCC National</option>
            <option value="Need Sponsorship" ${p.visaStatus === 'Need Sponsorship' ? 'selected' : ''}>Need Sponsorship</option>
          </select>
        </div>
      </div>
    </section>

    <!-- SECTION 5: Preferred UAE Locations & Bio Summary -->
    <section class="profile-section-card" id="section-locations">
      <div class="section-head">
        <span class="section-eyebrow">LOCATIONS & SUMMARY</span>
        <h2 class="section-title"><span>📍</span> Preferred Work Locations & Summary</h2>
        <p class="section-subtitle">Select your target UAE Emirates to receive personalized job matches.</p>
      </div>

      <div class="profile-field" style="margin-bottom:24px;">
        <div class="location-header-row">
          <div class="location-label-wrap">
            <label style="margin-bottom:0;">Preferred UAE Work Locations</label>
            <span class="location-selected-badge" id="locationSelectedBadge">${selectedLocations.length} selected</span>
          </div>
          <div class="location-quick-actions">
            <button type="button" class="loc-quick-pill" id="locSelectAllBtn">Select All</button>
            <button type="button" class="loc-quick-pill" id="locTopHubsBtn">Dubai & Abu Dhabi</button>
            <button type="button" class="loc-quick-pill" id="locClearBtn">Clear</button>
          </div>
        </div>

        <div class="location-cards-grid" id="locationCardsGrid">
          ${CANDIDATE_LOCATIONS.map(loc => {
            const isSel = selectedLocations.includes(loc);
            return `
              <button type="button" class="location-card-btn ${isSel ? 'selected' : ''}" data-val="${escapeAttr(loc)}">
                <div class="loc-btn-left">
                  <span class="loc-pin-icon">📍</span>
                  <span class="loc-name">${escapeAttr(loc)}</span>
                </div>
                <span class="loc-check-circle">
                  <svg class="loc-check-svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="profile-field" style="margin-bottom:14px;">
        <div class="bio-header-row">
          <label for="candSummary" style="margin-bottom:0;">Professional Summary / Career Bio</label>
          <span class="bio-char-counter" id="bioCharCounter">${(p.summary || '').length} characters</span>
        </div>

        <div class="bio-templates-row">
          <span class="bio-template-label">✨ Quick Templates:</span>
          <button type="button" class="bio-template-chip" data-template="health">Healthcare Pro</button>
          <button type="button" class="bio-template-chip" data-template="it">Software / Tech</button>
          <button type="button" class="bio-template-chip" data-template="biz">Finance & Accounting</button>
          <button type="button" class="bio-template-chip" data-template="exec">Operations / HR</button>
        </div>

        <div class="bio-box-wrap">
          <textarea id="candSummary" class="bio-textarea" placeholder="Write a short summary of your professional background, key achievements, core skills, and UAE career goals...">${escapeAttr(p.summary || '')}</textarea>
          <div class="bio-box-footer">
            <span class="bio-tip-text">💡 Tip: Highlight your UAE credentials, key specializations, and availability for top recruiter discovery.</span>
            <button type="button" class="bio-clear-btn" id="bioClearBtn" title="Clear text" ${p.summary ? '' : 'style="display:none;"'}>✕ Clear</button>
          </div>
        </div>
      </div>
    </section>

  </div>

  <!-- Right Column: Sticky Sidebar -->
  <aside class="candidate-sidebar">
    <!-- Widget 1: Profile Completeness Meter -->
    <div class="sidebar-widget profile-strength-widget">
      <div class="strength-header">
        <span class="strength-title"><span>⚡</span> Profile Strength</span>
        <span class="strength-percent" id="strengthPercentText">${completion}% Completed</span>
      </div>
      <div class="strength-bar-bg">
        <div class="strength-bar-fill" id="strengthBarFill" style="width:${Math.max(5, completion)}%;"></div>
      </div>
      <p class="strength-tips" id="strengthTipsText">
        ${completion >= 85
          ? '✓ Excellent! Your candidate profile is verified and prioritized for top employers across the UAE.'
          : '💡 Complete all sections to reach 100% and get 3x more recruiter contacts and direct interview requests.'}
      </p>
      <div class="strength-checklist" id="strengthChecklist">
        <div class="strength-check-item ${p.name && p.phone && p.currentLocation ? 'done' : ''}">
          <span class="strength-check-icon">${p.name && p.phone && p.currentLocation ? '✓' : '○'}</span> Personal & Contact
        </div>
        <div class="strength-check-item ${p.role && p.experience ? 'done' : ''}">
          <span class="strength-check-icon">${p.role && p.experience ? '✓' : '○'}</span> Career Field & Role
        </div>
        <div class="strength-check-item ${p.qualification && p.degree ? 'done' : ''}">
          <span class="strength-check-icon">${p.qualification && p.degree ? '✓' : '○'}</span> Degree & Credentials
        </div>
        <div class="strength-check-item ${selectedLicenses.length > 0 || p.licenseStatus ? 'done' : ''}">
          <span class="strength-check-icon">${selectedLicenses.length > 0 || p.licenseStatus ? '✓' : '○'}</span> Certifications / Status
        </div>
        <div class="strength-check-item ${selectedLocations.length > 0 ? 'done' : ''}">
          <span class="strength-check-icon">${selectedLocations.length > 0 ? '✓' : '○'}</span> Target Locations
        </div>
      </div>
    </div>

    <!-- Widget 2: ATS CV Builder Promo Card -->
    <div class="sidebar-widget cv-promo-widget">
      <div class="cv-promo-header">
        <span class="cv-promo-badge">⚡ ATS Optimized</span>
      </div>
      <h3>Professional CV Builder</h3>
      <p>Convert your profile information into a clean, UAE-compliant PDF and Word résumé ready for recruiter applications.</p>
      <a href="/resume-library" class="cv-promo-btn">
        Create / Edit My CV →
      </a>
    </div>
  </aside>
</div>

<!-- Floating Save Button Bar on Scroll -->
<div class="floating-profile-save-bar" id="floatingSaveBar">
  <span>Profile workspace</span>
  <button type="button" class="floating-save-btn" id="floatingSaveBtn">
    <span>💾</span> Save Changes
  </button>
  <a href="#" class="floating-top-btn" id="floatingTopBtn">↑ Top</a>
</div>

    <!-- Role Picker Modal -->
    <div class="profile-modal-overlay" id="rolePickerModal" style="display:none;" role="dialog" aria-modal="true" aria-label="Select healthcare job role">
      <div class="profile-modal-sheet">
        <div class="modal-sheet-head">
          <h3>Choose Healthcare Role</h3>
          <button type="button" class="modal-close-btn" id="closeRoleModalBtn" aria-label="Close modal">✕</button>
        </div>
        <div class="modal-search-wrap">
          <input type="text" class="modal-search-input" id="roleSearchInput" placeholder="Search role (e.g. Staff Nurse, GP, Coder, Pharmacist...)" autofocus>
        </div>
        <div class="modal-tabs-row" id="roleCategoryTabs">
          <button type="button" class="modal-tab-pill active" data-cat="All">All Roles</button>
          ${CANDIDATE_CATEGORIES.map(cat => `<button type="button" class="modal-tab-pill" data-cat="${escapeAttr(cat)}">${escapeAttr(cat)}</button>`).join('')}
        </div>
        <div class="modal-list-body" id="roleModalList"></div>
      </div>
    </div>

    <!-- Country / Nationality Picker Modal -->
    <div class="profile-modal-overlay" id="countryPickerModal" style="display:none;" role="dialog" aria-modal="true" aria-label="Select country">
      <div class="profile-modal-sheet">
        <div class="modal-sheet-head">
          <h3 id="countryModalTitle">Select Country</h3>
          <button type="button" class="modal-close-btn" id="closeCountryModalBtn" aria-label="Close modal">✕</button>
        </div>
        <div class="modal-search-wrap">
          <input type="text" class="modal-search-input" id="countrySearchInput" placeholder="Search country name or calling code..." autofocus>
        </div>
        <div class="modal-list-body" id="countryModalList"></div>
      </div>
    </div>
  </main>`;
}

function initCandidateProfile() {
  const root = document.querySelector('.candidate-profile-shell');
  if (!root || !getCurrentUser()) return;

  const currentProf = getCurrentUser().profile || {};
  let currentCountryCode = (document.getElementById('phoneCodeDial')?.textContent || '+971').trim();
  let currentCountryFlag = (document.getElementById('phoneCodeFlag')?.textContent || '🇦🇪').trim();
  let currentNationalityName = document.getElementById('candNationality')?.value || '';
  let countryModalTarget = 'phone';

  const getProfileData = () => {
    const rawNumber = (document.getElementById('candPhoneNumber')?.value || '').trim();
    const phone = rawNumber ? `${currentCountryCode} ${rawNumber}` : '';
    const degreeSelect = document.getElementById('candDegreeSelect')?.value || '';
    const customDegree = (document.getElementById('candCustomDegree')?.value || '').trim();
    const degree = degreeSelect === 'Other' ? customDegree : degreeSelect;

    const qualSelect = document.getElementById('candQualification')?.value || '';
    const customQual = (document.getElementById('candCustomQual')?.value || '').trim();
    const qualification = qualSelect === 'Other Qualification' ? customQual : qualSelect;

    const selectedLicenses = Array.from(document.querySelectorAll('#licensePillsWrap .choice-pill.selected'))
      .map(btn => btn.dataset.val);
    const selectedLocations = Array.from(document.querySelectorAll('#locationCardsGrid .location-card-btn.selected'))
      .map(btn => btn.dataset.val);

    const langStr = document.getElementById('candLanguages')?.value || '';
    const languages = langStr.split(',').map(s => s.trim()).filter(Boolean);

    return {
      name: (document.getElementById('candName')?.value || '').trim(),
      email: getCurrentUser().email,
      phone,
      nationality: (document.getElementById('candNationality')?.value || '').trim(),
      currentLocation: (document.getElementById('candCurrentLocation')?.value || '').trim(),
      gender: document.getElementById('candGender')?.value || '',
      industry: document.getElementById('candIndustry')?.value || 'Information Technology & Software',
      category: document.getElementById('candCategory')?.value || 'Software & IT',
      role: (document.getElementById('candRole')?.value || '').trim(),
      currentDesignation: (document.getElementById('candDesignation')?.value || '').trim(),
      experience: document.getElementById('candExperience')?.value || '',
      qualification,
      degree,
      specialization: (document.getElementById('candSpecialization')?.value || '').trim(),
      university: (document.getElementById('candUniversity')?.value || '').trim(),
      licenses: selectedLicenses,
      licenseStatus: document.getElementById('candLicenseStatus')?.value || '',
      languages,
      previousEmployers: (document.getElementById('candEmployers')?.value || '').trim(),
      salaryExpectation: (document.getElementById('candSalary')?.value || '').trim(),
      availability: document.getElementById('candAvailability')?.value || '',
      noticePeriod: (document.getElementById('candNotice')?.value || '').trim(),
      hospitalType: document.getElementById('candHospitalType')?.value || '',
      visaStatus: document.getElementById('candVisaStatus')?.value || '',
      locations: selectedLocations,
      summary: (document.getElementById('candSummary')?.value || '').trim(),
      photo: getCurrentUser().avatar || currentProf.photo || ''
    };
  };

  const updateCompletionUI = () => {
    const pData = getProfileData();
    const score = calculateCandidateCompletion(pData);

    const percentText = document.getElementById('strengthPercentText');
    if (percentText) percentText.textContent = `${score}% Completed`;

    const barFill = document.getElementById('strengthBarFill');
    if (barFill) barFill.style.width = `${Math.max(5, score)}%`;

    const tipsText = document.getElementById('strengthTipsText');
    if (tipsText) {
      tipsText.textContent = score >= 85
        ? '✓ Excellent! Your candidate profile is verified and prioritized for top healthcare employers in the UAE.'
        : '💡 Complete your healthcare licenses, qualifications, and target locations to reach 100% and get 3x more recruiter contacts.';
    }

    const heroRole = document.getElementById('heroRoleMeta');
    if (heroRole) heroRole.textContent = `💼 ${pData.role || pData.currentDesignation || 'Healthcare Professional'}`;

    const heroLoc = document.getElementById('heroLocationMeta');
    if (heroLoc) heroLoc.textContent = `📍 ${pData.currentLocation || 'UAE'}`;

    const checklist = document.getElementById('strengthChecklist');
    if (checklist) {
      checklist.innerHTML = `
        <span class="strength-check-item ${pData.name && pData.phone && pData.currentLocation ? 'done' : ''}">
          ${pData.name && pData.phone && pData.currentLocation ? '✓' : '○'} Personal & Contact
        </span>
        <span class="strength-check-item ${pData.role && pData.experience ? 'done' : ''}">
          ${pData.role && pData.experience ? '✓' : '○'} Healthcare Role & Experience
        </span>
        <span class="strength-check-item ${pData.qualification && pData.degree ? 'done' : ''}">
          ${pData.qualification && pData.degree ? '✓' : '○'} Degree & Credentials
        </span>
        <span class="strength-check-item ${pData.licenses.length > 0 ? 'done' : ''}">
          ${pData.licenses.length > 0 ? '✓' : '○'} License (DHA/DOH/MOH/SCFHS)
        </span>
        <span class="strength-check-item ${pData.locations.length > 0 ? 'done' : ''}">
          ${pData.locations.length > 0 ? '✓' : '○'} Preferred Locations
        </span>
      `;
    }
  };

  root.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', updateCompletionUI);
    el.addEventListener('change', updateCompletionUI);
  });

  // Upgrade all profile-field selects into searchable custom selects matching the website
  const enhanceSelectWithSearch = (selectEl) => {
    if (!selectEl || selectEl.dataset.searchableEnhanced) return;
    selectEl.dataset.searchableEnhanced = 'true';
    selectEl.style.display = 'none';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-searchable-select';
    wrapper.dataset.selectId = selectEl.id || '';

    // Trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'css-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const selectedTextSpan = document.createElement('span');
    selectedTextSpan.className = 'css-selected-text';

    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('class', 'css-arrow');
    arrowSvg.setAttribute('viewBox', '0 0 24 24');
    arrowSvg.setAttribute('fill', 'none');
    arrowSvg.setAttribute('stroke', 'currentColor');
    arrowSvg.setAttribute('stroke-width', '2.2');
    arrowSvg.setAttribute('stroke-linecap', 'round');
    arrowSvg.setAttribute('stroke-linejoin', 'round');
    arrowSvg.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';

    trigger.appendChild(selectedTextSpan);
    trigger.appendChild(arrowSvg);

    // Dropdown panel
    const dropdown = document.createElement('div');
    dropdown.className = 'css-dropdown';

    // Search box in dropdown
    const searchBox = document.createElement('div');
    searchBox.className = 'css-search-box';
    searchBox.innerHTML = `
      <svg class="css-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" class="css-search-input" placeholder="Search option..." autocomplete="off">
      <button type="button" class="css-search-clear" style="display:none;" title="Clear">✕</button>
    `;

    const searchInput = searchBox.querySelector('.css-search-input');
    const searchClear = searchBox.querySelector('.css-search-clear');

    // Options list
    const listEl = document.createElement('ul');
    listEl.className = 'css-options-list';
    listEl.setAttribute('role', 'listbox');

    // Empty state
    const emptyEl = document.createElement('div');
    emptyEl.className = 'css-empty-state';
    emptyEl.style.display = 'none';

    dropdown.appendChild(searchBox);
    dropdown.appendChild(listEl);
    dropdown.appendChild(emptyEl);

    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);

    // Insert wrapper right after the original select
    selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

    const updateSelectedDisplay = () => {
      const selOpt = selectEl.options[selectEl.selectedIndex];
      const text = selOpt ? selOpt.text : '';
      const isPlaceholder = !selOpt || selOpt.value === '';
      selectedTextSpan.textContent = text || 'Select option';
      selectedTextSpan.classList.toggle('is-placeholder', isPlaceholder);

      listEl.querySelectorAll('.css-option').forEach(li => {
        const isSel = li.dataset.value === selectEl.value;
        li.classList.toggle('selected', isSel);
        const check = li.querySelector('.css-check');
        if (isSel && !check) {
          li.insertAdjacentHTML('beforeend', '<svg class="css-check" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>');
        } else if (!isSel && check) {
          check.remove();
        }
      });
    };

    const createOptionLi = (opt, groupName) => {
      const li = document.createElement('li');
      li.className = 'css-option';
      li.dataset.value = opt.value;
      li.setAttribute('role', 'option');
      if (groupName) li.dataset.group = groupName;

      const isSel = opt.selected || selectEl.value === opt.value;
      if (isSel) li.classList.add('selected');

      li.innerHTML = `
        <span class="css-opt-text">${escapeAttr(opt.text)}</span>
        ${isSel ? '<svg class="css-check" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
      `;

      li.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEl.value = opt.value;
        updateSelectedDisplay();
        closeDropdown();
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        selectEl.dispatchEvent(new Event('input', { bubbles: true }));
      });

      return li;
    };

    const renderOptions = () => {
      listEl.innerHTML = '';
      const children = Array.from(selectEl.children);
      children.forEach(child => {
        if (child.tagName === 'OPTGROUP') {
          const groupLi = document.createElement('li');
          groupLi.className = 'css-optgroup-label';
          groupLi.textContent = child.label;
          listEl.appendChild(groupLi);

          Array.from(child.children).forEach(opt => {
            listEl.appendChild(createOptionLi(opt, child.label));
          });
        } else if (child.tagName === 'OPTION') {
          listEl.appendChild(createOptionLi(child, null));
        }
      });
      updateSelectedDisplay();
    };

    const filterOptions = (query) => {
      const q = query.trim().toLowerCase();
      searchClear.style.display = q ? 'flex' : 'none';

      let matchCount = 0;
      const groupCounts = new Map();

      listEl.querySelectorAll('.css-option').forEach(li => {
        const text = li.querySelector('.css-opt-text')?.textContent?.toLowerCase() || '';
        const isMatch = !q || text.includes(q);
        li.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) matchCount++;

        const grp = li.dataset.group;
        if (grp) {
          groupCounts.set(grp, (groupCounts.get(grp) || 0) + (isMatch ? 1 : 0));
        }
      });

      listEl.querySelectorAll('.css-optgroup-label').forEach(labelEl => {
        const grpName = labelEl.textContent;
        const count = groupCounts.get(grpName) || 0;
        labelEl.style.display = count > 0 ? 'block' : 'none';
      });

      if (matchCount === 0) {
        emptyEl.style.display = 'block';
        emptyEl.innerHTML = `<span>🔍 No options matching "<strong>${escapeAttr(query)}</strong>"</span>`;
      } else {
        emptyEl.style.display = 'none';
      }
    };

    const openDropdown = () => {
      document.querySelectorAll('.custom-searchable-select.open').forEach(other => {
        if (other !== wrapper) other.classList.remove('open');
      });
      wrapper.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      searchInput.value = '';
      searchClear.style.display = 'none';
      filterOptions('');
      setTimeout(() => {
        searchInput.focus();
        const selectedLi = listEl.querySelector('.css-option.selected');
        if (selectedLi) {
          selectedLi.scrollIntoView({ block: 'nearest' });
        }
      }, 40);
    };

    const closeDropdown = () => {
      wrapper.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const toggleDropdown = () => {
      if (wrapper.classList.contains('open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    };

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown();
    });

    searchInput.addEventListener('input', () => {
      filterOptions(searchInput.value);
    });

    searchClear.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      searchInput.value = '';
      filterOptions('');
      searchInput.focus();
    });

    selectEl.addEventListener('change', () => {
      updateSelectedDisplay();
    });

    renderOptions();
  };

  root.querySelectorAll('.profile-field select').forEach(enhanceSelectWithSearch);

  // Close custom dropdowns on outside click or Escape
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-searchable-select')) {
      document.querySelectorAll('.custom-searchable-select.open').forEach(w => {
        w.classList.remove('open');
        w.querySelector('.css-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-searchable-select.open').forEach(w => {
        w.classList.remove('open');
        w.querySelector('.css-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  const degreeSelect = document.getElementById('candDegreeSelect');
  const customDegreeInput = document.getElementById('candCustomDegree');
  if (degreeSelect && customDegreeInput) {
    degreeSelect.addEventListener('change', () => {
      customDegreeInput.style.display = degreeSelect.value === 'Other' ? 'block' : 'none';
      if (degreeSelect.value === 'Other') customDegreeInput.focus();
    });
  }

  const qualSelect = document.getElementById('candQualification');
  const customQualInput = document.getElementById('candCustomQual');
  if (qualSelect && customQualInput) {
    qualSelect.addEventListener('change', () => {
      customQualInput.style.display = qualSelect.value === 'Other Qualification' ? 'block' : 'none';
      if (qualSelect.value === 'Other Qualification') customQualInput.focus();
    });
  }

  const sameAsRoleChip = document.getElementById('sameAsRoleChip');
  if (sameAsRoleChip) {
    sameAsRoleChip.addEventListener('click', () => {
      const role = document.getElementById('candRole')?.value || '';
      const designationInput = document.getElementById('candDesignation');
      if (designationInput && role) {
        designationInput.value = role;
        updateCompletionUI();
      }
    });
  }

  document.getElementById('candIndustry')?.addEventListener('change', updateCompletionUI);
  document.getElementById('candCategory')?.addEventListener('change', updateCompletionUI);
  document.getElementById('candExperience')?.addEventListener('change', updateCompletionUI);

  const licenseWrap = document.getElementById('licensePillsWrap');
  if (licenseWrap) {
    licenseWrap.querySelectorAll('.choice-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const isSel = btn.classList.toggle('selected');
        const icon = btn.querySelector('.choice-pill-icon');
        if (isSel && !icon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'choice-pill-icon';
          iconSpan.textContent = '✓';
          btn.prepend(iconSpan);
        } else if (!isSel && icon) {
          icon.remove();
        }
        updateCompletionUI();
      });
    });
  }

  // Location Cards & Quick Select Actions
  const locGrid = document.getElementById('locationCardsGrid');
  const locBadge = document.getElementById('locationSelectedBadge');

  const updateLocationBadge = () => {
    if (!locGrid || !locBadge) return;
    const count = locGrid.querySelectorAll('.location-card-btn.selected').length;
    locBadge.textContent = `${count} selected`;
    locBadge.classList.toggle('has-selection', count > 0);
  };

  if (locGrid) {
    locGrid.querySelectorAll('.location-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        updateLocationBadge();
        updateCompletionUI();
      });
    });

    document.getElementById('locSelectAllBtn')?.addEventListener('click', () => {
      locGrid.querySelectorAll('.location-card-btn').forEach(b => b.classList.add('selected'));
      updateLocationBadge();
      updateCompletionUI();
    });

    document.getElementById('locTopHubsBtn')?.addEventListener('click', () => {
      locGrid.querySelectorAll('.location-card-btn').forEach(b => {
        const val = b.dataset.val;
        b.classList.toggle('selected', val === 'Dubai' || val === 'Abu Dhabi');
      });
      updateLocationBadge();
      updateCompletionUI();
    });

    document.getElementById('locClearBtn')?.addEventListener('click', () => {
      locGrid.querySelectorAll('.location-card-btn').forEach(b => b.classList.remove('selected'));
      updateLocationBadge();
      updateCompletionUI();
    });

    updateLocationBadge();
  }

  // Bio Summary Character Counter & Quick Templates
  const summaryEl = document.getElementById('candSummary');
  const bioCounter = document.getElementById('bioCharCounter');
  const bioClearBtn = document.getElementById('bioClearBtn');

  const updateBioCounter = () => {
    if (!summaryEl || !bioCounter) return;
    const len = summaryEl.value.length;
    bioCounter.textContent = `${len} characters${len >= 120 ? ' (Strong)' : len >= 50 ? ' (Good)' : ''}`;
    if (bioClearBtn) bioClearBtn.style.display = len > 0 ? 'inline-flex' : 'none';
  };

  if (summaryEl) {
    summaryEl.addEventListener('input', () => {
      updateBioCounter();
      updateCompletionUI();
    });

    if (bioClearBtn) {
      bioClearBtn.addEventListener('click', () => {
        summaryEl.value = '';
        updateBioCounter();
        updateCompletionUI();
        summaryEl.focus();
      });
    }

    const bioTemplates = {
      health: "Dedicated Healthcare Professional with 4+ years of clinical experience in high-volume hospital environments. Licensed/eligible with UAE credentials (DHA/DOH/MOH), committed to exceptional patient care and clinical quality standards.",
      it: "Results-driven Software Engineer with 4+ years experience developing resilient web platforms and cloud-native services. Skilled in modern JavaScript/TypeScript architectures, APIs, and eager to contribute to forward-thinking UAE tech teams.",
      biz: "Detail-oriented Finance & Accounting Professional with 5+ years expertise in financial modeling, compliance, VAT/tax reporting, and strategic audit across diverse Middle Eastern business environments.",
      exec: "Accomplished Operations & HR Specialist with proven track record in talent acquisition, workforce planning, and organizational efficiency aligned with UAE labor laws and corporate standards."
    };

    document.querySelectorAll('.bio-template-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.template;
        if (bioTemplates[key]) {
          summaryEl.value = bioTemplates[key];
          updateBioCounter();
          updateCompletionUI();
          summaryEl.focus();
        }
      });
    });

    updateBioCounter();
  }

  const photoInput = document.getElementById('candPhotoInput');
  if (photoInput) {
    photoInput.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = async () => {
          const size = 240;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const crop = Math.min(img.width, img.height);
          const x = (img.width - crop) / 2;
          const y = (img.height - crop) / 2;
          ctx.drawImage(img, x, y, crop, crop, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

          getCurrentUser().avatar = dataUrl;
          if (!getCurrentUser().profile) getCurrentUser().profile = {};
          getCurrentUser().profile.photo = dataUrl;

          const avatarImg = document.getElementById('candAvatarImg');
          const avatarInitial = document.getElementById('candAvatarInitial');
          if (avatarImg) {
            avatarImg.src = dataUrl;
          } else if (avatarInitial && avatarInitial.parentElement) {
            avatarInitial.outerHTML = `<img id="candAvatarImg" src="${dataUrl}" alt="Candidate Avatar">`;
          }

          const headerAvatar = document.querySelector('.nav-profile-photo');
          if (headerAvatar) headerAvatar.innerHTML = `<img src="${dataUrl}" alt="">`;

          updateCompletionUI();

          try {
            const photoRes = await fetch('/api/candidate/photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photo: dataUrl })
            });
            const photoData = await photoRes.json();
            if (photoRes.ok) {
              showToast('Profile photo updated and saved successfully!', 'success');
            } else {
              showToast(photoData.error || 'Photo updated locally. Click "Save Profile" to apply.', 'info');
            }
          } catch {
            showToast('Profile photo selected. Click "Save Profile" to finish saving.', 'info');
          }
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // ROLE PICKER MODAL
  const roleModal = document.getElementById('rolePickerModal');
  const roleBtn = document.getElementById('candRoleBtn');
  const closeRoleBtn = document.getElementById('closeRoleModalBtn');
  const roleSearch = document.getElementById('roleSearchInput');
  const roleTabs = document.getElementById('roleCategoryTabs');
  const roleList = document.getElementById('roleModalList');
  let currentCatFilter = 'All';

  const renderRoleList = () => {
    if (!roleList) return;
    const q = (roleSearch?.value || '').trim().toLowerCase();
    const currentRole = (document.getElementById('candRole')?.value || '').toLowerCase();

    const matches = CANDIDATE_TRACKED_ROLES.filter(item => {
      const matchCat = currentCatFilter === 'All' || item.category === currentCatFilter;
      const matchQ = !q || item.role.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    let html = '';
    if (q && !matches.some(m => m.role.toLowerCase() === q)) {
      html += `
        <button type="button" class="modal-list-item custom-role-item" style="background:#fef2f2;border:1px dashed #f87171;color:#b00008;margin-bottom:8px;">
          <span><strong>+ Use custom role: “${escapeAttr(roleSearch.value.trim())}”</strong></span>
          <small>Select</small>
        </button>
      `;
    }

    html += matches.map(item => {
      const isSelected = item.role.toLowerCase() === currentRole;
      return `
        <button type="button" class="modal-list-item ${isSelected ? 'selected' : ''}" data-role="${escapeAttr(item.role)}" data-cat="${escapeAttr(item.category)}">
          <span><strong>${escapeAttr(item.role)}</strong> <small style="color:#64748b;margin-left:6px;">${escapeAttr(item.category)}</small></span>
          ${isSelected ? '<span style="color:#b00008;font-weight:700;">✓</span>' : ''}
        </button>
      `;
    }).join('');

    if (!html) {
      html = `<div style="text-align:center;padding:24px;color:#64748b;">No roles found matching “${escapeAttr(q)}”. Type custom role above.</div>`;
    }

    roleList.innerHTML = html;

    roleList.querySelectorAll('.modal-list-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosenRole = btn.classList.contains('custom-role-item')
          ? roleSearch.value.trim()
          : (btn.dataset.role || '');
        const chosenCat = btn.dataset.cat || '';

        const roleHidden = document.getElementById('candRole');
        const roleBtnText = document.getElementById('candRoleBtnText');
        if (roleHidden) roleHidden.value = chosenRole;
        if (roleBtnText) roleBtnText.textContent = `💼 ${chosenRole}`;
        if (roleBtn) roleBtn.classList.remove('empty');

        const desigInput = document.getElementById('candDesignation');
        if (desigInput && !desigInput.value.trim()) {
          desigInput.value = chosenRole;
        }

        if (chosenCat) {
          const categorySelect = document.getElementById('candCategory');
          if (categorySelect && [...categorySelect.options].some(option => option.value === chosenCat)) categorySelect.value = chosenCat;
        }

        roleModal.style.display = 'none';
        updateCompletionUI();
      });
    });
  };

  if (roleBtn && roleModal) {
    roleBtn.addEventListener('click', () => {
      roleModal.style.display = 'flex';
      if (roleSearch) {
        roleSearch.value = '';
        setTimeout(() => roleSearch.focus(), 50);
      }
      currentCatFilter = 'All';
      if (roleTabs) {
        roleTabs.querySelectorAll('.modal-tab-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === 'All'));
      }
      renderRoleList();
    });
  }

  if (closeRoleBtn && roleModal) {
    closeRoleBtn.addEventListener('click', () => { roleModal.style.display = 'none'; });
    roleModal.addEventListener('click', e => { if (e.target === roleModal) roleModal.style.display = 'none'; });
  }

  if (roleSearch) {
    roleSearch.addEventListener('input', renderRoleList);
  }

  if (roleTabs) {
    roleTabs.querySelectorAll('.modal-tab-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        roleTabs.querySelectorAll('.modal-tab-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCatFilter = pill.dataset.cat || 'All';
        renderRoleList();
      });
    });
  }

  // COUNTRY & NATIONALITY MODAL
  const countryModal = document.getElementById('countryPickerModal');
  const countryModalTitle = document.getElementById('countryModalTitle');
  const countrySearch = document.getElementById('countrySearchInput');
  const countryList = document.getElementById('countryModalList');
  const closeCountryBtn = document.getElementById('closeCountryModalBtn');
  const phoneBtn = document.getElementById('phoneCodeBtn');
  const natBtn = document.getElementById('candNationalityBtn');

  const renderCountryList = () => {
    if (!countryList) return;
    const q = (countrySearch?.value || '').trim().toLowerCase();
    const matches = CANDIDATE_COUNTRIES.filter(c => !q || c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q));

    countryList.innerHTML = matches.map(c => `
      <button type="button" class="modal-list-item" data-code="${c.code}" data-name="${escapeAttr(c.name)}" data-dial="${c.dial}" data-flag="${c.flag}">
        <span><strong style="font-size:17px;margin-right:8px;">${c.flag}</strong> ${escapeAttr(c.name)}</span>
        <span style="font-size:13px;color:#64748b;font-weight:600;">${countryModalTarget === 'phone' ? c.dial : c.code}</span>
      </button>
    `).join('');

    countryList.querySelectorAll('.modal-list-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const flag = btn.dataset.flag || '';
        const dial = btn.dataset.dial || '';
        const name = btn.dataset.name || '';

        if (countryModalTarget === 'phone') {
          currentCountryCode = dial;
          currentCountryFlag = flag;
          const phoneFlagEl = document.getElementById('phoneCodeFlag');
          const phoneDialEl = document.getElementById('phoneCodeDial');
          if (phoneFlagEl) phoneFlagEl.textContent = flag;
          if (phoneDialEl) phoneDialEl.textContent = dial;
        } else {
          currentNationalityName = name;
          const natInput = document.getElementById('candNationality');
          const natText = document.getElementById('nationalityBtnText');
          if (natInput) natInput.value = name;
          if (natText) natText.textContent = `${flag} ${name}`;
          if (natBtn) natBtn.classList.remove('empty');
        }

        countryModal.style.display = 'none';
        updateCompletionUI();
      });
    });
  };

  if (phoneBtn && countryModal) {
    phoneBtn.addEventListener('click', () => {
      countryModalTarget = 'phone';
      if (countryModalTitle) countryModalTitle.textContent = 'Select Calling Code';
      countryModal.style.display = 'flex';
      if (countrySearch) {
        countrySearch.value = '';
        setTimeout(() => countrySearch.focus(), 50);
      }
      renderCountryList();
    });
  }

  if (natBtn && countryModal) {
    natBtn.addEventListener('click', () => {
      countryModalTarget = 'nationality';
      if (countryModalTitle) countryModalTitle.textContent = 'Select Nationality';
      countryModal.style.display = 'flex';
      if (countrySearch) {
        countrySearch.value = '';
        setTimeout(() => countrySearch.focus(), 50);
      }
      renderCountryList();
    });
  }

  if (closeCountryBtn && countryModal) {
    closeCountryBtn.addEventListener('click', () => { countryModal.style.display = 'none'; });
    countryModal.addEventListener('click', e => { if (e.target === countryModal) countryModal.style.display = 'none'; });
  }

  if (countrySearch) {
    countrySearch.addEventListener('input', renderCountryList);
  }

  const showToast = (msg, type = 'success') => {
    const existing = document.querySelector('.profile-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `profile-toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${escapeAttr(msg)}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  };

  const saveProfile = async (btn) => {
    if (!getCurrentUser()) return;
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span> Saving profile…`;
    }

    try {
      const payload = getProfileData();
      const res = await fetch('/api/candidate/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save candidate profile');

      getCurrentUser().profile = data.profile;
      getCurrentUser().completionPercentage = data.completionPercentage;
      if (data.profile.name) getCurrentUser().name = data.profile.name;
      if (data.profile.photo) getCurrentUser().avatar = data.profile.photo;

      const isComplete = data.completionPercentage >= 85;
      const navBadge = document.querySelector('.nav-profile-badge');
      if (navBadge) {
        if (isComplete) navBadge.remove();
        else navBadge.setAttribute('title', `Profile ${data.completionPercentage}% complete`);
      }

      updateCompletionUI();
      showToast('Profile saved successfully! Your candidate profile is updated.', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Error saving profile', 'error');
      return false;
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  };

  const heroSaveBtn = document.getElementById('saveProfileHeroBtn');
  if (heroSaveBtn) heroSaveBtn.addEventListener('click', () => saveProfile(heroSaveBtn));

  // Section Navigation Tabs
  const tabPills = document.querySelectorAll('.candidate-section-tabs .tab-pill');
  tabPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = pill.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        tabPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Floating save bar on scroll
  const floatingSaveBar = document.getElementById('floatingSaveBar');
  const floatingSaveBtn = document.getElementById('floatingSaveBtn');
  const floatingTopBtn = document.getElementById('floatingTopBtn');
  if (floatingSaveBar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        floatingSaveBar.classList.add('visible');
      } else {
        floatingSaveBar.classList.remove('visible');
      }
    }, { passive: true });
  }
  if (floatingSaveBtn) {
    floatingSaveBtn.addEventListener('click', () => saveProfile(floatingSaveBtn));
  }
  if (floatingTopBtn) {
    floatingTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active section indicator on scroll
  const profileSections = document.querySelectorAll('.candidate-main-content .profile-section-card');
  if ('IntersectionObserver' in window && profileSections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tabPills.forEach(pill => {
            pill.classList.toggle('active', pill.dataset.target === id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    profileSections.forEach(sec => observer.observe(sec));
  }

  // Add individual quick Save button to each section card header
  document.querySelectorAll('.profile-section-card').forEach((section, index) => {
    const sectionHead = section.querySelector('.section-head');
    if (!sectionHead) return;

    const controls = document.createElement('div');
    controls.className = 'section-edit-controls';
    controls.style.position = 'absolute';
    controls.style.top = '0';
    controls.style.right = '0';
    controls.innerHTML = `
      <button type="button" class="section-save-btn" style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;color:#475569;cursor:pointer;transition:all 0.15s ease;">Save Section</button>
    `;
    sectionHead.style.position = 'relative';
    sectionHead.appendChild(controls);

    const sectionSaveBtn = controls.querySelector('.section-save-btn');
    sectionSaveBtn.addEventListener('mouseenter', () => {
      sectionSaveBtn.style.background = '#b00008';
      sectionSaveBtn.style.color = '#ffffff';
      sectionSaveBtn.style.borderColor = '#b00008';
    });
    sectionSaveBtn.addEventListener('mouseleave', () => {
      sectionSaveBtn.style.background = '#f8fafc';
      sectionSaveBtn.style.color = '#475569';
      sectionSaveBtn.style.borderColor = '#e2e8f0';
    });
    sectionSaveBtn.addEventListener('click', async () => {
      await saveProfile(sectionSaveBtn);
    });
  });

  // Dashboard Sign Out
  document.getElementById('dashboardLogoutBtn')?.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.href = '/';
  });
}


return { candidateProfileWorkspace, initCandidateProfile };
}
