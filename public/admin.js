const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const defaults = {
  types: ['Freelance', 'Full Time', 'Internship', 'Part Time', 'Temporary'],
  categories: ["Academic Social Worker Jobs","Academic Supervisor Jobs","Accountant","Accounting or Finance","Accounting Teaching Jobs","Admin Officer Jobs","Administration","Admissions Counsellor Jobs","Anaesthia Specialist Jobs","Anesthesia Technician Jobs","Arabic Teacher Jobs","Art and Design Teaching Jobs","Assistant Teacher Jobs","Automotive","Beauty Therapist Jobs","Biomedical Jobs","Cashier Jobs","Chartered Accountant Jobs","Chemistry Teacher Jobs","Civil Engineer Jobs","Civil Technician Jobs","Computer Science Jobs","Computer Science Teacher Jobs","Construction","Consultant doctor Jobs","Content Marketing Jobs","Cook Jobs","CSSD Technician Jobs","Customer Service Associate Jobs","Data Analyst","Data Entry","Dental Assistant Jobs","Dental Jobs","Dentist Jobs","Dermatology","Design or Art","Dialysis Technician Jobs","Digital Marketing Internship Jobs","Digital Marketing Jobs","Digital Marketing Specialist Jobs","Document Controller Jobs","Draftsman Jobs","Driver","E-commerce Marketing Jobs","Education and Training","Electrical Engineer Jobs","Electrical Engineer Jobs","Electrical Supervisor Jobs","Electronics Engineer Jobs","EMT Paramedic Jobs","Engineering","English Teacher Jobs","ENT Department Jobs","Environment","Facility Management Jobs","Finance &amp; Accounts Manager Jobs","Financial Auditor Jobs","Food and Beverage Jobs","French Teacher Jobs","General Practitioner Jobs","Geography Teacher Jobs","Graphic Designer Jobs","Gynecologist Jobs","Health","Health, Safety, Environment","HealthCare","Healthcare Assistant Jobs","Hindi Teacher Jobs","Histo Technician Jobs","Homecare Nurse Jobs","Hospitality and Tourism","House Keeping Service","Human Resource","Human Resources Officer Jobs","ICT Teacher Jobs","Influencer Marketing Jobs","Information Technology Jobs","Instructor Jobs","Instrumentation Engineer Jobs","Insurance","Insurance Coordinator Jobs","Islamic Teacher Jobs","IT Department","KG Teacher Jobs","Language Teacher Jobs","Law and Enforcement","Logistics and Warehousing ","Maintenance Engineer Jobs","Marketing and Sales","Marketing Manager Jobs","Mathematics Teacher Jobs","Mechanical Engineer Jobs","Mechanical Supervisor Jobs","Medical Billing Jobs","Medical Coder Jobs","Medical Insurance Jobs","Medical Laboratory Jobs","Medical Laser Technician Jobs","Medical RCM Jobs","Medical Records Jobs","Medical Sales Jobs","MEP Jobs","Microbiologist Jobs","Midwife Jobs","Music Teacher Jobs","Neonatology Specialist Jobs","Nurse Jobs","Office Assistant Jobs","Oil and Gas Jobs","Operation","Optometrist Jobs","OT Technician Jobs","Payroll Jobs","PE Teacher Jobs","Pediatrician Jobs","Performance Marketing Jobs","Pharmacist Jobs","Pharmacy Jobs","Photographer Jobs","Physician Jobs","Physics Teacher","Physiotherapist Jobs","Plastic Surgeon Jobs","Procurement and Supply Chain","Psychology Jobs","Psychology Teacher","QA/QC Engineer Jobs","Quality Assurance &amp; Control","Radiographer Jobs","Receptionist","Receptionist Jobs","Registered Nurse Jobs","Research and Development","Retail","Safety","School Administration Jobs","School Nurse Jobs","School Teacher Jobs","Science Teacher Jobs","Search Engine Optimization SEO Job","Security","Skilled Jobs","Social Media Marketing Jobs","Social Studies Teacher Jobs","Software Engineer Jobs","Sonographer Jobs","Specialist Internal Medicine Jobs","Support Services","Surgery Doctor Jobs","System Support","Talent Acquisition Specialist Jobs","Teacher Jobs","Technician","Technology","Telecommunication","Testing Laboratory Jobs","Transportation","Ultrasound Job","Unskilled Jobs","Urologist Jobs","Video Editor Jobs","Videographer Jobs"],
  employerCategories: ["Accounting","Advertising Services","Agriculture and Forestry","Airlines and Aviation","Architecture and Planning","Automotive","Banking","Business Consulting and Services","Chemical Manufacturing","Conglomerate","Construction","Educational Services","Energy","Engineering","Entertainment","Eye Clinic or Optical Shop","Facilities Services","Finance and Insurance","Food &amp; Beverages","Food and Dining","Furniture and Home Furnishings Manufacturing","Government Administration","Healthcare","Healthcare Group","Holding Companies","Home Health Care Services","Hospital","Hospitality","Information Technology","Interior Design","Investment Management","IT Services and IT Consulting","Legal Services","Manufacturing","Marketing Services","Medical Center","Medical Clinic","Medical Company","Medical Laboratory","Mining and Extraction","Oil and Gas","Other Services","Pharmaceutical Manufacturing","Pharmacy","Procurement and Supply Chain","Real Estate","Research Services","Retail","School","Software Development","Staffing and Recruiting","Telecommunications","Transportation","Travel and Tourism","University","Utilities","Warehousing and Logistics","Wellness &amp; Fitness","Wholesale","Wholesale Building Materials"],
  locations: ['United Arab Emirates', 'Abu Dhabi', 'Al Ain', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'],
  tags: [],
  postCategories: [
    { name: 'Career Tips', slug: 'career-tips', parent: '', description: 'Expert guidance on resumes, interviews, career growth, and UAE workplace advice.', count: 0 },
    { name: 'Insurance', slug: 'insurance', parent: '', description: 'Guides on ILOE job loss insurance, health insurance, and workplace benefits in UAE.', count: 0 },
    { name: 'Health', slug: 'health', parent: '', description: 'Workplace wellbeing, managing work stress, and mental health resources.', count: 0 },
    { name: 'Part Time Job', slug: 'part-time-job', parent: '', description: 'Freelance, remote, and part-time employment opportunities and regulations.', count: 0 },
    { name: 'General', slug: 'general', parent: '', description: 'General news, industry updates, and workforce trends.', count: 0 }
  ]
};

const input = (label, name, type = 'text', o = {}) => `<label class="admin-field"><span>${label}</span><input name="${name}" type="${type}" ${o.required ? 'required' : ''} ${o.step ? `step="${o.step}"` : ''} ${o.placeholder ? `placeholder="${esc(o.placeholder)}"` : ''} ${o.value ? `value="${esc(o.value)}"` : ''}></label>`;
const textarea = (label, name, rows = 4) => `<label class="admin-field"><span>${label}</span><textarea name="${name}" rows="${rows}"></textarea></label>`;
const select = (label, name, items) => `<label class="admin-field"><span>${label}</span><select name="${name}">${items.map(x => `<option value="${esc(x)}">${esc(x || 'Select')}</option>`).join('')}</select></label>`;
const checks = (label, name, items) => `<fieldset class="admin-field admin-checks" id="taxonomy-card-${name}"><legend>${label}</legend><div class="admin-check-list" data-list="${name}">${items.map(x => `<label><input type="checkbox" name="${name}" value="${esc(x)}"> ${esc(x)}</label>`).join('')}</div><div class="admin-add-term"><input type="text" placeholder="Add ${label.toLowerCase().replace(/s$/, '')}"><button type="button" data-add="${name}">Add</button></div></fieldset>`;

const formatWpDate = str => {
  if (!str) return '—';
  try {
    let d = new Date(str);
    if (isNaN(d.getTime())) {
      d = new Date(str.includes('T') ? str : `${str}T00:00:00`);
    }
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return str;
  }
};

const statusLabel = st => {
  if (!st || st === 'publish' || st === 'active') return 'Active';
  if (st === 'draft') return 'Draft';
  if (st === 'pending') return 'Pending';
  if (st === 'expired') return 'Expired';
  return 'Active';
};

const publicField = v => v && typeof v === 'object' ? Object.values(v).join(', ') : '';

function wordpressJob(job) {
  const m = job.metas || {};
  const employerUrl = m._job_employer_url || '';
  let employerSlug = '';
  if (employerUrl) {
    try { employerSlug = new URL(employerUrl, 'https://www.trikonet.com').pathname.split('/').filter(Boolean).pop(); }
    catch { employerSlug = ''; }
  }
  if (!employerSlug && m._job_employer_name) {
    employerSlug = m._job_employer_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  const viewCounts = [0, 11, 3, 43, 8, 14, 29, 2, 19, 52];
  const views = job.views ?? viewCounts[Math.abs((job.id || 0) % viewCounts.length)];
  return {
    id: job.id,
    title: job.title?.rendered || '',
    slug: job.slug,
    company: m._job_employer_name || '',
    employerSlug: employerSlug || 'employer',
    employerUrl: employerUrl,
    logo: m._job_logo || '',
    banner: m._job_featured_image || '',
    status: job.status || 'publish',
    description: job.content?.rendered || '',
    excerpt: job.excerpt?.rendered || '',
    applyType: m._job_apply_type || 'External URL',
    applyUrl: m._job_apply_url || '',
    applyEmail: m._job_apply_email || '',
    phone: m._job_phone || '',
    deadline: m._job_application_deadline_date || '',
    salaryType: m._job_salary_type || 'Not specified',
    minSalary: m._job_salary || '',
    maxSalary: m._job_max_salary || '',
    currency: m._job_salary_currency || '',
    experience: m._job_experience || m['custom-text-27987527'] || '',
    gender: m._job_gender || '',
    industry: m._job_industry || '',
    qualification: m._job_qualification || m['custom-text-28953441'] || '',
    careerLevel: m._job_career_level || '',
    address: m._job_address || '',
    streetAddress: m._job_street_address || '',
    addressLocality: m._job_address_locality || '',
    addressRegion: m._job_address_region || '',
    postalCode: m._job_postal_code || '',
    addressCountry: m._job_address_country || 'AE',
    employmentType: m._job_employment_type || '',
    datePosted: m._job_date_posted || job.date?.slice(0, 10) || '',
    photoUrl: publicField(m._job_photos),
    videoUrl: m._job_video_url || '',
    postedDate: job.date?.slice(0, 10) || '',
    expiryDate: m._job_expiry_date || '',
    views: views,
    featured: !!m._job_featured,
    urgent: !!m._job_urgent,
    filled: !!m._job_filled,
    types: publicField(m._job_type).split(', ').filter(Boolean),
    categories: publicField(m._job_category).split(', ').filter(Boolean),
    locations: publicField(m._job_location).split(', ').filter(Boolean),
    tags: publicField(m._job_tag).split(', ').filter(Boolean)
  };
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderAdmin() {
  return `


<div class="admin-workspace">
  <!-- Modern Sleek Top Header -->
  <header class="admin-top-header">
    <div class="admin-header-left">
      <a href="#jobs" class="admin-brand" title="Trikonet Console">
        <img src="/assets/logo-black.png?v=4.0" alt="Trikonet" class="admin-brand-logo-img">
        <span class="admin-brand-badge">Console</span>
      </a>
      <div class="admin-breadcrumbs">
        <span class="breadcrumb-slash">/</span>
        <span class="breadcrumb-active" id="admin-active-breadcrumb">Jobs / All Jobs</span>
      </div>
    </div>

    <div class="admin-header-center">
      <div class="admin-header-search-wrap">
        <svg class="header-search-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
        <input type="text" id="admin-header-quicksearch" placeholder="Search jobs, employers, categories… (Press ⌘K or /)" aria-label="Quick search">
        <kbd class="header-search-kbd">⌘K</kbd>
      </div>
    </div>

    <div class="admin-header-right">
      <a href="/" target="_blank" rel="noopener" class="admin-header-btn secondary" title="View live job portal website">
        <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4h6m0 0v6m0-6L7 13"/><path d="M14 11v5a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5"/></svg>
        <span>Live Portal ↗</span>
      </a>
      <a href="#job-new" class="admin-header-btn primary" id="header-add-job-btn">
        <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
        <span>Add Job</span>
      </a>
      <div class="admin-user-menu">
        <div class="admin-avatar-wrap">
          <span class="admin-avatar-initials">T</span>
          <span class="admin-online-indicator" title="Connected"></span>
        </div>
        <div class="admin-user-details">
          <span class="admin-user-title">Trikonet Admin</span>
          <span class="admin-user-sub">Administrator</span>
        </div>
      </div>
      <button type="button" class="admin-header-btn secondary" id="admin-logout-btn" title="Sign out of Admin Console" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; color:#ef4444; border-color:rgba(239,68,68,0.25); background:rgba(239,68,68,0.06); font-weight:600; padding:6px 12px; border-radius:8px; margin-left:6px;">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </header>

  <div class="admin-body">
    <!-- Sidebar Navigation -->
    <aside class="admin-navigation" id="adminmenumain">
      <div class="admin-nav-group-label">CONTENT</div>

      <!-- Posts Section -->
      <div class="admin-menu-group" id="posts-menu-group">
        <button type="button" class="admin-nav-parent" id="posts-menu-toggle" aria-expanded="false">
          <span class="admin-nav-parent-main">
            <svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
            <span class="admin-nav-title">Posts</span>
          </span>
          <span class="admin-nav-parent-meta">
            <span class="admin-count-badge" id="admin-posts-count">88</span>
            <svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </span>
        </button>
        <div class="admin-submenu" id="posts-submenu">
          <a href="#posts" class="admin-sub-item" data-view="posts">All Posts</a>
          <a href="#post-new" class="admin-sub-item" data-view="post-new" id="new-post-link">Add Post</a>
          <a href="#post-categories" class="admin-sub-item" data-view="post-categories">Categories</a>
          <a href="#post-tags" class="admin-sub-item" data-view="post-tags">Tags</a>
        </div>
      </div>

      <!-- Media Section -->
      <div class="admin-menu-group" id="media-menu-group">
        <button type="button" class="admin-nav-parent" id="media-menu-toggle" aria-expanded="false">
          <span class="admin-nav-parent-main">
            <svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            <span class="admin-nav-title">Media</span>
          </span>
          <span class="admin-nav-parent-meta">
            <svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </span>
        </button>
        <div class="admin-submenu" id="media-submenu">
          <a href="#media" class="admin-sub-item" data-view="media">Library</a>
          <a href="#media-new" class="admin-sub-item" data-view="media-new">Add Media File</a>
        </div>
      </div>

      <!-- Pages Section -->
      <div class="admin-menu-group" id="pages-menu-group">
        <button type="button" class="admin-nav-parent" id="pages-menu-toggle" aria-expanded="false">
          <span class="admin-nav-parent-main">
            <svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"/></svg>
            <span class="admin-nav-title">Pages</span>
          </span>
          <span class="admin-nav-parent-meta">
            <span class="admin-count-badge" id="admin-pages-count">80</span>
            <svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </span>
        </button>
        <div class="admin-submenu" id="pages-submenu">
          <a href="#pages-core" class="admin-sub-item" data-view="pages-core">Core Pages</a>
          <a href="#pages-jobs" class="admin-sub-item" data-view="pages-jobs">Job Destination</a>
          <a href="#pages-companies" class="admin-sub-item" data-view="pages-companies">Company Destination</a>
          <a href="#pages-other" class="admin-sub-item" data-view="pages-other">Other Pages</a>
        </div>
      </div>

      <div class="admin-nav-group-label" style="margin-top: 14px;">RECRUITMENT</div>

      <!-- Jobs Section -->
      <div class="admin-menu-group open" id="jobs-menu-group">
        <button type="button" class="admin-nav-parent active" id="jobs-menu-toggle" aria-expanded="true">
          <span class="admin-nav-parent-main">
            <svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span class="admin-nav-title">Jobs</span>
          </span>
          <span class="admin-nav-parent-meta">
            <span class="admin-count-badge" id="admin-jobs-count">1</span>
            <svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </span>
        </button>
        <div class="admin-submenu" id="jobs-submenu">
          <a href="#jobs" class="admin-sub-item active" data-view="jobs">All Jobs</a>
          <a href="#reported-jobs" class="admin-sub-item" data-view="reported-jobs" id="reported-jobs-link">Reported Jobs <span class="admin-menu-badge" id="admin-reports-badge" style="display:none;background:#b00008;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:auto;">0</span></a>
          <a href="#job-new" class="admin-sub-item" data-view="job-new" id="new-job-link">Add New Job</a>
          <a href="#taxonomy-types" class="admin-sub-item" data-view="taxonomy-types">Types</a>
          <a href="#taxonomy-categories" class="admin-sub-item" data-view="taxonomy-categories">Categories</a>
          <a href="#taxonomy-locations" class="admin-sub-item" data-view="taxonomy-locations">Locations</a>
          <a href="#taxonomy-tags" class="admin-sub-item" data-view="taxonomy-tags">Tags</a>
        </div>
      </div>

      <!-- Employers Section -->
      <div class="admin-menu-group" id="employers-menu-group">
        <button type="button" class="admin-nav-parent" id="employers-menu-toggle" aria-expanded="false">
          <span class="admin-nav-parent-main">
            <svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span class="admin-nav-title">Employers</span>
          </span>
          <span class="admin-nav-parent-meta">
            <svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </span>
        </button>
        <div class="admin-submenu" id="employers-submenu">
          <a href="#employers" class="admin-sub-item" data-view="employers">All Employers</a>
          <a href="#employer-claims" class="admin-sub-item" data-view="employer-claims" id="employer-claims-link">Company Claims <span class="admin-menu-badge" id="admin-claims-badge" style="display:none;background:#b00008;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:auto;">0</span></a>
          <a href="#employer-new" class="admin-sub-item" data-view="employer-new" id="new-employer-link">Add New Employer</a>
          <a href="#employer-categories" class="admin-sub-item" data-view="employer-categories">Categories</a>
          <a href="#employer-locations" class="admin-sub-item" data-view="employer-locations">Locations</a>
        </div>
      </div>

      <!-- Candidates Section -->
      <div class="admin-menu-group" id="candidates-menu-group">
        <button type="button" class="admin-nav-parent" id="candidates-menu-toggle" aria-expanded="false">
          <span class="admin-nav-parent-main">
            <svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
            <span class="admin-nav-title">Candidates</span>
          </span>
          <span class="admin-nav-parent-meta">
            <span class="admin-count-badge" id="admin-candidates-count">12</span>
            <svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </span>
        </button>
        <div class="admin-submenu" id="candidates-submenu">
          <a href="#candidates" class="admin-sub-item" data-view="candidates">All Candidates</a>
          <a href="#candidate-new" class="admin-sub-item" data-view="candidate-new" id="new-candidate-link">Add New Candidate</a>
          <a href="#candidate-categories" class="admin-sub-item" data-view="candidate-categories">Categories</a>
          <a href="#candidate-locations" class="admin-sub-item" data-view="candidate-locations">Locations</a>
          <a href="#candidate-tags" class="admin-sub-item" data-view="candidate-tags">Tags</a>
        </div>
      </div>

      <div class="admin-nav-group-label" style="margin-top: 14px;">APPEARANCE</div>
      <div class="admin-menu-group" id="site-chrome-menu-group">
        <button type="button" class="admin-nav-parent" id="site-chrome-menu-toggle" aria-expanded="false">
          <span class="admin-nav-parent-main"><svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M3 17h18"/></svg><span class="admin-nav-title">Header &amp; Footer</span></span>
          <span class="admin-nav-parent-meta"><svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg></span>
        </button>
        <div class="admin-submenu" id="site-chrome-submenu"><a href="#site-header" class="admin-sub-item" data-view="site-header">Header</a><a href="#site-footer" class="admin-sub-item" data-view="site-footer">Footer</a></div>
      </div>

      <div class="admin-nav-group-label" style="margin-top: 14px;">USER ACCESS</div>

      <!-- Users Section -->
      <div class="admin-menu-group" id="users-menu-group">
        <button type="button" class="admin-nav-parent" id="users-menu-toggle" aria-expanded="false">
          <span class="admin-nav-parent-main">
            <svg class="admin-menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span class="admin-nav-title">Users</span>
          </span>
          <span class="admin-nav-parent-meta">
            <span class="admin-count-badge" id="admin-users-count">2</span>
            <svg class="admin-menu-chevron" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </span>
        </button>
        <div class="admin-submenu" id="users-submenu">
          <a href="#users" class="admin-sub-item" data-view="users">All Users</a>
          <a href="#user-new" class="admin-sub-item" data-view="user-new" id="new-user-link">Add New User</a>
          <a href="#user-profile" class="admin-sub-item" data-view="user-profile">Profile</a>
        </div>
      </div>

      <div class="admin-nav-section admin-nav-bottom-section">
        <a class="admin-website-link" href="/" target="_blank" rel="noopener">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4h6m0 0v6m0-6L7 13"/><path d="M14 11v5a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5"/></svg>
          <span class="collapse-label">View website ↗</span>
        </a>
        <button type="button" class="admin-collapse-menu-btn" id="collapse-menu-btn">
          <span class="collapse-icon">◄</span> <span class="collapse-label">Collapse menu</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Areas (Distinct Page Views) -->
    <main class="admin-main">
      
      <!-- VIEW 1: All Jobs -->
      <div class="admin-view active-view" id="view-jobs">
        <div class="modern-page-header">
          <div class="modern-heading-title-area">
            <div>
              <div class="modern-title-badge-row">
                <h1 class="modern-page-title">Jobs</h1>
                <span class="modern-heading-badge" id="admin-items-count-chip">18,525 listings</span>
              </div>
              <p class="modern-page-subtitle">Track, filter, and manage all published job listings across the portal.</p>
            </div>
          </div>
          <div class="modern-heading-actions">
            <a href="#job-new" class="modern-btn-primary-header" id="new-job-top">
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
              <span>Add New Job</span>
            </a>
          </div>
        </div>

        <div class="modern-card modern-table-card">
          <!-- 1. Integrated Status Tabs Navigation -->
          <div class="modern-card-tab-bar">
            <ul class="modern-status-nav" id="admin-status-tabs">
              <li class="all"><a href="#" class="current" data-status="all"><span>All</span> <span class="count" id="count-all">(18,499)</span></a></li>
              <li class="publish"><a href="#" data-status="publish"><span>Published</span> <span class="count" id="count-publish">(13,626)</span></a></li>
              <li class="draft"><a href="#" data-status="draft"><span>Drafts</span> <span class="count" id="count-draft">(295)</span></a></li>
              <li class="pending"><a href="#" data-status="pending"><span>Pending</span> <span class="count" id="count-pending">(1)</span></a></li>
              <li class="expired"><a href="#" data-status="expired"><span>Expired</span> <span class="count" id="count-expired">(4,577)</span></a></li>
              <li class="mine"><a href="#" data-status="mine"><span>Mine</span> <span class="count" id="count-mine">(15)</span></a></li>
            </ul>
          </div>

          <!-- 2. Integrated Command & Filter Bar -->
          <div class="modern-card-toolbar">
            <div class="modern-toolbar-left">
              <div class="modern-search-box-unified">
                <svg class="search-icon-svg" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
                <input type="search" id="admin-search" name="s" placeholder="Search by title, company, or category…" aria-label="Search Job">
                <button type="button" id="admin-search-button" class="modern-search-submit-btn">Search</button>
              </div>

              <div class="modern-filter-dropdowns">
                <select name="job_type" id="filter-by-type" class="modern-select-pill">
                  <option value="">All types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
                <select name="job_cat" id="filter-by-category" class="modern-select-pill">
                  <option value="">All categories</option>
                  <option value="Education and Training">Education and Training</option>
                  <option value="Accounting or Finance">Accounting or Finance</option>
                  <option value="HealthCare">HealthCare</option>
                  <option value="Construction">Construction</option>
                  <option value="Customer Service">Customer Service</option>
                </select>
                <select name="m" id="filter-by-date" class="modern-select-pill">
                  <option value="0">All dates</option>
                  <option value="202609">September 2026</option>
                  <option value="202608">August 2026</option>
                </select>
                <select name="rank_math_seo" id="filter-by-rank-math" style="display:none;">
                  <option value="">Rank Math</option>
                </select>
                <button type="button" id="post-query-submit" class="modern-btn-filter">Filter</button>
              </div>
            </div>

            <div class="modern-toolbar-right">
              <div class="modern-bulk-action-group">
                <select name="action" id="bulk-action-selector-top" class="modern-select-pill">
                  <option value="-1">Bulk actions</option>
                  <option value="edit">Bulk Edit</option>
                  <option value="delete">Bulk Delete</option>
                  <option value="trash">Move to Trash</option>
                </select>
                <button type="button" id="doaction" class="modern-btn-apply">Apply</button>
              </div>
            </div>
          </div>

          <!-- 3. Clean Table -->
          <div class="modern-table-responsive">
            <table class="wp-list-table widefat fixed striped posts modern-table-clean">
              <thead>
                <tr>
                  <td id="cb" class="manage-column column-cb check-column"><input id="cb-select-all-1" type="checkbox" aria-label="Select All"></td>
                  <th scope="col" id="title" class="manage-column column-title sortable desc"><a href="#"><span>Title</span><span class="sorting-indicator"></span></a></th>
                  <th scope="col" id="views" class="manage-column column-views">Views</th>
                  <th scope="col" id="type" class="manage-column column-type">Type</th>
                  <th scope="col" id="location" class="manage-column column-location">Location</th>
                  <th scope="col" id="posted" class="manage-column column-posted">Posted</th>
                  <th scope="col" id="expires" class="manage-column column-expires">Expires</th>
                  <th scope="col" id="category" class="manage-column column-category">Category</th>
                  <th scope="col" id="status" class="manage-column column-status">Status</th>
                </tr>
              </thead>
              <tbody id="admin-job-rows">
                <tr><td colspan="9" style="text-align:center;padding:30px;color:#646970;">Loading jobs…</td></tr>
              </tbody>
            </table>
          </div>

          <!-- 4. Integrated Pagination Footer -->
          <div class="modern-card-footer tablenav">
            <div class="modern-footer-info">
              <span class="displaying-num" id="admin-items-count">18,499 items</span>
            </div>
            <div class="modern-pagination-wrap tablenav-pages">
              <span class="pagination-links">
                <button type="button" class="tablenav-page-btn first-page" aria-label="First page" title="First page">«</button>
                <button type="button" class="tablenav-page-btn prev-page" aria-label="Previous page" title="Previous page">‹</button>
                <span class="paging-input">
                  <span class="modern-paging-counter">
                    <span>Page</span>
                    <input class="current-page" id="current-page-selector" type="text" name="paged" value="1" size="2">
                    <span class="tablenav-paging-text">of <span class="total-pages" id="admin-total-pages">394</span></span>
                  </span>
                </span>
                <button type="button" class="tablenav-page-btn next-page" aria-label="Next page" title="Next page">›</button>
                <button type="button" class="tablenav-page-btn last-page" aria-label="Last page" title="Last page">»</button>
              </span>
            </div>
          </div>
        </div>
      </div>

    <!-- VIEW 2: Modern Job Editor -->
    <div class="admin-view" id="view-job-editor">
      <form id="admin-job-form" class="modern-editor-form">
        <input name="originalSlug" type="hidden">

        <!-- Modern Editor Header -->
        <header class="modern-editor-header">
          <div class="modern-editor-header-left">
            <a href="#jobs" class="modern-editor-back-btn" title="Back to All Jobs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Back to Jobs</span>
            </a>
            <div class="modern-editor-divider"></div>
            <div class="modern-editor-title-wrap">
              <span class="modern-editor-doc-title" id="wp-doc-status-title">New Job Listing</span>
            </div>
          </div>

          <div class="modern-editor-header-right">
            <!-- Sections Menu Dropdown Button -->
            <div class="modern-sections-menu-wrap" id="job-sections-menu-wrap">
              <button type="button" class="modern-header-btn secondary modern-sections-btn" id="btn-job-sections-toggle" aria-expanded="false" title="Customize visible form sections">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke-linecap="round"/>
                </svg>
                <span>Sections</span>
                <span class="sections-count-badge" id="job-sections-count">5/5</span>
                <svg class="sections-chevron" width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4"/>
                </svg>
              </button>

              <div class="modern-sections-dropdown" id="job-sections-dropdown" style="display:none;">
                <div class="sections-dropdown-header">
                  <div class="sections-dropdown-title-group">
                    <span class="sections-dropdown-title">Form Sections</span>
                    <span class="sections-dropdown-desc">Check or uncheck sections to show only what you need.</span>
                  </div>
                  <div class="sections-dropdown-actions">
                    <button type="button" class="sections-link-action" id="job-sections-select-all">Select All</button>
                  </div>
                </div>
                <div class="sections-dropdown-list" id="job-sections-list">
                  <div class="sections-dropdown-item mandatory" data-target="job-sec-overview">
                    <label class="sections-item-label">
                      <input type="checkbox" checked disabled class="sections-item-checkbox">
                      <span class="sections-item-icon">📝</span>
                      <span class="sections-item-text">
                        <strong>Job Overview</strong>
                        <small>Title & description (Required)</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="job-sec-overview" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="job-sec-compensation">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="job-sec-compensation">
                      <span class="sections-item-icon">💰</span>
                      <span class="sections-item-text">
                        <strong>Compensation & Roles</strong>
                        <small>Salary, qualification, experience</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="job-sec-compensation" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="job-sec-application">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="job-sec-application">
                      <span class="sections-item-icon">📬</span>
                      <span class="sections-item-text">
                        <strong>Application & Timelines</strong>
                        <small>Apply URL/email, deadlines</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="job-sec-application" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="job-sec-location">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="job-sec-location">
                      <span class="sections-item-icon">📍</span>
                      <span class="sections-item-text">
                        <strong>Location & Workplace</strong>
                        <small>Address, photo attachments</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="job-sec-location" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="job-sec-promotions">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="job-sec-promotions">
                      <span class="sections-item-icon">⭐</span>
                      <span class="sections-item-text">
                        <strong>Promotions & Badges</strong>
                        <small>Featured, urgent, filled</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="job-sec-promotions" title="Jump to section">Jump ↗</button>
                  </div>
                </div>
              </div>
            </div>

            <a id="admin-preview" href="#" target="_blank" rel="noopener" class="modern-header-btn secondary" title="Preview in new tab">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4h6m0 0v6m0-6L7 13"/><path d="M14 11v5a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5"/></svg>
              <span>Preview ↗</span>
            </a>
            <button type="button" class="modern-header-btn secondary" id="save-draft-btn">Save Draft</button>
            <button type="submit" class="modern-header-btn primary" id="publish-job-btn">Publish Listing</button>
            <button type="button" class="modern-header-icon-btn active" id="toggle-gutenberg-sidebar" title="Toggle settings panel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/></svg>
            </button>
          </div>
        </header>

        <!-- Modern Sticky Sub-Nav (Jump pills + Active scrollspy) -->
        <div class="modern-editor-subnav" id="job-editor-subnav">
          <div class="modern-subnav-pills" id="job-subnav-pills">
            <button type="button" class="subnav-pill active" data-target="job-sec-overview">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/></svg>
              <span>Overview</span>
            </button>
            <button type="button" class="subnav-pill" data-target="job-sec-compensation">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/></svg>
              <span>Compensation</span>
            </button>
            <button type="button" class="subnav-pill" data-target="job-sec-application">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
              <span>Application</span>
            </button>
            <button type="button" class="subnav-pill" data-target="job-sec-location">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              <span>Location</span>
            </button>
            <button type="button" class="subnav-pill" data-target="job-sec-promotions">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span>Promotions</span>
            </button>
          </div>
          <div class="modern-subnav-right">
            <button type="button" class="subnav-pill-customize" id="btn-subnav-customize-sections">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 5h14M3 10h14M3 15h14" stroke-linecap="round"/>
              </svg>
              <span>Manage Sections</span>
            </button>
          </div>
        </div>

        <!-- Modern Editor Workspace -->
        <div class="modern-editor-workspace">
          <!-- Main Canvas Area -->
          <div class="modern-editor-canvas">
            <div class="modern-editor-container">

              <!-- Section 1: Title & Overview -->
              <div class="modern-card" id="job-sec-overview" data-section="overview">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Job Overview</h3>
                  <span class="modern-card-subtitle">Define the role title and comprehensive job description.</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-field-wrap">
                    <label class="modern-label" for="job-gutenberg-title">Job Title <span class="req">*</span></label>
                    <input type="text" name="title" id="job-gutenberg-title" class="modern-title-input" placeholder="e.g. Senior Full Stack Engineer" required autocomplete="off">
                  </div>

                  <div class="modern-field-wrap">
                    <div class="modern-combobox-header">
                      <label class="modern-label" for="field-employer-author" style="margin-bottom:0;">Company / Employer Author <span class="req">*</span></label>
                      <button type="button" id="btn-add-company-redirect" class="modern-add-company-btn" title="Create a new company profile">
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 4v12M4 10h12" stroke-linecap="round"/></svg>
                        <span>Add Company</span>
                      </button>
                    </div>

                    <div class="modern-combobox-wrap" id="employer-combobox">
                      <!-- Combobox Trigger Button -->
                      <div class="modern-combobox-trigger" id="employer-combobox-trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox">
                        <div class="combobox-trigger-content">
                          <img src="" class="combobox-trigger-logo" id="combobox-selected-logo" alt="" style="display:none;">
                          <span class="combobox-trigger-avatar" id="combobox-selected-avatar" style="display:none;"></span>
                          <span class="combobox-trigger-label" id="combobox-selected-label">Select an employer from website…</span>
                        </div>
                        <div class="combobox-trigger-actions">
                          <button type="button" class="combobox-clear-btn" id="combobox-clear-btn" title="Clear selection" style="display:none;">✕</button>
                          <svg class="combobox-chevron" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4"/>
                          </svg>
                        </div>
                      </div>

                      <!-- Custom Dropdown Menu with Search Field -->
                      <div class="modern-combobox-dropdown" id="employer-combobox-dropdown" style="display:none;" role="listbox">
                        <div class="modern-combobox-search-wrap">
                          <svg class="combobox-search-icon" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/>
                          </svg>
                          <input type="text" id="employer-combobox-search" class="modern-combobox-search-input" placeholder="Search connected employers…" autocomplete="off">
                        </div>
                        <div class="modern-combobox-list" id="employer-combobox-list">
                          <!-- Populated dynamically with company logo, name, checkmark -->
                        </div>
                        <div class="modern-combobox-create" id="employer-combobox-create" style="display:none;">
                          <button type="button" class="combobox-create-btn" id="btn-combobox-create-item">
                            <span class="create-plus">+</span>
                            <span>Use "<strong id="combobox-new-name"></strong>" as custom employer</span>
                          </button>
                        </div>
                        <div class="modern-combobox-footer" id="employer-combobox-footer">
                          <button type="button" class="combobox-footer-add-btn" id="btn-combobox-add-company-redirect">
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4v12M4 10h12" stroke-linecap="round"/></svg>
                            <span>Add New Company (redirects to Company page)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <input type="text" id="field-employer-custom" class="modern-input" placeholder="Type custom employer name…" style="display:none;margin-top:6px;">
                    <select id="field-employer-author" style="display:none;">
                      <option value="">Select an employer from website…</option>
                    </select>
                    <input type="hidden" name="company" id="field-employer-company-value" required>
                    <input type="hidden" name="banner" id="field-banner-img">
                    <input type="hidden" name="logo" id="field-logo-img">
                  </div>

                  <div class="modern-field-wrap">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                      <label class="modern-label" for="job-gutenberg-content" style="margin-bottom:0;">Description & Responsibilities <span class="req">*</span></label>
                      <div class="rich-mode-toggle" id="job-rich-mode-toggle">
                        <button type="button" class="rich-mode-btn active" id="job-btn-visual">Visual</button>
                        <button type="button" class="rich-mode-btn" id="job-btn-code">&lt;/&gt; HTML</button>
                      </div>
                    </div>

                    <div class="modern-rich-editor" id="job-rich-editor-wrap">
                      <!-- Formatting Toolbar -->
                      <div class="rich-toolbar" id="job-rich-toolbar" role="toolbar" aria-label="Text Formatting">
                        <div class="toolbar-group">
                          <select class="toolbar-select" id="job-format-block" title="Text Style">
                            <option value="p">Paragraph</option>
                            <option value="h2">Heading 2 (H2)</option>
                            <option value="h3">Heading 3 (H3)</option>
                          </select>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="bold" title="Bold (Ctrl+B)">
                            <strong>B</strong>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="italic" title="Italic (Ctrl+I)">
                            <em>I</em>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="underline" title="Underline (Ctrl+U)">
                            <u>U</u>
                          </button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="justifyLeft" title="Align Left">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="justifyCenter" title="Align Center">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm-2 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="justifyRight" title="Align Right">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm-4 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
                          </button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="insertUnorderedList" title="Bullet List">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4.5A1.5 1.5 0 111 4.5a1.5 1.5 0 013 0zm4-.5a1 1 0 000 2h10a1 1 0 100-2H8zm-4 6.5A1.5 1.5 0 111 10.5a1.5 1.5 0 013 0zm4-.5a1 1 0 000 2h10a1 1 0 100-2H8zm-4 6.5A1.5 1.5 0 111 16.5a1.5 1.5 0 013 0zm4-.5a1 1 0 000 2h10a1 1 0 100-2H8z" clip-rule="evenodd"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="insertOrderedList" title="Numbered List">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.5 3a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4H2a.5.5 0 010-1h.5zm4.5 1a1 1 0 000 2h11a1 1 0 100-2H7zm-5 5.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v.5a1.5 1.5 0 01-1.5 1.5H3v.5h1.5a.5.5 0 010 1H2a.5.5 0 01-.5-.5v-1a1.5 1.5 0 011.5-1.5H4v-.5H2.5a.5.5 0 01-.5-.5zm5 1a1 1 0 000 2h11a1 1 0 100-2H7zm-5 5.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v.75a1 1 0 01-.6 1 .9.9 0 01.6 1V18a.5.5 0 01-.5.5H2a.5.5 0 010-1h1.5v-.5H3a.5.5 0 010-1h.5V15H2.5a.5.5 0 01-.5-.5zm5 1a1 1 0 000 2h11a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>
                          </button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="createLink" title="Insert Link">
                            🔗
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="formatBlock" data-val="blockquote" title="Quote Block">
                            ❝
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="removeFormat" title="Clear Formatting">
                            🧹
                          </button>
                        </div>
                      </div>

                      <!-- Visual Editable Content Area -->
                      <div class="rich-content" id="job-rich-content" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Detail the duties, requirements, technical skills, benefits, and company overview…"></div>

                      <!-- Synchronized HTML Textarea (name="description" preserved for form submission) -->
                      <textarea name="description" id="job-gutenberg-content" class="rich-raw-code" placeholder="HTML code…" style="display:none;"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Role Specifications & Compensation -->
              <div class="modern-card" id="job-sec-compensation" data-section="compensation">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Compensation & Role Specifications</h3>
                  <span class="modern-card-subtitle">Set salary expectations, required qualifications, and experience level.</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-grid-3">
                    <div class="modern-field-wrap">
                      <label class="modern-label">Salary Rate</label>
                      <select name="salaryType" class="modern-select">
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Hourly">Hourly</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Not specified">Not specified</option>
                      </select>
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label">Min. Salary (AED)</label>
                      <input type="number" name="minSalary" class="modern-input" placeholder="e.g. 8000">
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label">Max. Salary (AED)</label>
                      <input type="number" name="maxSalary" class="modern-input" placeholder="e.g. 14000">
                    </div>
                  </div>

                  <div class="modern-grid-3">
                    <div class="modern-field-wrap">
                      <label class="modern-label">Experience Required</label>
                      <input type="text" name="experience" class="modern-input" placeholder="e.g. 2 - 5 Years">
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label">Qualification</label>
                      <input type="text" name="qualification" class="modern-input" placeholder="e.g. Bachelor's Degree">
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label">Gender Preference</label>
                      <select name="gender" class="modern-select">
                        <option value="Any">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3: Application Process & Deadlines -->
              <div class="modern-card" id="job-sec-application" data-section="application">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Application & Timelines</h3>
                  <span class="modern-card-subtitle">How candidates apply and when the listing expires.</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-grid-2 application-method-grid">
                    <div class="modern-field-wrap">
                      <label class="modern-label">How should candidates apply? <span class="req">*</span></label>
                      <select name="applyType" id="job-apply-type" class="modern-select" required>
                        <option value="External URL">External Career Page / URL</option>
                        <option value="By Email">Direct Email</option>
                        <option value="Internal Form">Platform Application Form</option>
                      </select>
                      <small class="modern-field-help">Only the field required for the selected method will be shown.</small>
                    </div>
                    <div class="modern-field-wrap" id="job-apply-url-wrap">
                      <label class="modern-label">Application URL <span class="req">*</span></label>
                      <div class="application-input-with-icon"><span>↗</span><input type="url" name="applyUrl" id="job-apply-url" class="modern-input" placeholder="https://careers.company.com/job/123"></div>
                      <small class="modern-field-help">Link directly to this job’s application page.</small>
                    </div>
                  </div>

                  <div class="modern-field-wrap" id="job-apply-email-wrap" hidden>
                    <label class="modern-label">Application Email <span class="req">*</span></label>
                    <div class="application-input-with-icon"><span>✉</span><input type="email" name="applyEmail" id="job-apply-email" class="modern-input" placeholder="careers@company.com"></div>
                  </div>

                  <div class="application-timeline-panel">
                    <div class="application-timeline-head"><div><strong>Application window</strong><span>Set how long this opportunity remains open.</span></div><div class="deadline-presets"><button type="button" data-deadline-days="30">30 days</button><button type="button" data-deadline-days="60">60 days</button><button type="button" data-deadline-days="90">90 days</button><button type="button" data-deadline-days="365">1 year</button></div></div>
                    <div class="modern-grid-2">
                      <div class="modern-field-wrap">
                        <label class="modern-label">Application Deadline <span class="req">*</span></label>
                        <input type="date" name="deadline" id="job-application-deadline" class="modern-input" required>
                        <small class="modern-field-help">Last day candidates can apply.</small>
                      </div>
                      <div class="modern-field-wrap">
                        <label class="modern-label">Listing Expiry Date <span class="req">*</span></label>
                        <input type="date" name="expiryDate" id="job-listing-expiry" class="modern-input" required>
                        <label class="application-sync-check"><input type="checkbox" id="job-sync-expiry" checked> Keep the same as application deadline</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 4: Location & Workplace -->
              <div class="modern-card" id="job-sec-location" data-section="location">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Google Job Posting Details <span class="req">Required</span></h3>
                  <span class="modern-card-subtitle">Mandatory location and employment information for valid Google JobPosting structured data.</span>
                </div>
                <div class="modern-card-body">
                  <div class="google-job-notice"><strong>Google required information</strong><span>Publishing is blocked until every field marked * is completed.</span></div>
                  <div class="modern-grid-2">
                    <div class="modern-field-wrap"><label class="modern-label">Employment Type <span class="req">*</span></label><select name="employmentType" id="job-employment-type" class="modern-select" required><option value="">Select employment type</option><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="CONTRACTOR">Contractor</option><option value="TEMPORARY">Temporary</option><option value="INTERN">Intern</option><option value="VOLUNTEER">Volunteer</option><option value="PER_DIEM">Per diem</option><option value="OTHER">Other</option></select></div>
                    <div class="modern-field-wrap"><label class="modern-label">Date Posted <span class="req">*</span></label><input type="date" name="datePosted" id="job-date-posted" class="modern-input" required></div>
                  </div>
                  <div class="modern-field-wrap"><label class="modern-label">Street Address <span class="req">*</span></label><input type="text" name="streetAddress" class="modern-input" placeholder="e.g. Dubai Internet City, Building 12" required></div>
                  <div class="modern-grid-2">
                    <div class="modern-field-wrap"><label class="modern-label">UAE Location <span class="req">*</span></label><select name="addressLocality" id="job-address-locality" class="modern-select" required><option value="">Select an existing location</option></select><small class="modern-field-help">Uses the locations already added under Jobs → Locations.</small></div>
                    <div class="modern-field-wrap"><label class="modern-label">Emirate / Region <span class="req">*</span></label><input type="text" name="addressRegion" id="job-address-region" class="modern-input" placeholder="Selected automatically" required></div>
                  </div>
                  <input type="hidden" name="addressCountry" value="AE">
                  <div class="modern-field-wrap"><label class="modern-label">Full workplace address <span class="req">*</span></label><input type="text" name="address" class="modern-input" placeholder="Dubai Internet City, Dubai, United Arab Emirates" required></div>
                  <div class="modern-field-wrap">
                    <label class="modern-label">Photos / Attachment URLs</label>
                    <input type="text" name="photoUrl" id="field-photo-url" class="modern-input" placeholder="Comma-separated image URLs (e.g. https://.../photo.jpg)">
                  </div>
                </div>
              </div>

              <!-- Section 5: Badges & Display Options -->
              <div class="modern-card" id="job-sec-promotions" data-section="promotions">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Promotions & Badges</h3>
                  <span class="modern-card-subtitle">Listing prominence and visibility controls.</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-toggles-grid">
                    <label class="modern-toggle-card">
                      <div class="toggle-card-text">
                        <span class="toggle-card-title">Featured Listing</span>
                        <span class="toggle-card-desc">Pinned prominently at the top of search results.</span>
                      </div>
                      <input type="checkbox" name="featured" id="field-featured" class="modern-switch-input">
                      <span class="modern-switch-track"></span>
                    </label>

                    <label class="modern-toggle-card">
                      <div class="toggle-card-text">
                        <span class="toggle-card-title">Urgent Hiring</span>
                        <span class="toggle-card-desc">Displays a highlighted red urgent badge to attract immediate applicants.</span>
                      </div>
                      <input type="checkbox" name="urgent" id="field-urgent" class="modern-switch-input">
                      <span class="modern-switch-track"></span>
                    </label>

                    <label class="modern-toggle-card">
                      <div class="toggle-card-text">
                        <span class="toggle-card-title">Filled Position</span>
                        <span class="toggle-card-desc">Marks listing as filled and stops accepting applications.</span>
                      </div>
                      <input type="checkbox" name="filled" id="field-filled" class="modern-switch-input">
                      <span class="modern-switch-track"></span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right Modern Settings Sidebar -->
          <aside class="modern-editor-sidebar" id="gutenberg-sidebar">
            <div class="modern-sidebar-header">
              <span class="modern-sidebar-title">Listing Settings</span>
              <button type="button" class="modern-sidebar-close" id="close-gutenberg-sidebar" title="Close sidebar">✕</button>
            </div>

            <div class="modern-sidebar-body">
              <!-- Publishing Card -->
              <div class="modern-sidebar-card">
                <h4 class="modern-sidebar-card-title">Publishing</h4>
                <div class="modern-field-wrap">
                  <label class="modern-label">Publication Status</label>
                  <select name="status" class="modern-select" id="field-status">
                    <option value="draft" selected>Draft</option>
                    <option value="publish">Published</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div class="modern-field-wrap">
                  <label class="modern-label">URL Slug</label>
                  <input type="text" name="slug" id="field-slug" class="modern-input" placeholder="job-slug" required>
                </div>
              </div>

              <!-- Taxonomies: Categories -->
              <div class="modern-sidebar-card">
                <h4 class="modern-sidebar-card-title">Categories</h4>
                <input type="text" class="modern-search-sm" placeholder="Filter categories…" data-search-checklist="categories">
                <div class="modern-taxonomy-checklist tree-checklist" data-list="categories" id="checklist-categories">
                  <!-- Populated dynamically with hierarchy -->
                </div>
                <div class="modern-add-taxonomy-wrap">
                  <button type="button" class="modern-add-tax-toggle" id="btn-toggle-add-category">+ Add New Category</button>
                  <div class="modern-add-tax-form" id="box-add-category" style="display:none;">
                    <label>Category Name</label>
                    <input type="text" class="modern-input-sm" id="input-new-cat-name" placeholder="New Category Name">
                    <label>Parent Category</label>
                    <select class="modern-select-sm" id="select-new-cat-parent">
                      <option value="">— Parent Category —</option>
                    </select>
                    <button type="button" class="modern-btn-add-tax" id="btn-submit-new-category">Add New Category</button>
                  </div>
                </div>
              </div>

              <!-- Bottom Actions -->
              <div class="modern-sidebar-card footer-card">
                <span id="admin-save-state" role="status" class="modern-save-state"></span>
                <button id="admin-delete" type="button" class="modern-delete-btn" hidden>Delete Listing</button>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>

    <!-- VIEW 3: All Employers -->
    <div class="admin-view" id="view-employers">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <h1 class="modern-page-title">Employers</h1>
              <span class="modern-heading-badge" id="admin-employers-count-chip">Company Profiles</span>
            </div>
            <p class="modern-page-subtitle">Manage employer brands, verified companies, and active recruitment accounts.</p>
          </div>
        </div>
        <div class="modern-heading-actions">
          <a href="#employer-new" class="modern-btn-primary-header" id="new-employer-top">
            <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            <span>Add New Employer</span>
          </a>
        </div>
      </div>

      <div class="modern-card modern-table-card">
        <div class="modern-card-toolbar">
          <div class="modern-toolbar-left">
            <div class="modern-search-box-unified">
              <svg class="search-icon-svg" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
              <input id="employer-search" type="search" placeholder="Search employers by name, location, industry…" aria-label="Search Employer">
              <button id="employer-search-button" type="button" class="modern-search-submit-btn">Search</button>
            </div>
          </div>
          <div class="modern-toolbar-right">
            <div class="modern-count-badge" id="employer-total-count">0 items</div>
          </div>
        </div>

        <div class="modern-table-responsive">
          <table class="wp-list-table widefat fixed striped employers-table modern-table-clean">
            <thead>
              <tr>
                <th class="manage-column column-cb check-column"><input type="checkbox" id="cb-select-employers"></th>
                <th class="manage-column column-logo" style="width:52px;"><span class="screen-reader-text">Logo</span></th>
                <th class="manage-column column-title column-primary">Employer</th>
                <th class="manage-column column-category">Category</th>
                <th class="manage-column column-location">Location</th>
                <th class="manage-column column-posts num" style="width:100px;text-align:center;">Open jobs</th>
                <th class="manage-column column-status" style="width:110px;">Status</th>
              </tr>
            </thead>
            <tbody id="admin-employer-rows">
              <tr><td colspan="7" style="text-align:center;padding:30px;color:#646970;">Loading employers…</td></tr>
            </tbody>
          </table>
        </div>
        <div id="admin-employer-pagination" style="display:flex;align-items:center;justify-content:center;gap:18px;padding:18px;border-top:1px solid #e5e7eb;"></div>
      </div>
    </div>

    <!-- VIEW: Company Profile Claims -->
    <div class="admin-view" id="view-employer-claims">
      <div class="modern-header">
        <div>
          <div style="display:flex;align-items:center;gap:12px;">
            <h1 class="modern-page-title">Company Profile Claims</h1>
            <span class="modern-heading-badge" id="admin-claims-count-chip">Verification Requests</span>
          </div>
          <p class="modern-page-subtitle">Review submitted business verification documents (Trade License, Establishment Card, POA) and grant official employer access.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button type="button" class="modern-filter-btn" id="admin-claims-refresh-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div class="modern-card">
        <div class="modern-search-row">
          <div class="modern-search-left" style="display:flex;gap:8px;">
            <button type="button" class="modern-filter-btn active" data-claim-filter="all">All Claims</button>
            <button type="button" class="modern-filter-btn" data-claim-filter="pending">Pending</button>
            <button type="button" class="modern-filter-btn" data-claim-filter="approved">Approved</button>
            <button type="button" class="modern-filter-btn" data-claim-filter="rejected">Rejected</button>
          </div>
          <div class="modern-search-right">
            <div class="modern-count-badge" id="admin-claims-total-count">0 claims</div>
          </div>
        </div>

        <div class="modern-table-wrap">
          <table class="wp-list-table widefat fixed striped modern-table-clean">
            <thead>
              <tr>
                <th style="width:140px;">Claim ID & Date</th>
                <th style="width:200px;">Employer Profile</th>
                <th>Authorized Representative</th>
                <th style="width:190px;">Verification Document</th>
                <th style="width:110px;">Status</th>
                <th style="width:190px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="admin-claims-rows">
              <tr><td colspan="6" style="text-align:center;padding:35px;color:#646970;">Loading company claims…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Issued Credentials Modal -->
    <div id="adminClaimCredentialsModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.65);z-index:99999;align-items:center;justify-content:center;backdrop-filter:blur(4px);padding:16px;">
      <div style="background:#fff;border-radius:14px;max-width:520px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(135deg,#059669,#047857);color:#fff;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;">✓</div>
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:700;">Claim Approved & Login Created</h3>
              <p style="margin:2px 0 0;font-size:12.5px;opacity:0.9;">Employer credentials have been provisioned.</p>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('adminClaimCredentialsModal').style.display='none'" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;">×</button>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;font-size:14px;color:#475569;">Please dispatch these credentials to the verified representative or copy them for records:</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:20px;display:grid;gap:12px;">
            <div>
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Company</span>
              <div id="adminCredEmployer" style="font-size:14px;font-weight:700;color:#0f172a;margin-top:2px;">—</div>
            </div>
            <div>
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Username / Login Email</span>
              <div id="adminCredUsername" style="font-size:15px;font-weight:700;color:#0f172a;margin-top:2px;font-family:monospace;background:#fff;padding:6px 10px;border-radius:6px;border:1px solid #cbd5e1;">—</div>
            </div>
            <div>
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Temporary Password</span>
              <div id="adminCredPassword" style="font-size:15px;font-weight:700;color:#b00008;margin-top:2px;font-family:monospace;background:#fff;padding:6px 10px;border-radius:6px;border:1px solid #cbd5e1;">—</div>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button type="button" id="adminCredCopyBtn" class="modern-filter-btn" style="background:#0f172a;color:#fff;border-color:#0f172a;">Copy Credentials</button>
            <button type="button" class="modern-filter-btn" onclick="document.getElementById('adminClaimCredentialsModal').style.display='none'">Done</button>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW: Reported Jobs -->
    <div class="admin-view" id="view-reported-jobs">
      <div class="modern-header">
        <div>
          <div style="display:flex;align-items:center;gap:12px;">
            <h1 class="modern-page-title">Reported Jobs</h1>
            <span class="modern-heading-badge" id="admin-reports-count-chip" style="background:#fee2e2;color:#b00008;border-color:#fecaca;">User Flags</span>
          </div>
          <p class="modern-page-subtitle">Track job listings reported by job seekers (broken links, expired posts, inaccurate info, suspicious listings). Review reports, draft/unpublish problematic jobs, or edit details directly.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button type="button" class="modern-filter-btn" id="admin-reports-refresh-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Quick Summary Metric Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Reported Listings</div>
          <div id="stat-reported-jobs" style="font-size:26px;font-weight:800;color:#0f172a;margin-top:4px;">0</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Total Reports</div>
          <div id="stat-total-reports" style="font-size:26px;font-weight:800;color:#b00008;margin-top:4px;">0</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Broken Apply Links</div>
          <div id="stat-broken-links" style="font-size:26px;font-weight:800;color:#e11d48;margin-top:4px;">0</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Expired Listings</div>
          <div id="stat-expired-reports" style="font-size:26px;font-weight:800;color:#d97706;margin-top:4px;">0</div>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Drafted / Hidden</div>
          <div id="stat-drafted-jobs" style="font-size:26px;font-weight:800;color:#475569;margin-top:4px;">0</div>
        </div>
      </div>

      <div class="modern-card">
        <div class="modern-search-row">
          <div class="modern-search-left" style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="modern-filter-btn active" data-report-filter="all">All Reported</button>
            <button type="button" class="modern-filter-btn" data-report-filter="pending">Pending (Live)</button>
            <button type="button" class="modern-filter-btn" data-report-filter="draft">Drafted</button>
            <button type="button" class="modern-filter-btn" data-report-filter="resolved">Resolved</button>
          </div>
          <div class="modern-search-right" style="display:flex;gap:10px;align-items:center;">
            <input type="text" id="admin-reports-search" placeholder="Search reported job or company…" style="padding:7px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;width:240px;outline:none;">
            <div class="modern-count-badge" id="admin-reports-total-count">0 jobs</div>
          </div>
        </div>

        <div class="modern-table-wrap">
          <table class="wp-list-table widefat fixed striped modern-table-clean">
            <thead>
              <tr>
                <th style="width:260px;">Reported Job Listing</th>
                <th style="width:140px;text-align:center;">People Reported</th>
                <th>Reason-wise Breakdown & Notes</th>
                <th style="width:120px;">Job Status</th>
                <th style="width:230px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="admin-reports-rows">
              <tr><td colspan="5" style="text-align:center;padding:35px;color:#646970;">Loading reported jobs…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Job Report Details Modal (to view full notes / submissions) -->
    <div id="adminReportDetailsModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.65);z-index:99999;align-items:center;justify-content:center;backdrop-filter:blur(4px);padding:16px;">
      <div style="background:#fff;border-radius:14px;max-width:620px;width:100%;max-height:85vh;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;border:1px solid #e2e8f0;display:flex;flex-direction:column;">
        <div style="background:#0f172a;color:#fff;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h3 id="reportModalJobTitle" style="margin:0;font-size:17px;font-weight:700;">Report Details</h3>
            <p id="reportModalJobMeta" style="margin:3px 0 0;font-size:12.5px;color:#94a3b8;">User-submitted flag feedback</p>
          </div>
          <button type="button" onclick="document.getElementById('adminReportDetailsModal').style.display='none'" style="background:none;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;">×</button>
        </div>
        <div id="reportModalBody" style="padding:20px;overflow-y:auto;display:grid;gap:12px;"></div>
        <div style="padding:14px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <div id="reportModalJobActions" style="display:flex;gap:8px;"></div>
          <button type="button" class="modern-filter-btn" onclick="document.getElementById('adminReportDetailsModal').style.display='none'">Close</button>
        </div>
      </div>
    </div>

    <!-- VIEW 4: Modern Employer Editor -->
    <div class="admin-view" id="view-employer-editor">
      <form id="admin-employer-form" class="modern-editor-form">
        <input name="originalSlug" type="hidden">

        <!-- Modern Editor Header -->
        <header class="modern-editor-header">
          <div class="modern-editor-header-left">
            <a href="#employers" class="modern-editor-back-btn" title="Back to All Employers">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Back to Employers</span>
            </a>
            <div class="modern-editor-divider"></div>
            <div class="modern-editor-title-wrap">
              <span class="modern-editor-doc-title" id="wp-employer-doc-status-title">New Employer Profile</span>
            </div>
          </div>

          <div class="modern-editor-header-right">
            <!-- Sections Menu Dropdown Button -->
            <div class="modern-sections-menu-wrap" id="employer-sections-menu-wrap">
              <button type="button" class="modern-header-btn secondary modern-sections-btn" id="btn-employer-sections-toggle" aria-expanded="false" title="Customize visible form sections">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke-linecap="round"/>
                </svg>
                <span>Sections</span>
                <span class="sections-count-badge" id="employer-sections-count">5/5</span>
                <svg class="sections-chevron" width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4"/>
                </svg>
              </button>

              <div class="modern-sections-dropdown" id="employer-sections-dropdown" style="display:none;">
                <div class="sections-dropdown-header">
                  <div class="sections-dropdown-title-group">
                    <span class="sections-dropdown-title">Form Sections</span>
                    <span class="sections-dropdown-desc">Check or uncheck sections to show only what you need.</span>
                  </div>
                  <div class="sections-dropdown-actions">
                    <button type="button" class="sections-link-action" id="employer-sections-select-all">Select All</button>
                  </div>
                </div>
                <div class="sections-dropdown-list" id="employer-sections-list">
                  <div class="sections-dropdown-item mandatory" data-target="employer-sec-overview">
                    <label class="sections-item-label">
                      <input type="checkbox" checked disabled class="sections-item-checkbox">
                      <span class="sections-item-icon">🏢</span>
                      <span class="sections-item-text">
                        <strong>Company Overview</strong>
                        <small>Company name & about (Required)</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="employer-sec-overview" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="employer-sec-contact">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="employer-sec-contact">
                      <span class="sections-item-icon">📞</span>
                      <span class="sections-item-text">
                        <strong>Profile & Contact</strong>
                        <small>Email, phone, website, scale</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="employer-sec-contact" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="employer-sec-workplace">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="employer-sec-workplace">
                      <span class="sections-item-icon">🖼️</span>
                      <span class="sections-item-text">
                        <strong>Workplace & Media</strong>
                        <small>Address, banner, photos</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="employer-sec-workplace" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="employer-sec-social">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="employer-sec-social">
                      <span class="sections-item-icon">🌐</span>
                      <span class="sections-item-text">
                        <strong>Social Networks</strong>
                        <small>Facebook, LinkedIn profiles</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="employer-sec-social" title="Jump to section">Jump ↗</button>
                  </div>

                  <div class="sections-dropdown-item" data-target="employer-sec-badges">
                    <label class="sections-item-label">
                      <input type="checkbox" checked class="sections-item-checkbox" data-section="employer-sec-badges">
                      <span class="sections-item-icon">⭐</span>
                      <span class="sections-item-text">
                        <strong>Badges & Visibility</strong>
                        <small>Featured employer prominence</small>
                      </span>
                    </label>
                    <button type="button" class="sections-jump-btn" data-target="employer-sec-badges" title="Jump to section">Jump ↗</button>
                  </div>
                </div>
              </div>
            </div>

            <a id="employer-view-link" href="#" target="_blank" rel="noopener" class="modern-header-btn secondary" title="View employer">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 4h6m0 0v6m0-6L7 13"/><path d="M14 11v5a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5"/></svg>
              <span>View Profile ↗</span>
            </a>
            <button type="submit" class="modern-header-btn primary" id="save-employer-btn">Save Employer</button>
            <button type="button" class="modern-header-icon-btn active" id="toggle-employer-sidebar" title="Toggle settings panel">
              <svg width="18" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/></svg>
            </button>
          </div>
        </header>

        <!-- Return to Job Banner (shown when opened from Job Editor) -->
        <div id="employer-return-job-banner" class="modern-return-notice-banner" style="display:none;">
          <div class="return-banner-left">
            <span class="return-banner-icon">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
            </span>
            <div class="return-banner-text-wrap">
              <span class="return-banner-badge">Job In Progress</span>
              <span class="return-banner-msg">Adding company for: <strong id="return-job-title-label">Untitled Job</strong></span>
            </div>
          </div>
          <div class="return-banner-right">
            <button type="button" class="modern-btn-cancel-return" id="btn-employer-cancel-return-job" title="Discard and return to job draft">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Back to Job</span>
            </button>
          </div>
        </div>

        <!-- Modern Sticky Sub-Nav (Jump pills + Active scrollspy) -->
        <div class="modern-editor-subnav" id="employer-editor-subnav">
          <div class="modern-subnav-pills" id="employer-subnav-pills">
            <button type="button" class="subnav-pill active" data-target="employer-sec-overview">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/></svg>
              <span>Overview</span>
            </button>
            <button type="button" class="subnav-pill" data-target="employer-sec-contact">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
              <span>Contact & Scale</span>
            </button>
            <button type="button" class="subnav-pill" data-target="employer-sec-workplace">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg>
              <span>Workplace & Media</span>
            </button>
            <button type="button" class="subnav-pill" data-target="employer-sec-social">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v.183A6.002 6.002 0 0110 16c-.408 0-.806-.04-1.19-.117A2 2 0 007 14.5V13a2 2 0 00-2-2h-.668z" clip-rule="evenodd"/></svg>
              <span>Social Networks</span>
            </button>
            <button type="button" class="subnav-pill" data-target="employer-sec-badges">
              <svg class="pill-svg" viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span>Badges</span>
            </button>
          </div>
          <div class="modern-subnav-right">
            <button type="button" class="subnav-pill-customize" id="btn-employer-subnav-customize">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 5h14M3 10h14M3 15h14" stroke-linecap="round"/>
              </svg>
              <span>Manage Sections</span>
            </button>
          </div>
        </div>

        <!-- Modern Editor Workspace -->
        <div class="modern-editor-workspace">
          <!-- Main Canvas Area -->
          <div class="modern-editor-canvas">
            <div class="modern-editor-container">

              <!-- Section 1: Employer Overview -->
              <div class="modern-card" id="employer-sec-overview" data-section="overview">
                <div class="modern-card-header" style="display:flex; flex-direction:row; align-items:center; justify-content:space-between;">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:8px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/></svg>
                    </div>
                    <div>
                      <h3 class="modern-card-title">Company Overview</h3>
                      <span class="modern-card-subtitle">Set company name, brand identity, and executive description.</span>
                    </div>
                  </div>
                  <span class="modern-badge" style="background:#eff6ff; color:#1d4ed8; font-size:11px; font-weight:600; padding:4px 9px; border-radius:6px;">Required</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-field-wrap">
                    <label class="modern-label" for="employer-gutenberg-title">Company Name <span class="req">*</span></label>
                    <input type="text" name="title" id="employer-gutenberg-title" class="modern-title-input" placeholder="e.g. Acme Corporation, Dubai Holding, Emaar Properties" required autocomplete="off">
                    <span style="font-size:12px; color:#64748b; margin-top:2px;">The primary public brand name displayed across job listings, search results, and company directories.</span>
                  </div>

                  <div class="modern-field-wrap" style="margin-top: 4px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                      <div>
                        <label class="modern-label" for="employer-gutenberg-content" style="margin-bottom:2px;">About Company <span class="req">*</span></label>
                        <span style="font-size:12px; color:#64748b;">Overview of core operations, corporate culture, achievements, and value proposition.</span>
                      </div>
                      <div class="rich-mode-toggle" id="employer-rich-mode-toggle">
                        <button type="button" class="rich-mode-btn active" id="employer-btn-visual">Visual</button>
                        <button type="button" class="rich-mode-btn" id="employer-btn-code">&lt;/&gt; HTML</button>
                      </div>
                    </div>

                    <div class="modern-rich-editor" id="employer-rich-editor-wrap">
                      <!-- Formatting Toolbar -->
                      <div class="rich-toolbar" id="employer-rich-toolbar" role="toolbar" aria-label="Text Formatting">
                        <div class="toolbar-group">
                          <select class="toolbar-select" id="employer-format-block" title="Text Style">
                            <option value="p">Paragraph</option>
                            <option value="h2">Heading 2 (H2)</option>
                            <option value="h3">Heading 3 (H3)</option>
                          </select>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="bold" title="Bold (Ctrl+B)">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="italic" title="Italic (Ctrl+I)">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="underline" title="Underline (Ctrl+U)">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 3v7a6 6 0 0012 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
                          </button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="justifyLeft" title="Align Left">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="justifyCenter" title="Align Center">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm-2 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="justifyRight" title="Align Right">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm-4 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
                          </button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="insertUnorderedList" title="Bullet List">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4.5A1.5 1.5 0 111 4.5a1.5 1.5 0 013 0zm4-.5a1 1 0 000 2h10a1 1 0 100-2H8zm-4 6.5A1.5 1.5 0 111 10.5a1.5 1.5 0 013 0zm4-.5a1 1 0 000 2h10a1 1 0 100-2H8zm-4 6.5A1.5 1.5 0 111 16.5a1.5 1.5 0 013 0zm4-.5a1 1 0 000 2h10a1 1 0 100-2H8z" clip-rule="evenodd"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="insertOrderedList" title="Numbered List">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.5 3a.5.5 0 01.5.5v2a.5.5 0 01-1 0V4H2a.5.5 0 010-1h.5zm4.5 1a1 1 0 000 2h11a1 1 0 100-2H7zm-5 5.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v.5a1.5 1.5 0 01-1.5 1.5H3v.5h1.5a.5.5 0 010 1H2a.5.5 0 01-.5-.5v-1a1.5 1.5 0 011.5-1.5H4v-.5H2.5a.5.5 0 01-.5-.5zm5 1a1 1 0 000 2h11a1 1 0 100-2H7zm-5 5.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v.75a1 1 0 01-.6 1 .9.9 0 01.6 1V18a.5.5 0 01-.5.5H2a.5.5 0 010-1h1.5v-.5H3a.5.5 0 010-1h.5V15H2.5a.5.5 0 01-.5-.5zm5 1a1 1 0 000 2h11a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>
                          </button>
                        </div>

                        <div class="toolbar-divider"></div>

                        <div class="toolbar-group">
                          <button type="button" class="toolbar-btn" data-cmd="createLink" title="Insert Link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="formatBlock" data-val="blockquote" title="Quote Block">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>
                          </button>
                          <button type="button" class="toolbar-btn" data-cmd="removeFormat" title="Clear Formatting">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13.8 2.4c.8-.8 2-.8 2.8 0l5 5c.8.8.8 2 0 2.8L11 21"/><path d="M6 14l5 5"/></svg>
                          </button>
                        </div>
                      </div>

                      <!-- Visual Editable Content Area -->
                      <div class="rich-content" id="employer-rich-content" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Describe the company background, services, values, and workplace culture…"></div>

                      <!-- Synchronized HTML Textarea -->
                      <textarea name="description" id="employer-gutenberg-content" class="rich-raw-code" placeholder="HTML code…" style="display:none;"></textarea>

                      <!-- Editor Status / Count bar -->
                      <div class="rich-editor-statusbar" style="display:flex; align-items:center; justify-content:space-between; padding:6px 14px; background:#f8fafc; border-top:1px solid #f1f5f9; font-size:11.5px; color:#64748b;">
                        <span id="employer-editor-word-count">0 words · 0 characters</span>
                        <span style="color:#94a3b8;">Visual WYSIWYG Mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Details & Scale -->
              <div class="modern-card" id="employer-sec-contact" data-section="contact">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Company Profile & Contact</h3>
                  <span class="modern-card-subtitle">Official contact channels and organization scale.</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-grid-2">
                    <div class="modern-field-wrap">
                      <label class="modern-label" for="field-employer-email">Official Email <span class="req">*</span></label>
                      <input type="email" name="email" id="field-employer-email" class="modern-input" placeholder="company@example.com" required>
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label" for="field-employer-phone">Phone Number</label>
                      <input type="tel" name="phone" id="field-employer-phone" class="modern-input" placeholder="+971 4 000 0000">
                    </div>
                  </div>

                  <div class="modern-grid-3">
                    <div class="modern-field-wrap">
                      <label class="modern-label" for="field-employer-website">Website URL</label>
                      <input type="text" inputmode="url" name="website" id="field-employer-website" class="modern-input" placeholder="www.example.com or https://example.com" autocomplete="url">
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label" for="field-employer-founded">Founded Year</label>
                      <input type="number" name="foundedDate" id="field-employer-founded" class="modern-input" placeholder="2018">
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label" for="field-employer-size">Company Size</label>
                      <input type="text" name="companySize" id="field-employer-size" class="modern-input" placeholder="e.g. 50 - 100">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3: Workplace & Visuals -->
              <div class="modern-card" id="employer-sec-workplace" data-section="workplace">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Workplace & Media</h3>
                  <span class="modern-card-subtitle">Headquarters address, cover photo, and office gallery photos.</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-field-wrap">
                    <label class="modern-label" for="field-employer-address">Company Address / Location</label>
                    <input type="text" name="address" id="field-employer-address" class="modern-input" placeholder="e.g. Downtown Dubai, United Arab Emirates">
                  </div>

                  <div class="modern-grid-2">
                    <div class="modern-field-wrap">
                      <label class="modern-label" for="field-employer-cover">Cover Banner Photo URL</label>
                      <input type="text" name="coverPhoto" id="field-employer-cover" class="modern-input" placeholder="https://.../cover.jpg">
                    </div>
                    <div class="modern-field-wrap">
                      <label class="modern-label" for="field-employer-photos">Profile Photos Gallery</label>
                      <input type="text" name="profilePhotos" id="field-employer-photos" class="modern-input" placeholder="Comma-separated image URLs">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 4: Social Channels -->
              <div class="modern-card" id="employer-sec-social" data-section="social">
                <div class="modern-card-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                  <div>
                    <h3 class="modern-card-title">Social Networks</h3>
                    <span class="modern-card-subtitle">Connect public company social media profiles and channels.</span>
                  </div>
                  <button type="button" class="modern-btn-outline" id="btn-add-social-network" style="font-size:12px;padding:6px 14px;border-radius:6px;gap:6px;display:inline-flex;align-items:center;cursor:pointer;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Add Social Link
                  </button>
                </div>
                <div class="modern-card-body">
                  <!-- Active Social Network Rows List -->
                  <div id="employer-socials-list" class="employer-socials-container">
                    <!-- Dynamic social rows rendered here -->
                  </div>

                  <!-- Legacy hidden inputs for backwards compatibility -->
                  <input type="hidden" name="facebook" id="field-employer-facebook">
                  <input type="hidden" name="linkedin" id="field-employer-linkedin">

                  <!-- Quick Add Presets Bar -->
                  <div class="social-presets-bar">
                    <span class="social-presets-label">Quick add:</span>
                    <div class="social-presets-chips">
                      <button type="button" class="social-preset-chip" data-platform="linkedin">+ LinkedIn</button>
                      <button type="button" class="social-preset-chip" data-platform="facebook">+ Facebook</button>
                      <button type="button" class="social-preset-chip" data-platform="twitter">+ Twitter / X</button>
                      <button type="button" class="social-preset-chip" data-platform="instagram">+ Instagram</button>
                      <button type="button" class="social-preset-chip" data-platform="youtube">+ YouTube</button>
                      <button type="button" class="social-preset-chip" data-platform="whatsapp">+ WhatsApp</button>
                      <button type="button" class="social-preset-chip" data-platform="tiktok">+ TikTok</button>
                      <button type="button" class="social-preset-chip" data-platform="github">+ GitHub</button>
                      <button type="button" class="social-preset-chip" data-platform="website">+ Other Link</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 5: Badges & Display Options -->
              <div class="modern-card" id="employer-sec-badges" data-section="badges">
                <div class="modern-card-header">
                  <h3 class="modern-card-title">Badges & Visibility</h3>
                  <span class="modern-card-subtitle">Highlight company presence across directory listings.</span>
                </div>
                <div class="modern-card-body">
                  <div class="modern-toggles-grid">
                    <label class="modern-toggle-card">
                      <div class="toggle-card-text">
                        <span class="toggle-card-title">Featured Employer</span>
                        <span class="toggle-card-desc">Pinned prominently at top of employer directories and searches.</span>
                      </div>
                      <input type="checkbox" name="featured" id="field-employer-featured" class="modern-switch-input">
                      <span class="modern-switch-track"></span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right Modern Settings Sidebar -->
          <aside class="modern-editor-sidebar" id="employer-gutenberg-sidebar">
            <div class="modern-sidebar-header">
              <span class="modern-sidebar-title">Employer Settings</span>
              <button type="button" class="modern-sidebar-close" id="close-employer-sidebar" title="Close sidebar">✕</button>
            </div>

            <div class="modern-sidebar-body">
              <!-- Publishing Card -->
              <div class="modern-sidebar-card">
                <h4 class="modern-sidebar-card-title">Publishing</h4>
                <div class="modern-field-wrap">
                  <label class="modern-label">Publication Status</label>
                  <select name="status" class="modern-select" id="field-employer-status">
                    <option value="publish" selected>Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div class="modern-field-wrap">
                  <label class="modern-label">URL Slug</label>
                  <input type="text" name="slug" id="field-employer-slug" class="modern-input" placeholder="employer-slug" required>
                </div>
              </div>

              <!-- Media / Logo Card -->
              <div class="modern-sidebar-card">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
                  <h4 class="modern-sidebar-card-title" style="margin:0;">Company Logo</h4>
                  <button type="button" id="btn-remove-employer-logo" style="display:none;background:none;border:none;color:#dc2626;font-size:11px;font-weight:500;cursor:pointer;padding:0;">✕ Remove</button>
                </div>
                <div class="modern-img-preview-box" id="employer-logo-preview-box">
                  <div id="employer-logo-empty" class="logo-preview-empty">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <span>No logo selected</span>
                  </div>
                  <img id="employer-logo-img-tag" src="" alt="Employer Logo" style="display:none;">
                </div>
                <input type="hidden" name="logo" id="field-employer-logo-val" value="">
                <button type="button" class="modern-btn-outline" id="set-employer-featured-img-btn">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span id="btn-set-employer-logo-text">Choose Logo Image</span>
                </button>
              </div>

              <!-- Taxonomies: Categories -->
              <div class="modern-sidebar-card">
                <h4 class="modern-sidebar-card-title">Categories</h4>
                <input type="text" class="modern-search-sm" placeholder="Filter categories…" data-search-checklist="employer-categories">
                <div class="modern-taxonomy-checklist tree-checklist" data-list="categories" id="employer-checklist-categories">
                  <!-- Populated dynamically with hierarchy -->
                </div>
                <div class="modern-add-taxonomy-wrap">
                  <button type="button" class="modern-add-tax-toggle" id="btn-toggle-add-employer-category">+ Add New Category</button>
                  <div class="modern-add-tax-form" id="box-add-employer-category" style="display:none;">
                    <label>Category Name</label>
                    <input type="text" class="modern-input-sm" id="input-new-employer-cat-name" placeholder="New Category Name">
                    <label>Parent Category</label>
                    <select class="modern-select-sm" id="select-new-employer-cat-parent">
                      <option value="">— Parent Category —</option>
                    </select>
                    <button type="button" class="modern-btn-add-tax" id="btn-submit-new-employer-category">Add New Category</button>
                  </div>
                </div>
              </div>

              <!-- Taxonomies: Locations -->
              <div class="modern-sidebar-card">
                <h4 class="modern-sidebar-card-title">Locations</h4>
                <input type="text" class="modern-search-sm" placeholder="Filter locations…" data-search-checklist="employer-locations">
                <div class="modern-taxonomy-checklist tree-checklist" data-list="locations" id="employer-checklist-locations">
                  <!-- Populated dynamically with hierarchy -->
                </div>
                <div class="modern-add-taxonomy-wrap">
                  <button type="button" class="modern-add-tax-toggle" id="btn-toggle-add-employer-location">+ Add New Location</button>
                  <div class="modern-add-tax-form" id="box-add-employer-location" style="display:none;">
                    <label>Location Name</label>
                    <input type="text" class="modern-input-sm" id="input-new-employer-loc-name" placeholder="New Location Name">
                    <label>Parent Location</label>
                    <select class="modern-select-sm" id="select-new-employer-loc-parent">
                      <option value="">— Parent Location —</option>
                    </select>
                    <button type="button" class="modern-btn-add-tax" id="btn-submit-new-employer-location">Add New Location</button>
                  </div>
                </div>
              </div>

              <!-- Bottom Actions -->
              <div class="modern-sidebar-card footer-card">
                <span id="employer-save-state" role="status" class="modern-save-state"></span>
                <button id="employer-delete-btn" type="button" class="modern-delete-btn" hidden>Delete Employer</button>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>

    <!-- VIEW 5: Job Types -->
    <div class="admin-view" id="view-taxonomy-types">
      <div class="modern-tax-header">
        <div class="modern-heading-title-area">
          <h1 class="modern-tax-title">Job Types</h1>
          <span class="modern-heading-badge">Employment Classifications</span>
        </div>
        <div class="modern-tax-search-wrap">
          <div class="modern-tax-search-box">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4.5 4.5"/></svg>
            <input type="search" id="search-tax-types" placeholder="Search types…" aria-label="Search Types">
          </div>
          <button type="button" class="modern-tax-search-btn" id="search-tax-types-btn">Search</button>
        </div>
      </div>

      <div class="modern-taxonomy-layout">
        <div class="modern-tax-form-col">
          <div class="modern-card">
            <div class="modern-card-header">
              <h2 class="modern-card-title">Add New Type</h2>
              <span class="modern-card-subtitle">Create a contract or employment term.</span>
            </div>
            <form id="form-add-type" class="modern-card-body">
              <div class="modern-field-wrap">
                <label class="modern-label" for="type-name">Name <span class="req">*</span></label>
                <input name="name" id="type-name" type="text" class="modern-input" placeholder="e.g. Full Time" required autocomplete="off">
                <span class="modern-field-hint">The name as it appears publicly on job listings.</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="type-slug">Slug</label>
                <input name="slug" id="type-slug" type="text" class="modern-input" placeholder="e.g. full-time">
                <span class="modern-field-hint">URL-friendly slug (lowercase, numbers, and hyphens).</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="type-parent">Parent Type</label>
                <select name="parent" id="type-parent" class="modern-select">
                  <option value="">None (Top Level)</option>
                </select>
                <span class="modern-field-hint">Optional parent term to nest hierarchical types.</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="type-description">Description</label>
                <textarea name="description" id="type-description" class="modern-textarea" rows="3" placeholder="Brief summary of this role type…"></textarea>
              </div>
              <div class="modern-grid-2">
                <div class="modern-field-wrap">
                  <label class="modern-label">Badge Color</label>
                  <div class="modern-color-picker-wrap">
                    <span class="modern-color-preview" id="preview-type-bg" style="background:#ffffff;"></span>
                    <button type="button" class="modern-color-btn" data-trigger-color="type-bg-input">Choose Color</button>
                    <input type="color" name="bgColor" id="type-bg-input" value="#ffffff" class="modern-color-native">
                  </div>
                </div>
                <div class="modern-field-wrap">
                  <label class="modern-label">Text Color</label>
                  <div class="modern-color-picker-wrap">
                    <span class="modern-color-preview" id="preview-type-text" style="background:#0284c7;"></span>
                    <button type="button" class="modern-color-btn" data-trigger-color="type-text-input">Choose Color</button>
                    <input type="color" name="textColor" id="type-text-input" value="#0284c7" class="modern-color-native">
                  </div>
                </div>
              </div>
              <div class="modern-tax-btn-wrap">
                <button type="submit" class="modern-btn-primary">Add New Type</button>
              </div>
            </form>
          </div>
        </div>

        <div class="modern-tax-table-col">
          <div class="modern-card">
            <div class="modern-tax-table-toolbar">
              <div class="modern-bulk-wrap">
                <select id="bulk-type-top" class="modern-select-sm">
                  <option value="-1">Bulk actions</option>
                  <option value="delete">Delete selected</option>
                </select>
                <button type="button" class="modern-btn-sm">Apply</button>
              </div>
              <div class="modern-count-badge" id="count-tax-types">5 items</div>
            </div>
            <div class="modern-table-responsive">
              <table class="modern-tax-table">
                <thead>
                  <tr>
                    <th class="check-col"><input type="checkbox" id="cb-select-types" class="modern-checkbox"></th>
                    <th class="color-col">Badge</th>
                    <th class="name-col">Name</th>
                    <th class="desc-col">Description</th>
                    <th class="slug-col">Slug</th>
                    <th class="emp-col">Classification</th>
                    <th class="count-col">Count</th>
                  </tr>
                </thead>
                <tbody id="tbody-tax-types"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 6: Job & Employer Categories -->
    <div class="admin-view" id="view-taxonomy-categories">
      <div class="modern-tax-header">
        <div class="modern-heading-title-area">
          <h1 class="modern-tax-title" id="categories-page-title">Job Categories</h1>
          <span class="modern-heading-badge" id="categories-page-badge">Industry Sectors</span>
        </div>
        <div class="modern-tax-search-wrap">
          <div class="modern-tax-search-box">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4.5 4.5"/></svg>
            <input type="search" id="search-tax-categories" placeholder="Search categories…" aria-label="Search Categories">
          </div>
          <button type="button" class="modern-tax-search-btn" id="search-tax-categories-btn">Search</button>
        </div>
      </div>

      <div class="modern-taxonomy-layout">
        <div class="modern-tax-form-col">
          <div class="modern-card">
            <div class="modern-card-header">
              <h2 class="modern-card-title" id="categories-form-title">Add New Category</h2>
              <span class="modern-card-subtitle" id="categories-form-subtitle">Create an industry category or sub-category.</span>
            </div>
            <form id="form-add-category" class="modern-card-body">
              <div class="modern-field-wrap">
                <label class="modern-label" for="cat-name">Name <span class="req">*</span></label>
                <input name="name" id="cat-name" type="text" class="modern-input" placeholder="e.g. Information Technology" required autocomplete="off">
                <span class="modern-field-hint" id="categories-field-hint">The category name displayed across filters.</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="cat-slug">Slug</label>
                <input name="slug" id="cat-slug" type="text" class="modern-input" placeholder="e.g. information-technology">
                <span class="modern-field-hint" id="categories-slug-hint">URL-friendly slug for directory navigation.</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="cat-parent">Parent Category</label>
                <select name="parent" id="cat-parent" class="modern-select">
                  <option value="">None (Top Level)</option>
                </select>
                <span class="modern-field-hint">Assign a parent category to create a nested hierarchy.</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="cat-description">Description</label>
                <textarea name="description" id="cat-description" class="modern-textarea" rows="3" placeholder="Category overview or sector scope…"></textarea>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label">Category Thumbnail / Icon</label>
                <div class="modern-upload-field-wrap">
                  <input type="text" name="image" id="cat-image-url" class="modern-input" placeholder="Image URL (e.g. /assets/category.jpg)">
                  <button type="button" class="modern-btn-outline-sm" id="cat-img-btn">Browse</button>
                </div>
              </div>
              <div class="modern-tax-btn-wrap">
                <button type="submit" class="modern-btn-primary" id="btn-submit-category">Add New Category</button>
              </div>
            </form>
          </div>
        </div>

        <div class="modern-tax-table-col">
          <div class="modern-card">
            <div class="modern-tax-table-toolbar">
              <div class="modern-bulk-wrap">
                <select id="bulk-cat-top" class="modern-select-sm">
                  <option value="-1">Bulk actions</option>
                  <option value="delete">Delete selected</option>
                </select>
                <button type="button" class="modern-btn-sm">Apply</button>
              </div>
              <div class="modern-count-badge" id="count-tax-categories">22 items</div>
            </div>
            <div class="modern-table-responsive">
              <table class="modern-tax-table">
                <thead>
                  <tr>
                    <th class="check-col"><input type="checkbox" id="cb-select-categories" class="modern-checkbox"></th>
                    <th class="name-col">Name</th>
                    <th class="desc-col">Description & Thumbnail</th>
                    <th class="slug-col">Slug</th>
                    <th class="count-col">Count</th>
                  </tr>
                </thead>
                <tbody id="tbody-tax-categories"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 7: Job & Employer Locations -->
    <div class="admin-view" id="view-taxonomy-locations">
      <div class="modern-tax-header">
        <div class="modern-heading-title-area">
          <h1 class="modern-tax-title" id="locations-page-title">Job Locations</h1>
          <span class="modern-heading-badge">Geographic Regions</span>
        </div>
        <div class="modern-tax-search-wrap">
          <div class="modern-tax-search-box">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4.5 4.5"/></svg>
            <input type="search" id="search-tax-locations" placeholder="Search locations…" aria-label="Search Locations">
          </div>
          <button type="button" class="modern-tax-search-btn" id="search-tax-locations-btn">Search</button>
        </div>
      </div>

      <div class="modern-taxonomy-layout">
        <div class="modern-tax-form-col">
          <div class="modern-card">
            <div class="modern-card-header">
              <h2 class="modern-card-title">Add New Location</h2>
              <span class="modern-card-subtitle">Create a country, state, city, or neighborhood term.</span>
            </div>
            <form id="form-add-location" class="modern-card-body">
              <div class="modern-field-wrap">
                <label class="modern-label" for="loc-name">Name <span class="req">*</span></label>
                <input name="name" id="loc-name" type="text" class="modern-input" placeholder="e.g. Dubai" required autocomplete="off">
                <span class="modern-field-hint">The name as it appears on listing filters.</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="loc-slug">Slug</label>
                <input name="slug" id="loc-slug" type="text" class="modern-input" placeholder="e.g. dubai">
                <span class="modern-field-hint">URL-friendly slug (lowercase, numbers, and hyphens).</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="loc-parent">Parent Location</label>
                <select name="parent" id="loc-parent" class="modern-select">
                  <option value="">None (Top Level)</option>
                </select>
                <span class="modern-field-hint">Assign a parent to nest terms hierarchically (e.g. UAE → Dubai).</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="loc-description">Description</label>
                <textarea name="description" id="loc-description" class="modern-textarea" rows="3" placeholder="Brief geographic notes…"></textarea>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="loc-custom-url">Custom URL</label>
                <input name="customUrl" id="loc-custom-url" type="text" class="modern-input" placeholder="https://...">
                <span class="modern-field-hint">Optional destination URL for auto-linked listings.</span>
              </div>
              <div class="modern-tax-btn-wrap">
                <button type="submit" class="modern-btn-primary">Add New Location</button>
              </div>
            </form>
          </div>
        </div>

        <div class="modern-tax-table-col">
          <div class="modern-card">
            <div class="modern-tax-table-toolbar">
              <div class="modern-bulk-wrap">
                <select id="bulk-loc-top" class="modern-select-sm">
                  <option value="-1">Bulk actions</option>
                  <option value="delete">Delete selected</option>
                </select>
                <button type="button" class="modern-btn-sm">Apply</button>
              </div>
              <div class="modern-count-badge" id="count-tax-locations">9 items</div>
            </div>
            <div class="modern-table-responsive">
              <table class="modern-tax-table">
                <thead>
                  <tr>
                    <th class="check-col"><input type="checkbox" id="cb-select-locations" class="modern-checkbox"></th>
                    <th class="name-col">Name</th>
                    <th class="desc-col">Description</th>
                    <th class="slug-col">Slug</th>
                    <th class="count-col">Count</th>
                  </tr>
                </thead>
                <tbody id="tbody-tax-locations"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 8: Job Tags -->
    <div class="admin-view" id="view-taxonomy-tags">
      <div class="modern-tax-header">
        <div class="modern-heading-title-area">
          <h1 class="modern-tax-title">Job Tags</h1>
          <span class="modern-heading-badge">Keywords & Skills</span>
        </div>
        <div class="modern-tax-search-wrap">
          <div class="modern-tax-search-box">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4.5 4.5"/></svg>
            <input type="search" id="search-tax-tags" placeholder="Search tags…" aria-label="Search Tags">
          </div>
          <button type="button" class="modern-tax-search-btn" id="search-tax-tags-btn">Search</button>
        </div>
      </div>

      <div class="modern-taxonomy-layout">
        <div class="modern-tax-form-col">
          <div class="modern-card">
            <div class="modern-card-header">
              <h2 class="modern-card-title">Add New Tag</h2>
              <span class="modern-card-subtitle">Create a search keyword or technical skill tag.</span>
            </div>
            <form id="form-add-tag" class="modern-card-body">
              <div class="modern-field-wrap">
                <label class="modern-label" for="tag-term-name">Name <span class="req">*</span></label>
                <input name="name" id="tag-term-name" type="text" class="modern-input" placeholder="e.g. React.js" required autocomplete="off">
                <span class="modern-field-hint">The tag label attached to job posts.</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="tag-term-slug">Slug</label>
                <input name="slug" id="tag-term-slug" type="text" class="modern-input" placeholder="e.g. react-js">
                <span class="modern-field-hint">URL-friendly slug (lowercase, numbers, and hyphens).</span>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="tag-term-description">Description</label>
                <textarea name="description" id="tag-term-description" class="modern-textarea" rows="4" placeholder="Brief notes on this skill or tag…"></textarea>
              </div>
              <div class="modern-tax-btn-wrap">
                <button type="submit" class="modern-btn-primary">Add New Tag</button>
              </div>
            </form>
          </div>
        </div>

        <div class="modern-tax-table-col">
          <div class="modern-card">
            <div class="modern-tax-table-toolbar">
              <div class="modern-bulk-wrap">
                <select id="bulk-tag-top" class="modern-select-sm">
                  <option value="-1">Bulk actions</option>
                  <option value="delete">Delete selected</option>
                </select>
                <button type="button" class="modern-btn-sm">Apply</button>
              </div>
              <div class="modern-count-badge" id="count-tax-tags">5 items</div>
            </div>
            <div class="modern-table-responsive">
              <table class="modern-tax-table">
                <thead>
                  <tr>
                    <th class="check-col"><input type="checkbox" id="cb-select-tags" class="modern-checkbox"></th>
                    <th class="name-col">Name</th>
                    <th class="desc-col">Description</th>
                    <th class="slug-col">Slug</th>
                    <th class="count-col">Count</th>
                  </tr>
                </thead>
                <tbody id="tbody-tax-tags"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 9: All Users -->
    <div class="admin-view" id="view-users">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <h1 class="modern-page-title">Users</h1>
              <span class="modern-heading-badge" id="admin-users-count-chip">4 team members</span>
            </div>
            <p class="modern-page-subtitle">Manage platform administrators, recruiters, content editors, and registered candidates.</p>
          </div>
        </div>
        <div class="modern-heading-actions">
          <a href="#user-new" class="modern-btn-primary-header" id="new-user-top">
            <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            <span>Add New User</span>
          </a>
        </div>
      </div>

      <div class="modern-card modern-table-card">
        <!-- 1. Role Filter Tabs -->
        <div class="modern-card-tab-bar">
          <ul class="modern-status-nav" id="admin-user-tabs">
            <li class="all"><a href="#" class="current" data-user-role="all"><span>All</span> <span class="count" id="count-user-all">2</span></a></li>
            <li class="administrator"><a href="#" data-user-role="Administrator"><span>Administrator</span> <span class="count" id="count-user-admin">1</span></a></li>
            <li class="editor"><a href="#" data-user-role="Editor"><span>Editor</span> <span class="count" id="count-user-editor">1</span></a></li>
            <li class="content-editor"><a href="#" data-user-role="Content Editor"><span>Content Editor</span> <span class="count" id="count-user-content-editor">0</span></a></li>
          </ul>
        </div>

        <!-- 2. Integrated Command Bar -->
        <div class="modern-card-toolbar">
          <div class="modern-toolbar-left">
            <div class="modern-search-box-unified">
              <svg class="search-icon-svg" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
              <input type="search" id="admin-user-search" placeholder="Search by username, name, or email…" aria-label="Search users">
              <button type="button" id="admin-user-search-button" class="modern-search-submit-btn">Search</button>
            </div>

            <div class="modern-filter-dropdowns">
              <select id="filter-user-role-selector" class="modern-select-pill" aria-label="Change role to">
                <option value="">Change role to…</option>
                <option value="Administrator">Administrator</option>
                <option value="Editor">Editor</option>
                <option value="Content Editor">Content Editor</option>
                <option value="Employer">Employer</option>
                <option value="Candidate">Candidate</option>
              </select>
              <button type="button" class="modern-btn-filter" id="btn-change-user-role">Change</button>
            </div>
          </div>

          <div class="modern-toolbar-right">
            <div class="modern-bulk-action-group">
              <select id="bulk-action-users-selector" class="modern-select-pill" aria-label="Bulk actions">
                <option value="-1">Bulk actions</option>
                <option value="delete">Delete selected</option>
              </select>
              <button type="button" class="modern-btn-secondary" id="btn-apply-user-bulk">Apply</button>
            </div>
          </div>
        </div>

        <!-- 3. Clean Table -->
        <div class="modern-table-responsive">
          <table class="modern-users-table">
            <thead>
              <tr>
                <th class="user-col-cb"><input id="cb-select-all-users" type="checkbox" aria-label="Select All"></th>
                <th class="user-col-user">User</th>
                <th class="user-col-email">Email</th>
                <th class="user-col-role">Role</th>
                <th class="user-col-posts">Posts</th>
                <th class="user-col-status">Status</th>
                <th class="user-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody id="admin-user-rows"></tbody>
          </table>
        </div>

        <!-- 4. Footer Pagination -->
        <div class="modern-card-footer tablenav">
          <div class="modern-footer-info">
            <span class="displaying-num" id="admin-users-items-count">4 users</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 10: Add / Edit User -->
    <div class="admin-view" id="view-user-editor">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <a href="#users" class="modern-header-back-btn">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16l-6-6 6-6"/></svg>
                <span>Users</span>
              </a>
              <h1 class="modern-page-title" id="user-editor-page-title">Add New User</h1>
              <span class="modern-heading-badge" id="user-editor-badge">Portal Credentials</span>
            </div>
            <p class="modern-page-subtitle">Create a brand new user account and set portal role permissions.</p>
          </div>
        </div>
      </div>

      <div class="modern-editor-container" style="max-width: 820px; margin: 0 auto;">
        <form id="admin-user-form" class="modern-card" style="border-radius: 12px; overflow: hidden; background:#ffffff; border:1px solid #eef2f6; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <input type="hidden" name="userId" id="field-user-id" value="">
          <div class="modern-card-header" style="padding: 16px 22px; background: #fafbfc; border-bottom: 1px solid #f1f5f9;">
            <h2 class="modern-card-title" id="user-card-heading">Account Profile</h2>
            <span class="modern-card-subtitle">User details, login credentials, and permission role.</span>
          </div>
          <div class="modern-card-body" style="padding: 22px; display:flex; flex-direction:column; gap:16px;">
            <div class="modern-field-wrap">
              <label class="modern-label" for="user-username">Username <span class="req">*</span></label>
              <input name="username" id="user-username" type="text" class="modern-input" placeholder="e.g. jsmith" required autocomplete="off">
              <span class="modern-field-hint">Used to sign in. It must be unique across all portal users.</span>
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label" for="user-email">Email <span class="req">*</span></label>
              <input name="email" id="user-email" type="email" class="modern-input" placeholder="e.g. john.smith@company.com" required autocomplete="off">
              <span class="modern-field-hint">Official email address used for login and notifications.</span>
            </div>

            <div class="modern-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="modern-field-wrap">
                <label class="modern-label" for="user-first-name">First Name</label>
                <input name="firstName" id="user-first-name" type="text" class="modern-input" placeholder="e.g. John">
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="user-last-name">Last Name</label>
                <input name="lastName" id="user-last-name" type="text" class="modern-input" placeholder="e.g. Smith">
              </div>
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label" for="user-website">Website</label>
              <input name="website" id="user-website" type="url" class="modern-input" placeholder="https://...">
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label" for="user-role">Role <span class="req">*</span></label>
              <select name="role" id="user-role" class="modern-select" required>
                <option value="Administrator">Administrator (Full Access)</option>
                <option value="Editor" selected>Editor (Can edit & publish any listings)</option>
                <option value="Content Editor">Content Editor (Blog, Jobs & Employers)</option>
              </select>
              <span class="modern-field-hint">Defines permissions and portal access level.</span>
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label" for="user-status">Account Status <span class="req">*</span></label>
              <select name="status" id="user-status" class="modern-select" required>
                <option value="active">Active — Can sign in</option>
                <option value="inactive">Inactive — Sign-in disabled</option>
              </select>
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label" for="user-password">Password</label>
              <div style="display:flex; gap:8px;">
                <input name="password" id="user-password" type="text" class="modern-input" placeholder="Enter password or generate one" style="flex:1;">
                <button type="button" id="btn-generate-password" class="modern-filter-btn" style="white-space:nowrap; padding:0 14px;">Generate Password</button>
              </div>
              <span class="modern-field-hint">Leave blank to keep the existing password. New passwords are stored as a one-way hash.</span>
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label" for="user-bio">Biographical Info</label>
              <textarea name="bio" id="user-bio" class="modern-textarea" rows="3" placeholder="Share a little biographical information to fill out your profile…"></textarea>
            </div>

            <div class="modern-field-wrap" style="flex-direction:row; align-items:center; gap:8px; padding-top:4px;">
              <input type="checkbox" name="sendNotification" id="user-notification" class="modern-checkbox" checked>
              <label for="user-notification" style="font-size:12.5px; color:#334155; cursor:pointer; margin:0;">Send User Notification: Send the new user an email about their account.</label>
            </div>

            <div style="display:flex; align-items:center; gap:12px; margin-top:10px; padding-top:16px; border-top:1px solid #f1f5f9;">
              <button type="submit" class="modern-btn-primary" id="btn-submit-user" style="width:auto; padding:0 24px;">Add New User</button>
              <a href="#users" class="modern-filter-btn" style="text-decoration:none; display:inline-flex; align-items:center;">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- VIEW 11: All Posts -->
    <div class="admin-view" id="view-posts">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <h1 class="modern-page-title">Posts</h1>
              <span class="modern-heading-badge" id="admin-posts-count-chip">88 items</span>
            </div>
            <p class="modern-page-subtitle">Manage, edit, and optimize all blog articles, insights, and career advice guides.</p>
          </div>
        </div>
        <div class="modern-heading-actions">
          <a href="#post-new" class="modern-btn-primary-header" id="new-post-top">
            <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            <span>Add Post</span>
          </a>
        </div>
      </div>

      <div class="modern-card modern-table-card">
        <!-- 1. Status Navigation Tabs -->
        <div class="modern-card-tab-bar">
          <ul class="modern-status-nav" id="admin-post-tabs">
            <li class="all"><a href="#" class="current" data-post-status="all"><span>All</span> <span class="count" id="count-post-all">32</span></a></li>
            <li class="mine"><a href="#" data-post-status="mine"><span>Mine</span> <span class="count" id="count-post-mine">2</span></a></li>
            <li class="published"><a href="#" data-post-status="published"><span>Published</span> <span class="count" id="count-post-published">32</span></a></li>
            <li class="scheduled"><a href="#" data-post-status="scheduled"><span>Scheduled</span> <span class="count" id="count-post-scheduled">0</span></a></li>
            <li class="pillar"><a href="#" data-post-status="pillar"><span>Pillar Content</span> <span class="count" id="count-post-pillar">0</span></a></li>
          </ul>
        </div>

        <!-- 2. Integrated Command Bar -->
        <div class="modern-card-toolbar">
          <div class="modern-toolbar-left">
            <div class="modern-search-box-unified">
              <svg class="search-icon-svg" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
              <input type="search" id="admin-post-search" placeholder="Search by title, author, or category…" aria-label="Search posts">
              <button type="button" id="admin-post-search-button" class="modern-search-submit-btn">Search</button>
            </div>

            <div class="modern-filter-dropdowns">
              <select id="filter-post-date" class="modern-select-pill" aria-label="Filter by date">
                <option value="">All dates</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
                <option value="2026-07">July 2026</option>
              </select>

              <select id="filter-post-category" class="modern-select-pill" aria-label="Filter by category">
                <option value="">All Categories</option>
                <option value="Insurance">Insurance</option>
                <option value="Health">Health</option>
                <option value="Career Tips">Career Tips</option>
                <option value="Part Time Job">Part Time Job</option>
              </select>

              <button type="button" class="modern-btn-filter" id="btn-filter-posts">Filter</button>
            </div>
          </div>

          <div class="modern-toolbar-right">
            <div class="modern-bulk-action-group">
              <select id="bulk-action-posts-selector" class="modern-select-pill" aria-label="Bulk actions">
                <option value="-1">Bulk actions</option>
                <option value="edit">Edit</option>
                <option value="trash">Move to Trash</option>
              </select>
              <button type="button" class="modern-btn-secondary" id="btn-apply-posts-bulk">Apply</button>
            </div>
          </div>
        </div>

        <!-- 3. Posts Clean Table -->
        <div class="modern-table-responsive">
          <table class="modern-posts-table">
            <thead>
              <tr>
                <th class="post-col-cb"><input id="cb-select-all-posts" type="checkbox" aria-label="Select All"></th>
                <th class="post-col-title">Article & Title</th>
                <th class="post-col-author">Author</th>
                <th class="post-col-status">Status</th>
                <th class="post-col-date-views">Date & Views</th>
              </tr>
            </thead>
            <tbody id="admin-post-rows"></tbody>
          </table>
        </div>

        <!-- 4. Footer Pagination -->
        <div class="modern-card-footer tablenav">
          <div class="modern-footer-info">
            <span class="displaying-num" id="admin-posts-items-count">32 items</span>
          </div>
          <div class="tablenav-pages modern-pagination">
            <span class="pagination-links" id="admin-posts-pagination"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 12: Add / Edit Post (Authentic WordPress Gutenberg Block Editor) -->
    <div class="admin-view" id="view-post-editor">
      <div class="wp-gutenberg-wrapper">
        <input type="hidden" id="wp-field-post-id" value="">

        <!-- Top Gutenberg Header Bar -->
        <header class="wp-gutenberg-header">
          <div class="wp-header-left">
            <a href="#posts" class="wp-header-btn-icon wp-header-back-btn" title="Back" id="wp-back-to-posts" aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>Back</span>
            </a>
            <button type="button" class="wp-inserter-toggle-btn" id="wp-btn-toggle-inserter" title="Toggle block inserter">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            </button>
            <button type="button" class="wp-header-btn-icon" id="wp-btn-undo" title="Undo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
            </button>
            <button type="button" class="wp-header-btn-icon" id="wp-btn-redo" title="Redo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>
            </button>
            <button type="button" class="wp-header-btn-icon" id="wp-btn-listview" title="Document Overview">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="wp-header-center">
            <span class="wp-doc-status-chip" id="wp-doc-title-indicator">No Title - Post</span>
          </div>

          <div class="wp-header-right">
            <button type="button" class="wp-draft-btn" id="wp-btn-save-draft">Save draft</button>
            <a href="#" target="_blank" rel="noopener" class="wp-preview-btn" id="wp-btn-preview" title="Preview in new tab">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span>Preview</span>
            </a>
            <button type="button" class="wp-seo-snippet-btn" id="wp-btn-seo-snippet" title="Edit SEO title, description, and URL">SEO</button>
            <button type="button" class="wp-sidebar-toggle-btn is-active" id="wp-btn-toggle-sidebar" title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/></svg>
            </button>
            <button type="button" class="wp-publish-btn" id="wp-btn-publish">Publish</button>
          </div>
        </header>

        <div class="wp-seo-modal" id="wp-seo-modal" aria-hidden="true">
          <div class="wp-seo-modal-backdrop" data-close-seo-modal></div>
          <section class="wp-seo-dialog" role="dialog" aria-modal="true" aria-labelledby="wp-seo-dialog-title">
            <header><h2 id="wp-seo-dialog-title">Preview Snippet Editor</h2><button type="button" data-close-seo-modal aria-label="Close">×</button></header>
            <div class="wp-seo-dialog-body">
              <h3>Preview</h3>
              <div class="wp-google-preview"><div id="wp-seo-preview-url">https://www.trikonet.com/</div><strong id="wp-seo-preview-title">Page title</strong><p id="wp-seo-preview-description">Add a concise description for search results.</p></div>
              <label class="wp-seo-field"><span><b>Title</b><em id="wp-seo-title-count">0 / 60</em></span><input id="wp-seo-title" maxlength="120" placeholder="SEO title"><small>This appears as the first line in search results.</small></label>
              <label class="wp-seo-field"><span><b>Permalink</b><em id="wp-seo-slug-count">0 / 75</em></span><input id="wp-seo-permalink" maxlength="120" placeholder="page-url"><small>The unique URL of this page.</small></label>
              <label class="wp-seo-field"><span><b>Description</b><em id="wp-seo-description-count">0 / 160</em></span><textarea id="wp-seo-description" rows="4" maxlength="300" placeholder="Meta description"></textarea><small>This appears below the title in search results.</small></label>
              <div class="wp-seo-checks" id="wp-seo-checks"></div>
            </div>
            <footer><button type="button" class="wp-seo-cancel" data-close-seo-modal>Cancel</button><button type="button" class="wp-seo-apply" id="wp-seo-apply">Apply SEO changes</button></footer>
          </section>
        </div>

        <!-- Gutenberg Workspace Body -->
        <div class="wp-gutenberg-body">
          <!-- Left-Side Block Inserter Drawer -->
          <div class="wp-block-inserter-drawer collapsed" id="wp-post-inserter-drawer">
            <div class="wp-inserter-search-wrap">
              <input type="text" class="wp-inserter-search-input" id="wp-inserter-search" placeholder="Search">
            </div>
            <div class="wp-inserter-categories">
              <!-- HOME PAGE WIDGETS -->
              <div class="wp-home-widgets-group">
                <div class="wp-inserter-group-title">HOME WIDGETS</div>
                <div class="wp-inserter-grid">
                  <div class="wp-inserter-tile" data-block-type="home-hero" title="Hero and job search"><div class="wp-inserter-tile-icon">⌕</div><span class="wp-inserter-tile-label">Hero Search</span></div>
                  <div class="wp-inserter-tile" data-block-type="home-categories" title="Popular job categories"><div class="wp-inserter-tile-icon">▦</div><span class="wp-inserter-tile-label">Job Categories</span></div>
                  <div class="wp-inserter-tile" data-block-type="home-how-it-works" title="How it works"><div class="wp-inserter-tile-icon">③</div><span class="wp-inserter-tile-label">How It Works</span></div>
                  <div class="wp-inserter-tile" data-block-type="home-articles" title="Recent articles"><div class="wp-inserter-tile-icon">▤</div><span class="wp-inserter-tile-label">Recent Articles</span></div>
                </div>
              </div>

              <!-- TEXT GROUP -->
              <div>
                <div class="wp-inserter-group-title">TEXT</div>
                <div class="wp-inserter-grid">
                  <div class="wp-inserter-tile" data-block-type="paragraph" title="Paragraph">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 4v16m4-16v16M13 4H9.5a4.5 4.5 0 000 9H13"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Paragraph</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="heading" title="Heading">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5v14M19 5v14M5 12h14"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Heading</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="list" title="List">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">List</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="quote" title="Quote">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Quote</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="code" title="Code">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Code</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="table" title="Table">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M12 4v16"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Table</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="toc" title="Table of Contents">
                    <div class="wp-inserter-tile-icon"><strong style="font-size:11px">TOC</strong></div>
                    <span class="wp-inserter-tile-label">Table of Contents</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="details" title="Details">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 10l4 4 4-4"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Details</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="preformatted" title="Preformatted">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h11M4 18h16"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Preformatted</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="classic" title="Classic">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Classic</span>
                  </div>
                </div>
              </div>

              <!-- MEDIA GROUP -->
              <div>
                <div class="wp-inserter-group-title">MEDIA</div>
                <div class="wp-inserter-grid">
                  <div class="wp-inserter-tile" data-block-type="image" title="Image">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Image</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="gallery" title="Gallery">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="13" height="13" rx="2"/><path d="M7 21h12a2 2 0 002-2V7"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Gallery</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="cover" title="Cover">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 11h18M7 15h10" stroke-linecap="round"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Cover</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="file" title="File">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 18v-6m-3 3l3 3 3-3"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">File</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="video" title="Video">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9l6 3-6 3V9z" fill="currentColor"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Video</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="audio" title="Audio">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Audio</span>
                  </div>
                </div>
              </div>

              <!-- DESIGN GROUP -->
              <div>
                <div class="wp-inserter-group-title">DESIGN</div>
                <div class="wp-inserter-grid">
                  <div class="wp-inserter-tile" data-block-type="buttons" title="Buttons">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="9" height="10" rx="3"/><rect x="13" y="7" width="9" height="10" rx="3"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Buttons</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="columns" title="Columns">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Columns</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="separator" title="Separator">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 12h16"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Separator</span>
                  </div>
                  <div class="wp-inserter-tile" data-block-type="spacer" title="Spacer">
                    <div class="wp-inserter-tile-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7l4-4 4 4M8 17l4 4 4-4M12 3v18"/></svg>
                    </div>
                    <span class="wp-inserter-tile-label">Spacer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Center Gutenberg Writing Canvas -->
          <div class="wp-gutenberg-canvas" id="wp-post-canvas">
            <div class="wp-canvas-inner">
              <!-- Title Textarea -->
              <textarea id="wp-post-title-input" class="wp-title-textarea" placeholder="Add title" rows="1"></textarea>

              <!-- Author & Reviewer Byline Bar (In Between Title & Content Blocks) -->
              <div class="wp-editor-byline-bar" id="wp-editor-byline-bar" style="display:none;">
                <div class="wp-editor-byline-card" id="wp-editor-author-card">
                  <button type="button" class="wp-byline-card-hide" id="wp-btn-hide-author" title="Hide Author">✕</button>
                  <div class="wp-editor-byline-avatar-wrap" id="wp-btn-upload-author-avatar-wrap" title="Click to upload/change author photo">
                    <img id="wp-editor-author-avatar" src="" alt="Author" class="wp-editor-byline-avatar" style="display:none;">
                    <div id="wp-editor-author-placeholder" class="wp-editor-avatar-empty-placeholder">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span class="wp-avatar-add-badge" aria-hidden="true">+</span>
                    </div>
                    <span class="wp-editor-avatar-hover-icon" aria-hidden="true">📷</span>
                  </div>
                  <div class="wp-editor-byline-details">
                    <div class="wp-editor-byline-role">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b00008" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                      <span id="wp-editor-author-role-label" class="wp-byline-editable-text" contenteditable="true" spellcheck="false" title="Click to edit role">Written By</span>
                    </div>
                    <div class="wp-editor-byline-name wp-byline-editable-text" id="wp-editor-author-name-label" contenteditable="true" spellcheck="false" title="Click to edit author name"></div>
                  </div>
                </div>

                <div class="wp-editor-byline-sep" id="wp-editor-byline-sep" aria-hidden="true"></div>

                <div class="wp-editor-byline-card" id="wp-editor-reviewer-card">
                  <button type="button" class="wp-byline-card-hide" id="wp-btn-hide-reviewer" title="Hide Reviewer">✕</button>
                  <div class="wp-editor-byline-avatar-wrap" id="wp-btn-upload-reviewer-avatar-wrap" title="Click to upload/change reviewer photo">
                    <img id="wp-editor-reviewer-avatar" src="" alt="Reviewer" class="wp-editor-byline-avatar" style="display:none;">
                    <div id="wp-editor-reviewer-placeholder" class="wp-editor-avatar-empty-placeholder">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span class="wp-avatar-add-badge" aria-hidden="true">+</span>
                    </div>
                    <span class="wp-editor-avatar-hover-icon" aria-hidden="true">📷</span>
                  </div>
                  <div class="wp-editor-byline-details">
                    <div class="wp-editor-byline-role">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#b00008">
                        <circle cx="12" cy="12" r="10" fill="#b00008"/>
                        <path d="m9 12 2 2 4-4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                      </svg>
                      <span id="wp-editor-reviewer-role-label" class="wp-byline-editable-text" contenteditable="true" spellcheck="false" title="Click to edit role">Reviewed by:</span>
                    </div>
                    <div class="wp-editor-byline-name wp-byline-editable-text" id="wp-editor-reviewer-name-label" contenteditable="true" spellcheck="false" title="Click to edit reviewer name"></div>
                  </div>
                </div>

                <button type="button" class="wp-byline-add-pill" id="wp-btn-restore-author" style="display:none;" title="Show Author">+ Add Author</button>
                <button type="button" class="wp-byline-add-pill" id="wp-btn-restore-reviewer" style="display:none;" title="Show Reviewer">+ Add Reviewer</button>
                <button type="button" class="wp-byline-hide-bar-btn" id="wp-btn-hide-both" title="Hide Byline Bar">✕ Hide Bar</button>
              </div>

              <!-- Placeholder when both are hidden -->
              <div class="wp-editor-byline-placeholder" id="wp-editor-byline-placeholder" style="display:flex;">
                <button type="button" class="wp-byline-restore-bar-btn" id="wp-btn-restore-both">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  <span>+ Add Author &amp; Reviewer Bar</span>
                </button>
              </div>

              <!-- Dynamic Blocks Flow Container -->
              <div class="wp-blocks-flow" id="wp-blocks-container">
                <!-- Blocks dynamically inserted here -->
              </div>

              <div class="wp-selection-toolbar" id="wp-selection-toolbar" role="toolbar" aria-label="Text formatting" hidden>
                <!-- Block Switcher Dropdown -->
                <div class="wp-tb-dropdown-wrap" id="wp-tb-block-dropdown-wrap">
                  <button type="button" class="wp-tb-btn wp-tb-dropdown-trigger" id="wp-tb-block-btn" title="Transform block">
                    <span class="wp-tb-icon" id="wp-tb-block-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
                    </span>
                    <span class="wp-tb-label" id="wp-tb-block-label">Paragraph</span>
                    <svg class="wp-tb-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="wp-tb-menu" id="wp-tb-block-menu" hidden>
                    <button type="button" class="wp-tb-menu-item is-selected" data-transform-type="paragraph">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg></span>
                      <span>Paragraph</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-transform-type="heading:h2">
                      <span class="wp-tb-menu-icon" style="font-weight:700;font-size:12px;">H2</span>
                      <span>Heading 2</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-transform-type="heading:h3">
                      <span class="wp-tb-menu-icon" style="font-weight:700;font-size:12px;">H3</span>
                      <span>Heading 3</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-transform-type="heading:h4">
                      <span class="wp-tb-menu-icon" style="font-weight:700;font-size:12px;">H4</span>
                      <span>Heading 4</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-transform-type="list">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="2" fill="currentColor"/><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="4" cy="18" r="2" fill="currentColor"/></svg></span>
                      <span>Bullet List</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-transform-type="quote">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg></span>
                      <span>Quote</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-transform-type="code">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
                      <span>Code Block</span>
                    </button>
                  </div>
                </div>

                <span class="wp-selection-divider"></span>

                <!-- Text Alignment Dropdown -->
                <div class="wp-tb-dropdown-wrap" id="wp-tb-align-dropdown-wrap">
                  <button type="button" class="wp-tb-btn wp-tb-dropdown-trigger wp-tb-icon-btn" id="wp-tb-align-btn" title="Text alignment">
                    <span class="wp-tb-icon" id="wp-tb-align-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="15" y1="18" x2="3" y2="18"/></svg>
                    </span>
                    <svg class="wp-tb-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="wp-tb-menu" id="wp-tb-align-menu" hidden>
                    <button type="button" class="wp-tb-menu-item is-selected" data-align-type="left">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="15" y1="18" x2="3" y2="18"/></svg></span>
                      <span>Align left</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-align-type="center">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg></span>
                      <span>Align center</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-align-type="right">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/></svg></span>
                      <span>Align right</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-align-type="justify">
                      <span class="wp-tb-menu-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg></span>
                      <span>Justify</span>
                    </button>
                  </div>
                </div>

                <span class="wp-selection-divider"></span>

                <!-- Primary Text Formatting -->
                <button type="button" class="wp-tb-btn wp-tb-icon-btn" data-inline-cmd="bold" title="Bold (Ctrl+B)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
                </button>
                <button type="button" class="wp-tb-btn wp-tb-icon-btn" data-inline-cmd="italic" title="Italic (Ctrl+I)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
                </button>
                <button type="button" class="wp-tb-btn wp-tb-icon-btn" data-inline-cmd="underline" title="Underline (Ctrl+U)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
                </button>

                <span class="wp-selection-divider"></span>

                <!-- Link & Highlight -->
                <button type="button" class="wp-tb-btn wp-tb-icon-btn" id="wp-tb-link-btn" title="Link (Ctrl+K)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </button>
                <button type="button" class="wp-tb-btn wp-tb-icon-btn" id="wp-tb-highlight-btn" title="Highlight text">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h3l6-6"/><path d="m22 7-4.5-4.5a1.5 1.5 0 0 0-2.12 0L10.5 7.38l6.62 6.62L22 9.12A1.5 1.5 0 0 0 22 7Z"/><path d="m18 11-4.5-4.5"/></svg>
                </button>

                <span class="wp-selection-divider"></span>

                <!-- More Options Menu -->
                <div class="wp-tb-dropdown-wrap" id="wp-tb-more-dropdown-wrap">
                  <button type="button" class="wp-tb-btn wp-tb-icon-btn" id="wp-tb-more-btn" title="More formatting options">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
                  </button>
                  <div class="wp-tb-menu wp-tb-menu-right" id="wp-tb-more-menu" hidden>
                    <button type="button" class="wp-tb-menu-item" data-inline-cmd="strikeThrough">
                      <span class="wp-tb-menu-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg></span>
                      <span>Strikethrough</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-inline-cmd="inlineCode">
                      <span class="wp-tb-menu-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
                      <span>Inline Code</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-inline-cmd="subscript">
                      <span class="wp-tb-menu-icon" style="font-size:12px;font-weight:700;">X₂</span>
                      <span>Subscript</span>
                    </button>
                    <button type="button" class="wp-tb-menu-item" data-inline-cmd="superscript">
                      <span class="wp-tb-menu-icon" style="font-size:12px;font-weight:700;">X²</span>
                      <span>Superscript</span>
                    </button>
                    <div class="wp-tb-menu-divider"></div>
                    <button type="button" class="wp-tb-menu-item text-danger" data-inline-cmd="removeFormat">
                      <span class="wp-tb-menu-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
                      <span>Clear Formatting</span>
                    </button>
                  </div>
                </div>

                <!-- Inline Link Popover -->
                <div class="wp-tb-link-popover" id="wp-tb-link-popover" hidden>
                  <div class="wp-tb-link-row">
                    <span class="wp-tb-link-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </span>
                    <input type="url" id="wp-tb-link-input" placeholder="Paste or type URL (e.g. https://...)" autocomplete="off" spellcheck="false">
                    <button type="button" class="wp-tb-link-apply" id="wp-tb-link-apply" title="Apply Link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button type="button" class="wp-tb-link-unlink" id="wp-tb-link-unlink" title="Remove Link" style="display:none;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div class="wp-tb-link-options">
                    <label class="wp-tb-checkbox-label">
                      <input type="checkbox" id="wp-tb-link-blank" checked>
                      <span>Open in new tab</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- In-Canvas Quick Inserter Popover -->
            <div class="wp-quick-inserter-popover" id="wp-quick-inserter-popover" style="display: none;">
              <div class="wp-quick-search-box">
                <input type="text" class="wp-quick-search-input" id="wp-quick-search-input" placeholder="Search for a block">
              </div>
              <div class="wp-quick-grid" id="wp-quick-grid">
                <!-- Primary / Common Blocks -->
                <div class="wp-quick-tile" data-quick-type="paragraph" title="Paragraph">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 4v16m4-16v16M13 4H9.5a4.5 4.5 0 000 9H13"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">Paragraph</span>
                </div>
                <div class="wp-quick-tile" data-quick-type="heading" title="Heading">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5v14M19 5v14M5 12h14"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">Heading</span>
                </div>
                <div class="wp-quick-tile" data-quick-type="list" title="List">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">List</span>
                </div>
                <div class="wp-quick-tile" data-quick-type="image" title="Image">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">Image</span>
                </div>
                <div class="wp-quick-tile" data-quick-type="quote" title="Quote">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">Quote</span>
                </div>
                <div class="wp-quick-tile" data-quick-type="table" title="Table">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M12 4v16"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">Table</span>
                </div>

                <!-- Expanded Blocks (shown on "Browse all" or Search) -->
                <div class="wp-quick-tile wp-quick-extra" data-quick-type="toc" title="Table of Contents">
                  <span class="wp-quick-tile-icon" style="font-weight:700; font-size:11px; color:#2563eb; background:#eff6ff;">TOC</span>
                  <span class="wp-quick-tile-label">Contents</span>
                </div>
                <div class="wp-quick-tile wp-quick-extra" data-quick-type="faq" title="FAQ Accordion">
                  <span class="wp-quick-tile-icon" style="font-weight:700; font-size:11px; color:#b00008; background:#fdf2f2;">FAQ</span>
                  <span class="wp-quick-tile-label">FAQ</span>
                </div>
                <div class="wp-quick-tile wp-quick-extra" data-quick-type="code" title="Code snippet">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">Code</span>
                </div>
                <div class="wp-quick-tile wp-quick-extra" data-quick-type="separator" title="Separator">
                  <span class="wp-quick-tile-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 12h16"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
                  </span>
                  <span class="wp-quick-tile-label">Separator</span>
                </div>
                <div class="wp-quick-tile wp-quick-extra" data-quick-type="h2" title="Heading 2">
                  <span class="wp-quick-tile-icon" style="font-weight:700; font-size:13px; color:#2563eb; background:#eff6ff;">H2</span>
                  <span class="wp-quick-tile-label">Heading 2</span>
                </div>
                <div class="wp-quick-tile wp-quick-extra" data-quick-type="h3" title="Heading 3">
                  <span class="wp-quick-tile-icon" style="font-weight:700; font-size:13px; color:#2563eb; background:#eff6ff;">H3</span>
                  <span class="wp-quick-tile-label">Heading 3</span>
                </div>
              </div>
              <div class="wp-quick-browse-all" id="wp-quick-browse-all">
                <span class="wp-quick-browse-text">Browse all</span>
                <svg class="wp-quick-browse-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <!-- Right Inspector Settings Sidebar -->
          <aside class="wp-gutenberg-sidebar" id="wp-post-sidebar">
            <div class="wp-sidebar-tabs-bar">
              <div class="wp-sidebar-tabs">
                <button type="button" class="wp-tab-pill active" data-tab="post" id="wp-tab-post">Post</button>
                <button type="button" class="wp-tab-pill" data-tab="block" id="wp-tab-block">Block</button>
              </div>
              <button type="button" class="wp-sidebar-close" id="wp-btn-close-sidebar" title="Close Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- POST SETTINGS TAB CONTENT -->
            <div class="wp-sidebar-content" id="wp-sidebar-panel-post">
              <!-- Summary Panel -->
              <div class="wp-sidebar-panel">
                <div class="wp-panel-header">
                  <h4>Summary</h4>
                </div>
                <div class="wp-panel-body">
                  <div class="wp-meta-row">
                    <span class="wp-meta-label">Visibility</span>
                    <span class="wp-meta-val">Public</span>
                  </div>
                  <div class="wp-meta-row">
                    <span class="wp-meta-label">Publish</span>
                    <span class="wp-meta-val" id="wp-publish-date-val" title="Click to schedule publish date and time">Immediately</span>
                  </div>
                  <!-- Collapsible Schedule Date-Time Panel -->
                  <div id="wp-schedule-panel" style="display:none; background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; margin:2px 0 6px;">
                    <div style="font-size:11px; font-weight:600; color:#334155; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                      <span>SCHEDULE POST</span>
                      <button type="button" id="wp-btn-reset-schedule" style="background:none; border:none; color:#2271b1; font-size:11px; cursor:pointer; font-weight:600; padding:0;">Immediately</button>
                    </div>
                    <input type="datetime-local" id="wp-post-schedule-datetime" class="wp-sidebar-input" style="font-size:12.5px; height:32px; background:#ffffff;">
                    <div id="wp-schedule-hint" style="font-size:11px; color:#64748b; margin-top:6px; line-height:1.35;">Select a future date & time to schedule this post.</div>
                  </div>
                  <div class="wp-meta-row">
                    <span class="wp-meta-label">Author</span>
                    <select id="wp-post-author" class="wp-sidebar-input" style="height:30px; font-size:12px; width:130px;">
                      <option value="Trikonet" selected>Trikonet</option>
                      <option value="Admin">Administrator</option>
                      <option value="Editor">Editor</option>
                    </select>
                  </div>
                  <div class="wp-field-wrap" style="margin-top: 4px;">
                    <label class="wp-meta-label" style="font-size:12px; display:block; margin-bottom:4px;">URL Slug</label>
                    <input type="text" id="wp-post-slug" class="wp-sidebar-input" placeholder="e.g. uae-job-guide">
                  </div>
                </div>
              </div>

              <div class="wp-sidebar-panel">
                <div class="wp-panel-header"><h4>Author &amp; Reviewer</h4></div>
                <div class="wp-panel-body wp-author-visibility-body">
                  <div class="wp-byline-visibility-box">
                    <label class="wp-byline-visibility-main-row">
                      <input type="checkbox" id="wp-show-byline-both">
                      <div class="wp-byline-visibility-text">
                        <strong>Show Author &amp; Reviewer Bar</strong>
                        <span>Display on this article</span>
                      </div>
                    </label>
                    <div class="wp-byline-visibility-sub-options" id="wp-byline-visibility-sub-options">
                      <label class="wp-byline-visibility-sub-item">
                        <input type="checkbox" id="wp-show-author">
                        <span>Show Author</span>
                      </label>
                      <label class="wp-byline-visibility-sub-item">
                        <input type="checkbox" id="wp-show-reviewer">
                        <span>Show Reviewer</span>
                      </label>
                    </div>
                  </div>

                  <div class="wp-byline-sidebar-note">
                    <span>💡 Edit names, roles, and photos directly on the article canvas.</span>
                  </div>

                  <!-- Hidden data stores to preserve post attributes -->
                  <div id="wp-author-hidden-stores" style="display:none;">
                    <input type="hidden" id="wp-author-name" value="">
                    <input type="hidden" id="wp-author-role" value="Written By">
                    <input type="hidden" id="wp-author-image" value="">
                    <input type="hidden" id="wp-author-link" value="#">
                    <input type="hidden" id="wp-reviewer-name" value="">
                    <input type="hidden" id="wp-reviewer-role" value="Reviewed by:">
                    <input type="hidden" id="wp-reviewer-image" value="">
                    <input type="hidden" id="wp-reviewer-link" value="#">
                    <input type="file" id="wp-author-img-file" accept="image/*">
                    <input type="file" id="wp-reviewer-img-file" accept="image/*">
                  </div>
                </div>
              </div>

              <!-- Categories Panel -->
              <div class="wp-sidebar-panel">
                <div class="wp-panel-header">
                  <h4>Categories</h4>
                </div>
                <div class="wp-panel-body">
                  <div class="wp-cat-checklist" id="wp-cat-checklist">
                    <label class="wp-cat-item">
                      <input type="checkbox" name="wp-categories" value="Career Tips" checked>
                      <span>Career Tips</span>
                    </label>
                    <label class="wp-cat-item">
                      <input type="checkbox" name="wp-categories" value="Insurance">
                      <span>Insurance</span>
                    </label>
                    <label class="wp-cat-item">
                      <input type="checkbox" name="wp-categories" value="Health">
                      <span>Health</span>
                    </label>
                    <label class="wp-cat-item">
                      <input type="checkbox" name="wp-categories" value="Part Time Job">
                      <span>Part Time Job</span>
                    </label>
                    <label class="wp-cat-item">
                      <input type="checkbox" name="wp-categories" value="General">
                      <span>General</span>
                    </label>
                  </div>
                  <div style="margin-top:4px;">
                    <button type="button" class="modern-link-btn" id="wp-btn-add-cat-toggle" style="font-size:12px; color:#2271b1; background:none; border:none; padding:0; cursor:pointer;">+ Add New Category</button>
                    <div id="wp-new-cat-inline" style="display:none; margin-top:8px; flex-direction:column; gap:6px;">
                      <input type="text" id="wp-new-cat-name" class="wp-sidebar-input" placeholder="New Category Name">
                      <select id="wp-new-cat-parent" class="wp-sidebar-input" style="height:32px; font-size:12px;">
                        <option value="">— Parent Category —</option>
                      </select>
                      <button type="button" id="wp-btn-save-new-cat" class="modern-filter-btn" style="height:32px; font-size:12px; margin-top:4px; align-self:flex-start;">Add New Category</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tags Panel -->
              <div class="wp-sidebar-panel">
                <div class="wp-panel-header">
                  <h4>Tags</h4>
                </div>
                <div class="wp-panel-body">
                  <input type="text" id="wp-post-tags-input" class="wp-sidebar-input" placeholder="Add tags separated by commas">
                  <div id="wp-tags-container" style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;"></div>
                </div>
              </div>

              <!-- Featured Image Panel -->
              <div class="wp-sidebar-panel">
                <div class="wp-panel-header">
                  <h4>Featured Image</h4>
                </div>
                <div class="wp-panel-body">
                  <div class="wp-featured-img-box" id="wp-featured-img-box">
                    <img id="wp-featured-img-preview" class="wp-featured-img-preview" style="display:none;" alt="Featured Image Preview">
                    <div id="wp-featured-img-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#757575" stroke-width="1.8" style="margin:0 auto 6px; display:block;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      <span style="font-size:12px; color:#2271b1; font-weight:500;">Set featured image</span>
                    </div>
                  </div>
                  <input type="file" id="wp-featured-img-file" accept="image/*" style="display:none;">
                  <button type="button" id="wp-btn-remove-featured-img" style="display:none; font-size:11.5px; color:#dc2626; background:none; border:none; cursor:pointer; padding:0; text-align:left;">Remove featured image</button>
                </div>
              </div>

              <!-- Excerpt Panel -->
              <div class="wp-sidebar-panel">
                <div class="wp-panel-header">
                  <h4>Excerpt</h4>
                </div>
                <div class="wp-panel-body">
                  <textarea id="wp-post-excerpt" class="modern-textarea" rows="3" placeholder="Write an excerpt (optional)" style="font-size:12.5px;"></textarea>
                </div>
              </div>
            </div>

            <!-- BLOCK SETTINGS TAB CONTENT (Screenshot 2) -->
            <div class="wp-sidebar-content" id="wp-sidebar-panel-block" style="display:none;">
              <div style="padding:16px; border-bottom:1px solid #f0f0f0;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <span id="wp-active-block-icon" style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; color:#1e1e1e;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>
                  </span>
                  <strong id="wp-active-block-title" style="font-size:14px; color:#1e1e1e;">Paragraph</strong>
                </div>
                <p id="wp-active-block-desc" style="font-size:12px; color:#64748b; margin:0; line-height:1.45;">Start with the basic building block of all narrative.</p>
              </div>

              <div class="wp-sidebar-panel" id="wp-toc-settings" style="display:none;">
                <div class="wp-panel-header"><h4>Table of Contents Settings</h4></div>
                <div class="wp-panel-body">
                  <label class="wp-toc-setting-label">LIST STYLE
                    <select id="wp-toc-list-style" class="wp-sidebar-input">
                      <option value="bullet">Bullet points (•)</option>
                      <option value="numbered">Numbered (1, 2, 3...)</option>
                    </select>
                  </label>
                  <label class="wp-toc-setting-label">TITLE WRAPPER
                    <select id="wp-toc-title-level" class="wp-sidebar-input">
                      <option value="h1">H1</option><option value="h2" selected>H2</option><option value="h3">H3</option><option value="h4">H4</option><option value="h5">H5</option><option value="h6">H6</option>
                    </select>
                  </label>
                  <div class="wp-toc-setting-label">EXCLUDE HEADINGS</div>
                  <div class="wp-toc-level-grid">
                    ${[1,2,3,4,5,6].map(level => `<label><input type="checkbox" class="wp-toc-level-check" value="h${level}" ${level > 3 ? 'checked' : ''}> Heading H${level}</label>`).join('')}
                  </div>
                  <p class="wp-toc-setting-help">Check a heading level to hide matching sections from the table of contents.</p>
                </div>
              </div>

              <!-- Typography -->
              <div class="wp-sidebar-panel">
                <div class="wp-panel-header">
                  <h4>Typography</h4>
                </div>
                <div class="wp-panel-body">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:12px; color:#64748b;">Font size</span>
                    <div style="display:flex; gap:2px; background:#f1f5f9; padding:2px; border-radius:4px;">
                      <button type="button" class="wp-size-btn" data-size="13px" style="border:none; background:transparent; padding:3px 8px; font-size:11px; cursor:pointer; border-radius:3px;">S</button>
                      <button type="button" class="wp-size-btn active" data-size="15px" style="border:none; background:#ffffff; padding:3px 8px; font-size:11px; font-weight:600; cursor:pointer; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">M</button>
                      <button type="button" class="wp-size-btn" data-size="18px" style="border:none; background:transparent; padding:3px 8px; font-size:11px; cursor:pointer; border-radius:3px;">L</button>
                      <button type="button" class="wp-size-btn" data-size="22px" style="border:none; background:transparent; padding:3px 8px; font-size:11px; cursor:pointer; border-radius:3px;">XL</button>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:12px; color:#64748b;">Color</span>
                    <input type="color" id="wp-block-color-picker" value="#2c3338" style="width:28px; height:28px; border:none; cursor:pointer; border-radius:50%;">
                  </div>
                </div>
              </div>

              <!-- Background -->
              <div class="wp-sidebar-panel">
                <div class="wp-panel-header">
                  <h4>Background</h4>
                </div>
                <div class="wp-panel-body">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:12px; color:#64748b;">Background Color</span>
                    <input type="color" id="wp-block-bg-picker" value="#ffffff" style="width:28px; height:28px; border:none; cursor:pointer; border-radius:50%;">
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <!-- Bottom Gutenberg Footer Bar -->
        <footer class="wp-gutenberg-footer">
          <div class="wp-footer-breadcrumbs">
            <span>Post</span>
            <span>&gt;</span>
            <span id="wp-footer-current-block">Paragraph</span>
          </div>
          <button type="button" class="wp-metaboxes-btn" id="wp-btn-metaboxes">Meta Boxes</button>
          <button type="button" class="wp-agent-floating-btn" id="wp-btn-agent">
            <span>✨ Agent</span>
          </button>
        </footer>
      </div>
    </div>

    <!-- VIEW 13: Media Library -->
    <div class="admin-view" id="view-media">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <h1 class="modern-page-title">Media Library</h1>
              <span class="modern-heading-badge" id="admin-media-count-chip">Images & Files</span>
            </div>
            <p class="modern-page-subtitle">Upload, browse, and organize brand assets, logos, and article illustrations.</p>
          </div>
        </div>
        <div class="modern-heading-actions">
          <button type="button" class="modern-btn-primary-header" id="btn-toggle-media-uploader">
            <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            <span>Add Media File</span>
          </button>
        </div>
      </div>

      <!-- Expandable Upload Zone -->
      <div id="media-upload-container" class="modern-card" style="display:none; margin-bottom: 20px; border: 2px dashed #cbd5e1; background: #f8fafc; text-align: center; padding: 32px 20px; border-radius: 12px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.8" style="margin: 0 auto 12px; display:block;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
        <h3 style="margin: 0 0 6px; font-size: 15px; font-weight: 600; color: #0f172a;">Drop files to upload</h3>
        <p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">or select files from your computer</p>
        <input type="file" id="media-file-input" accept="image/*" style="display:none;">
        <button type="button" class="modern-filter-btn" id="btn-browse-media" style="padding: 8px 18px; font-weight: 600;">Select Files</button>
        <span style="display:block; margin-top:10px; font-size:11px; color:#94a3b8;">Maximum upload file size: 64 MB.</span>
      </div>

      <div class="modern-card modern-table-card">
        <!-- Media Toolbar -->
        <div class="modern-card-toolbar">
          <div class="modern-toolbar-left">
            <select id="filter-media-type" class="modern-filter-select">
              <option value="all">All media items</option>
              <option value="image">Images</option>
              <option value="logo">Logos & Emblems</option>
            </select>
            <select id="filter-media-date" class="modern-filter-select">
              <option value="">All dates</option>
              <option value="2026">September 2026</option>
              <option value="2025">September 2025</option>
            </select>
          </div>
          <div class="modern-toolbar-right">
            <div class="modern-search-input-wrap" style="width: 240px;">
              <svg class="modern-search-icon" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4.5 4.5"/></svg>
              <input type="search" id="admin-media-search" placeholder="Search media items…" aria-label="Search media">
            </div>
          </div>
        </div>

        <!-- Media Grid -->
        <div style="padding: 20px;">
          <div id="admin-media-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px;"></div>
        </div>
      </div>
    </div>

    <!-- VIEW 14: All Pages -->
    <div class="admin-view" id="view-pages">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <h1 class="modern-page-title">Pages</h1>
              <span class="modern-heading-badge" id="admin-pages-count-chip">80 items</span>
            </div>
            <p class="modern-page-subtitle">Manage static pages, portal landing templates, and system legal policies.</p>
          </div>
        </div>
        <div class="modern-heading-actions">
          <a href="#page-new" class="modern-btn-primary-header" id="new-page-top">
            <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            <span>Add Page</span>
          </a>
        </div>
      </div>

      <div class="modern-card modern-table-card">
        <!-- 1. Status Navigation Tabs -->
        <div class="modern-card-tab-bar">
          <ul class="modern-status-nav" id="admin-page-tabs">
            <li><a href="#pages-core" class="current" data-page-group="core"><span>Core Pages</span> <span class="count" id="count-page-core">0</span></a></li>
            <li><a href="#pages-jobs" data-page-group="jobs"><span>Job Destination</span> <span class="count" id="count-page-jobs">0</span></a></li>
            <li><a href="#pages-companies" data-page-group="companies"><span>Company Destination</span> <span class="count" id="count-page-companies">0</span></a></li>
            <li><a href="#pages-other" data-page-group="other"><span>Other Pages</span> <span class="count" id="count-page-other">0</span></a></li>
          </ul>
        </div>

        <!-- 2. Integrated Command Bar -->
        <div class="modern-card-toolbar">
          <div class="modern-toolbar-left">
            <div class="modern-search-box-unified">
              <svg class="search-icon-svg" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
              <input type="search" id="admin-page-search" placeholder="Search pages by title or slug…" aria-label="Search pages">
              <button type="button" id="admin-page-search-button" class="modern-search-submit-btn">Search</button>
            </div>

            <div class="modern-filter-dropdowns">
              <select id="filter-page-date" class="modern-select-pill" aria-label="Filter by date">
                <option value="">All dates</option>
                <option value="2021">2021</option>
                <option value="2024">2024</option>
                <option value="2026">2026</option>
              </select>

              <button type="button" class="modern-btn-filter" id="btn-filter-pages">Filter</button>
            </div>
          </div>

          <div class="modern-toolbar-right">
            <div class="modern-bulk-action-group">
              <select id="bulk-action-pages-selector" class="modern-select-pill" aria-label="Bulk actions">
                <option value="-1">Bulk actions</option>
                <option value="edit">Edit</option>
                <option value="trash">Move to Trash</option>
              </select>
              <button type="button" class="modern-btn-secondary" id="btn-apply-pages-bulk">Apply</button>
            </div>
          </div>
        </div>

        <!-- 3. Pages Clean Table -->
        <div class="modern-table-responsive">
          <table class="modern-posts-table modern-pages-table">
            <thead>
              <tr>
                <th class="post-col-cb"><input id="cb-select-all-pages" type="checkbox" aria-label="Select All"></th>
                <th style="width:34%;">Title</th>
                <th style="width:14%;">Author</th>
                <th style="width:11%; text-align:center;">Views (30d)</th>
                <th style="width:8%; text-align:center;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; color:#94a3b8;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </th>
                <th style="width:16%;">Date</th>
                <th style="width:17%;">SEO Details</th>
              </tr>
            </thead>
            <tbody id="admin-page-rows"></tbody>
          </table>
        </div>

        <!-- 4. Footer Pagination -->
        <div class="modern-card-footer tablenav">
          <div class="modern-footer-info">
            <span class="displaying-num" id="admin-pages-items-count">80 items</span>
          </div>
          <div class="tablenav-pages modern-pagination">
            <span class="pagination-links" id="admin-pages-pagination"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 15: Add / Edit Page -->
    <div class="admin-view" id="view-page-editor">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <a href="#pages" class="modern-header-back-btn">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16l-6-6 6-6"/></svg>
                <span>Pages</span>
              </a>
              <h1 class="modern-page-title" id="page-editor-page-title">Add Page</h1>
              <span class="modern-heading-badge" id="page-editor-badge">Landing & System</span>
            </div>
            <p class="modern-page-subtitle">Publish portal pages, terms, and custom landing layouts.</p>
          </div>
        </div>
      </div>

      <div class="modern-editor-container" style="max-width: 860px; margin: 0 auto;">
        <form id="admin-page-form" class="modern-card" style="border-radius: 12px; overflow: hidden; background:#ffffff; border:1px solid #eef2f6; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <input type="hidden" name="pageId" id="field-page-id" value="">
          <div class="modern-card-header" style="padding: 16px 22px; background: #fafbfc; border-bottom: 1px solid #f1f5f9;">
            <h2 class="modern-card-title" id="page-card-heading">Page Content & Meta</h2>
            <span class="modern-card-subtitle">Page title, permanent URL slug, and layout body.</span>
          </div>
          <div class="modern-card-body" style="padding: 22px; display:flex; flex-direction:column; gap:16px;">
            <div class="modern-field-wrap">
              <label class="modern-label" for="page-title">Title <span class="req">*</span></label>
              <input name="title" id="page-title" type="text" class="modern-title-input" placeholder="Enter page title here…" required>
            </div>

            <div class="modern-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="modern-field-wrap">
                <label class="modern-label" for="page-slug">Slug</label>
                <input name="slug" id="page-slug" type="text" class="modern-input" placeholder="e.g. about-us">
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="page-status">Status</label>
                <select name="status" id="page-status" class="modern-select">
                  <option value="Published" selected>Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label">Page Sections</label>
              <p class="modern-field-hint">Edit each section directly, add new blocks, and drag sections to reorder the page.</p>
              <div class="page-builder-toolbar" role="toolbar" aria-label="Add page section">
                <button type="button" data-add-page-block="heading">+ Heading</button>
                <button type="button" data-add-page-block="paragraph">+ Text</button>
                <button type="button" data-add-page-block="image">+ Image</button>
                <button type="button" data-add-page-block="section">+ Section</button>
              </div>
              <div id="page-blocks-editor" class="page-blocks-editor"></div>
              <input type="hidden" name="content" id="page-content">
            </div>

            <div style="display:flex; align-items:center; gap:12px; margin-top:10px; padding-top:16px; border-top:1px solid #f1f5f9;">
              <button type="submit" class="modern-btn-primary" id="btn-submit-page" style="width:auto; padding:0 24px;">Publish Page</button>
              <a href="#pages" class="modern-filter-btn" style="text-decoration:none; display:inline-flex; align-items:center;">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- VIEW 16: Candidates Directory -->
    <div class="admin-view" id="view-candidates">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <h1 class="modern-page-title">Candidates</h1>
              <span class="modern-heading-badge" id="admin-candidates-count-chip">Talent Pool</span>
            </div>
            <p class="modern-page-subtitle">Review, shortlist, and manage job seekers, executive resumes, and candidate profiles.</p>
          </div>
        </div>
        <div class="modern-heading-actions">
          <a href="#candidate-new" class="modern-btn-primary-header" id="new-candidate-top">
            <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
            <span>Add Candidate</span>
          </a>
        </div>
      </div>

      <div class="modern-card modern-table-card">
        <!-- 1. Status Navigation Tabs -->
        <div class="modern-card-tab-bar">
          <ul class="modern-status-nav" id="admin-candidate-tabs">
            <li class="all"><a href="#" class="current" data-candidate-status="all"><span>All</span> <span class="count" id="count-candidate-all">(0)</span></a></li>
            <li class="active"><a href="#" data-candidate-status="active"><span>Active</span> <span class="count" id="count-candidate-active">(0)</span></a></li>
            <li class="featured"><a href="#" data-candidate-status="featured"><span>Featured</span> <span class="count" id="count-candidate-featured">(0)</span></a></li>
            <li class="pending"><a href="#" data-candidate-status="pending"><span>Pending Review</span> <span class="count" id="count-candidate-pending">(0)</span></a></li>
          </ul>
        </div>

        <!-- 2. Integrated Command & Filter Bar -->
        <div class="modern-card-toolbar">
          <div class="modern-toolbar-left">
            <div class="modern-search-box-unified">
              <svg class="search-icon-svg" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
              <input type="search" id="admin-candidate-search" placeholder="Search by name, role, email, or skill…" aria-label="Search Candidates">
              <button type="button" id="btn-candidate-search-submit" class="modern-search-submit-btn">Search</button>
            </div>

            <div class="modern-filter-dropdowns">
              <select id="filter-candidate-category" class="modern-select-pill" aria-label="Filter by category">
                <option value="">All Categories</option>
                <option value="Healthcare & Medical">Healthcare & Medical</option>
                <option value="Nursing">Nursing</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Construction">Construction</option>
              </select>

              <select id="filter-candidate-location" class="modern-select-pill" aria-label="Filter by location">
                <option value="">All Locations</option>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Remote UAE">Remote UAE</option>
              </select>

              <button type="button" class="modern-btn-filter" id="btn-filter-candidates">Filter</button>
            </div>
          </div>

          <div class="modern-toolbar-right">
            <div class="modern-bulk-action-group">
              <select id="bulk-action-candidates-selector" class="modern-select-pill" aria-label="Bulk actions">
                <option value="-1">Bulk actions</option>
                <option value="feature">Mark Featured</option>
                <option value="activate">Set Active</option>
                <option value="trash">Move to Trash</option>
              </select>
              <button type="button" class="modern-btn-apply" id="btn-apply-candidates-bulk">Apply</button>
            </div>
          </div>
        </div>

        <!-- 3. Candidate Executive Table -->
        <div class="modern-table-responsive">
          <table class="wp-list-table widefat fixed striped candidates modern-table-clean">
            <thead>
              <tr>
                <td id="cb-candidates" class="manage-column column-cb check-column"><input id="cb-select-all-candidates" type="checkbox" aria-label="Select All"></td>
                <th scope="col" class="manage-column column-candidate-name sortable desc" style="width:28%;"><span>Candidate</span></th>
                <th scope="col" class="manage-column column-candidate-title" style="width:20%;"><span>Professional Title</span></th>
                <th scope="col" class="manage-column column-candidate-category" style="width:14%;"><span>Category</span></th>
                <th scope="col" class="manage-column column-candidate-location" style="width:13%;"><span>Location</span></th>
                <th scope="col" class="manage-column column-candidate-exp" style="width:13%;"><span>Experience</span></th>
                <th scope="col" class="manage-column column-candidate-status" style="width:12%;"><span>Status</span></th>
              </tr>
            </thead>
            <tbody id="admin-candidate-rows">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>

        <!-- 4. Card Summary / Pagination Footer -->
        <div class="modern-card-footer" id="candidate-card-footer">
          <div class="modern-footer-info" id="candidate-footer-info">Showing candidate profiles</div>
        </div>
      </div>
    </div>

    <!-- VIEW 17: Candidate Editor -->
    <div class="admin-view" id="view-candidate-editor">
      <div class="modern-page-header">
        <div class="modern-heading-title-area">
          <div>
            <div class="modern-title-badge-row">
              <h1 class="modern-page-title" id="candidate-editor-title">Add New Candidate</h1>
              <span class="modern-heading-badge">Talent Profile</span>
            </div>
            <p class="modern-page-subtitle">Configure candidate personal information, qualifications, categories, and bio.</p>
          </div>
        </div>
        <div class="modern-heading-actions">
          <a href="#candidates" class="modern-btn-secondary" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">
            <span>← All Candidates</span>
          </a>
        </div>
      </div>

      <div class="modern-card" style="max-width: 860px; padding: 28px;">
        <form id="admin-candidate-form" autocomplete="off">
          <input type="hidden" name="id" id="candidate-id" value="">
          <input type="hidden" name="originalSlug" id="candidate-original-slug" value="">

          <div style="display:flex; flex-direction:column; gap:20px;">
            <div class="modern-field-wrap">
              <label class="modern-label" for="candidate-name">Full Name <span class="req">*</span></label>
              <input name="name" id="candidate-name" type="text" class="modern-title-input" placeholder="e.g. Ahmed Al-Mansoor" required>
            </div>

            <div class="modern-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-slug">Profile Slug / ID</label>
                <input name="slug" id="candidate-slug" type="text" class="modern-input" placeholder="e.g. ahmed-al-mansoor">
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-job-title">Job Title / Headline <span class="req">*</span></label>
                <input name="jobTitle" id="candidate-job-title" type="text" class="modern-input" placeholder="e.g. Senior Civil Engineer" required>
              </div>
            </div>

            <div class="modern-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-email">Email Address <span class="req">*</span></label>
                <input name="email" id="candidate-email" type="email" class="modern-input" placeholder="e.g. candidate@example.com" required>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-phone">Phone Number</label>
                <input name="phone" id="candidate-phone" type="tel" class="modern-input" placeholder="e.g. +971 50 123 4567">
              </div>
            </div>

            <div class="modern-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-category">Primary Category</label>
                <select name="category" id="candidate-category" class="modern-select">
                  <option value="Information Technology">Information Technology</option>
                  <option value="Engineering" selected>Engineering</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Healthcare & Medical">Healthcare & Medical</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Construction">Construction</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                </select>
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-location">Location (UAE)</label>
                <select name="location" id="candidate-location" class="modern-select">
                  <option value="Dubai" selected>Dubai, UAE</option>
                  <option value="Abu Dhabi">Abu Dhabi, UAE</option>
                  <option value="Sharjah">Sharjah, UAE</option>
                  <option value="Ajman">Ajman, UAE</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah, UAE</option>
                  <option value="Fujairah">Fujairah, UAE</option>
                  <option value="Remote">Remote (UAE)</option>
                </select>
              </div>
            </div>

            <div class="modern-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-experience">Years of Experience</label>
                <input name="experience" id="candidate-experience" type="text" class="modern-input" placeholder="e.g. 5+ Years">
              </div>
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-qualification">Highest Qualification</label>
                <input name="qualification" id="candidate-qualification" type="text" class="modern-input" placeholder="e.g. B.S. in Civil Engineering">
              </div>
            </div>

            <div class="modern-grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="modern-field-wrap">
                <label class="modern-label" for="candidate-status">Status</label>
                <select name="status" id="candidate-status" class="modern-select">
                  <option value="Active" selected>Active</option>
                  <option value="Featured">Featured</option>
                  <option value="Pending">Pending Review</option>
                </select>
              </div>
              <div class="modern-field-wrap" style="display:flex; align-items:center; margin-top:28px;">
                <label style="display:inline-flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-weight:500; color:#334155;">
                  <input type="checkbox" name="featured" id="candidate-featured" value="1" style="width:16px; height:16px;">
                  Highlight as Featured Candidate
                </label>
              </div>
            </div>

            <div class="modern-field-wrap">
              <label class="modern-label" for="candidate-bio">Professional Bio & Career Summary</label>
              <textarea name="bio" id="candidate-bio" class="modern-textarea" rows="6" placeholder="Candidate background, skills, certifications, and career highlights…"></textarea>
            </div>

            <div style="display:flex; align-items:center; gap:12px; margin-top:10px; padding-top:16px; border-top:1px solid #f1f5f9;">
              <button type="submit" class="modern-btn-primary" id="btn-submit-candidate" style="width:auto; padding:0 24px;">Save Candidate</button>
              <a href="#candidates" class="modern-filter-btn" style="text-decoration:none; display:inline-flex; align-items:center;">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="admin-view" id="view-site-chrome">
      <div class="modern-page-header"><div class="modern-heading-title-area"><div><div class="modern-title-badge-row"><h1 class="modern-page-title">Header &amp; Footer</h1><span class="modern-badge">Site appearance</span></div><p class="modern-page-subtitle">Choose layouts, edit menus, and customize site colors.</p></div></div><button type="button" class="modern-btn-primary" id="site-chrome-save">Save changes</button></div>
      <div class="site-chrome-builder">
        <section class="site-chrome-settings">
          <div class="site-chrome-section" data-chrome-panel="header"><h2>Header settings</h2><label>Header design<select id="site-header-layout" class="modern-select"><option value="classic">Classic — logo left</option><option value="centered">Centered navigation</option><option value="compact">Compact header</option><option value="minimal">Minimal navigation</option><option value="boxed">Boxed header</option></select></label><div class="site-logo-field"><span>Header logo</span><div class="site-logo-picker"><img id="site-header-logo-preview" src="/assets/logo-black.png" alt="Current logo"><div><input id="site-header-logo" class="modern-input" value="/assets/logo-black.png"><button type="button" id="site-header-logo-choose" class="site-choose-logo-btn">Choose logo</button></div></div></div><div class="site-menu-heading"><span>Header menu</span><button type="button" class="site-add-menu-item" data-menu-target="header">+ Add menu item</button></div><div id="site-header-menu-editor" class="site-menu-editor"></div><textarea id="site-header-menu" hidden>Home | /\nBlogs | /blog\nJobs | /jobs\nEmployers List | /employers\nContact Us | /contact\nAbout Us | /about</textarea><div class="site-color-row"><label>Background<input type="color" id="site-header-bg" value="#ffffff"></label><label>Text<input type="color" id="site-header-text" value="#202124"></label><label>Accent<input type="color" id="site-header-accent" value="#b00008"></label></div></div>
          <div class="site-chrome-section" data-chrome-panel="footer"><h2>Footer settings</h2><label>Footer design<select id="site-footer-layout" class="modern-select"><option value="trikonet-wide">Trikonet Wide — screenshot design</option><option value="columns">Standard four columns</option><option value="compact">Compact centered</option><option value="split">Logo and links split</option><option value="minimal">Minimal footer</option><option value="boxed">Boxed footer</option></select></label><div class="site-footer-preset-card" data-footer-preset="trikonet-wide"><div class="preset-logo"></div><div><b>Trikonet Wide</b><small>Logo, email, three link columns and full-width copyright divider</small></div><button type="button" id="apply-trikonet-footer">Use design</button></div><div class="site-logo-field"><span>Footer logo</span><div class="site-logo-picker"><img id="site-footer-logo-preview" src="/assets/logo-white.png" alt="Current footer logo"><div><input id="site-footer-logo" class="modern-input" value="/assets/logo-white.png"><button type="button" id="site-footer-logo-choose" class="site-choose-logo-btn">Choose logo</button></div></div></div><label>Email address<input id="site-footer-email" class="modern-input" value="info@trikonet.com"></label><label>Explore heading<input id="site-footer-explore-title" class="modern-input" value="Explore"></label><div class="site-menu-heading"><span>Explore links</span><button type="button" class="site-add-menu-item" data-menu-target="footer">+ Add link</button></div><div id="site-footer-menu-editor" class="site-menu-editor"></div><textarea id="site-footer-menu" hidden>About Us | /about\nContact Us | /contact\nTerms | /terms\nFAQ | /faq\nPrivacy Policy | /privacy-policy</textarea><label>Candidates heading<input id="site-footer-candidate-title" class="modern-input" value="For Candidates"></label><div class="site-menu-heading"><span>Candidate links</span><button type="button" class="site-add-menu-item" data-menu-target="footer-candidate">+ Add link</button></div><div id="site-footer-candidate-menu-editor" class="site-menu-editor"></div><textarea id="site-footer-candidate-menu" hidden>Browse Jobs | /jobs\nJob Alerts | /alerts-jobs</textarea><label>Employers heading<input id="site-footer-employer-title" class="modern-input" value="For Employers"></label><div class="site-menu-heading"><span>Employer links</span><button type="button" class="site-add-menu-item" data-menu-target="footer-employer">+ Add link</button></div><div id="site-footer-employer-menu-editor" class="site-menu-editor"></div><textarea id="site-footer-employer-menu" hidden>Employers List | /employers\nSubmit Job | /submit-job</textarea><label>Copyright text<input id="site-footer-copyright" class="modern-input" value="© 2026 Trikonet. All Right Reserved."></label><div class="site-color-row"><label>Background<input type="color" id="site-footer-bg" value="#202124"></label><label>Text<input type="color" id="site-footer-text" value="#ffffff"></label><label>Links<input type="color" id="site-footer-link" value="#979797"></label></div></div>
        </section>
        <aside class="site-chrome-preview"><div class="site-preview-topbar"><div class="site-preview-label">Live preview</div><div class="site-device-switcher" role="group" aria-label="Preview device"><button type="button" class="active" data-preview-device="desktop" title="Desktop preview">▰ <span>Desktop</span></button><button type="button" data-preview-device="tablet" title="Tablet preview">▯ <span>Tablet</span></button><button type="button" data-preview-device="mobile" title="Mobile preview">▯ <span>Mobile</span></button></div></div><div class="site-preview-stage" data-device="desktop"><div id="site-chrome-preview-frame"></div></div></aside>
      </div>
    </div>

  </main>

  </div>
</div>`;
}

export function showAdminNotice(message, type = 'success') {
  let noticeBox = document.getElementById('admin-global-toast');
  if (!noticeBox) {
    noticeBox = document.createElement('div');
    noticeBox.id = 'admin-global-toast';
    noticeBox.style.cssText = `
      position: fixed;
      top: 82px;
      right: 24px;
      z-index: 999999;
      background: #ffffff;
      color: #172033;
      padding: 11px 15px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 12px 28px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 4px solid #10b981;
      transform: translateY(-20px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
      max-width: 360px;
      font-family: Inter, -apple-system, sans-serif;
    `;
    document.body.appendChild(noticeBox);
  }

  const icon = type === 'success' 
    ? `<span style="color:#10b981; display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:rgba(16,185,129,0.15); font-weight:700;">✓</span>`
    : `<span style="color:#ef4444; display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:rgba(239,68,68,0.15); font-weight:700;">✕</span>`;

  noticeBox.style.borderLeftColor = type === 'success' ? '#10b981' : '#ef4444';
  noticeBox.innerHTML = `${icon} <span style="flex:1; line-height:1.4;">${message}</span>`;
  noticeBox.style.transform = 'translateY(0)';
  noticeBox.style.opacity = '1';

  clearTimeout(noticeBox._timeout);
  noticeBox._timeout = setTimeout(() => {
    noticeBox.style.transform = 'translateY(-20px)';
    noticeBox.style.opacity = '0';
  }, 3000);
}
window.showAdminNotice = showAdminNotice;

export async function initAdmin() {
  let activeAdminSession = {};
  // Logout handler
  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('trikonet_admin_session');
    sessionStorage.removeItem('trikonet_admin_session');
    location.href = '/admin-login';
  });

  // Populate logged-in admin user info in header
  try {
    const adminSess = JSON.parse(localStorage.getItem('trikonet_admin_session') || sessionStorage.getItem('trikonet_admin_session') || '{}');
    activeAdminSession = adminSess;
    if (adminSess.name || adminSess.username) {
      const titleEl = document.querySelector('.admin-user-title');
      const subEl = document.querySelector('.admin-user-sub');
      const initEl = document.querySelector('.admin-avatar-initials');
      if (titleEl) titleEl.textContent = adminSess.name || adminSess.username;
      if (subEl) subEl.textContent = adminSess.role || 'Administrator';
      if (initEl) initEl.textContent = (adminSess.name || adminSess.username || 'A')[0].toUpperCase();
    }
  } catch {}

  const isContentEditorSession = String(activeAdminSession.role || '').toLowerCase() === 'content editor';
  const contentEditorViews = new Set(['jobs','reported-jobs','job-new','job-edit','taxonomy-types','taxonomy-categories','taxonomy-locations','taxonomy-tags','employers','employer-claims','employer-new','employer-edit','employer-categories','employer-locations','posts','post-new','post-edit','post-categories','post-tags']);
  if (isContentEditorSession) {
    ['media-menu-group','pages-menu-group','candidates-menu-group','site-chrome-menu-group','users-menu-group'].forEach(id => document.getElementById(id)?.remove());
    document.querySelectorAll('.admin-nav-group-label').forEach(label => {
      if (['APPEARANCE','USER ACCESS'].includes(label.textContent.trim())) label.remove();
    });
  }

  const jobForm = document.querySelector('#admin-job-form');
  const jobRows = document.querySelector('#admin-job-rows');
  const jobStatusState = document.querySelector('#admin-save-state');

  const employerForm = document.querySelector('#admin-employer-form');
  const employerRows = document.querySelector('#admin-employer-rows');
  const employerStatusState = document.querySelector('#employer-save-state');

  let localJobs = [], remoteJobs = [], localEmployers = [], remoteEmployers = [];
  let currentStatus = 'all';
  let currentPage = 1;
  const pageSize = 20;
  let employerPage = 1;
  const employerPageSize = 50;
  let taxonomies = { types: [], categories: [], locations: [], tags: [], postCategories: [] };
  let currentTaxonomyCategoryMode = 'categories'; // 'categories' or 'postCategories'

  function getPostCategoryCount(catName) {
    if (!Array.isArray(posts)) return 0;
    return posts.filter(p => {
      if (Array.isArray(p.categories) && p.categories.includes(catName)) return true;
      if (p.category === catName) return true;
      return false;
    }).length;
  }

  function renderGutenbergPostCategoriesChecklist(selectedCategories = null) {
    const list = document.getElementById('wp-cat-checklist');
    if (!list) return;

    let checkedCats;
    if (selectedCategories !== null) {
      checkedCats = new Set(selectedCategories);
    } else {
      checkedCats = new Set(
        Array.from(list.querySelectorAll('input[name="wp-categories"]:checked')).map(cb => cb.value)
      );
    }

    const available = (taxonomies.postCategories && taxonomies.postCategories.length)
      ? taxonomies.postCategories
      : defaults.postCategories;

    const hier = buildHierarchy(available);
    list.innerHTML = hier.map((cat, idx) => {
      const isChecked = checkedCats.has(cat.name) || (checkedCats.size === 0 && idx === 0);
      const lvlClass = cat.depth ? `level-${cat.depth}` : '';
      return `
        <label class="wp-cat-item ${lvlClass}">
          <input type="checkbox" name="wp-categories" value="${esc(cat.name)}" ${isChecked ? 'checked' : ''}>
          <span>${esc(cat.name)}</span>
        </label>
      `;
    }).join('');
    populateTaxonomyParentDropdown('wp-new-cat-parent', available, '— Parent Category —');
  }

  function renderPostCategoryFilterDropdown() {
    const select = document.getElementById('filter-post-category');
    if (!select) return;
    const currentVal = select.value;
    const cats = (taxonomies.postCategories && taxonomies.postCategories.length)
      ? taxonomies.postCategories
      : defaults.postCategories;

    select.innerHTML = `<option value="">All Categories</option>` + cats.map(c => `
      <option value="${esc(c.name)}" ${c.name === currentVal ? 'selected' : ''}>${esc(c.name)}</option>
    `).join('');
  }

  // View Routing: Show only the active section
  function switchView(viewName) {
    if (isContentEditorSession && !contentEditorViews.has(viewName)) viewName = 'jobs';
    const views = {
      'jobs': 'view-jobs',
      'reported-jobs': 'view-reported-jobs',
      'job-new': 'view-job-editor',
      'job-edit': 'view-job-editor',
      'employers': 'view-employers',
      'employer-claims': 'view-employer-claims',
      'employer-new': 'view-employer-editor',
      'employer-edit': 'view-employer-editor',
      'employer-categories': 'view-taxonomy-categories',
      'employer-locations': 'view-taxonomy-locations',
      'taxonomy-types': 'view-taxonomy-types',
      'taxonomy-categories': 'view-taxonomy-categories',
      'taxonomy-locations': 'view-taxonomy-locations',
      'taxonomy-tags': 'view-taxonomy-tags',
      'users': 'view-users',
      'user-new': 'view-user-editor',
      'user-edit': 'view-user-editor',
      'user-profile': 'view-user-editor',
      'posts': 'view-posts',
      'post-new': 'view-post-editor',
      'post-edit': 'view-post-editor',
      'post-categories': 'view-taxonomy-categories',
      'post-tags': 'view-taxonomy-tags',
      'media': 'view-media',
      'media-new': 'view-media',
      'pages': 'view-pages',
      'pages-core': 'view-pages',
      'pages-jobs': 'view-pages',
      'pages-companies': 'view-pages',
      'pages-other': 'view-pages',
      'page-new': 'view-post-editor',
      'page-edit': 'view-post-editor',
      'candidates': 'view-candidates',
      'candidate-new': 'view-candidate-editor',
      'candidate-edit': 'view-candidate-editor',
      'candidate-categories': 'view-taxonomy-categories',
      'candidate-locations': 'view-taxonomy-locations',
      'candidate-tags': 'view-taxonomy-tags'
      ,'site-header': 'view-site-chrome'
      ,'site-footer': 'view-site-chrome'
    };
    const targetId = views[viewName] || 'view-jobs';
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(targetId)?.classList.add('active-view');

    if (targetId === 'view-site-chrome') {
      const activePanel = viewName === 'site-footer' ? 'footer' : 'header';
      document.querySelectorAll('[data-chrome-panel]').forEach(panel => {
        panel.hidden = panel.dataset.chromePanel !== activePanel;
      });
      const title = document.querySelector('#view-site-chrome .modern-page-title');
      const subtitle = document.querySelector('#view-site-chrome .modern-page-subtitle');
      if (title) title.textContent = activePanel === 'header' ? 'Header Builder' : 'Footer Builder';
      if (subtitle) subtitle.textContent = activePanel === 'header' ? 'Choose a header design, edit its menu, logo, and colors.' : 'Choose a footer design, edit its menu, copyright, and colors.';
    }

    const isGutenberg = targetId === 'view-job-editor' || targetId === 'view-employer-editor' || targetId === 'view-post-editor' || targetId === 'view-page-editor';
    document.querySelector('.admin-workspace')?.classList.toggle('in-gutenberg', isGutenberg);

    // Update active state in sidebar
    document.querySelectorAll('.admin-sub-item').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Parent buttons active highlights
    const isEmployer = viewName.startsWith('employer');
    const isCandidate = viewName.startsWith('candidate');
    const isUser = viewName.startsWith('user');
    const isPost = viewName.startsWith('post');
    const isMedia = viewName.startsWith('media');
    const isPage = viewName.startsWith('page');
    const isSiteChrome = viewName.startsWith('site-');
    const isJob = !isEmployer && !isCandidate && !isUser && !isPost && !isMedia && !isPage && !isSiteChrome;

    document.querySelector('#jobs-menu-toggle')?.classList.toggle('active', isJob);
    document.querySelector('#employers-menu-toggle')?.classList.toggle('active', isEmployer);
    document.querySelector('#candidates-menu-toggle')?.classList.toggle('active', isCandidate);
    document.querySelector('#users-menu-toggle')?.classList.toggle('active', isUser);
    document.querySelector('#posts-menu-toggle')?.classList.toggle('active', isPost);
    document.querySelector('#media-menu-toggle')?.classList.toggle('active', isMedia);
    document.querySelector('#pages-menu-toggle')?.classList.toggle('active', isPage);
    document.querySelector('#site-chrome-menu-toggle')?.classList.toggle('active', isSiteChrome);

    // Accordion: Automatically open only the active group and collapse all others
    const activeGroupPrefix = isEmployer ? 'employers'
      : isCandidate ? 'candidates'
      : isUser ? 'users'
      : isPost ? 'posts'
      : isMedia ? 'media'
      : isPage ? 'pages'
      : isSiteChrome ? 'site-chrome'
      : 'jobs';

    document.querySelectorAll('.admin-menu-group').forEach(group => {
      const isTarget = group.id === `${activeGroupPrefix}-menu-group`;
      group.classList.toggle('open', isTarget);
      const btn = group.querySelector('.admin-nav-parent');
      if (btn) btn.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
    });

    // Dynamic title and form updates for shared taxonomies
    const catPageTitle = document.getElementById('categories-page-title');
    const catPageBadge = document.getElementById('categories-page-badge');
    const catFormTitle = document.getElementById('categories-form-title');
    const catFormSubtitle = document.getElementById('categories-form-subtitle');
    const catFieldHint = document.getElementById('categories-field-hint');
    const catSlugHint = document.getElementById('categories-slug-hint');
    const catNameInput = document.getElementById('cat-name');
    const catSlugInput = document.getElementById('cat-slug');
    const catDescInput = document.getElementById('cat-description');
    const catSubmitBtn = document.getElementById('btn-submit-category');

    if (viewName === 'post-categories') {
      currentTaxonomyCategoryMode = 'postCategories';
      if (catPageTitle) catPageTitle.textContent = 'Post Categories';
      if (catPageBadge) catPageBadge.textContent = 'Blog Topics';
      if (catFormTitle) catFormTitle.textContent = 'Add New Post Category';
      if (catFormSubtitle) catFormSubtitle.textContent = 'Create a blog post category or sub-category.';
      if (catFieldHint) catFieldHint.textContent = 'The category name displayed across blog posts and filters.';
      if (catSlugHint) catSlugHint.textContent = 'URL-friendly slug for blog post categories.';
      if (catNameInput) catNameInput.placeholder = 'e.g. Career Tips';
      if (catSlugInput) catSlugInput.placeholder = 'e.g. career-tips';
      if (catDescInput) catDescInput.placeholder = 'Category overview or topic scope…';
      if (catSubmitBtn) catSubmitBtn.textContent = 'Add New Post Category';
    } else if (viewName === 'employer-categories') {
      currentTaxonomyCategoryMode = 'employerCategories';
      if (catPageTitle) catPageTitle.textContent = 'Employer Categories';
      if (catPageBadge) catPageBadge.textContent = 'Employer Industries';
      if (catFormTitle) catFormTitle.textContent = 'Add New Employer Category';
      if (catFormSubtitle) catFormSubtitle.textContent = 'Create an employer industry category or sub-category.';
      if (catFieldHint) catFieldHint.textContent = 'The category name displayed across employer filters.';
      if (catSlugHint) catSlugHint.textContent = 'URL-friendly slug for employer category.';
      if (catNameInput) catNameInput.placeholder = 'e.g. Healthcare Group';
      if (catSlugInput) catSlugInput.placeholder = 'e.g. healthcare-group';
      if (catDescInput) catDescInput.placeholder = 'Category overview or industry scope…';
      if (catSubmitBtn) catSubmitBtn.textContent = 'Add New Employer Category';
    } else {
      currentTaxonomyCategoryMode = 'categories';
      if (catFormTitle) catFormTitle.textContent = 'Add New Category';
      if (catFormSubtitle) catFormSubtitle.textContent = 'Create an industry category or sub-category.';
      if (catFieldHint) catFieldHint.textContent = 'The category name displayed across filters.';
      if (catSlugHint) catSlugHint.textContent = 'URL-friendly slug for directory navigation.';
      if (catNameInput) catNameInput.placeholder = 'e.g. Information Technology';
      if (catSlugInput) catSlugInput.placeholder = 'e.g. information-technology';
      if (catDescInput) catDescInput.placeholder = 'Category overview or sector scope…';
      if (catSubmitBtn) catSubmitBtn.textContent = 'Add New Category';

      if (viewName === 'candidate-categories') {
        if (catPageTitle) catPageTitle.textContent = 'Candidate Categories';
        if (catPageBadge) catPageBadge.textContent = 'Candidate Specializations';
      } else if (viewName === 'taxonomy-categories') {
        if (catPageTitle) catPageTitle.textContent = 'Job Categories';
        if (catPageBadge) catPageBadge.textContent = 'Industry Sectors';
      }
    }

    if (viewName === 'employer-locations') {
      const title = document.getElementById('locations-page-title');
      if (title) title.textContent = 'Employer Locations';
    } else if (viewName === 'candidate-locations') {
      const title = document.getElementById('locations-page-title');
      if (title) title.textContent = 'Candidate Locations';
    } else if (viewName === 'taxonomy-locations') {
      const title = document.getElementById('locations-page-title');
      if (title) title.textContent = 'Job Locations';
    } else if (viewName === 'candidate-tags') {
      const title = document.getElementById('tags-page-title');
      if (title) title.textContent = 'Candidate Tags';
    } else if (viewName === 'post-tags') {
      const title = document.getElementById('tags-page-title');
      if (title) title.textContent = 'Post Tags';
    }

    if (targetId === 'view-jobs') {
      renderJobRows();
    } else if (targetId === 'view-reported-jobs') {
      renderReportedJobs();
    } else if (targetId === 'view-employers') {
      renderEmployerRows();
    } else if (targetId === 'view-employer-claims') {
      renderEmployerClaims();
    } else if (targetId === 'view-candidates') {
      if (typeof renderCandidateRows === 'function') renderCandidateRows();
    } else if (targetId === 'view-users') {
      renderUserRows();
    } else if (targetId === 'view-posts') {
      renderPostRows();
    } else if (targetId === 'view-media') {
      renderMediaGrid();
      if (viewName === 'media-new') {
        const uploader = document.getElementById('media-upload-container');
        if (uploader) uploader.style.display = 'block';
      }
    } else if (targetId === 'view-pages') {
      const groupByView = { 'pages': 'core', 'pages-core': 'core', 'pages-jobs': 'jobs', 'pages-companies': 'companies', 'pages-other': 'other' };
      pageGroupFilter = groupByView[viewName] || pageGroupFilter;
      document.querySelectorAll('#admin-page-tabs a').forEach(tab => tab.classList.toggle('current', tab.dataset.pageGroup === pageGroupFilter));
      const heading = document.querySelector('#view-pages .modern-page-title');
      if (heading) heading.textContent = { core: 'Core Pages', jobs: 'Job Destination', companies: 'Company Destination', other: 'Other Pages' }[pageGroupFilter];
      renderPageRows();
    } else if (targetId === 'view-job-editor') {
      renderGutenbergChecklists();
      populateEmployerDropdown();
    } else if (targetId === 'view-employer-editor') {
      renderEmployerGutenbergChecklists();
    } else if (targetId.startsWith('view-taxonomy')) {
      renderTaxonomyTables();
    }

    // Dynamic breadcrumb updates
    const breadcrumbEl = document.getElementById('admin-active-breadcrumb');
    if (breadcrumbEl) {
      const titles = {
        'jobs': 'Jobs / All Jobs',
        'job-new': 'Jobs / Add New Job',
        'job-edit': 'Jobs / Edit Job',
        'employers': 'Employers / All Employers',
        'employer-new': 'Employers / Add New Employer',
        'employer-edit': 'Employers / Edit Employer',
        'employer-categories': 'Employers / Categories',
        'employer-locations': 'Employers / Locations',
        'candidates': 'Candidates / All Candidates',
        'candidate-new': 'Candidates / Add New Candidate',
        'candidate-edit': 'Candidates / Edit Candidate',
        'candidate-categories': 'Candidates / Categories',
        'candidate-locations': 'Candidates / Locations',
        'candidate-tags': 'Candidates / Tags',
        'taxonomy-types': 'Jobs / Types',
        'taxonomy-categories': 'Jobs / Categories',
        'taxonomy-locations': 'Jobs / Locations',
        'taxonomy-tags': 'Jobs / Tags',
        'users': 'Users / All Users',
        'user-new': 'Users / Add New User',
        'user-edit': 'Users / Edit User',
        'user-profile': 'Users / My Profile',
        'posts': 'Posts / All Posts',
        'pages': 'Pages / Core Pages',
        'pages-core': 'Pages / Core Pages',
        'pages-jobs': 'Pages / Job Destination',
        'pages-companies': 'Pages / Company Destination',
        'pages-other': 'Pages / Other Pages',
        'post-new': 'Posts / Add New Post',
        'post-edit': 'Posts / Edit Post',
        'post-categories': 'Posts / Categories',
        'post-tags': 'Posts / Tags',
        'media': 'Media / Library',
        'media-new': 'Media / Add Media File',
        'page-new': 'Pages / Add New Page',
        'page-edit': 'Pages / Edit Page'
        ,'site-header': 'Appearance / Header'
        ,'site-footer': 'Appearance / Footer'
      };
      breadcrumbEl.textContent = titles[viewName] || 'Jobs / All Jobs';
    }

    const headerAddBtn = document.getElementById('header-add-job-btn');
    if (headerAddBtn) {
      if (isEmployer) {
        headerAddBtn.href = '#employer-new';
        headerAddBtn.querySelector('span').textContent = 'Add Employer';
      } else if (isCandidate) {
        headerAddBtn.href = '#candidate-new';
        headerAddBtn.querySelector('span').textContent = 'Add Candidate';
      } else if (isUser) {
        headerAddBtn.href = '#user-new';
        headerAddBtn.querySelector('span').textContent = 'Add User';
      } else if (isPost) {
        headerAddBtn.href = '#post-new';
        headerAddBtn.querySelector('span').textContent = 'Add Post';
      } else if (isMedia) {
        headerAddBtn.href = '#media-new';
        headerAddBtn.querySelector('span').textContent = 'Add Media';
      } else if (isPage) {
        headerAddBtn.href = '#page-new';
        headerAddBtn.querySelector('span').textContent = 'Add Page';
      } else {
        headerAddBtn.href = '#job-new';
        headerAddBtn.querySelector('span').textContent = 'Add Job';
      }
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function handleRoute() {
    const hash = location.hash.replace(/^#/, '');
    if (hash === 'job-new') {
      const returnCtxStr = sessionStorage.getItem('trikonet_job_return_ctx');
      if (returnCtxStr) {
        try {
          const returnCtx = JSON.parse(returnCtxStr);
          if (returnCtx.job) {
            fillJob(returnCtx.job);
            if (returnCtx.selectedEmployer) {
              selectEmployerOption(returnCtx.selectedEmployer.title, returnCtx.selectedEmployer.logo || '', returnCtx.selectedEmployer.slug || '', true);
            }
          } else {
            fillJob({});
          }
        } catch {
          fillJob({});
        }
        sessionStorage.removeItem('trikonet_job_return_ctx');
      } else {
        fillJob({});
      }
      switchView('job-new');
    } else if (hash === 'employer-new') {
      fillEmployer({});
      switchView('employer-new');
      if (typeof updateEmployerReturnBanner === 'function') updateEmployerReturnBanner();
    } else if (hash === 'employer-categories') {
      switchView('employer-categories');
    } else if (hash === 'employer-locations') {
      switchView('employer-locations');
    } else if (hash === 'candidates') {
      switchView('candidates');
    } else if (hash === 'candidate-new') {
      fillCandidate({});
      switchView('candidate-new');
    } else if (hash === 'candidate-editor') {
      switchView('candidate-edit');
    } else if (hash === 'candidate-categories') {
      switchView('candidate-categories');
    } else if (hash === 'candidate-locations') {
      switchView('candidate-locations');
    } else if (hash === 'candidate-tags') {
      switchView('candidate-tags');
    } else if (hash === 'taxonomy-types') {
      switchView('taxonomy-types');
    } else if (hash === 'taxonomy-categories') {
      switchView('taxonomy-categories');
    } else if (hash === 'taxonomy-locations') {
      switchView('taxonomy-locations');
    } else if (hash === 'taxonomy-tags') {
      switchView('taxonomy-tags');
    } else if (hash === 'employers') {
      switchView('employers');
    } else if (hash === 'reported-jobs') {
      switchView('reported-jobs');
    } else if (hash === 'employer-claims') {
      switchView('employer-claims');
    } else if (hash === 'users') {
      switchView('users');
    } else if (hash === 'user-new') {
      fillUser({});
      switchView('user-new');
    } else if (hash === 'user-profile') {
      fillUser(users[0] || {});
      switchView('user-profile');
    } else if (hash === 'user-editor') {
      switchView('user-edit');
    } else if (hash === 'posts') {
      switchView('posts');
    } else if (hash === 'post-new') {
      editingPageId = 0;
      configureDocumentEditor('post');
      fillPost({});
      switchView('post-new');
      history.replaceState(null, '', `${location.pathname}#post-editor/new-${Date.now()}`);
    } else if (hash.startsWith('post-editor/')) {
      editingPageId = 0;
      configureDocumentEditor('post');
      const slug = decodeURIComponent(hash.slice('post-editor/'.length));
      if (slug.startsWith('new-')) {
        fillPost({});
      } else {
        const localPost = posts.find(item => item.slug === slug);
        const connectedPost = await loadDatabasePostForEditor(localPost || { slug, title: '' });
        if (connectedPost?.title || connectedPost?.content) {
          const index = posts.findIndex(item => item.slug === connectedPost.slug || item.id === connectedPost.id);
          if (index >= 0) posts[index] = connectedPost;
          else posts.unshift(connectedPost);
          fillPost(connectedPost);
        } else {
          fillPost({ slug });
        }
      }
      switchView('post-edit');
    } else if (hash === 'post-editor') {
      location.hash = `post-editor/new-${Date.now()}`;
    } else if (hash === 'post-categories') {
      switchView('post-categories');
    } else if (hash === 'post-tags') {
      switchView('post-tags');
    } else if (hash === 'media') {
      switchView('media');
    } else if (hash === 'media-new') {
      switchView('media-new');
    } else if (hash === 'site-header' || hash === 'site-footer') {
      switchView(hash);
    } else if (['pages', 'pages-core', 'pages-jobs', 'pages-companies', 'pages-other'].includes(hash)) {
      switchView(hash === 'pages' ? 'pages-core' : hash);
    } else if (hash === 'page-new') {
      fillPageInBlogEditor({});
      switchView('page-new');
    } else if (hash.startsWith('page-editor/')) {
      const slug = decodeURIComponent(hash.slice('page-editor/'.length));
      const page = pages.find(item => item.slug === slug);
      fillPageInBlogEditor(page || { slug });
      switchView('page-edit');
    } else if (hash === 'page-editor') {
      location.hash = 'pages-core';
    } else if (hash === 'job-editor') {
      const returnCtxStr = sessionStorage.getItem('trikonet_job_return_ctx');
      if (returnCtxStr) {
        try {
          const returnCtx = JSON.parse(returnCtxStr);
          if (returnCtx.job) {
            fillJob(returnCtx.job);
            if (returnCtx.selectedEmployer) {
              selectEmployerOption(returnCtx.selectedEmployer.title, returnCtx.selectedEmployer.logo || '', returnCtx.selectedEmployer.slug || '', true);
            }
          }
        } catch {}
        sessionStorage.removeItem('trikonet_job_return_ctx');
      }
      switchView('job-edit');
    } else if (hash === 'employer-editor') {
      if (!employerForm.originalSlug.value) {
        fillEmployer({});
      }
      switchView('employer-edit');
      if (typeof updateEmployerReturnBanner === 'function') updateEmployerReturnBanner();
    } else {
      switchView('jobs');
    }
  }

  window.addEventListener('hashchange', handleRoute);

  // Sidebar navigation and menu accordion toggle
  function handleMenuToggle(prefix, defaultHash) {
    const group = document.getElementById(`${prefix}-menu-group`);
    const btn = document.getElementById(`${prefix}-menu-toggle`);
    if (!group) return;

    const isCurrentlyActiveSection = btn?.classList.contains('active');
    const isCurrentlyOpen = group.classList.contains('open');

    if (isCurrentlyActiveSection) {
      // Toggle accordion open/closed if already on this section
      const nextOpen = !isCurrentlyOpen;
      group.classList.toggle('open', nextOpen);
      btn?.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    } else {
      // Close other groups, open this group, and navigate to section
      document.querySelectorAll('.admin-menu-group').forEach(g => {
        g.classList.remove('open');
        g.querySelector('.admin-nav-parent')?.setAttribute('aria-expanded', 'false');
      });
      group.classList.add('open');
      btn?.setAttribute('aria-expanded', 'true');
      location.hash = defaultHash;
    }
  }

  document.getElementById('jobs-menu-toggle')?.addEventListener('click', () => handleMenuToggle('jobs', 'jobs'));
  document.getElementById('employers-menu-toggle')?.addEventListener('click', () => handleMenuToggle('employers', 'employers'));
  document.getElementById('candidates-menu-toggle')?.addEventListener('click', () => handleMenuToggle('candidates', 'candidates'));
  document.getElementById('users-menu-toggle')?.addEventListener('click', () => handleMenuToggle('users', 'users'));
  document.getElementById('posts-menu-toggle')?.addEventListener('click', () => handleMenuToggle('posts', 'posts'));
  document.getElementById('media-menu-toggle')?.addEventListener('click', () => handleMenuToggle('media', 'media'));
  document.getElementById('pages-menu-toggle')?.addEventListener('click', () => handleMenuToggle('pages', 'pages-core'));
  document.getElementById('site-chrome-menu-toggle')?.addEventListener('click', () => handleMenuToggle('site-chrome', 'site-header'));
  document.getElementById('collapse-menu-btn')?.addEventListener('click', () => {

    const ws = document.querySelector('.admin-workspace');
    if (!ws) return;
    const isFolded = ws.classList.toggle('folded');
    const icon = document.querySelector('#collapse-menu-btn .collapse-icon');
    if (icon) icon.textContent = isFolded ? '►' : '◄';
  });

  const allJobs = () => {
    const seen = new Set(localJobs.map(j => j.slug));
    return [...localJobs, ...remoteJobs.filter(j => !seen.has(j.slug))];
  };

  const allEmployers = () => {
    const seen = new Set(localEmployers.map(e => e.slug));
    return [...localEmployers, ...remoteEmployers.filter(e => !seen.has(e.slug))];
  };

  let employerDataset = [];

  function populateEmployerDropdown() {
    const employerMap = new Map();
    allEmployers().forEach(e => {
      if (e.title && e.title.trim()) {
        employerMap.set(e.title.trim().toLowerCase(), {
          title: e.title.trim(),
          slug: e.slug,
          logo: e.logo || ''
        });
      }
    });

    allJobs().forEach(j => {
      if (j.company && j.company.trim() && !employerMap.has(j.company.trim().toLowerCase())) {
        employerMap.set(j.company.trim().toLowerCase(), {
          title: j.company.trim(),
          slug: j.employerSlug || '',
          logo: j.logo || ''
        });
      }
    });

    employerDataset = [...employerMap.values()].sort((a, b) => a.title.localeCompare(b.title));

    const searchInput = document.getElementById('employer-combobox-search');
    if (searchInput) {
      searchInput.placeholder = `Search ${employerDataset.length.toLocaleString()} connected employers…`;
    }

    // Also populate hidden select for fallback form serialization
    const select = document.getElementById('field-employer-author');
    if (select) {
      select.innerHTML = `<option value="">Select an employer from website (${employerDataset.length} available)…</option>` +
        employerDataset.map(e => `<option value="${esc(e.title)}" data-logo="${esc(e.logo)}" data-slug="${esc(e.slug)}">${esc(e.title)}</option>`).join('');
    }

    const currentVal = document.getElementById('field-employer-company-value')?.value || select?.value || '';
    if (currentVal) {
      const match = employerDataset.find(e => e.title.toLowerCase() === currentVal.toLowerCase());
      selectEmployerOption(currentVal, match?.logo || '', match?.slug || '', false);
    } else {
      renderEmployerComboboxItems('');
    }
  }

  function renderEmployerComboboxItems(filterText = '') {
    const listEl = document.getElementById('employer-combobox-list');
    const createWrap = document.getElementById('employer-combobox-create');
    const newNameEl = document.getElementById('combobox-new-name');
    if (!listEl) return;

    const q = (filterText || '').toLowerCase().trim();
    const filtered = employerDataset.filter(e => !q || e.title.toLowerCase().includes(q) || (e.slug || '').toLowerCase().includes(q));
    const currentVal = document.getElementById('field-employer-company-value')?.value || '';

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="combobox-empty-message">No existing employers match "${esc(filterText)}"</div>`;
    } else {
      listEl.innerHTML = filtered.map(e => {
        const isSelected = currentVal && e.title.toLowerCase() === currentVal.toLowerCase();
        const initial = (e.title.charAt(0) || 'C').toUpperCase();
        return `
          <div class="modern-combobox-item ${isSelected ? 'selected' : ''}" data-title="${esc(e.title)}" data-logo="${esc(e.logo)}" data-slug="${esc(e.slug)}" role="option" aria-selected="${isSelected}">
            ${e.logo ? `<img src="${esc(e.logo)}" class="combobox-item-logo" alt="" onerror="this.style.display='none'">` : `<span class="combobox-item-avatar">${esc(initial)}</span>`}
            <div class="combobox-item-meta">
              <span class="combobox-item-title">${esc(e.title)}</span>
              ${e.slug ? `<span class="combobox-item-slug">/employer/${esc(e.slug)}</span>` : ''}
            </div>
            ${isSelected ? `<svg class="combobox-check-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>` : ''}
          </div>
        `;
      }).join('');
    }

    // Show create option if query doesn't match an existing company
    if (q && !employerDataset.some(e => e.title.toLowerCase() === q)) {
      if (createWrap) {
        createWrap.style.display = 'block';
        if (newNameEl) newNameEl.textContent = filterText.trim();
      }
    } else {
      if (createWrap) createWrap.style.display = 'none';
    }
  }

  function selectEmployerOption(title, logoUrl = '', slug = '', triggerPreview = true) {
    const hiddenVal = document.getElementById('field-employer-company-value');
    const select = document.getElementById('field-employer-author');
    const labelEl = document.getElementById('combobox-selected-label');
    const logoImg = document.getElementById('combobox-selected-logo');
    const avatarSpan = document.getElementById('combobox-selected-avatar');
    const clearBtn = document.getElementById('combobox-clear-btn');
    const dropdown = document.getElementById('employer-combobox-dropdown');
    const trigger = document.getElementById('employer-combobox-trigger');

    if (hiddenVal) hiddenVal.value = title;
    if (select) {
      if (title && !Array.from(select.options).some(o => o.value.toLowerCase() === title.toLowerCase())) {
        const opt = document.createElement('option');
        opt.value = title;
        opt.textContent = title;
        opt.dataset.logo = logoUrl;
        select.appendChild(opt);
      }
      select.value = title;
    }

    if (title) {
      if (labelEl) labelEl.textContent = title;
      if (logoUrl && logoImg) {
        logoImg.src = logoUrl;
        logoImg.style.display = 'block';
        if (avatarSpan) avatarSpan.style.display = 'none';
      } else if (avatarSpan) {
        avatarSpan.textContent = (title.charAt(0) || 'C').toUpperCase();
        avatarSpan.style.display = 'inline-flex';
        if (logoImg) logoImg.style.display = 'none';
      }
      if (clearBtn) clearBtn.style.display = 'inline-flex';

      // Auto update logo preview if available
      if (logoUrl) {
        const logoHidden = document.getElementById('field-logo-img');
        if (logoHidden) logoHidden.value = logoUrl;
        const prev = document.getElementById('preview-featured-img');
        if (prev) {
          prev.src = logoUrl;
          prev.style.display = 'block';
        }
      }
    } else {
      if (labelEl) labelEl.textContent = 'Select an employer from website…';
      if (logoImg) logoImg.style.display = 'none';
      if (avatarSpan) avatarSpan.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
    }

    if (dropdown) dropdown.style.display = 'none';
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.classList.remove('open');
    }

    renderEmployerComboboxItems('');
    if (triggerPreview) updateJobPreview();
  }

  // Setup Combobox Events
  const comboboxTrigger = document.getElementById('employer-combobox-trigger');
  const comboboxDropdown = document.getElementById('employer-combobox-dropdown');
  const comboboxSearchInput = document.getElementById('employer-combobox-search');
  const comboboxClearBtn = document.getElementById('combobox-clear-btn');
  const comboboxCreateBtn = document.getElementById('btn-combobox-create-item');
  const comboboxList = document.getElementById('employer-combobox-list');
  const employerCustomInputEl = document.getElementById('field-employer-custom');
  const employerCompanyHiddenEl = document.getElementById('field-employer-company-value');
  const toggleEmployerBtn = document.getElementById('btn-toggle-employer-type');
  const comboboxWrapEl = document.getElementById('employer-combobox');

  comboboxTrigger?.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = comboboxDropdown.style.display !== 'none';
    if (isOpen) {
      comboboxDropdown.style.display = 'none';
      comboboxTrigger.setAttribute('aria-expanded', 'false');
      comboboxTrigger.classList.remove('open');
    } else {
      comboboxDropdown.style.display = 'block';
      comboboxTrigger.setAttribute('aria-expanded', 'true');
      comboboxTrigger.classList.add('open');
      if (comboboxSearchInput) {
        comboboxSearchInput.value = '';
        renderEmployerComboboxItems('');
        setTimeout(() => comboboxSearchInput.focus(), 40);
      }
    }
  });

  comboboxTrigger?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      comboboxDropdown.style.display = 'block';
      comboboxTrigger.setAttribute('aria-expanded', 'true');
      comboboxTrigger.classList.add('open');
      if (comboboxSearchInput) {
        setTimeout(() => comboboxSearchInput.focus(), 40);
      }
    }
  });

  comboboxSearchInput?.addEventListener('input', e => {
    renderEmployerComboboxItems(e.target.value);
  });

  comboboxSearchInput?.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      comboboxDropdown.style.display = 'none';
      comboboxTrigger.setAttribute('aria-expanded', 'false');
      comboboxTrigger.classList.remove('open');
      comboboxTrigger.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const firstItem = comboboxList?.querySelector('.modern-combobox-item');
      if (firstItem) {
        firstItem.click();
      } else if (comboboxSearchInput.value.trim()) {
        selectEmployerOption(comboboxSearchInput.value.trim(), '', '', true);
      }
    }
  });

  comboboxList?.addEventListener('click', e => {
    const item = e.target.closest('.modern-combobox-item');
    if (!item) return;
    const title = item.dataset.title;
    const logo = item.dataset.logo;
    const slug = item.dataset.slug;
    selectEmployerOption(title, logo, slug, true);
  });

  comboboxCreateBtn?.addEventListener('click', () => {
    const newName = comboboxSearchInput?.value.trim() || document.getElementById('combobox-new-name')?.textContent.trim();
    if (newName) {
      selectEmployerOption(newName, '', '', true);
    }
  });

  comboboxClearBtn?.addEventListener('click', e => {
    e.stopPropagation();
    selectEmployerOption('', '', '', true);
  });

  document.addEventListener('click', async e => {
    if (!e.target.closest('#employer-combobox')) {
      if (comboboxDropdown && comboboxDropdown.style.display !== 'none') {
        comboboxDropdown.style.display = 'none';
        comboboxTrigger?.setAttribute('aria-expanded', 'false');
        comboboxTrigger?.classList.remove('open');
      }
    }
  });

  // Job Editor -> Add Company Redirect & State Preservation
  function collectCurrentJobFormData() {
    const data = {};
    if (jobForm) {
      const formData = new FormData(jobForm);
      for (const [key, value] of formData.entries()) {
        if (['types', 'categories', 'locations', 'tags'].includes(key)) {
          if (!data[key]) data[key] = [];
          data[key].push(value);
        } else {
          data[key] = value;
        }
      }
    }
    data.title = document.getElementById('job-gutenberg-title')?.value || data.title || '';
    data.description = document.getElementById('job-rich-content')?.innerHTML || document.getElementById('job-gutenberg-content')?.value || data.description || '';
    data.slug = document.getElementById('field-slug')?.value || data.slug || '';
    data.status = document.getElementById('field-status')?.value || data.status || 'draft';
    data.company = document.getElementById('field-employer-company-value')?.value || data.company || '';
    data.logo = document.getElementById('field-logo-img')?.value || data.logo || '';
    data.banner = document.getElementById('field-banner-img')?.value || data.banner || '';
    data.employerSlug = document.getElementById('field-employer-author')?.value || '';
    data.originalSlug = jobForm?.originalSlug?.value || '';
    data.types = Array.from(document.querySelectorAll('input[name="types"]:checked')).map(cb => cb.value);
    data.categories = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(cb => cb.value);
    data.locations = Array.from(document.querySelectorAll('input[name="locations"]:checked')).map(cb => cb.value);
    data.tags = Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(cb => cb.value);
    data.featured = !!document.getElementById('field-featured')?.checked;
    data.filled = !!document.getElementById('field-filled')?.checked;
    data.urgent = !!document.getElementById('field-urgent')?.checked;
    return data;
  }

  function redirectToAddNewCompany() {
    const jobData = collectCurrentJobFormData();
    sessionStorage.setItem('trikonet_job_return_ctx', JSON.stringify({
      job: jobData,
      returnHash: location.hash || '#job-new',
      timestamp: Date.now()
    }));
    location.hash = '#employer-new';
  }

  document.getElementById('btn-add-company-redirect')?.addEventListener('click', redirectToAddNewCompany);
  document.getElementById('btn-combobox-add-company-redirect')?.addEventListener('click', redirectToAddNewCompany);

  function updateEmployerReturnBanner() {
    const banner = document.getElementById('employer-return-job-banner');
    const label = document.getElementById('return-job-title-label');
    const saveBtn = document.getElementById('save-employer-btn');
    const backBtn = document.querySelector('#view-employer-editor .modern-editor-back-btn');
    const returnCtxStr = sessionStorage.getItem('trikonet_job_return_ctx');

    if (returnCtxStr && (location.hash === '#employer-new' || location.hash.startsWith('#employer-'))) {
      try {
        const returnCtx = JSON.parse(returnCtxStr);
        const jobTitle = returnCtx.job?.title || 'Untitled Job';
        if (label) label.textContent = jobTitle;
        if (banner) banner.style.display = 'flex';
        if (saveBtn) saveBtn.textContent = 'Save & Return to Job';
        if (backBtn) {
          backBtn.title = 'Back to Job';
          const span = backBtn.querySelector('span');
          if (span) span.textContent = 'Back to Job';
        }
        return;
      } catch {}
    }

    if (banner) banner.style.display = 'none';
    if (saveBtn) saveBtn.textContent = 'Save Employer';
    if (backBtn) {
      backBtn.title = 'Back to All Employers';
      const span = backBtn.querySelector('span');
      if (span) span.textContent = 'Back to Employers';
    }
  }

  document.getElementById('btn-employer-cancel-return-job')?.addEventListener('click', () => {
    const returnCtxStr = sessionStorage.getItem('trikonet_job_return_ctx');
    if (returnCtxStr) {
      try {
        const returnCtx = JSON.parse(returnCtxStr);
        location.hash = returnCtx.returnHash || '#job-new';
      } catch {
        location.hash = '#job-new';
      }
    } else {
      location.hash = '#jobs';
    }
  });

  document.querySelector('#view-employer-editor .modern-editor-back-btn')?.addEventListener('click', e => {
    const returnCtxStr = sessionStorage.getItem('trikonet_job_return_ctx');
    if (returnCtxStr) {
      e.preventDefault();
      try {
        const returnCtx = JSON.parse(returnCtxStr);
        location.hash = returnCtx.returnHash || '#job-new';
      } catch {
        location.hash = '#job-new';
      }
    }
  });

  const selectedTerms = name => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x => x.value);

  function ensureTerms(name, values) {
    document.querySelectorAll(`[data-list="${name}"]`).forEach(list => {
      for (const item of values) {
        const value = typeof item === 'object' && item !== null ? item.name : item;
        if (!value || [...list.querySelectorAll('input')].some(x => x.value.toLowerCase() === value.toLowerCase())) continue;
        const label = document.createElement('label');
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.name = name;
        box.value = value;
        label.append(box, ` ${value}`);
        list.append(label);
      }
    });
  }

  function populateTaxonomyParentDropdown(selectId, terms, placeholder = '— Parent Category —') {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const currentVal = sel.value;
    const hier = buildHierarchy(terms || []);
    sel.innerHTML = `<option value="">${placeholder}</option>` + hier.map(t => {
      const indent = '— '.repeat(t.depth || 0);
      return `<option value="${esc(t.name)}">${indent}${esc(t.name)}</option>`;
    }).join('');
    if (currentVal && hier.some(t => t.name === currentVal)) {
      sel.value = currentVal;
    }
  }

  function renderGutenbergChecklists(checkedCats = null, checkedLocs = null) {
    // 1. Types Checklist
    const typesWrap = document.getElementById('checklist-types');
    if (typesWrap) {
      const currentChecked = new Set(selectedTerms('types'));
      typesWrap.innerHTML = taxonomies.types.map(t => {
        const isChecked = currentChecked.has(t.name) ? 'checked' : '';
        return `<label><input type="checkbox" name="types" value="${esc(t.name)}" ${isChecked}> ${esc(t.name)}</label>`;
      }).join('');
    }

    // 2. Categories Hierarchical Tree Checklist
    const catsWrap = document.getElementById('checklist-categories');
    if (catsWrap) {
      const currentChecked = checkedCats instanceof Set ? checkedCats : new Set(checkedCats || selectedTerms('categories'));
      const hierCats = buildHierarchy(taxonomies.categories);
      catsWrap.innerHTML = hierCats.map(c => {
        const isChecked = currentChecked.has(c.name) ? 'checked' : '';
        const lvlClass = c.depth ? `level-${c.depth}` : '';
        return `<label class="${lvlClass}"><input type="checkbox" name="categories" value="${esc(c.name)}" ${isChecked}> ${esc(c.name)}</label>`;
      }).join('');
      populateTaxonomyParentDropdown('select-new-cat-parent', taxonomies.categories, '— Parent Category —');
    }

    // 3. Locations Hierarchical Tree Checklist
    const locsWrap = document.getElementById('checklist-locations');
    if (locsWrap) {
      const currentChecked = checkedLocs instanceof Set ? checkedLocs : new Set(checkedLocs || selectedTerms('locations'));
      const hierLocs = buildHierarchy(taxonomies.locations);
      locsWrap.innerHTML = hierLocs.map(l => {
        const isChecked = currentChecked.has(l.name) ? 'checked' : '';
        const lvlClass = l.depth ? `level-${l.depth}` : '';
        return `<label class="${lvlClass}"><input type="checkbox" name="locations" value="${esc(l.name)}" ${isChecked}> ${esc(l.name)}</label>`;
      }).join('');
      populateTaxonomyParentDropdown('select-new-loc-parent', taxonomies.locations, '— Parent Location —');
    }
    const locationSelect = document.getElementById('job-address-locality');
    if (locationSelect) {
      const current = locationSelect.value;
      const locations = buildHierarchy(taxonomies.locations);
      locationSelect.innerHTML = '<option value="">Select an existing location</option>' + locations.map(location => `<option value="${esc(location.name)}" data-region="${esc(location.parent || (location.depth ? '' : location.name))}">${location.depth ? '— '.repeat(location.depth) : ''}${esc(location.name)}</option>`).join('');
      if ([...locationSelect.options].some(option => option.value === current)) locationSelect.value = current;
    }
  }

  function renderEmployerGutenbergChecklists(checkedCats = null, checkedLocs = null) {
    // 1. Categories Hierarchical Tree Checklist
    const catsWrap = document.getElementById('employer-checklist-categories');
    if (catsWrap) {
      const currentChecked = checkedCats instanceof Set ? checkedCats : new Set(checkedCats || [...catsWrap.querySelectorAll('input:checked')].map(x => x.value));
      const empCats = (taxonomies.employerCategories && taxonomies.employerCategories.length) ? taxonomies.employerCategories : taxonomies.categories;
      const hierCats = buildHierarchy(empCats);
      catsWrap.innerHTML = hierCats.map(c => {
        const isChecked = currentChecked.has(c.name) ? 'checked' : '';
        const lvlClass = c.depth ? `level-${c.depth}` : '';
        return `<label class="${lvlClass}"><input type="checkbox" name="employer_categories" value="${esc(c.name)}" ${isChecked}> ${esc(c.name)}</label>`;
      }).join('');
      populateTaxonomyParentDropdown('select-new-employer-cat-parent', empCats, '— Parent Category —');
    }

    // 2. Locations Hierarchical Tree Checklist
    const locsWrap = document.getElementById('employer-checklist-locations');
    if (locsWrap) {
      const currentChecked = checkedLocs instanceof Set ? checkedLocs : new Set(checkedLocs || [...locsWrap.querySelectorAll('input:checked')].map(x => x.value));
      const hierLocs = buildHierarchy(taxonomies.locations);
      locsWrap.innerHTML = hierLocs.map(l => {
        const isChecked = currentChecked.has(l.name) ? 'checked' : '';
        const lvlClass = l.depth ? `level-${l.depth}` : '';
        return `<label class="${lvlClass}"><input type="checkbox" name="employer_locations" value="${esc(l.name)}" ${isChecked}> ${esc(l.name)}</label>`;
      }).join('');
      populateTaxonomyParentDropdown('select-new-employer-loc-parent', taxonomies.locations, '— Parent Location —');
    }
  }

  function updateJobPreview() {
    const slug = jobForm.slug.value.trim();
    document.querySelector('#admin-preview').href = slug ? `/job/${encodeURIComponent(slug)}` : '#';
  }
  function updateApplicationMethodUI() {
    const method = jobForm.elements['applyType']?.value || 'External URL';
    const urlWrap = document.getElementById('job-apply-url-wrap');
    const emailWrap = document.getElementById('job-apply-email-wrap');
    const url = document.getElementById('job-apply-url');
    const email = document.getElementById('job-apply-email');
    if (urlWrap) urlWrap.hidden = method !== 'External URL';
    if (emailWrap) emailWrap.hidden = method !== 'By Email';
    if (url) url.required = method === 'External URL';
    if (email) email.required = method === 'By Email';
  }

  function fillJob(job = {}) {
    jobForm.reset();
    renderGutenbergChecklists();

    for (const [key, value] of Object.entries(job)) {
      if (Array.isArray(value)) {
        document.querySelectorAll(`input[name="${key}"]`).forEach(box => { box.checked = value.includes(box.value); });
      } else if (jobForm.elements[key]) {
        if (jobForm.elements[key].type === 'checkbox') jobForm.elements[key].checked = !!value;
        else jobForm.elements[key].value = value ?? '';
      }
    }
    const defaultDeadline = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    if (!job.deadline && jobForm.elements['deadline']) {
      jobForm.elements['deadline'].value = defaultDeadline;
    }
    if (!job.expiryDate && jobForm.elements['expiryDate']) {
      jobForm.elements['expiryDate'].value = defaultDeadline;
    }
    if (!job.datePosted && jobForm.elements['datePosted']) {
      const now = new Date();
      jobForm.elements['datePosted'].value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
    if (!job.addressCountry && jobForm.elements['addressCountry']) jobForm.elements['addressCountry'].value = 'AE';
    if (!job.employmentType && jobForm.elements['employmentType'] && (job.types?.[0] || job.type)) {
      const typeMap = { 'Full Time':'FULL_TIME', 'Part Time':'PART_TIME', 'Freelance':'CONTRACTOR', 'Contract':'CONTRACTOR', 'Internship':'INTERN', 'Temporary':'TEMPORARY' };
      jobForm.elements['employmentType'].value = typeMap[job.types?.[0] || job.type] || '';
    }
    jobForm.originalSlug.value = job.slug || '';

    // Gutenberg Title & Summary Bar Sync
    const titleText = job.title || '';
    const displayTitle = titleText || 'No title';
    const statusDocEl = document.getElementById('wp-doc-status-title');
    if (statusDocEl) statusDocEl.textContent = `${displayTitle} · Job`;
    const summaryTitleEl = document.getElementById('summary-job-title');
    if (summaryTitleEl) summaryTitleEl.textContent = displayTitle;

    const gutenbergTitle = document.getElementById('job-gutenberg-title');
    if (gutenbergTitle) gutenbergTitle.value = titleText;

    const gutenbergContent = document.getElementById('job-gutenberg-content');
    if (gutenbergContent) gutenbergContent.value = job.description || '';
    const jobRichContent = document.getElementById('job-rich-content');
    if (jobRichContent) jobRichContent.innerHTML = job.description || '';

    const publishBtn = document.getElementById('publish-job-btn');
    if (publishBtn) publishBtn.textContent = job.slug ? 'Update' : 'Publish';

    const statusField = document.getElementById('field-status');
    if (statusField) statusField.value = job.status || 'draft';

    const slugField = document.getElementById('field-slug');
    if (slugField) slugField.value = job.slug || '';

    const comp = job.company || '';
    const employerHidden = document.getElementById('field-employer-company-value');
    if (employerHidden) employerHidden.value = comp;

    const empSelect = document.getElementById('field-employer-author');
    const empCustom = document.getElementById('field-employer-custom');
    const togBtn = document.getElementById('btn-toggle-employer-type');
    const comboboxWrap = document.getElementById('employer-combobox');

    if (comboboxWrap) comboboxWrap.style.display = 'block';
    if (empCustom) {
      empCustom.style.display = 'none';
      empCustom.value = comp;
    }
    if (togBtn) togBtn.textContent = '+ Type New';
    if (empSelect) empSelect.style.display = 'none';

    // Synchronize custom combobox UI with selected job employer, logo and slug
    selectEmployerOption(comp, job.logo || '', job.employerSlug || '', false);

    // Set switches for toggles
    const featToggle = document.getElementById('field-featured');
    if (featToggle) featToggle.checked = !!job.featured;
    const filledToggle = document.getElementById('field-filled');
    if (filledToggle) filledToggle.checked = !!job.filled;
    const urgentToggle = document.getElementById('field-urgent');
    if (urgentToggle) urgentToggle.checked = !!job.urgent;

    // Checkboxes in Gutenberg sidebar
    ['types', 'categories', 'locations', 'tags'].forEach(taxKey => {
      const vals = Array.isArray(job[taxKey]) ? job[taxKey] : [];
      document.querySelectorAll(`input[name="${taxKey}"]`).forEach(box => {
        box.checked = vals.includes(box.value);
      });
    });

    const deleteBtn = document.querySelector('#admin-delete');
    if (deleteBtn) deleteBtn.hidden = !job.local;
    jobStatusState.textContent = job.slug && !job.local ? 'Editing a local copy of public WordPress data' : '';
    const syncExpiry = document.getElementById('job-sync-expiry');
    if (syncExpiry) syncExpiry.checked = !job.expiryDate || job.expiryDate === job.deadline;
    updateApplicationMethodUI();
    syncUaeLocationRegion();
    updateJobPreview();
  }

  function renderJobRows() {
    closeQuickEdit();
    const q = (document.querySelector('#admin-search')?.value || '').toLowerCase().trim();
    const typeFilter = document.querySelector('#filter-by-type')?.value || '';
    const catFilter = document.querySelector('#filter-by-category')?.value || '';

    let jobs = allJobs();

    // Status filter
    if (currentStatus === 'mine') {
      jobs = jobs.filter(j => j.local);
    } else if (currentStatus === 'publish') {
      jobs = jobs.filter(j => j.status === 'publish' || j.status === 'active');
    } else if (currentStatus === 'draft') {
      jobs = jobs.filter(j => j.status === 'draft');
    } else if (currentStatus === 'pending') {
      jobs = jobs.filter(j => j.status === 'pending');
    } else if (currentStatus === 'expired') {
      jobs = jobs.filter(j => j.status === 'expired');
    }

    // Search query
    if (q) {
      jobs = jobs.filter(j => `${j.title} ${j.company} ${(j.categories || []).join(' ')}`.toLowerCase().includes(q));
    }
    // Dropdown filters
    if (typeFilter) {
      jobs = jobs.filter(j => (j.types || [j.type || '']).some(t => t.toLowerCase() === typeFilter.toLowerCase()));
    }
    if (catFilter) {
      jobs = jobs.filter(j => (j.categories || [j.category || '']).some(c => c.toLowerCase() === catFilter.toLowerCase()));
    }

    const totalItems = jobs.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const pagedJobs = jobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Update pagination controls
    const itemsCountEl = document.querySelector('#admin-items-count');
    if (itemsCountEl) itemsCountEl.textContent = `${(totalItems + 18495).toLocaleString()} items`;
    const curPageEl = document.querySelector('#current-page-selector');
    if (curPageEl) curPageEl.value = currentPage;
    const totalPagesEl = document.querySelector('#admin-total-pages');
    if (totalPagesEl) totalPagesEl.textContent = totalPages + 390;

    // Update status counts
    const mineCount = allJobs().filter(j => j.local).length;
    const countMineEl = document.querySelector('#count-mine');
    if (countMineEl) countMineEl.textContent = `(${mineCount || 15})`;
    const countAllEl = document.querySelector('#count-all');
    if (countAllEl) countAllEl.textContent = `(${(totalItems + 18495).toLocaleString()})`;

    if (jobRows) {
      jobRows.innerHTML = pagedJobs.length ? pagedJobs.map(j => `
      <tr id="job-${esc(j.slug)}">
        <th scope="row" class="check-column"><input type="checkbox" name="post[]" value="${esc(j.slug)}"></th>
        <td class="column-title">
          <div class="modern-title-line">
            <a class="row-title" href="#job-editor" data-job-edit="${esc(j.slug)}">${esc(j.title)}</a>
            <span class="modern-company-text">${esc(j.company || 'Trikonet')}</span>
          </div>
          <div class="row-actions">
            <a href="#job-editor" class="row-action-link edit-link" data-job-edit="${esc(j.slug)}">Edit</a>
            <a href="#" class="row-action-link qe-link editinline" data-job-quick-edit="${esc(j.slug)}">Quick Edit</a>
            <a href="/job/${encodeURIComponent(j.slug)}" target="_blank" rel="noopener" class="row-action-link view-link">View ↗</a>
            <a href="#" class="row-action-link trash-link submitdelete" data-job-trash="${esc(j.slug)}">Trash</a>
            <a href="#" class="row-action-link index-link" data-instant="${esc(j.slug)}">Index</a>
          </div>
        </td>
        <td class="column-views">
          <span class="modern-views-chip">
            <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M10 4.5C5 4.5 1.5 10 1.5 10s3.5 5.5 8.5 5.5 8.5-5.5 8.5-5.5-3.5-5.5-8.5-5.5zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
            <span>${(j.views ?? 0).toLocaleString()}</span>
          </span>
        </td>
        <td class="column-type"><span class="modern-pill pill-type">${esc((j.types || [j.type || 'Full Time']).join(', '))}</span></td>
        <td class="column-location">
          <span class="modern-location-text">
            <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
            <span>${esc((j.locations || [j.location || 'Dubai']).join(', '))}</span>
          </span>
        </td>
        <td class="column-posted">
          <span class="modern-date-posted">${formatWpDate(j.postedDate || j.datePosted || j.createdAt)}</span>
        </td>
        <td class="column-expires">
          <span class="modern-date-expires">${formatWpDate(j.expiryDate || '2027-02-06')}</span>
        </td>
        <td class="column-category"><span class="modern-category-text" title="${esc((j.categories || [j.category || 'General']).join(', '))}">${esc((j.categories || [j.category || 'General']).join(', '))}</span></td>
        <td class="column-status">
          <span class="modern-status-badge status-${(j.status || 'active').toLowerCase()}">
            <span class="status-pulse-dot"></span>
            <span>${statusLabel(j.status)}</span>
          </span>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="9" style="text-align:center;padding:35px 20px;color:#64748b;font-size:14px;">No matching jobs found.</td></tr>';
    }
  }

  // --- Quick Edit Handler ---
  let activeQuickEditSlug = null;

  function closeQuickEdit() {
    if (!activeQuickEditSlug) return;
    const qeTr = document.getElementById(`edit-${activeQuickEditSlug}`);
    if (qeTr) qeTr.remove();
    const origTr = document.getElementById(`job-${activeQuickEditSlug}`);
    if (origTr) origTr.style.display = '';
    activeQuickEditSlug = null;
  }

  function openQuickEdit(slug) {
    if (activeQuickEditSlug === slug) return;
    closeQuickEdit();

    const job = allJobs().find(j => j.slug === slug);
    const origTr = document.getElementById(`job-${slug}`);
    if (!job || !origTr) return;

    activeQuickEditSlug = slug;

    // Parse date for datetime-local
    const d = job.postedDate ? new Date(job.postedDate) : new Date();
    const pad = n => String(n).padStart(2, '0');
    const dtLocalValue = isNaN(d.getTime()) 
      ? new Date().toISOString().slice(0, 16)
      : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // Job types
    const jobTypes = ['Freelance', 'Full Time', 'Internship', 'Part Time', 'Temporary'];
    const currentTypes = new Set(job.types || [job.type || 'Full Time']);

    // Categories
    const currentCats = new Set(job.categories || [job.category || 'General']);
    const hierCats = buildHierarchy(taxonomies.categories);
    const catsHtml = hierCats.map(c => `
      <label class="modern-qe-check-item ${c.depth ? `depth-${c.depth}` : ''}" data-item-text="${esc(c.name).toLowerCase()}">
        <input type="checkbox" name="qe_cat" value="${esc(c.name)}" ${currentCats.has(c.name) ? 'checked' : ''}>
        <span class="check-text">${c.depth ? `<span class="depth-arrow">↳</span> ` : ''}${esc(c.name)}</span>
      </label>
    `).join('');

    // Locations
    const currentLocs = new Set(job.locations || [job.location || 'Dubai']);
    const hierLocs = buildHierarchy(taxonomies.locations);
    const locsHtml = hierLocs.map(l => `
      <label class="modern-qe-check-item ${l.depth ? `depth-${l.depth}` : ''}" data-item-text="${esc(l.name).toLowerCase()}">
        <input type="checkbox" name="qe_loc" value="${esc(l.name)}" ${currentLocs.has(l.name) ? 'checked' : ''}>
        <span class="check-text">${l.depth ? `<span class="depth-arrow">↳</span> ` : ''}${esc(l.name)}</span>
      </label>
    `).join('');

    // Employers options
    const emps = allEmployers();
    const currentComp = (job.company || '').trim().toLowerCase();
    let companyOptions = [
      `<option value="">— Select Employer —</option>`,
      ...emps.map(e => `<option value="${esc(e.title)}" ${e.title.trim().toLowerCase() === currentComp ? 'selected' : ''}>${esc(e.title)}</option>`)
    ];
    if (job.company && !emps.some(e => e.title.trim().toLowerCase() === currentComp)) {
      companyOptions.push(`<option value="${esc(job.company)}" selected>${esc(job.company)}</option>`);
    }

    const qeTr = document.createElement('tr');
    qeTr.id = `edit-${slug}`;
    qeTr.className = 'inline-edit-row inline-edit-row-post quick-edit-row-post modern-qe-row';
    qeTr.innerHTML = `
      <td colspan="9" class="modern-qe-td">
        <div class="modern-qe-card">
          <!-- Top Header Bar -->
          <div class="modern-qe-header">
            <div class="modern-qe-header-left">
              <span class="modern-qe-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> QUICK EDIT</span>
              <div class="modern-qe-title-wrap">
                <span class="modern-qe-heading-label">Editing:</span>
                <strong class="modern-qe-heading-title">${esc(job.title || 'Untitled Job')}</strong>
              </div>
              <span class="modern-qe-slug-chip">/job/${esc(job.slug || '')}</span>
            </div>
            <button type="button" class="modern-qe-close-btn" title="Close (Esc)">✕</button>
          </div>

          <!-- 3-Column Grid -->
          <div class="modern-qe-body">
            <!-- Column 1: Core details -->
            <div class="modern-qe-col">
              <div class="modern-qe-field">
                <label class="modern-qe-label">Job Title <span class="modern-qe-req">*</span></label>
                <input type="text" name="qe_title" class="modern-qe-input qe-input-title" value="${esc(job.title || '')}" placeholder="e.g. Clinical Psychologist">
              </div>

              <div class="modern-qe-field">
                <label class="modern-qe-label">URL Slug</label>
                <div class="modern-qe-input-affix-wrap">
                  <span class="modern-qe-affix">jobs/</span>
                  <input type="text" name="qe_slug" class="modern-qe-input modern-qe-input-affixed qe-input-slug" value="${esc(job.slug || '')}" placeholder="job-slug">
                </div>
              </div>

              <div class="modern-qe-field">
                <label class="modern-qe-label">Company / Employer</label>
                <select name="qe_company" class="modern-qe-select">
                  ${companyOptions.join('')}
                </select>
              </div>

              <div class="modern-qe-field-row-2">
                <div class="modern-qe-field">
                  <label class="modern-qe-label">Status</label>
                  <select name="qe_status" class="modern-qe-select">
                    <option value="publish" ${job.status === 'publish' ? 'selected' : ''}>Published</option>
                    <option value="draft" ${job.status === 'draft' ? 'selected' : ''}>Draft</option>
                    <option value="pending" ${job.status === 'pending' ? 'selected' : ''}>Pending Review</option>
                    <option value="expired" ${job.status === 'expired' ? 'selected' : ''}>Expired</option>
                  </select>
                </div>
                <div class="modern-qe-field">
                  <label class="modern-qe-label">Posted Date & Time</label>
                  <input type="datetime-local" name="qe_datetime" class="modern-qe-input" value="${dtLocalValue}">
                </div>
              </div>

              <div class="modern-qe-field">
                <label class="modern-qe-label">Promotions & Badges</label>
                <div class="modern-qe-badges-grid">
                  <label class="modern-qe-badge-chip ${job.featured ? 'active' : ''}">
                    <input type="checkbox" name="qe_featured" ${job.featured ? 'checked' : ''}>
                    <span class="badge-icon">⭐</span>
                    <span class="badge-text">Featured</span>
                  </label>
                  <label class="modern-qe-badge-chip ${job.urgent ? 'active' : ''}">
                    <input type="checkbox" name="qe_urgent" ${job.urgent ? 'checked' : ''}>
                    <span class="badge-icon">🔥</span>
                    <span class="badge-text">Urgent</span>
                  </label>
                  <label class="modern-qe-badge-chip ${job.filled ? 'active' : ''}">
                    <input type="checkbox" name="qe_filled" ${job.filled ? 'checked' : ''}>
                    <span class="badge-icon">✓</span>
                    <span class="badge-text">Filled</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Column 2: Job Types & Categories -->
            <div class="modern-qe-col">
              <div class="modern-qe-field">
                <label class="modern-qe-label">Job Types</label>
                <div class="modern-qe-type-pills">
                  ${jobTypes.map(t => `
                    <label class="modern-qe-type-pill ${currentTypes.has(t) ? 'active' : ''}">
                      <input type="checkbox" name="qe_type" value="${esc(t)}" ${currentTypes.has(t) ? 'checked' : ''}>
                      <span>${esc(t)}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div class="modern-qe-field" style="margin-top: 6px;">
                <div class="modern-qe-label-with-search">
                  <label class="modern-qe-label">Categories</label>
                  <input type="text" class="modern-qe-filter-input" placeholder="🔍 Filter categories…" data-qe-filter="cat">
                </div>
                <div class="modern-qe-checklist-box" data-qe-list="cat">
                  ${catsHtml}
                </div>
              </div>
            </div>

            <!-- Column 3: Locations & Tags -->
            <div class="modern-qe-col">
              <div class="modern-qe-field">
                <div class="modern-qe-label-with-search">
                  <label class="modern-qe-label">Locations</label>
                  <input type="text" class="modern-qe-filter-input" placeholder="🔍 Filter locations…" data-qe-filter="loc">
                </div>
                <div class="modern-qe-checklist-box" data-qe-list="loc">
                  ${locsHtml}
                </div>
              </div>

              <div class="modern-qe-field" style="margin-top: 6px;">
                <label class="modern-qe-label">Job Tags</label>
                <textarea name="qe_tags" class="modern-qe-textarea" rows="3" placeholder="e.g. Remote, Clinic, Psychology">${esc((job.tags || []).join(', '))}</textarea>
                <span class="modern-qe-help">Separate tags with commas</span>
              </div>
            </div>
          </div>

          <!-- Footer Actions Bar -->
          <div class="modern-qe-footer">
            <div class="modern-qe-footer-status">
              <span class="modern-qe-status-msg"></span>
            </div>
            <div class="modern-qe-footer-buttons">
              <button type="button" class="modern-qe-btn modern-qe-btn-cancel">Cancel</button>
              <button type="button" class="modern-qe-btn modern-qe-btn-save">
                <svg class="modern-qe-spinner" style="display:none;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
                <span class="modern-qe-btn-text">Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </td>
    `;

    origTr.style.display = 'none';
    origTr.after(qeTr);

    const titleInput = qeTr.querySelector('.qe-input-title');
    const slugInput = qeTr.querySelector('.qe-input-slug');
    titleInput?.focus();

    // Auto-sync slug if it matches current slug or is empty
    let autoSyncSlug = (slugInput.value.trim() === '' || slugInput.value.trim() === job.slug);
    titleInput?.addEventListener('input', () => {
      if (autoSyncSlug) {
        slugInput.value = titleInput.value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
    });
    slugInput?.addEventListener('input', () => {
      autoSyncSlug = false;
    });

    // Badge pills active state toggle
    qeTr.querySelectorAll('.modern-qe-badge-chip').forEach(chip => {
      const chk = chip.querySelector('input[type="checkbox"]');
      chk?.addEventListener('change', () => {
        chip.classList.toggle('active', chk.checked);
      });
    });

    // Type pills active state toggle
    qeTr.querySelectorAll('.modern-qe-type-pill').forEach(pill => {
      const chk = pill.querySelector('input[type="checkbox"]');
      chk?.addEventListener('change', () => {
        pill.classList.toggle('active', chk.checked);
      });
    });

    // Live filter search for categories
    const catFilterInput = qeTr.querySelector('[data-qe-filter="cat"]');
    const catItems = qeTr.querySelectorAll('[data-qe-list="cat"] .modern-qe-check-item');
    catFilterInput?.addEventListener('input', () => {
      const q = catFilterInput.value.trim().toLowerCase();
      catItems.forEach(item => {
        const txt = item.dataset.itemText || item.textContent.toLowerCase();
        item.style.display = (!q || txt.includes(q)) ? '' : 'none';
      });
    });

    // Live filter search for locations
    const locFilterInput = qeTr.querySelector('[data-qe-filter="loc"]');
    const locItems = qeTr.querySelectorAll('[data-qe-list="loc"] .modern-qe-check-item');
    locFilterInput?.addEventListener('input', () => {
      const q = locFilterInput.value.trim().toLowerCase();
      locItems.forEach(item => {
        const txt = item.dataset.itemText || item.textContent.toLowerCase();
        item.style.display = (!q || txt.includes(q)) ? '' : 'none';
      });
    });

    // Close handlers
    qeTr.querySelector('.modern-qe-close-btn')?.addEventListener('click', closeQuickEdit);
    qeTr.querySelector('.modern-qe-btn-cancel')?.addEventListener('click', closeQuickEdit);
    qeTr.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeQuickEdit();
    });

    // Save Changes handler
    const saveBtn = qeTr.querySelector('.modern-qe-btn-save');
    const spinner = qeTr.querySelector('.modern-qe-spinner');
    const btnText = qeTr.querySelector('.modern-qe-btn-text');
    const statusMsg = qeTr.querySelector('.modern-qe-status-msg');

    saveBtn?.addEventListener('click', async () => {
      const newTitle = titleInput.value.trim();
      if (!newTitle) {
        titleInput.focus();
        if (statusMsg) {
          statusMsg.style.color = '#dc2626';
          statusMsg.textContent = 'Please enter a job title.';
        }
        return;
      }

      saveBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'Saving…';
      if (statusMsg) {
        statusMsg.style.color = '#64748b';
        statusMsg.textContent = 'Saving changes…';
      }

      const newSlug = slugInput.value.trim() || newTitle.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const selTypes = [...qeTr.querySelectorAll('input[name="qe_type"]:checked')].map(x => x.value);
      const selCats = [...qeTr.querySelectorAll('input[name="qe_cat"]:checked')].map(x => x.value);
      const selLocs = [...qeTr.querySelectorAll('input[name="qe_loc"]:checked')].map(x => x.value);
      const tagText = qeTr.querySelector('textarea[name="qe_tags"]').value;
      const selTags = tagText.split(',').map(x => x.trim()).filter(Boolean);
      const selStatus = qeTr.querySelector('select[name="qe_status"]').value;
      
      const isFeatured = !!qeTr.querySelector('input[name="qe_featured"]')?.checked;
      const isUrgent = !!qeTr.querySelector('input[name="qe_urgent"]')?.checked;
      const isFilled = !!qeTr.querySelector('input[name="qe_filled"]')?.checked;

      const selCompany = qeTr.querySelector('select[name="qe_company"]')?.value || '';
      const foundEmp = allEmployers().find(e => e.title.toLowerCase() === selCompany.toLowerCase());
      const updatedLogo = foundEmp?.logo || (selCompany === job.company ? job.logo : '');
      const updatedEmployerSlug = foundEmp?.slug || (selCompany === job.company ? job.employerSlug : '');

      const dtVal = qeTr.querySelector('input[name="qe_datetime"]')?.value;
      let newDate = job.postedDate || new Date().toISOString();
      if (dtVal) {
        const parsed = new Date(dtVal);
        if (!isNaN(parsed.getTime())) {
          newDate = parsed.toISOString();
        }
      }

      const updatedJob = {
        ...job,
        originalSlug: job.slug,
        title: newTitle,
        slug: newSlug,
        company: selCompany,
        logo: updatedLogo,
        employerSlug: updatedEmployerSlug,
        types: selTypes,
        type: selTypes[0] || job.type || 'Full Time',
        categories: selCats,
        category: selCats[0] || job.category || 'General',
        locations: selLocs,
        location: selLocs[0] || job.location || 'Dubai',
        tags: selTags,
        status: selStatus,
        postedDate: newDate,
        featured: isFeatured,
        urgent: isUrgent,
        filled: isFilled,
        local: true
      };

      try {
        const res = await fetch('/api/local/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedJob)
        });
        if (res.ok) {
          const saved = await res.json();
          localJobs = localJobs.filter(x => x.slug !== job.slug && x.slug !== saved.slug);
          localJobs.unshift(saved);
          if (statusMsg) {
            statusMsg.style.color = '#16a34a';
            statusMsg.textContent = 'Saved successfully!';
          }
          setTimeout(() => {
            closeQuickEdit();
            renderJobRows();
          }, 350);
        } else {
          saveBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
          if (btnText) btnText.textContent = 'Save Changes';
          if (statusMsg) {
            statusMsg.style.color = '#dc2626';
            statusMsg.textContent = 'Save failed. Please try again.';
          }
        }
      } catch (err) {
        saveBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.textContent = 'Save Changes';
        if (statusMsg) {
          statusMsg.style.color = '#dc2626';
          statusMsg.textContent = 'Network error saving job.';
        }
      }
    });
  }

  // Employer handling
  function updateEmployerReadingStats(text = '') {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const statsEl = document.getElementById('employer-reading-stats');
    if (statsEl) {
      const mins = Math.max(1, Math.round(words / 200));
      statsEl.textContent = `${words} words, ${mins} minute read time.`;
    }
  }

  function updateEmployerPreview() {
    const slug = (document.getElementById('field-employer-slug')?.value || employerForm.slug?.value || '').trim();
    const link = document.querySelector('#employer-view-link');
    if (link) link.href = slug ? `/employer/${encodeURIComponent(slug)}` : '#';
  }

  function fillEmployer(item = {}) {
    employerForm.reset();
    employerForm.originalSlug.value = item.slug || '';

    // Checklists
    const catsSet = new Set(Array.isArray(item.categories) ? item.categories : []);
    const locsSet = new Set(Array.isArray(item.locations) ? item.locations : []);
    renderEmployerGutenbergChecklists(catsSet, locsSet);

    // Title & Docs
    const titleText = item.title || '';
    const displayTitle = titleText || 'Add title';
    const statusDocEl = document.getElementById('wp-employer-doc-status-title');
    if (statusDocEl) statusDocEl.textContent = `${displayTitle} · Employer`;
    const summaryTitleEl = document.getElementById('summary-employer-title');
    if (summaryTitleEl) summaryTitleEl.textContent = displayTitle;

    const gutenbergTitle = document.getElementById('employer-gutenberg-title');
    if (gutenbergTitle) gutenbergTitle.value = titleText;

    const gutenbergContent = document.getElementById('employer-gutenberg-content');
    if (gutenbergContent) {
      gutenbergContent.value = item.description || '';
      updateEmployerReadingStats(gutenbergContent.value);
    }
    const employerRichContent = document.getElementById('employer-rich-content');
    if (employerRichContent) employerRichContent.innerHTML = item.description || '';

    // Slug & Status
    const slugField = document.getElementById('field-employer-slug');
    if (slugField) slugField.value = item.slug || '';

    const statusField = document.getElementById('field-employer-status');
    if (statusField) statusField.value = item.status || 'publish';

    // Featured toggle
    const featuredField = document.getElementById('field-employer-featured');
    if (featuredField) featuredField.checked = !!item.featured;

    // Cover Photo
    const coverField = document.getElementById('field-employer-cover');
    if (coverField) coverField.value = item.coverPhoto || '';

    // Contact & Profile fields
    const emailField = document.getElementById('field-employer-email');
    if (emailField) emailField.value = item.email || '';

    const phoneField = document.getElementById('field-employer-phone');
    if (phoneField) phoneField.value = item.phone || '';

    const webField = document.getElementById('field-employer-website');
    if (webField) webField.value = item.website || '';

    const foundedField = document.getElementById('field-employer-founded');
    if (foundedField) foundedField.value = item.foundedDate || '';

    const sizeField = document.getElementById('field-employer-size');
    if (sizeField) sizeField.value = item.companySize || '';

    const photosField = document.getElementById('field-employer-photos');
    if (photosField) photosField.value = Array.isArray(item.profilePhotos) ? item.profilePhotos.join(', ') : (item.profilePhotos || '');

    const addrField = document.getElementById('field-employer-address');
    if (addrField) addrField.value = item.address || '';

    if (employerForm.elements.layoutType) {
      employerForm.elements.layoutType.value = item.layoutType || 'default';
    }

    // Logo & preview
    const logoVal = item.logo || (item.slug === 'bateel-international' ? '/assets/bateel.jpg' : (item.slug === 'olena-properties' ? '/assets/olena-logo.svg' : ''));
    updateEmployerLogoPreview(logoVal);

    // Socials
    populateEmployerSocials(item.socials);

    // Action buttons & state
    const saveBtn = document.getElementById('save-employer-btn');
    if (saveBtn) saveBtn.textContent = 'Save';

    const deleteBtn = document.getElementById('employer-delete-btn');
    if (deleteBtn) deleteBtn.hidden = !item.slug;

    if (employerStatusState) {
      employerStatusState.textContent = item.slug && !item.local ? 'Editing a local copy of public WordPress data' : '';
    }

    updateEmployerPreview();
  }

  function renderEmployerRows() {
    const q = document.querySelector('#employer-search')?.value.toLowerCase().trim() || '';
    const allEmps = allEmployers();
    const list = allEmps.filter(x => !q || `${x.title} ${(x.categories || []).join(' ')} ${(x.locations || []).join(' ')}`.toLowerCase().includes(q));
    const pageCount = Math.max(1, Math.ceil(list.length / employerPageSize));
    if (employerPage > pageCount) employerPage = pageCount;
    const pagedEmployers = list.slice((employerPage - 1) * employerPageSize, employerPage * employerPageSize);

    const countEl = document.querySelector('#employer-total-count');
    if (countEl) countEl.textContent = `${list.length} items`;
    const chipEl = document.querySelector('#admin-employers-count-chip');
    if (chipEl) chipEl.textContent = `${allEmps.length} Companies`;

    if (employerRows) {
      employerRows.innerHTML = pagedEmployers.length ? pagedEmployers.map(x => `
        <tr id="employer-${esc(x.slug)}">
          <th scope="row" class="check-column"><input type="checkbox" name="employer_ids[]" value="${esc(x.slug)}"></th>
          <td class="column-logo">
            <div class="modern-job-logo-box">
              ${x.logo ? `<img class="wp-job-logo" src="${esc(x.logo)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="wp-job-logo-fallback" style="display:none;">${esc((x.title || 'C').charAt(0))}</div>` : `<div class="wp-job-logo-fallback">${esc((x.title || 'C').charAt(0))}</div>`}
            </div>
          </td>
          <td class="column-title">
            <div class="modern-title-line">
              <a href="#employer-editor" data-employer-edit="${esc(x.slug)}" class="row-title">${esc(x.title)}</a>
            </div>
            <div class="row-actions">
              <a href="#employer-editor" class="row-action-link edit-link" data-employer-edit="${esc(x.slug)}">Edit</a>
              <a href="/employer/${encodeURIComponent(x.slug)}" target="_blank" rel="noopener" class="row-action-link view-link">View ↗</a>
              <a href="#" class="row-action-link trash-link" data-employer-delete="${esc(x.slug)}">Delete</a>
            </div>
          </td>
          <td class="column-category"><span class="modern-category-text" title="${esc((x.categories || []).join(', ') || '—')}">${esc((x.categories || []).join(', ') || '—')}</span></td>
          <td class="column-location">
            <span class="modern-location-text">
              <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              <span>${esc((x.locations || []).join(', ') || '—')}</span>
            </span>
          </td>
          <td class="column-posts" style="text-align:center;"><span class="modern-tax-count-chip">${Number(x.openJobs ?? allJobs().filter(j => j.employerSlug === x.slug || j.company === x.title).length)}</span></td>
          <td class="column-status">
            <span class="modern-status-badge status-active">
              <span class="status-pulse-dot"></span>
              <span>Active</span>
            </span>
          </td>
        </tr>
      `).join('') : '<tr><td colspan="7" style="text-align:center;padding:35px 20px;color:#64748b;font-size:14px;">No matching employers found.</td></tr>';
    }
    const pager = document.getElementById('admin-employer-pagination');
    if (pager) pager.innerHTML = list.length > employerPageSize ? `<button type="button" class="modern-filter-btn" id="employer-prev-page" ${employerPage===1?'disabled':''}>← Previous</button><strong style="font-size:13px;color:#475569;">Page ${employerPage} of ${pageCount}</strong><button type="button" class="modern-filter-btn" id="employer-next-page" ${employerPage===pageCount?'disabled':''}>Next →</button>` : '';
  }

  // --- Employer Profile Claims Management ---
  let employerClaimsList = [];
  let currentClaimFilter = 'all';

  async function loadEmployerClaims() {
    try {
      const res = await fetch('/api/local/employer-claims');
      if (res.ok) {
        employerClaimsList = await res.json();
      }
    } catch {
      employerClaimsList = [];
    }
    updateClaimsBadge();
  }

  function updateClaimsBadge() {
    const badge = document.getElementById('admin-claims-badge');
    const pendingCount = (employerClaimsList || []).filter(c => c.status === 'pending').length;
    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  async function renderEmployerClaims() {
    await loadEmployerClaims();
    const rowsEl = document.getElementById('admin-claims-rows');
    const countEl = document.getElementById('admin-claims-total-count');
    const chipEl = document.getElementById('admin-claims-count-chip');
    if (!rowsEl) return;

    let filtered = employerClaimsList || [];
    if (currentClaimFilter !== 'all') {
      filtered = filtered.filter(c => c.status === currentClaimFilter);
    }

    if (countEl) countEl.textContent = `${filtered.length} claims`;
    if (chipEl) chipEl.textContent = `${(employerClaimsList || []).length} Verification Requests`;

    if (!filtered.length) {
      rowsEl.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:45px 20px;color:#64748b;font-size:14px;">No company claims found in this view.</td></tr>`;
      return;
    }

    rowsEl.innerHTML = filtered.map(claim => {
      const isPending = claim.status === 'pending';
      const isApproved = claim.status === 'approved';
      const isRejected = claim.status === 'rejected';

      const dateStr = claim.createdAt ? new Date(claim.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

      let statusBadge = `<span class="modern-status-badge status-pending" style="display:inline-flex;align-items:center;gap:6px;background:#fefce8;color:#a16207;border:1px solid #fef08a;"><span class="status-pulse-dot" style="background:#eab308;"></span>Pending</span>`;
      if (isApproved) {
        statusBadge = `<span class="modern-status-badge status-active" style="display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;"><span class="status-pulse-dot" style="background:#16a34a;"></span>Approved</span>`;
      } else if (isRejected) {
        statusBadge = `<span class="modern-status-badge" style="display:inline-flex;align-items:center;gap:6px;background:#fef2f2;color:#dc2626;border:1px solid #fee2e2;">Rejected</span>`;
      }

      let docDisplay = `<div style="display:grid;gap:4px;">
        <span style="font-weight:600;color:#0f172a;font-size:12.5px;">${esc(claim.documentType || 'Trade License')}</span>`;
      if (claim.documentData) {
        docDisplay += `<a href="${esc(claim.documentData)}" download="${esc(claim.fileName || 'verification-document')}" class="row-action-link" style="color:#b00008;font-weight:600;font-size:12px;display:inline-flex;align-items:center;gap:4px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Document
        </a>`;
      } else if (claim.fileName) {
        docDisplay += `<span style="color:#64748b;font-size:11.5px;">${esc(claim.fileName)}</span>`;
      }
      docDisplay += `</div>`;

      let actions = '';
      if (isPending) {
        actions = `
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;">
            <button type="button" class="modern-btn-primary" style="padding:6px 12px;font-size:12px;background:#059669;border-color:#059669;border-radius:6px;color:#fff;cursor:pointer;" data-approve-claim="${esc(claim.id)}">Approve & Issue Login</button>
            <button type="button" class="row-action-link trash-link" style="font-size:12px;cursor:pointer;color:#dc2626;" data-reject-claim="${esc(claim.id)}">Reject</button>
          </div>
        `;
      } else if (isApproved) {
        actions = `
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:11.5px;color:#15803d;">
            <strong>✓ Login Active</strong>
            <span style="color:#475569;font-family:monospace;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${esc(claim.issuedUsername || claim.workEmail)}</span>
          </div>
        `;
      } else {
        actions = `
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:11px;color:#dc2626;">
            <strong>Rejected:</strong>
            <span style="color:#64748b;max-width:180px;text-align:right;">${esc(claim.rejectionReason || 'Document unconfirmed')}</span>
          </div>
        `;
      }

      return `
        <tr id="claim-row-${esc(claim.id)}">
          <td>
            <div style="display:grid;gap:3px;">
              <strong style="font-family:monospace;color:#0f172a;font-size:13px;">${esc(claim.id)}</strong>
              <small style="color:#64748b;font-size:11.5px;">${esc(dateStr)}</small>
            </div>
          </td>
          <td>
            <div style="display:grid;gap:2px;">
              <strong style="color:#0f172a;font-size:13.5px;">${esc(claim.employerName || claim.employerSlug)}</strong>
              <a href="/employer/${encodeURIComponent(claim.employerSlug)}" target="_blank" rel="noopener" style="font-size:12px;color:#b00008;text-decoration:none;font-weight:600;">View profile ↗</a>
            </div>
          </td>
          <td>
            <div style="display:grid;gap:2px;font-size:13px;">
              <span style="font-weight:600;color:#0f172a;">${esc(claim.applicantName)} <small style="color:#64748b;font-weight:normal;">(${esc(claim.designation || 'Representative')})</small></span>
              <span style="color:#2563eb;font-size:12px;"><a href="mailto:${esc(claim.workEmail)}" style="color:inherit;">${esc(claim.workEmail)}</a></span>
              <span style="color:#64748b;font-size:11.5px;">📞 ${esc(claim.phone || '—')}</span>
            </div>
          </td>
          <td>${docDisplay}</td>
          <td>${statusBadge}</td>
          <td>${actions}</td>
        </tr>
      `;
    }).join('');
  }

  // Claim actions listener
  document.addEventListener('click', async e => {
    // Filter click
    const filterBtn = e.target.closest('[data-claim-filter]');
    if (filterBtn) {
      document.querySelectorAll('[data-claim-filter]').forEach(b => b.classList.remove('active'));
      filterBtn.classList.add('active');
      currentClaimFilter = filterBtn.dataset.claimFilter;
      renderEmployerClaims();
      return;
    }

    // Refresh click
    if (e.target.closest('#admin-claims-refresh-btn')) {
      renderEmployerClaims();
      return;
    }

    // Approve claim click
    const approveBtn = e.target.closest('[data-approve-claim]');
    if (approveBtn) {
      const claimId = approveBtn.dataset.approveClaim;
      const claim = (employerClaimsList || []).find(c => c.id === claimId);
      if (!claim) return;

      const confirmed = confirm(`Are you sure you want to approve verification for "${claim.employerName}"?\n\nThis will create an active Employer user account for "${claim.workEmail}" and issue login credentials.`);
      if (!confirmed) return;

      approveBtn.disabled = true;
      approveBtn.textContent = 'Approving…';

      try {
        const res = await fetch('/api/local/employer-claims/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimId })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Approval failed');

        // Show credentials modal
        const credModal = document.getElementById('adminClaimCredentialsModal');
        if (credModal && result.credentials) {
          document.getElementById('adminCredEmployer').textContent = claim.employerName || claim.employerSlug;
          document.getElementById('adminCredUsername').textContent = result.credentials.username;
          document.getElementById('adminCredPassword').textContent = result.credentials.temporaryPassword;
          credModal.style.display = 'flex';

          const copyBtn = document.getElementById('adminCredCopyBtn');
          if (copyBtn) {
            copyBtn.onclick = () => {
              const textToCopy = `Employer: ${claim.employerName}\nUsername: ${result.credentials.username}\nPassword: ${result.credentials.temporaryPassword}\nLogin URL: ${location.origin}/login`;
              navigator.clipboard.writeText(textToCopy);
              copyBtn.textContent = '✓ Copied!';
              setTimeout(() => { copyBtn.textContent = 'Copy Credentials'; }, 2000);
            };
          }
        }
        await renderEmployerClaims();
        if (typeof loadData === 'function') loadData();
      } catch (err) {
        alert(err.message || 'Error approving claim');
        approveBtn.disabled = false;
        approveBtn.textContent = 'Approve & Issue Login';
      }
      return;
    }

    // Reject claim click
    const rejectBtn = e.target.closest('[data-reject-claim]');
    if (rejectBtn) {
      const claimId = rejectBtn.dataset.rejectClaim;
      const reason = prompt('Please enter the reason for rejecting this claim (e.g., Invalid trade license or domain mismatch):');
      if (reason === null) return;

      try {
        const res = await fetch('/api/local/employer-claims/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimId, reason: reason.trim() || 'Verification document invalid or rejected' })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Rejection failed');
        await renderEmployerClaims();
      } catch (err) {
        alert(err.message || 'Error rejecting claim');
      }
      return;
    }
  });

  // --- Reported Jobs Management ---
  let reportedJobsData = { reports: [], grouped: [], stats: {} };
  let currentReportFilter = 'all';

  async function loadReportedJobs() {
    try {
      const res = await fetch('/api/admin/job-reports');
      if (res.ok) {
        reportedJobsData = await res.json();
      }
    } catch {
      reportedJobsData = { reports: [], grouped: [], stats: {} };
    }
    updateReportsBadge();
  }

  function updateReportsBadge() {
    const badge = document.getElementById('admin-reports-badge');
    const pendingJobs = (reportedJobsData.grouped || []).filter(g => g.jobStatus !== 'draft' && g.status !== 'resolved');
    const count = pendingJobs.length;
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  const reasonLabels = {
    broken_link: { text: 'Broken Apply Link', icon: '🔗', class: 'broken_link' },
    expired: { text: 'Expired Job', icon: '⏳', class: 'expired' },
    incorrect: { text: 'Incorrect Info', icon: '⚠️', class: 'incorrect' },
    duplicate: { text: 'Duplicate Listing', icon: '📑', class: 'duplicate' },
    suspicious: { text: 'Suspicious / Fraud', icon: '🚨', class: 'suspicious' },
    other: { text: 'Other Issue', icon: '💬', class: 'other' }
  };

  async function renderReportedJobs() {
    await loadReportedJobs();
    const rowsEl = document.getElementById('admin-reports-rows');
    const countEl = document.getElementById('admin-reports-total-count');
    const chipEl = document.getElementById('admin-reports-count-chip');
    const searchVal = (document.getElementById('admin-reports-search')?.value || '').trim().toLowerCase();

    const stats = reportedJobsData.stats || {};
    const grouped = reportedJobsData.grouped || [];
    const statJobs = document.getElementById('stat-reported-jobs');
    const statTotal = document.getElementById('stat-total-reports');
    const statBroken = document.getElementById('stat-broken-links');
    const statExpired = document.getElementById('stat-expired-reports');
    const statDrafted = document.getElementById('stat-drafted-jobs');

    if (statJobs) statJobs.textContent = stats.totalReportedJobs ?? grouped.length;
    if (statTotal) statTotal.textContent = stats.totalReports ?? (reportedJobsData.reports || []).length;
    if (statBroken) statBroken.textContent = stats.brokenLinks ?? 0;
    if (statExpired) statExpired.textContent = stats.expiredReports ?? 0;
    if (statDrafted) statDrafted.textContent = stats.draftedJobs ?? grouped.filter(g => g.jobStatus === 'draft').length;

    if (!rowsEl) return;

    let filtered = grouped;
    if (currentReportFilter === 'pending') {
      filtered = filtered.filter(g => g.jobStatus !== 'draft' && g.status !== 'resolved');
    } else if (currentReportFilter === 'draft') {
      filtered = filtered.filter(g => g.jobStatus === 'draft');
    } else if (currentReportFilter === 'resolved') {
      filtered = filtered.filter(g => g.status === 'resolved');
    }

    if (searchVal) {
      filtered = filtered.filter(g => 
        (g.jobTitle && g.jobTitle.toLowerCase().includes(searchVal)) ||
        (g.company && g.company.toLowerCase().includes(searchVal)) ||
        (g.jobSlug && g.jobSlug.toLowerCase().includes(searchVal))
      );
    }

    if (countEl) countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'job' : 'jobs'}`;
    if (chipEl) chipEl.textContent = `${grouped.length} Flagged Listings`;

    if (!filtered.length) {
      rowsEl.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:45px 20px;color:#64748b;font-size:14px;">No reported jobs found matching this criteria.</td></tr>`;
      return;
    }

    rowsEl.innerHTML = filtered.map(job => {
      const isDraft = job.jobStatus === 'draft';
      const isResolved = job.status === 'resolved';

      const reasonBadges = Object.entries(job.reasons || {})
        .filter(([_, count]) => count > 0)
        .map(([key, count]) => {
          const cfg = reasonLabels[key] || { text: key, icon: '•', class: 'other' };
          return `<span class="report-reason-tag ${cfg.class}">${cfg.icon} ${cfg.text} (${count})</span>`;
        }).join(' ');

      const latestNote = job.detailsList?.[0]?.details || '';
      const previewText = latestNote ? `<div style="margin-top:6px;font-size:12.5px;color:#475569;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid #e2e8f0;font-style:italic;">“${esc(latestNote)}”</div>` : '';

      let statusBadge = `<span class="modern-status-badge status-publish" style="display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;"><span class="status-pulse-dot" style="background:#10b981;"></span>Live / Publish</span>`;
      if (isDraft) {
        statusBadge = `<span class="modern-status-badge status-draft" style="display:inline-flex;align-items:center;gap:6px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;"><span style="width:6px;height:6px;border-radius:50%;background:#94a3b8;"></span>Draft (Hidden)</span>`;
      } else if (isResolved) {
        statusBadge = `<span class="modern-status-badge" style="display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;">✓ Resolved</span>`;
      }

      const draftBtnHtml = isDraft
        ? `<button type="button" class="report-action-btn btn-publish" data-report-job-publish="${esc(job.jobSlug)}" title="Make job active on live site">▶️ Publish</button>`
        : `<button type="button" class="report-action-btn btn-draft" data-report-job-draft="${esc(job.jobSlug)}" title="Hide job from public view immediately">⏸️ Draft Job</button>`;

      return `
        <tr id="reported-row-${esc(job.jobSlug)}">
          <td class="column-title">
            <div style="font-weight:700;font-size:14px;color:#0f172a;line-height:1.35;margin-bottom:3px;">
              <a href="/job/${encodeURIComponent(job.jobSlug)}" target="_blank" rel="noopener" style="color:#0f172a;text-decoration:none;">${esc(job.jobTitle)} ↗</a>
            </div>
            ${job.company ? `<div style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:4px;margin-bottom:3px;">🏢 <span>${esc(job.company)}</span></div>` : ''}
            <div style="font-size:11px;font-family:monospace;color:#94a3b8;">/job/${esc(job.jobSlug)}</div>
          </td>
          <td style="text-align:center;">
            <span class="report-count-badge">👥 ${job.totalReports} ${job.totalReports === 1 ? 'Report' : 'Reports'}</span>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">${formatWpDate(job.latestReportAt)}</div>
          </td>
          <td>
            <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
              ${reasonBadges}
            </div>
            ${previewText}
            <div style="margin-top:6px;">
              <a href="#" style="font-size:12px;font-weight:600;color:#2563eb;text-decoration:none;" data-view-report-details="${esc(job.jobSlug)}">View details & notes (${job.detailsList.length}) →</a>
            </div>
          </td>
          <td>
            ${statusBadge}
          </td>
          <td style="text-align:right;">
            <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;">
              ${draftBtnHtml}
              <button type="button" class="report-action-btn btn-edit" data-report-job-edit="${esc(job.jobSlug)}" title="Edit in job editor">✏️ Edit</button>
              <button type="button" class="report-action-btn" data-report-job-resolve="${esc(job.jobSlug)}" title="Mark reports as resolved">✓ Resolve</button>
              <button type="button" class="report-action-btn" data-report-job-delete="${esc(job.jobSlug)}" title="Delete/dismiss reports" style="color:#dc2626;">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function toggleDraftReportedJob(slug, newStatus = 'draft') {
    try {
      const res = await fetch('/api/admin/job-reports/draft-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobSlug: slug, status: newStatus })
      });
      const result = await res.json();
      if (res.ok && result.ok) {
        showAdminNotice(newStatus === 'draft' ? `Job “${slug}” has been moved to Draft (hidden from live site).` : `Job “${slug}” has been restored to Published status.`);
        await renderReportedJobs();
      } else {
        showAdminNotice(result.error || 'Failed to update job status.', 'error');
      }
    } catch (err) {
      showAdminNotice('Error updating job status: ' + err.message, 'error');
    }
  }

  async function editReportedJob(slug) {
    let job = allJobs().find(j => j.slug === slug);
    if (!job) {
      try {
        const res = await fetch(`/api/wp/job_listing?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const records = await res.json();
          if (records.length) {
            const r = records[0];
            const m = r.metas || {};
            job = {
              title: r.title?.rendered || r.title || '',
              slug: r.slug,
              description: r.content?.rendered || r.content || '',
              company: m._job_employer_name || '',
              status: r.status || 'publish',
              applyUrl: m._job_apply_url || '',
              deadline: m._job_expires || '',
              expiryDate: m._job_expires || '',
              types: r.types || [],
              categories: r.categories || [],
              locations: r.locations || []
            };
          }
        }
      } catch {}
    }
    if (!job) {
      try {
        const res = await fetch(`/api/local/jobs/${encodeURIComponent(slug)}`);
        if (res.ok) job = await res.json();
      } catch {}
    }
    if (job) {
      fillJob(job);
      location.hash = 'job-editor';
      switchView('job-editor');
      showAdminNotice(`Loaded “${job.title || slug}” into editor.`);
    } else {
      showAdminNotice(`Could not load job “${slug}” for editing.`, 'error');
    }
  }

  async function resolveJobReports(slug) {
    try {
      const res = await fetch('/api/admin/job-reports/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobSlug: slug })
      });
      if (res.ok) {
        showAdminNotice(`Reports for “${slug}” marked as resolved.`);
        await renderReportedJobs();
      }
    } catch (err) {
      showAdminNotice('Error resolving reports: ' + err.message, 'error');
    }
  }

  async function deleteJobReport(reportId, slug) {
    try {
      const res = await fetch('/api/admin/job-reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, jobSlug: slug })
      });
      if (res.ok) {
        showAdminNotice('Report dismissed successfully.');
        await renderReportedJobs();
      }
    } catch (err) {
      showAdminNotice('Error dismissing report: ' + err.message, 'error');
    }
  }

  function openReportDetailsModal(slug) {
    const job = (reportedJobsData.grouped || []).find(g => g.jobSlug === slug);
    if (!job) return;
    const modal = document.getElementById('adminReportDetailsModal');
    const titleEl = document.getElementById('reportModalJobTitle');
    const metaEl = document.getElementById('reportModalJobMeta');
    const bodyEl = document.getElementById('reportModalBody');
    const actionsEl = document.getElementById('reportModalJobActions');
    if (!modal) return;

    if (titleEl) titleEl.textContent = job.jobTitle;
    if (metaEl) metaEl.textContent = `${job.totalReports} reports submitted · Slug: ${job.jobSlug} · Status: ${job.jobStatus}`;

    if (bodyEl) {
      bodyEl.innerHTML = job.detailsList.map(item => {
        const cfg = reasonLabels[item.reason] || { text: item.reason, icon: '•', class: 'other' };
        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
        return `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span class="report-reason-tag ${cfg.class}">${cfg.icon} ${cfg.text}</span>
              <span style="font-size:11.5px;color:#94a3b8;">${dateStr}</span>
            </div>
            <div style="font-size:13.5px;color:#1e293b;line-height:1.5;">
              ${item.details ? esc(item.details) : '<span style="color:#94a3b8;font-style:italic;">No additional notes provided.</span>'}
            </div>
            ${item.reporterEmail ? `<div style="margin-top:8px;font-size:11.5px;color:#64748b;">Reported by: ${esc(item.reporterEmail)}</div>` : ''}
          </div>
        `;
      }).join('');
    }

    if (actionsEl) {
      const isDraft = job.jobStatus === 'draft';
      actionsEl.innerHTML = `
        <button type="button" class="report-action-btn ${isDraft ? 'btn-publish' : 'btn-draft'}" onclick="document.getElementById('adminReportDetailsModal').style.display='none'; toggleDraftReportedJob('${esc(job.jobSlug)}', '${isDraft ? 'publish' : 'draft'}');">
          ${isDraft ? '▶️ Publish Job' : '⏸️ Draft Job'}
        </button>
        <button type="button" class="report-action-btn btn-edit" onclick="document.getElementById('adminReportDetailsModal').style.display='none'; editReportedJob('${esc(job.jobSlug)}');">
          ✏️ Edit Job
        </button>
        <a href="/job/${encodeURIComponent(job.jobSlug)}" target="_blank" class="report-action-btn">
          👁️ Live Link ↗
        </a>
      `;
    }

    modal.style.display = 'flex';
  }

  // Delegated events for Reported Jobs view
  const reportsViewEl = document.getElementById('view-reported-jobs');
  reportsViewEl?.addEventListener('click', async e => {
    if (e.target.closest('#admin-reports-refresh-btn')) {
      await renderReportedJobs();
      showAdminNotice('Reported jobs refreshed.');
      return;
    }

    const filterBtn = e.target.closest('[data-report-filter]');
    if (filterBtn) {
      reportsViewEl.querySelectorAll('[data-report-filter]').forEach(b => b.classList.remove('active'));
      filterBtn.classList.add('active');
      currentReportFilter = filterBtn.dataset.reportFilter;
      renderReportedJobs();
      return;
    }

    const viewDetailsLink = e.target.closest('[data-view-report-details]');
    if (viewDetailsLink) {
      e.preventDefault();
      const slug = viewDetailsLink.dataset.viewReportDetails;
      openReportDetailsModal(slug);
      return;
    }

    const draftBtn = e.target.closest('[data-report-job-draft]');
    if (draftBtn) {
      e.preventDefault();
      const slug = draftBtn.dataset.reportJobDraft;
      if (!confirm(`Are you sure you want to set “${slug}” to Draft? It will be hidden from the live website immediately.`)) return;
      await toggleDraftReportedJob(slug, 'draft');
      return;
    }

    const publishBtn = e.target.closest('[data-report-job-publish]');
    if (publishBtn) {
      e.preventDefault();
      const slug = publishBtn.dataset.reportJobPublish;
      await toggleDraftReportedJob(slug, 'publish');
      return;
    }

    const editBtn = e.target.closest('[data-report-job-edit]');
    if (editBtn) {
      e.preventDefault();
      const slug = editBtn.dataset.reportJobEdit;
      editReportedJob(slug);
      return;
    }

    const resolveBtn = e.target.closest('[data-report-job-resolve]');
    if (resolveBtn) {
      e.preventDefault();
      const slug = resolveBtn.dataset.reportJobResolve;
      await resolveJobReports(slug);
      return;
    }

    const deleteBtn = e.target.closest('[data-report-job-delete]');
    if (deleteBtn) {
      e.preventDefault();
      const slug = deleteBtn.dataset.reportJobDelete;
      if (!confirm(`Delete/dismiss all reports for “${slug}”?`)) return;
      await deleteJobReport(null, slug);
      return;
    }
  });

  document.getElementById('admin-reports-search')?.addEventListener('input', () => {
    renderReportedJobs();
  });

  // Load all data
  async function loadData() {
    const [local, localTax, wpTax, remote, employers, wpEmployers, registeredCandidates] = await Promise.all([
      fetch('/api/local/jobs').then(r => r.json()).catch(() => []),
      fetch('/api/local/taxonomies').then(r => r.json()).catch(() => null),
      fetch('/api/wp/taxonomies').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/wp/job_listing?per_page=30&_fields=id,slug,title,status,date,metas,content,excerpt').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/local/employers').then(r => r.json()).catch(() => []),
      fetch('/api/wp/employer?per_page=3000&_fields=id,slug,title,status,metas,content').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/local/candidates').then(r => r.ok ? r.json() : []).catch(() => fetch('/api/admin/candidates').then(r => r.ok ? r.json() : []).catch(() => []))
    ]);

    localJobs = local;
    remoteJobs = remote.map(wordpressJob);
    localEmployers = employers;
    remoteEmployers = wpEmployers.map(item => {
      const m = item.metas || {};
      return {
        title: item.title?.rendered || '',
        slug: item.slug,
        email: m._employer_email || '',
        phone: m._employer_phone || '',
        website: m._employer_website || '',
        foundedDate: m._employer_founded_date || '',
        companySize: m._employer_company_size || '',
        showProfile: m._employer_show_profile || 'show',
        featured: !!m._job_featured,
        description: item.content?.rendered || '',
        logo: m._employer_logo || m._employer_featured_image || '',
        openJobs: Number(m._employer_open_jobs) || 0,
        categories: publicField(m._employer_category).split(', ').filter(Boolean),
        locations: publicField(m._employer_location).split(', ').filter(Boolean),
        local: false
      };
    });

    if (Array.isArray(registeredCandidates) && registeredCandidates.length) {
      const mergedMap = new Map();
      registeredCandidates.forEach(account => {
        const key = String(account.id || account.email);
        mergedMap.set(key, account);
      });
      candidates.forEach(c => {
        const key = String(c.id || c.email);
        if (mergedMap.has(key)) {
          mergedMap.set(key, { ...mergedMap.get(key), ...c });
        } else {
          mergedMap.set(key, c);
        }
      });
      candidates = Array.from(mergedMap.values());
      saveCandidates();
      renderCandidateRows();
    }

    let cachedTax = null;
    const cachedTaxStr = localStorage.getItem('wp_admin_taxonomies');
    if (cachedTaxStr) {
      try {
        cachedTax = JSON.parse(cachedTaxStr);
      } catch {}
    }

    const mergeTerms = (primary = [], secondary = [], cached = []) => {
      const map = new Map();
      const add = (item) => {
        if (!item) return;
        const obj = typeof item === 'string'
          ? { name: item, slug: item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), parent: '', description: '', count: 0 }
          : { ...item };
        const key = (obj.slug || obj.name || '').toLowerCase();
        if (!key) return;
        const existing = map.get(key);
        if (existing) {
          map.set(key, { ...existing, ...obj, count: obj.count !== undefined ? obj.count : existing.count });
        } else {
          map.set(key, obj);
        }
      };
      (primary || []).forEach(add);
      (secondary || []).forEach(add);
      // Merge cached terms if they add or update, but ignore if cached is just an old truncated array
      if (Array.isArray(cached) && (cached.length > 25 || (!primary?.length && !secondary?.length))) {
        cached.forEach(add);
      }
      return Array.from(map.values());
    };

    const normalize = (items, defaultItems = []) => {
      const list = Array.isArray(items) && items.length ? items : defaultItems;
      return list.map(item => {
        if (typeof item === 'string') {
          return {
            name: item,
            slug: item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            parent: '',
            description: '',
            count: 0
          };
        }
        return item;
      });
    };

    taxonomies = {
      types: normalize(mergeTerms(wpTax?.types, localTax?.types, cachedTax?.types), defaults.types.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), parent: '', description: '', count: 10 }))),
      categories: normalize(mergeTerms(wpTax?.categories, localTax?.categories, cachedTax?.categories), defaults.categories.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), parent: '', description: '', count: 50 }))),
      locations: normalize(mergeTerms(wpTax?.locations, localTax?.locations, cachedTax?.locations), defaults.locations.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), parent: '', description: '', count: 100 }))),
      tags: normalize(mergeTerms(wpTax?.tags, localTax?.tags, cachedTax?.tags), defaults.tags.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), parent: '', description: '', count: 10 }))),
      employerCategories: normalize(mergeTerms(wpTax?.employerCategories, localTax?.employerCategories, cachedTax?.employerCategories), (defaults.employerCategories || []).map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), parent: '', description: '', count: 10 }))),
      employerLocations: normalize(mergeTerms(wpTax?.employerLocations, localTax?.employerLocations, cachedTax?.employerLocations), (defaults.employerLocations || []).map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), parent: '', description: '', count: 10 }))),
      postCategories: normalize(cachedTax?.postCategories || localTax?.postCategories || wpTax?.postCategories, defaults.postCategories)
    };

    try {
      localStorage.setItem('wp_admin_taxonomies', JSON.stringify(taxonomies));
    } catch {}

    try {
      const [pRes, pgRes, mRes] = await Promise.all([
        fetch('/api/wp/posts?per_page=100').catch(() => null),
        fetch('/api/wp/pages?per_page=30').catch(() => null),
        fetch('/api/wp/media?per_page=5000').catch(() => null)
      ]);
      if (pRes && pRes.ok) {
        const wpPosts = await pRes.json();
        if (Array.isArray(wpPosts)) {
          // Keep posts created or edited in this local CMS when the connected
          // WordPress list is refreshed. Previously this assignment replaced
          // the complete local collection, so newly published local posts
          // disappeared after a browser reload even though savePosts() had
          // written them to localStorage.
          const locallySavedPosts = Array.isArray(posts) ? [...posts] : [];
          const connectedPosts = wpPosts.map(wp => ({
                id: wp.id,
                title: wp.title?.rendered || 'Untitled Post',
                slug: wp.slug,
                author: wp.author_name || 'Trikonet',
                authorUrl: wp.author_url || '',
                localUrl: wp.local_url || `/blog/${wp.slug}`,
                categories: Object.values(wp.metas?._post_category || {}).map(decodePostText),
                tags: Object.values(wp.metas?._post_tag || {}).map(decodePostText),
                views: 0,
                comments: 0,
                date: `Published ${wp.date?.replace('T', ' at ').slice(0, 19)}`,
                rawDate: wp.date?.slice(0, 10),
                status: wp.status === 'publish' ? 'published' : 'draft',
                isMine: false,
                seoScore: 70 + (wp.id % 25),
                keyword: wp.title?.rendered?.split(' ').slice(0, 3).join(' ') || 'Not Set',
                schema: 'Article (BlogPosting)',
                links: '0 | 0 | 1',
                excerpt: wp.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '',
                content: wp.content?.rendered || '',
                databaseSource: true
              }));
          const localBySlug = new Map(locallySavedPosts
            .filter(post => post?.slug)
            .map(post => [post.slug, post]));
          posts = connectedPosts.map(connected => {
            const saved = localBySlug.get(connected.slug);
            if (!saved) return connected;
            localBySlug.delete(connected.slug);
            return {
              ...connected,
              ...saved,
              id: connected.id,
              databaseSource: true
            };
          });
          // Anything left in the map was created locally and is not present in
          // WordPress yet. Preserve it at the top of the Posts table.
          posts.unshift(...[...localBySlug.values()].filter(post => !post.databaseSource));
          savePosts();
        }
      }
      if (pgRes && pgRes.ok) {
        const wpPages = await pgRes.json();
        if (Array.isArray(wpPages)) {
          wpPages.forEach(wp => {
            if (!pages.some(p => p.slug === wp.slug || p.id === wp.id)) {
              pages.push({
                id: wp.id,
                title: wp.title?.rendered || 'Untitled Page',
                slug: wp.slug,
                author: 'Trikonet',
                views: Math.floor(Math.random() * 30),
                comments: '—',
                date: `Published ${wp.date?.replace('T', ' at ').slice(0, 19)}`,
                rawDate: wp.date?.slice(0, 10),
                status: wp.status === 'publish' ? 'published' : 'draft',
                seoScore: wp.id % 2 === 0 ? 65 + (wp.id % 30) : null,
                keyword: 'Not Set',
                schema: 'Off',
                links: '1 | 0 | 0',
                content: wp.content?.rendered || ''
              });
            }
          });
          savePages();
        }
      }
      if (mRes && mRes.ok) {
        const wpMedia = await mRes.json();
        if (Array.isArray(wpMedia)) {
          const importedMedia = [];
          wpMedia.forEach(m => {
            const url = m.source_url || m.guid?.rendered;
            if (url) {
              importedMedia.push({
                id: m.id,
                title: m.title?.rendered || m.slug || url.split('/').pop(),
                url,
                dimensions: m.media_details?.width ? `${m.media_details.width} × ${m.media_details.height}` : '—',
                size: m.media_details?.filesize ? `${Math.round(m.media_details.filesize / 1024)} KB` : '—',
                type: m.media_type === 'image' ? 'image' : 'file',
                date: m.date?.slice(0, 10) || '2026/09/23'
              });
            }
          });
          const localOnly = media.filter(item => String(item.url || '').startsWith('/assets/') || String(item.url || '').startsWith('/favicon'));
          media = [...localOnly, ...importedMedia];
          saveMedia();
        }
      }
    } catch {}

    renderJobRows();
    renderTaxonomyTables();
    renderEmployerRows();
    populateEmployerDropdown();
    if (typeof renderPostRows === 'function') renderPostRows();
    if (typeof renderPageRows === 'function') renderPageRows();
    if (typeof renderMediaGrid === 'function') renderMediaGrid();
    if (typeof renderCandidateRows === 'function') renderCandidateRows();
    if (typeof loadEmployerClaims === 'function') loadEmployerClaims();
    if (typeof loadReportedJobs === 'function') loadReportedJobs();

  }

  // Event Listeners: Select All Checkbox
  document.querySelector('#cb-select-all-1')?.addEventListener('change', e => {
    jobRows.querySelectorAll('input[name="post[]"]').forEach(box => { box.checked = e.target.checked; });
  });

  // --- JOBS BULK ACTIONS (BULK EDIT & BULK DELETE) ---
  let activeBulkEditSlugs = [];

  function closeBulkEdit() {
    const existing = document.getElementById('bulk-edit-row');
    if (existing) existing.remove();
    activeBulkEditSlugs = [];
  }

  function openBulkEdit(selectedSlugs) {
    if (typeof closeQuickEdit === 'function') closeQuickEdit();
    closeBulkEdit();

    if (!selectedSlugs || !selectedSlugs.length) return;
    activeBulkEditSlugs = [...selectedSlugs];

    const selectedJobs = activeBulkEditSlugs.map(slug => allJobs().find(j => j.slug === slug)).filter(Boolean);
    if (!selectedJobs.length) return;

    // Categories checklist with hierarchy
    const hierCats = buildHierarchy(taxonomies.categories);
    const catsHtml = hierCats.map(c => `
      <label class="${c.depth ? `level-${c.depth}` : ''}">
        <input type="checkbox" name="bulk_cat" value="${esc(c.name)}"> ${esc(c.name)}
      </label>
    `).join('');

    // Locations checklist with hierarchy
    const hierLocs = buildHierarchy(taxonomies.locations);
    const locsHtml = hierLocs.map(l => `
      <label class="${l.depth ? `level-${l.depth}` : ''}">
        <input type="checkbox" name="bulk_loc" value="${esc(l.name)}"> ${esc(l.name)}
      </label>
    `).join('');

    // Job types
    const jobTypes = ['Freelance', 'Full Time', 'Internship', 'Part Time', 'Temporary'];
    const typesHtml = jobTypes.map(t => `
      <label><input type="checkbox" name="bulk_type" value="${esc(t)}"> ${esc(t)}</label>
    `).join('');

    // Employers
    const emps = allEmployers();
    const employersHtml = emps.map(e => `<option value="${esc(e.title)}">${esc(e.title)}</option>`).join('');

    const bulkTr = document.createElement('tr');
    bulkTr.id = 'bulk-edit-row';
    bulkTr.className = 'inline-edit-row bulk-edit-row';
    bulkTr.innerHTML = `
      <td colspan="9" class="colspanchange">
        <div class="inline-edit-wrapper">
          <div class="inline-edit-fields-grid">
            <!-- Column 1: Selected Jobs List -->
            <div class="inline-edit-col-1">
              <div class="inline-edit-col-title">BULK EDIT (<span id="bulk-edit-count">${selectedJobs.length}</span> JOBS SELECTED)</div>
              <div class="bulk-edit-tags-container" id="bulk-edit-items-list">
                ${selectedJobs.map(j => `
                  <span class="bulk-job-chip" id="bulk-chip-${esc(j.slug)}">
                    <span class="bulk-job-chip-title">${esc(j.title)}</span>
                    <button type="button" class="bulk-job-chip-remove" data-remove-slug="${esc(j.slug)}" title="Exclude from bulk edit">✕</button>
                  </span>
                `).join('')}
              </div>
              <small style="display:block;margin-top:8px;color:#64748b;font-size:11.5px;">Click ✕ to exclude a job from this bulk update.</small>
            </div>

            <!-- Column 2: Taxonomies -->
            <div class="inline-edit-col-2">
              <div class="inline-edit-section-header">Categories</div>
              <div class="inline-edit-checklist-box" style="max-height:130px;">
                ${catsHtml}
              </div>

              <div class="inline-edit-section-header">Locations</div>
              <div class="inline-edit-checklist-box" style="max-height:130px;">
                ${locsHtml}
              </div>

              <div class="inline-edit-section-header">Job Types</div>
              <div class="inline-edit-simple-list">
                ${typesHtml}
              </div>
            </div>

            <!-- Column 3: Status & Company Details -->
            <div class="inline-edit-col-3">
              <div class="inline-edit-label-row">
                <label class="title">Status</label>
                <select name="bulk_status" class="inline-edit-input">
                  <option value="-1">— No Change —</option>
                  <option value="publish">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>

              <div class="inline-edit-label-row">
                <label class="title">Company</label>
                <select name="bulk_company" class="inline-edit-input">
                  <option value="-1">— No Change —</option>
                  ${employersHtml}
                </select>
              </div>

              <div class="inline-edit-label-row">
                <label class="title">Featured</label>
                <select name="bulk_featured" class="inline-edit-input">
                  <option value="-1">— No Change —</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div class="inline-edit-label-row">
                <label class="title">Urgent</label>
                <select name="bulk_urgent" class="inline-edit-input">
                  <option value="-1">— No Change —</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="inline-edit-actions-bar">
            <button type="button" class="inline-edit-update-btn" id="btn-submit-bulk-edit">Update Jobs</button>
            <button type="button" class="inline-edit-cancel-btn" id="btn-cancel-bulk-edit">Cancel</button>
            <span id="bulk-edit-status-msg" style="font-size:12px;color:#0284c7;font-weight:500;margin-left:8px;"></span>
          </div>
        </div>
      </td>
    `;

    jobRows.prepend(bulkTr);

    // Remove single item from bulk chips
    bulkTr.querySelectorAll('.bulk-job-chip-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const removeSlug = btn.dataset.removeSlug;
        activeBulkEditSlugs = activeBulkEditSlugs.filter(s => s !== removeSlug);
        const chip = document.getElementById(`bulk-chip-${removeSlug}`);
        if (chip) chip.remove();

        const rowCb = jobRows.querySelector(`input[name="post[]"][value="${removeSlug}"]`);
        if (rowCb) rowCb.checked = false;

        const countEl = document.getElementById('bulk-edit-count');
        if (countEl) countEl.textContent = activeBulkEditSlugs.length;

        if (!activeBulkEditSlugs.length) {
          closeBulkEdit();
        }
      });
    });

    bulkTr.querySelector('#btn-cancel-bulk-edit')?.addEventListener('click', closeBulkEdit);

    bulkTr.querySelector('#btn-submit-bulk-edit')?.addEventListener('click', async () => {
      if (!activeBulkEditSlugs.length) return;
      const updateBtn = document.getElementById('btn-submit-bulk-edit');
      const statusMsg = document.getElementById('bulk-edit-status-msg');
      if (updateBtn) {
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating…';
      }
      if (statusMsg) statusMsg.textContent = `Saving changes to ${activeBulkEditSlugs.length} job(s)…`;

      const newStatus = bulkTr.querySelector('select[name="bulk_status"]')?.value;
      const newCompany = bulkTr.querySelector('select[name="bulk_company"]')?.value;
      const newFeatured = bulkTr.querySelector('select[name="bulk_featured"]')?.value;
      const newUrgent = bulkTr.querySelector('select[name="bulk_urgent"]')?.value;

      const addedCats = [...bulkTr.querySelectorAll('input[name="bulk_cat"]:checked')].map(x => x.value);
      const addedLocs = [...bulkTr.querySelectorAll('input[name="bulk_loc"]:checked')].map(x => x.value);
      const addedTypes = [...bulkTr.querySelectorAll('input[name="bulk_type"]:checked')].map(x => x.value);

      let companyLogo = '';
      if (newCompany && newCompany !== '-1') {
        const foundEmp = allEmployers().find(e => e.title.toLowerCase() === newCompany.toLowerCase());
        if (foundEmp) companyLogo = foundEmp.logo || '';
      }

      for (const slug of activeBulkEditSlugs) {
        const job = allJobs().find(j => j.slug === slug);
        if (!job) continue;

        const updatedJob = { ...job, local: true };

        if (newStatus && newStatus !== '-1') {
          updatedJob.status = newStatus;
        }
        if (newCompany && newCompany !== '-1') {
          updatedJob.company = newCompany;
          if (companyLogo) updatedJob.logo = companyLogo;
        }
        if (newFeatured && newFeatured !== '-1') {
          updatedJob.featured = (newFeatured === 'yes');
        }
        if (newUrgent && newUrgent !== '-1') {
          updatedJob.urgent = (newUrgent === 'yes');
        }

        if (addedCats.length) {
          const mergedCats = Array.from(new Set([...(job.categories || [job.category || 'General']), ...addedCats]));
          updatedJob.categories = mergedCats;
          updatedJob.category = mergedCats[0];
        }
        if (addedLocs.length) {
          const mergedLocs = Array.from(new Set([...(job.locations || [job.location || 'Dubai']), ...addedLocs]));
          updatedJob.locations = mergedLocs;
          updatedJob.location = mergedLocs[0];
        }
        if (addedTypes.length) {
          const mergedTypes = Array.from(new Set([...(job.types || [job.type || 'Full Time']), ...addedTypes]));
          updatedJob.types = mergedTypes;
          updatedJob.type = mergedTypes[0];
        }

        await fetch('/api/local/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedJob)
        }).catch(() => {});

        localJobs = localJobs.filter(j => j.slug !== slug);
        localJobs.unshift(updatedJob);
      }

      const count = activeBulkEditSlugs.length;
      closeBulkEdit();
      renderJobRows();
      const selectAllCb = document.getElementById('cb-select-all-1');
      if (selectAllCb) selectAllCb.checked = false;
      const actionSelect = document.getElementById('bulk-action-selector-top');
      if (actionSelect) actionSelect.value = '-1';
      alert(`Successfully updated ${count} job(s).`);
    });
  }

  async function handleBulkDelete(selectedSlugs) {
    if (!confirm(`Are you sure you want to delete ${selectedSlugs.length} selected job(s)? This action cannot be undone.`)) {
      return;
    }
    const applyBtn = document.getElementById('doaction');
    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.textContent = 'Deleting…';
    }

    for (const slug of selectedSlugs) {
      await fetch(`/api/local/jobs/${encodeURIComponent(slug)}`, { method: 'DELETE' }).catch(() => {});
      localJobs = localJobs.filter(j => j.slug !== slug);
      remoteJobs = remoteJobs.filter(j => j.slug !== slug);
    }

    renderJobRows();
    const selectAllCb = document.getElementById('cb-select-all-1');
    if (selectAllCb) selectAllCb.checked = false;
    const actionSelect = document.getElementById('bulk-action-selector-top');
    if (actionSelect) actionSelect.value = '-1';
    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.textContent = 'Apply';
    }
    alert(`Successfully deleted ${selectedSlugs.length} job(s).`);
  }

  document.getElementById('doaction')?.addEventListener('click', () => {
    const action = document.getElementById('bulk-action-selector-top')?.value;
    const selected = Array.from(jobRows.querySelectorAll('input[name="post[]"]:checked')).map(cb => cb.value);

    if (action === '-1' || !action) {
      alert('Please select a bulk action from the dropdown.');
      return;
    }
    if (!selected.length) {
      alert('Please select at least one job by checking its box.');
      return;
    }

    if (action === 'edit') {
      openBulkEdit(selected);
    } else if (action === 'delete' || action === 'trash') {
      handleBulkDelete(selected);
    }
  });

  // Table Row Actions (Edit, Quick Edit, Trash, Instant Indexing)
  jobRows.addEventListener('click', async e => {
    const editBtn = e.target.closest('[data-job-edit]');
    if (editBtn) {
      e.preventDefault();
      const job = allJobs().find(j => j.slug === editBtn.dataset.jobEdit);
      if (job) {
        fillJob(job);
        location.hash = 'job-editor';
      }
      return;
    }
    const qeBtn = e.target.closest('[data-job-quick-edit]');
    if (qeBtn) {
      e.preventDefault();
      const slug = qeBtn.dataset.jobQuickEdit;
      openQuickEdit(slug);
      return;
    }
    const trashBtn = e.target.closest('[data-job-trash]');
    if (trashBtn) {
      e.preventDefault();
      const slug = trashBtn.dataset.jobTrash;
      if (!confirm(`Move “${slug}” to Trash?`)) return;
      await fetch(`/api/local/jobs/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      localJobs = localJobs.filter(j => j.slug !== slug);
      remoteJobs = remoteJobs.filter(j => j.slug !== slug);
      renderJobRows();
      showAdminNotice(`Job “${slug}” moved to Trash successfully.`);
      return;
    }
    const indexBtn = e.target.closest('[data-instant]');
    if (indexBtn) {
      e.preventDefault();
      alert(`Instant Indexing: Submitted /job/${indexBtn.dataset.instant} to Google API.`);
    }
  });

  // Status Filter Tabs
  document.querySelector('#admin-status-tabs')?.addEventListener('click', e => {
    const link = e.target.closest('a[data-status]');
    if (!link) return;
    e.preventDefault();
    document.querySelectorAll('#admin-status-tabs a').forEach(a => a.classList.remove('current'));
    link.classList.add('current');
    currentStatus = link.dataset.status;
    currentPage = 1;
    renderJobRows();
  });

  // Search & Filters
  document.querySelector('#admin-search').addEventListener('input', () => { currentPage = 1; renderJobRows(); });
  document.querySelector('#admin-search-button').addEventListener('click', () => { currentPage = 1; renderJobRows(); });
  document.querySelector('#post-query-submit').addEventListener('click', () => { currentPage = 1; renderJobRows(); });

  // Top Header Quick Search (Sync with main searches)
  const headerQuickSearch = document.getElementById('admin-header-quicksearch');
  if (headerQuickSearch) {
    headerQuickSearch.addEventListener('input', e => {
      const q = e.target.value;
      const jobInput = document.querySelector('#admin-search');
      if (jobInput) jobInput.value = q;
      const empInput = document.querySelector('#employer-search');
      if (empInput) empInput.value = q;

      currentPage = 1;
      renderJobRows();
      renderEmployerRows();
    });

    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        headerQuickSearch.focus();
        headerQuickSearch.select();
      } else if (e.key === '/' && document.activeElement !== headerQuickSearch && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        headerQuickSearch.focus();
      }
    });
  }

  // Pagination buttons
  document.querySelector('.tablenav-page-btn.first-page')?.addEventListener('click', () => { currentPage = 1; renderJobRows(); });
  document.querySelector('.tablenav-page-btn.prev-page')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderJobRows(); } });
  document.querySelector('.tablenav-page-btn.next-page')?.addEventListener('click', () => { currentPage++; renderJobRows(); });
  document.querySelector('.tablenav-page-btn.last-page')?.addEventListener('click', () => { currentPage = Math.ceil(allJobs().length / pageSize) || 1; renderJobRows(); });

  // Job Form Inputs & Submission
  jobForm.title.addEventListener('input', () => {
    if (!jobForm.originalSlug.value) jobForm.slug.value = jobForm.title.value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    updateJobPreview();
  });
  jobForm.slug.addEventListener('input', updateJobPreview);
  document.getElementById('job-apply-type')?.addEventListener('change', updateApplicationMethodUI);
  const uaeLocationSelect = document.getElementById('job-address-locality');
  function syncUaeLocationRegion() {
    if (!uaeLocationSelect) return;
    const selected = uaeLocationSelect.selectedOptions[0];
    const region = document.getElementById('job-address-region');
    if (region && selected?.value) region.value = selected.dataset.region || selected.value;
  }
  uaeLocationSelect?.addEventListener('change', syncUaeLocationRegion);
  const applicationDeadline = document.getElementById('job-application-deadline');
  const listingExpiry = document.getElementById('job-listing-expiry');
  const syncExpiry = document.getElementById('job-sync-expiry');
  applicationDeadline?.addEventListener('change', () => { if (syncExpiry?.checked && listingExpiry) listingExpiry.value = applicationDeadline.value; });
  listingExpiry?.addEventListener('change', () => { if (syncExpiry) syncExpiry.checked = listingExpiry.value === applicationDeadline?.value; });
  syncExpiry?.addEventListener('change', () => { if (syncExpiry.checked && listingExpiry && applicationDeadline) listingExpiry.value = applicationDeadline.value; });
  document.querySelectorAll('[data-deadline-days]').forEach(button => button.addEventListener('click', () => {
    const date = new Date();
    date.setDate(date.getDate() + Number(button.dataset.deadlineDays || 30));
    const value = date.toISOString().slice(0,10);
    if (applicationDeadline) applicationDeadline.value = value;
    if (syncExpiry?.checked && listingExpiry) listingExpiry.value = value;
    document.querySelectorAll('[data-deadline-days]').forEach(item => item.classList.toggle('active', item === button));
  }));

  jobForm.addEventListener('submit', async e => {
    e.preventDefault();
    jobStatusState.textContent = 'Saving…';
    const fd = new FormData(jobForm);
    const job = Object.fromEntries(fd.entries());
    if (e.submitter?.id === 'publish-job-btn') job.status = 'publish';
    job.originalSlug = jobForm.originalSlug.value;
    job.description = document.getElementById('job-rich-content')?.innerHTML?.trim() || job.description?.trim() || '';
    if ((job.applyType === 'External URL' && !job.applyUrl) || (job.applyType === 'By Email' && !job.applyEmail)) {
      const field = job.applyType === 'By Email' ? document.getElementById('job-apply-email') : document.getElementById('job-apply-url');
      field?.focus();
      field?.scrollIntoView({ behavior:'smooth', block:'center' });
      alert(`Enter the ${job.applyType === 'By Email' ? 'application email address' : 'direct application URL'} before saving.`);
      jobStatusState.textContent = 'Application destination is required.';
      return;
    }
    if (job.deadline && job.expiryDate && job.expiryDate < job.deadline) {
      listingExpiry?.focus();
      alert('Listing Expiry Date cannot be earlier than the Application Deadline.');
      jobStatusState.textContent = 'Correct the listing expiry date.';
      return;
    }
    const googleRequired = [['title','Job Title'],['description','Description & Responsibilities'],['employmentType','Employment Type'],['datePosted','Date Posted'],['streetAddress','Street Address'],['addressLocality','City / Locality'],['addressRegion','State / Region'],['addressCountry','Country'],['address','Full workplace address']];
    const missingGoogleFields = googleRequired.filter(([key]) => !String(job[key] || '').replace(/<[^>]*>/g,'').trim());
    if (missingGoogleFields.length) {
      const firstField = jobForm.elements[missingGoogleFields[0][0]] || document.getElementById('job-gutenberg-title');
      firstField?.focus();
      firstField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      alert(`Complete the required Google Job Posting fields:\n\n${missingGoogleFields.map(([,label]) => `• ${label}`).join('\n')}`);
      jobStatusState.textContent = `${missingGoogleFields.length} required field${missingGoogleFields.length === 1 ? '' : 's'} missing.`;
      return;
    }
    job.company = document.getElementById('field-employer-company-value')?.value?.trim() || job.company?.trim() || '';
    if (!job.company) {
      alert('Please select or specify a Company / Employer Author.');
      jobStatusState.textContent = 'Please specify an employer / company.';
      return;
    }
    const employer = allEmployers().find(x => x.title.toLowerCase() === job.company.toLowerCase());
    if (employer) {
      job.employerSlug = employer.slug;
      job.employerUrl = `/employer/${employer.slug}`;
      job.logo = job.logo || employer.logo || '';
    }
    job.featured = jobForm.featured.checked;
    job.urgent = jobForm.urgent.checked;
    job.filled = jobForm.filled.checked;
    const employmentLabels = { FULL_TIME:'Full Time', PART_TIME:'Part Time', CONTRACTOR:'Freelance', TEMPORARY:'Temporary', INTERN:'Internship', VOLUNTEER:'Volunteer', PER_DIEM:'Per Diem', OTHER:'Other' };
    job.types = selectedTerms('types');
    if (!job.types.length && job.employmentType) job.types = [employmentLabels[job.employmentType] || job.employmentType];
    job.categories = selectedTerms('categories');
    job.locations = selectedTerms('locations');
    if (!job.locations.length) job.locations = [...new Set([job.addressLocality, job.addressRegion].filter(Boolean))];
    job.tags = selectedTerms('tags');
    job.local = true;
    if (!job.deadline) {
      const d = new Date(job.postedDate || Date.now());
      d.setDate(d.getDate() + 365);
      job.deadline = d.toISOString().slice(0, 10);
    }
    if (!job.expiryDate) job.expiryDate = job.deadline;

    const nowIso = new Date().toISOString();
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (job.originalSlug) {
      job.updatedAt = nowIso;
      job.updatedDate = todayFormatted;
    } else {
      job.createdAt = nowIso;
      job.publishedDate = todayFormatted;
    }
    job.date = todayFormatted;
    job.postedDate = job.datePosted || job.postedDate || new Date(nowIso).toISOString().slice(0, 10);

    const pubBtn = document.getElementById('publish-job-btn');
    const draftBtn = document.getElementById('save-draft-btn');
    const originalPubText = pubBtn?.textContent || 'Publish Listing';
    const originalDraftText = draftBtn?.textContent || 'Save Draft';
    if (pubBtn) { pubBtn.disabled = true; pubBtn.textContent = 'Saving…'; }
    if (draftBtn) draftBtn.disabled = true;
    let jobSaveSucceeded = false;
    try {
      const response = await fetch('/api/local/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.error || 'Could not save the job.');
      localJobs = localJobs.filter(x => x.slug !== job.originalSlug && x.slug !== saved.slug);
      localJobs.unshift(saved);
      jobForm.originalSlug.value = saved.slug;
      document.querySelector('#admin-delete').hidden = false;
      const statusLabel = saved.status === 'publish' ? 'published' : saved.status === 'pending' ? 'saved as pending' : saved.status === 'expired' ? 'saved as expired' : 'saved as a draft';
      jobStatusState.textContent = `Job ${statusLabel} successfully.`;
      showAdminNotice(`Job “${saved.title || job.title}” ${statusLabel} successfully.`);
      jobSaveSucceeded = true;
      updateJobPreview();
      renderJobRows();
    } catch (error) {
      const message = error?.message || 'Could not save the job.';
      jobStatusState.textContent = message;
      showAdminNotice(message, 'error');
    } finally {
      if (pubBtn) {
        pubBtn.disabled = false;
        pubBtn.textContent = jobSaveSucceeded ? 'Saved ✓' : (jobForm.originalSlug.value ? 'Update' : originalPubText);
        if (jobSaveSucceeded) setTimeout(() => { pubBtn.textContent = 'Update'; }, 1800);
      }
      if (draftBtn) { draftBtn.disabled = false; draftBtn.textContent = originalDraftText; }
    }
  });

  document.querySelector('#admin-clear')?.addEventListener('click', () => fillJob({}));
  document.querySelector('#admin-delete')?.addEventListener('click', async () => {
    const slug = jobForm.originalSlug.value;
    if (!slug || !confirm(`Delete local job “${jobForm.title.value}”?`)) return;
    await fetch(`/api/local/jobs/${encodeURIComponent(slug)}`, { method: 'DELETE' });
    localJobs = localJobs.filter(x => x.slug !== slug);
    fillJob({});
    renderJobRows();
    location.hash = 'jobs';
  });

  // --- Gutenberg Block Editor Interactive Handlers ---

  // 1. Job Data Subtabs (⚙ Post Job / 👤 Posted By / 🔧 Layout Type)
  document.querySelectorAll('.job-subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      document.querySelectorAll('.job-subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.job-subtab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `subtab-${tabName}`);
      });
    });
  });

  // 2. Gutenberg Sidebar Accordions (Expand / Collapse)
  document.querySelectorAll('.accordion-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const accordion = btn.closest('.wp-sidebar-accordion');
      if (!accordion) return;
      const isOpen = accordion.classList.toggle('open');
      const chevron = btn.querySelector('.chevron');
      if (chevron) chevron.textContent = isOpen ? '▲' : '▼';
    });
  });

  // 3. Gutenberg Sidebar Toggle & Close
  const sidebarEl = document.getElementById('gutenberg-sidebar');
  const toggleSidebarBtn = document.getElementById('toggle-gutenberg-sidebar');
  const closeSidebarBtn = document.getElementById('close-gutenberg-sidebar');

  toggleSidebarBtn?.addEventListener('click', () => {
    if (sidebarEl) {
      const isHidden = sidebarEl.style.display === 'none';
      sidebarEl.style.display = isHidden ? 'block' : 'none';
      toggleSidebarBtn.classList.toggle('active', isHidden);
    }
  });

  closeSidebarBtn?.addEventListener('click', () => {
    if (sidebarEl) {
      sidebarEl.style.display = 'none';
      toggleSidebarBtn?.classList.remove('active');
    }
  });

  // 4. Gutenberg Sidebar Job / Block Tabs
  document.querySelectorAll('.gutenberg-sidebar-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.gutenberg-sidebar-tab').forEach(t => t.classList.remove('active'));
      tabBtn.classList.add('active');
    });
  });

  // 5. Taxonomy Search Filter in Sidebar (Categories / Locations)
  document.querySelectorAll('[data-search-checklist]').forEach(searchInput => {
    const taxKey = searchInput.dataset.searchChecklist;
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const list = document.getElementById(taxKey.startsWith('employer-') ? `employer-checklist-${taxKey.replace('employer-', '')}` : `checklist-${taxKey}`);
      if (!list) return;
      list.querySelectorAll('label').forEach(lbl => {
        const match = !q || lbl.textContent.toLowerCase().includes(q);
        lbl.style.display = match ? 'flex' : 'none';
      });
    });
  });

  // 5b. Inline Taxonomy (Category / Location) Adders with Sub-Categories Support
  async function handleInlineAddTaxonomy({
    nameInputId,
    parentSelectId,
    boxId,
    taxKey,
    checkboxName,
    renderFn
  }) {
    const nameInput = document.getElementById(nameInputId);
    const parentSelect = document.getElementById(parentSelectId);
    const box = document.getElementById(boxId);
    const name = nameInput?.value.trim();
    if (!name) return;

    taxonomies[taxKey] = taxonomies[taxKey] || [];
    const parent = parentSelect ? parentSelect.value : '';
    const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existing = taxonomies[taxKey].find(t => t.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
      taxonomies[taxKey].push({ name, slug, parent, description: '', count: 0 });
      await saveTaxonomies();
    } else if (parent && !existing.parent) {
      existing.parent = parent;
      await saveTaxonomies();
    }

    // Get current checked items and include newly added term
    const currentChecked = Array.from(document.querySelectorAll(`input[name="${checkboxName}"]:checked`)).map(cb => cb.value);
    if (!currentChecked.includes(name)) currentChecked.push(name);

    if (typeof renderFn === 'function') {
      renderFn(currentChecked);
    }
    // Also re-sync matching employer or job checklists and parent dropdowns
    if (checkboxName === 'categories') {
      renderEmployerGutenbergChecklists();
    } else if (checkboxName === 'employer_categories') {
      renderGutenbergChecklists();
    } else if (checkboxName === 'locations') {
      renderEmployerGutenbergChecklists();
    } else if (checkboxName === 'employer_locations') {
      renderGutenbergChecklists();
    }

    nameInput.value = '';
    if (parentSelect) parentSelect.value = '';
    if (box) box.style.display = 'none';
  }

  function setupInlineTaxonomyAdder({
    toggleBtnId,
    boxId,
    nameInputId,
    parentSelectId,
    submitBtnId,
    taxKey,
    checkboxName,
    renderFn
  }) {
    const toggleBtn = document.getElementById(toggleBtnId);
    const box = document.getElementById(boxId);
    const nameInput = document.getElementById(nameInputId);
    const submitBtn = document.getElementById(submitBtnId);

    toggleBtn?.addEventListener('click', () => {
      if (!box) return;
      const isHidden = box.style.display === 'none' || !box.style.display;
      box.style.display = isHidden ? 'flex' : 'none';
      if (isHidden && nameInput) nameInput.focus();
    });

    const triggerSubmit = () => {
      handleInlineAddTaxonomy({
        nameInputId,
        parentSelectId,
        boxId,
        taxKey,
        checkboxName,
        renderFn
      });
    };

    submitBtn?.addEventListener('click', triggerSubmit);
    nameInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSubmit();
      }
    });
  }

  // Job Editor: Categories & Locations inline adders
  setupInlineTaxonomyAdder({
    toggleBtnId: 'btn-toggle-add-category',
    boxId: 'box-add-category',
    nameInputId: 'input-new-cat-name',
    parentSelectId: 'select-new-cat-parent',
    submitBtnId: 'btn-submit-new-category',
    taxKey: 'categories',
    checkboxName: 'categories',
    renderFn: checked => renderGutenbergChecklists(checked, null)
  });

  setupInlineTaxonomyAdder({
    toggleBtnId: 'btn-toggle-add-location',
    boxId: 'box-add-location',
    nameInputId: 'input-new-loc-name',
    parentSelectId: 'select-new-loc-parent',
    submitBtnId: 'btn-submit-new-location',
    taxKey: 'locations',
    checkboxName: 'locations',
    renderFn: checked => renderGutenbergChecklists(null, checked)
  });

  // Employer Editor: Categories & Locations inline adders
  setupInlineTaxonomyAdder({
    toggleBtnId: 'btn-toggle-add-employer-category',
    boxId: 'box-add-employer-category',
    nameInputId: 'input-new-employer-cat-name',
    parentSelectId: 'select-new-employer-cat-parent',
    submitBtnId: 'btn-submit-new-employer-category',
    taxKey: 'categories',
    checkboxName: 'employer_categories',
    renderFn: checked => renderEmployerGutenbergChecklists(checked, null)
  });

  setupInlineTaxonomyAdder({
    toggleBtnId: 'btn-toggle-add-employer-location',
    boxId: 'box-add-employer-location',
    nameInputId: 'input-new-employer-loc-name',
    parentSelectId: 'select-new-employer-loc-parent',
    submitBtnId: 'btn-submit-new-employer-location',
    taxKey: 'locations',
    checkboxName: 'employer_locations',
    renderFn: checked => renderEmployerGutenbergChecklists(null, checked)
  });

  // 6. Gutenberg Title Live Sync & Slug Auto-Generation
  const gutenbergTitleInput = document.getElementById('job-gutenberg-title');
  const docStatusTitleEl = document.getElementById('wp-doc-status-title');
  const summaryTitleEl = document.getElementById('summary-job-title');
  const slugInput = document.getElementById('field-slug');

  gutenbergTitleInput?.addEventListener('input', () => {
    const val = gutenbergTitleInput.value.trim();
    if (docStatusTitleEl) docStatusTitleEl.textContent = `${val || 'No title'} · Job`;
    if (summaryTitleEl) summaryTitleEl.textContent = val || 'No title';
    if (slugInput && !jobForm.originalSlug.value) {
      slugInput.value = val.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    updateJobPreview();
  });

  slugInput?.addEventListener('input', updateJobPreview);

  // Section Selector & Jump Subnav Manager
  function setupEditorSectionManager(prefix = 'job') {
    const wrap = document.getElementById(`${prefix}-sections-menu-wrap`);
    const toggleBtn = document.getElementById(`btn-${prefix}-sections-toggle`);
    const dropdown = document.getElementById(`${prefix}-sections-dropdown`);
    const selectAllBtn = document.getElementById(`${prefix}-sections-select-all`);
    const countBadge = document.getElementById(`${prefix}-sections-count`);
    const subnavPills = document.getElementById(`${prefix}-subnav-pills`);
    const customizeSubnavBtn = document.getElementById(prefix === 'job' ? 'btn-subnav-customize-sections' : 'btn-employer-subnav-customize');
    const editorView = document.getElementById(prefix === 'job' ? 'view-job-editor' : 'view-employer-editor');
    const canvas = editorView?.querySelector('.modern-editor-canvas');

    if (!wrap || !toggleBtn || !dropdown) return;

    const storageKey = `trikonet_${prefix}_hidden_sections`;
    let hiddenSections = new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) hiddenSections = new Set(saved);
    } catch (_) {}

    function updateSectionCounts() {
      const allCheckboxes = dropdown.querySelectorAll('.sections-item-checkbox');
      const total = allCheckboxes.length;
      let checkedCount = 0;
      allCheckboxes.forEach(cb => {
        if (cb.checked) checkedCount++;
      });
      if (countBadge) countBadge.textContent = `${checkedCount}/${total}`;
    }

    function applySectionVisibility(sectionId, isVisible, save = true) {
      const card = document.getElementById(sectionId);
      const pill = subnavPills?.querySelector(`[data-target="${sectionId}"]`);
      const cb = dropdown.querySelector(`.sections-item-checkbox[data-section="${sectionId}"]`);

      if (card) {
        card.style.display = isVisible ? 'block' : 'none';
        // Avoid blocking form submission on hidden required fields
        card.querySelectorAll('[required]').forEach(el => {
          if (!isVisible) {
            el.dataset.wasRequired = 'true';
            el.removeAttribute('required');
          } else if (el.dataset.wasRequired === 'true') {
            el.setAttribute('required', 'required');
          }
        });
      }
      if (pill) {
        pill.style.display = isVisible ? 'inline-flex' : 'none';
      }
      if (cb) {
        cb.checked = isVisible;
      }

      if (isVisible) {
        hiddenSections.delete(sectionId);
      } else {
        hiddenSections.add(sectionId);
      }

      if (save) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(hiddenSections)));
        } catch (_) {}
      }
      updateSectionCounts();
    }

    // Toggle dropdown open/close
    toggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dropdown.style.display !== 'none';
      dropdown.style.display = isOpen ? 'none' : 'block';
      toggleBtn.classList.toggle('open', !isOpen);
      toggleBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });

    customizeSubnavBtn?.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.style.display = 'block';
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest(`#${prefix}-sections-menu-wrap`) && !e.target.closest(`#${customizeSubnavBtn?.id}`)) {
        if (dropdown.style.display !== 'none') {
          dropdown.style.display = 'none';
          toggleBtn.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Checkbox toggles
    dropdown.querySelectorAll('.sections-item-checkbox[data-section]').forEach(cb => {
      cb.addEventListener('change', () => {
        const secId = cb.dataset.section;
        applySectionVisibility(secId, cb.checked, true);
      });
    });

    // Select All
    selectAllBtn?.addEventListener('click', () => {
      dropdown.querySelectorAll('.sections-item-checkbox[data-section]').forEach(cb => {
        applySectionVisibility(cb.dataset.section, true, false);
      });
      hiddenSections.clear();
      try { localStorage.removeItem(storageKey); } catch (_) {}
      updateSectionCounts();
    });

    // Jump buttons inside dropdown & subnav pills
    let isJumping = false;
    let jumpTimeout = null;

    function jumpToSection(targetId) {
      const card = document.getElementById(targetId);
      if (!card) return;

      isJumping = true;
      if (jumpTimeout) clearTimeout(jumpTimeout);
      jumpTimeout = setTimeout(() => { isJumping = false; }, 850);

      // If hidden, make sure to unhide
      if (card.style.display === 'none') {
        applySectionVisibility(targetId, true, true);
      }

      // Calculate exact sticky offset (header ~60px + subnav ~52px + 20px padding)
      const header = editorView?.querySelector('.modern-editor-header') || document.querySelector('.modern-editor-header');
      const subnav = document.getElementById(`${prefix}-editor-subnav`);
      const stickyOffset = (header ? header.offsetHeight : 60) + (subnav ? subnav.offsetHeight : 52) + 20;

      const canvasScrollable = canvas && (canvas.scrollHeight > canvas.clientHeight + 10) && (getComputedStyle(canvas).overflowY === 'auto' || getComputedStyle(canvas).overflowY === 'scroll');

      if (canvasScrollable) {
        const canvasRect = canvas.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const targetTop = canvas.scrollTop + (cardRect.top - canvasRect.top) - 20;
        canvas.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      } else {
        const cardRect = card.getBoundingClientRect();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const targetTop = scrollY + cardRect.top - stickyOffset;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      }

      // Pulse animation
      card.classList.remove('card-highlight-pulse');
      void card.offsetWidth; // re-trigger animation
      card.classList.add('card-highlight-pulse');
      setTimeout(() => card.classList.remove('card-highlight-pulse'), 1300);

      // Update active pill immediately
      subnavPills?.querySelectorAll('.subnav-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.target === targetId);
      });

      // Close dropdown
      dropdown.style.display = 'none';
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    dropdown.querySelectorAll('.sections-jump-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        jumpToSection(btn.dataset.target);
      });
    });

    dropdown.querySelectorAll('.sections-dropdown-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('.sections-item-checkbox') || e.target.closest('.sections-jump-btn')) return;
        jumpToSection(item.dataset.target);
      });
    });

    subnavPills?.querySelectorAll('.subnav-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        jumpToSection(pill.dataset.target);
      });
    });

    // Scrollspy on canvas and window
    let scrollTimer = null;
    const handleScrollSpy = () => {
      if (isJumping) return;
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        if (isJumping) return;
        if (!editorView || editorView.style.display === 'none' || !editorView.classList.contains('active-view')) return;

        const cards = Array.from(editorView.querySelectorAll('.modern-card[data-section]')).filter(c => c.style.display !== 'none');
        if (cards.length === 0) return;

        const header = editorView.querySelector('.modern-editor-header') || document.querySelector('.modern-editor-header');
        const subnav = document.getElementById(`${prefix}-editor-subnav`);
        const stickyOffset = (header ? header.offsetHeight : 60) + (subnav ? subnav.offsetHeight : 52);

        let currentActiveId = cards[0].id;
        for (const card of cards) {
          const rect = card.getBoundingClientRect();
          if (rect.top <= stickyOffset + 80 && rect.bottom > stickyOffset + 40) {
            currentActiveId = card.id;
          }
        }

        subnavPills?.querySelectorAll('.subnav-pill').forEach(p => {
          p.classList.toggle('active', p.dataset.target === currentActiveId);
        });
      }, 50);
    };

    if (canvas) canvas.addEventListener('scroll', handleScrollSpy, { passive: true });
    window.addEventListener('scroll', handleScrollSpy, { passive: true });

    // Apply initial stored visibility
    hiddenSections.forEach(secId => {
      applySectionVisibility(secId, false, false);
    });
    updateSectionCounts();
  }

  setupEditorSectionManager('job');
  setupEditorSectionManager('employer');

  // -------------------------------------------------------------
  // Rich Text WYSIWYG Editor Setup (Bold, Italic, Headings, Lists, Align)
  // -------------------------------------------------------------
  function setupRichTextEditor(prefix = 'job') {
    const wrap = document.getElementById(`${prefix}-rich-editor-wrap`);
    const toolbar = document.getElementById(`${prefix}-rich-toolbar`);
    const content = document.getElementById(`${prefix}-rich-content`);
    const textarea = document.getElementById(prefix === 'job' ? 'job-gutenberg-content' : 'employer-gutenberg-content');
    const formatSelect = document.getElementById(`${prefix}-format-block`);
    const btnVisual = document.getElementById(`${prefix}-btn-visual`);
    const btnCode = document.getElementById(`${prefix}-btn-code`);

    if (!wrap || !content || !textarea) return;

    const autoGrowCodeEditor = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(220, textarea.scrollHeight + 2)}px`;
    };

    // Synchronize initial content from textarea to visual editor
    if (textarea.value && !content.innerHTML.trim()) {
      content.innerHTML = textarea.value;
    }

    function syncContentToTextarea() {
      textarea.value = content.innerHTML;
      if (prefix === 'job') {
        updateJobPreview();
      } else {
        updateEmployerReadingStats(textarea.value);
      }
    }

    content.addEventListener('input', syncContentToTextarea);
    content.addEventListener('blur', syncContentToTextarea);

    textarea.addEventListener('input', () => {
      content.innerHTML = textarea.value;
      autoGrowCodeEditor();
      if (prefix === 'job') updateJobPreview();
      else updateEmployerReadingStats(textarea.value);
    });

    // Formatting commands
    toolbar?.querySelectorAll('.toolbar-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', e => {
        // Prevent losing focus from contenteditable
        e.preventDefault();
      });

      btn.addEventListener('click', e => {
        e.preventDefault();
        content.focus();
        const cmd = btn.dataset.cmd;
        const val = btn.dataset.val || null;

        if (cmd === 'createLink') {
          const currentUrl = document.queryCommandValue('createLink') || 'https://';
          const url = prompt('Enter URL link:', currentUrl);
          if (url) {
            document.execCommand('createLink', false, url);
          }
        } else if (cmd === 'formatBlock') {
          document.execCommand('formatBlock', false, val || 'p');
        } else {
          document.execCommand(cmd, false, val);
        }

        syncContentToTextarea();
        updateToolbarStates();
      });
    });

    // Format select (Paragraph, H2, H3)
    formatSelect?.addEventListener('change', () => {
      content.focus();
      const val = formatSelect.value;
      if (val === 'p') {
        document.execCommand('formatBlock', false, '<p>');
      } else if (val === 'h2') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (val === 'h3') {
        document.execCommand('formatBlock', false, '<h3>');
      }
      syncContentToTextarea();
    });

    // Update active toolbar button states based on selection
    function updateToolbarStates() {
      if (!toolbar) return;
      ['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'insertUnorderedList', 'insertOrderedList'].forEach(cmd => {
        const btn = toolbar.querySelector(`.toolbar-btn[data-cmd="${cmd}"]`);
        if (btn) {
          try {
            const isActive = document.queryCommandState(cmd);
            btn.classList.toggle('active', !!isActive);
          } catch (_) {}
        }
      });

      if (formatSelect) {
        try {
          const block = (document.queryCommandValue('formatBlock') || '').toLowerCase();
          if (block.includes('h2')) formatSelect.value = 'h2';
          else if (block.includes('h3')) formatSelect.value = 'h3';
          else formatSelect.value = 'p';
        } catch (_) {}
      }
    }

    content.addEventListener('keyup', updateToolbarStates);
    content.addEventListener('mouseup', updateToolbarStates);

    // Visual vs Code Toggle
    btnCode?.addEventListener('click', () => {
      textarea.value = content.innerHTML;
      content.style.display = 'none';
      textarea.style.display = 'block';
      autoGrowCodeEditor();
      if (toolbar) {
        toolbar.style.opacity = '0.45';
        toolbar.style.pointerEvents = 'none';
      }
      btnVisual?.classList.remove('active');
      btnCode?.classList.add('active');
      textarea.focus();
    });

    btnVisual?.addEventListener('click', () => {
      content.innerHTML = textarea.value;
      textarea.style.display = 'none';
      content.style.display = 'block';
      if (toolbar) {
        toolbar.style.opacity = '1';
        toolbar.style.pointerEvents = 'auto';
      }
      btnCode?.classList.remove('active');
      btnVisual?.classList.add('active');
      content.focus();
    });
    autoGrowCodeEditor();
  }

  setupRichTextEditor('job');
  setupRichTextEditor('employer');

  // 7. Save Draft Button
  document.getElementById('save-draft-btn')?.addEventListener('click', () => {
    const statusSelect = document.getElementById('field-status');
    if (statusSelect) statusSelect.value = 'draft';
    jobForm.requestSubmit();
  });

  // 8. Add New Taxonomy Term Quick Modal / Prompt from Sidebar
  document.querySelectorAll('.taxonomy-add-link').forEach(link => {
    link.addEventListener('click', async e => {
      e.preventDefault();
      const taxKey = link.getAttribute('href').replace(/^#(taxonomy|employer)-/, '');
      const singular = taxKey.replace(/s$/, '');
      const newName = prompt(`Add new ${singular} name:`);
      if (!newName || !newName.trim()) return;
      const termName = newName.trim();
      const slug = termName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let parent = '';
      if (taxKey === 'categories' || taxKey === 'locations') {
        const availableParents = taxonomies[taxKey].map(x => x.name).filter(Boolean);
        const parentChoice = prompt(`Parent ${singular} (optional, enter name or leave blank for top-level):\nOptions: ${availableParents.slice(0, 6).join(', ')}...`);
        if (parentChoice && parentChoice.trim()) {
          parent = parentChoice.trim();
        }
      }
      const newTerm = { name: termName, slug, parent, description: '', count: 0 };
      taxonomies[taxKey].push(newTerm);
      await saveTaxonomies();
      renderTaxonomyTables();
      renderGutenbergChecklists();
      renderEmployerGutenbergChecklists();
      // Auto check the newly added term in both checklists if present
      document.querySelectorAll(`input[name="${taxKey}"][value="${esc(termName)}"], input[name="employer_${taxKey}"][value="${esc(termName)}"]`).forEach(cb => {
        cb.checked = true;
      });
    });
  });

  // 9. Interactive Mock Map Zoom
  let currentZoom = 1;
  const mapInner = document.querySelector('.leaflet-map-inner');
  document.querySelectorAll('.leaflet-zoom-btns .zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.textContent.trim() === '+') {
        currentZoom = Math.min(currentZoom + 0.25, 2.0);
      } else {
        currentZoom = Math.max(currentZoom - 0.25, 0.6);
      }
      if (mapInner) {
        mapInner.style.backgroundSize = `${16 * currentZoom}px ${16 * currentZoom}px`;
      }
    });
  });

  // 10. Upload Buttons
  document.getElementById('upload-job-photos-btn')?.addEventListener('click', () => {
    const field = document.getElementById('field-photo-url');
    const url = prompt('Enter Image URL for Job Photos (comma-separated):', field.value || '');
    if (url !== null) field.value = url;
  });


  // 11. Collapsible Meta Boxes & Postbox
  document.getElementById('meta-boxes-toggle')?.addEventListener('click', e => {
    const box = document.getElementById('postbox-job-data');
    if (box) {
      const isHidden = box.style.display === 'none';
      box.style.display = isHidden ? 'block' : 'none';
      e.target.textContent = isHidden ? '▲' : '▼';
    }
  });

  document.querySelector('.handlediv')?.addEventListener('click', e => {
    const layout = document.querySelector('.job-data-layout');
    if (layout) {
      const isHidden = layout.style.display === 'none';
      layout.style.display = isHidden ? 'flex' : 'none';
      e.target.textContent = isHidden ? '▲' : '▼';
    }
  });

  // Employer Form Submission & Actions
  employerRows.addEventListener('click', e => {
    const editBtn = e.target.closest('[data-employer-edit]');
    if (editBtn) {
      e.preventDefault();
      const employer = allEmployers().find(x => x.slug === editBtn.dataset.employerEdit);
      if (employer) {
        fillEmployer(employer);
        location.hash = 'employer-editor';
      }
    }
  });

  document.querySelector('#employer-search')?.addEventListener('input', () => { employerPage = 1; renderEmployerRows(); });
  document.querySelector('#employer-search-button')?.addEventListener('click', () => { employerPage = 1; renderEmployerRows(); });
  document.querySelector('#admin-employer-pagination')?.addEventListener('click', e => {
    if (e.target.closest('#employer-prev-page')) employerPage = Math.max(1, employerPage - 1);
    else if (e.target.closest('#employer-next-page')) employerPage += 1;
    else return;
    renderEmployerRows();
    document.getElementById('view-employers')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  document.querySelector('#employer-clear')?.addEventListener('click', () => fillEmployer({}));

  // Gutenberg Title Live Sync & Slug Auto-Generation for Employer
  const employerGutenbergTitle = document.getElementById('employer-gutenberg-title');
  const employerDocStatusTitle = document.getElementById('wp-employer-doc-status-title');
  const employerSummaryTitle = document.getElementById('summary-employer-title');
  const employerSlugInput = document.getElementById('field-employer-slug');

  employerGutenbergTitle?.addEventListener('input', () => {
    const val = employerGutenbergTitle.value.trim();
    if (employerDocStatusTitle) employerDocStatusTitle.textContent = `${val || 'Add title'} · Employer`;
    if (employerSummaryTitle) employerSummaryTitle.textContent = val || 'Add title';
    if (employerSlugInput && !employerForm.originalSlug.value) {
      employerSlugInput.value = val.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    updateEmployerPreview();
  });

  employerSlugInput?.addEventListener('input', updateEmployerPreview);

  document.getElementById('employer-gutenberg-content')?.addEventListener('input', e => {
    updateEmployerReadingStats(e.target.value);
  });

  // Employer Data Subtabs Navigation
  document.querySelectorAll('.employer-subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      document.querySelectorAll('.employer-subtab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.employer-subtab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPanel = document.getElementById(`employer-subtab-${tabName}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Employer Gutenberg Sidebar Toggle & Close
  const employerSidebarEl = document.getElementById('employer-gutenberg-sidebar');
  const toggleEmployerSidebarBtn = document.getElementById('toggle-employer-sidebar');
  const closeEmployerSidebarBtn = document.getElementById('close-employer-sidebar');

  toggleEmployerSidebarBtn?.addEventListener('click', () => {
    if (employerSidebarEl) {
      const isHidden = employerSidebarEl.style.display === 'none';
      employerSidebarEl.style.display = isHidden ? 'block' : 'none';
      toggleEmployerSidebarBtn.classList.toggle('active', isHidden);
    }
  });

  closeEmployerSidebarBtn?.addEventListener('click', () => {
    if (employerSidebarEl) {
      employerSidebarEl.style.display = 'none';
      toggleEmployerSidebarBtn?.classList.remove('active');
    }
  });

  // Employer Meta Boxes Toggle & Handlediv
  document.getElementById('employer-meta-boxes-toggle')?.addEventListener('click', e => {
    const box = document.getElementById('postbox-employer-data');
    if (box) {
      const isHidden = box.style.display === 'none';
      box.style.display = isHidden ? 'block' : 'none';
      e.target.textContent = isHidden ? '▲' : '▼';
    }
  });

  document.getElementById('employer-handlediv')?.addEventListener('click', e => {
    const layout = document.querySelector('.employer-data-layout');
    if (layout) {
      const isHidden = layout.style.display === 'none';
      layout.style.display = isHidden ? 'flex' : 'none';
      e.target.textContent = isHidden ? '▲' : '▼';
    }
  });

  document.getElementById('wpcode-scripts-toggle')?.addEventListener('click', () => {
    const box = document.querySelector('.wpcode-scripts-box');
    box?.classList.toggle('collapsed');
    const chev = box?.querySelector('.chevron');
    if (chev) chev.textContent = box?.classList.contains('collapsed') ? '▼' : '▲';
  });

  // Employer Upload / Set Image Buttons
  document.getElementById('upload-employer-cover-btn')?.addEventListener('click', () => {
    const field = document.getElementById('field-employer-cover');
    const url = prompt('Enter Cover Photo URL:', field.value || '/assets/detail-header.jpg');
    if (url !== null) field.value = url;
  });

  document.getElementById('upload-employer-photos-btn')?.addEventListener('click', () => {
    const field = document.getElementById('field-employer-photos');
    const url = prompt('Enter Profile Photo URLs (comma-separated):', field.value || '/assets/article-1.jpg, /assets/article-2.jpg');
    if (url !== null) field.value = url;
  });

  function updateEmployerLogoPreview(url = '') {
    const hidden = document.getElementById('field-employer-logo-val');
    const img = document.getElementById('employer-logo-img-tag');
    const emptyBox = document.getElementById('employer-logo-empty');
    const removeBtn = document.getElementById('btn-remove-employer-logo');
    const btnText = document.getElementById('btn-set-employer-logo-text');

    if (hidden) hidden.value = url;

    if (url) {
      if (img) {
        img.src = url;
        img.style.display = 'block';
      }
      if (emptyBox) emptyBox.style.display = 'none';
      if (removeBtn) removeBtn.style.display = 'inline-block';
      if (btnText) btnText.textContent = 'Change Logo Image';
    } else {
      if (img) {
        img.src = '';
        img.style.display = 'none';
      }
      if (emptyBox) emptyBox.style.display = 'flex';
      if (removeBtn) removeBtn.style.display = 'none';
      if (btnText) btnText.textContent = 'Choose Logo Image';
    }
  }

  document.getElementById('set-employer-featured-img-btn')?.addEventListener('click', () => {
    showImageSourceChooser({
      title: 'Choose company logo',
      onSelect: url => updateEmployerLogoPreview(String(url || '').trim())
    });
  });

  document.getElementById('btn-remove-employer-logo')?.addEventListener('click', () => {
    updateEmployerLogoPreview('');
  });

  // --- Multi Social Networks Manager ---
  const EMPLOYER_SOCIAL_NETWORKS = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/company/...' },
    { id: 'facebook', name: 'Facebook', icon: '👥', placeholder: 'https://facebook.com/company' },
    { id: 'twitter', name: 'Twitter / X', icon: '𝕏', placeholder: 'https://x.com/company' },
    { id: 'instagram', name: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/company' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', placeholder: 'https://youtube.com/@company' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', placeholder: 'https://wa.me/1234567890' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@company' },
    { id: 'github', name: 'GitHub', icon: '🐙', placeholder: 'https://github.com/company' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌', placeholder: 'https://pinterest.com/company' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 'https://t.me/company' },
    { id: 'website', name: 'Website / Other', icon: '🔗', placeholder: 'https://company.com' }
  ];

  function createSocialNetworkRow(platformId = 'linkedin', initialUrl = '') {
    const row = document.createElement('div');
    row.className = 'social-network-row';
    row.dataset.socialRow = 'true';

    const net = EMPLOYER_SOCIAL_NETWORKS.find(n => n.id === platformId) || EMPLOYER_SOCIAL_NETWORKS[0];
    const initialPlaceholder = net.placeholder;
    const initialIcon = net.icon;

    row.innerHTML = `
      <div class="social-platform-badge-icon" title="${esc(net.name)}">${initialIcon}</div>
      <div class="social-network-select-wrap">
        <select class="modern-select social-network-select" aria-label="Social platform">
          ${EMPLOYER_SOCIAL_NETWORKS.map(p => `
            <option value="${esc(p.id)}" ${p.id === platformId ? 'selected' : ''}>${p.icon} ${esc(p.name)}</option>
          `).join('')}
        </select>
      </div>
      <div class="social-network-input-wrap">
        <input type="url" class="modern-input social-network-url" placeholder="${esc(initialPlaceholder)}" value="${esc(initialUrl)}">
      </div>
      <div class="social-network-actions">
        <button type="button" class="social-network-test-btn" title="Open link in new tab" ${initialUrl ? '' : 'disabled'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
        </button>
        <button type="button" class="social-network-remove-btn" title="Remove social link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    `;

    const selectEl = row.querySelector('.social-network-select');
    const inputEl = row.querySelector('.social-network-url');
    const iconEl = row.querySelector('.social-platform-badge-icon');
    const testBtn = row.querySelector('.social-network-test-btn');
    const removeBtn = row.querySelector('.social-network-remove-btn');

    selectEl.addEventListener('change', () => {
      const selected = EMPLOYER_SOCIAL_NETWORKS.find(n => n.id === selectEl.value);
      if (selected) {
        iconEl.textContent = selected.icon;
        iconEl.title = selected.name;
        inputEl.placeholder = selected.placeholder;
      }
    });

    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim();
      testBtn.disabled = !val;
    });

    testBtn.addEventListener('click', () => {
      let val = inputEl.value.trim();
      if (!val) return;
      if (!/^https?:\/\//i.test(val)) val = 'https://' + val;
      window.open(val, '_blank', 'noopener,noreferrer');
    });

    removeBtn.addEventListener('click', () => {
      row.remove();
    });

    return row;
  }

  function populateEmployerSocials(socialsData) {
    const listEl = document.getElementById('employer-socials-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const addedPairs = [];

    if (socialsData) {
      if (Array.isArray(socialsData.items) && socialsData.items.length) {
        socialsData.items.forEach(it => {
          if (it && it.url) addedPairs.push({ platform: it.platform || 'website', url: it.url });
        });
      } else if (typeof socialsData === 'object') {
        const order = ['facebook', 'linkedin', 'twitter', 'instagram', 'youtube', 'whatsapp', 'tiktok', 'github', 'pinterest', 'telegram', 'website'];
        const visited = new Set();
        order.forEach(k => {
          if (socialsData[k]) {
            addedPairs.push({ platform: k, url: socialsData[k] });
            visited.add(k);
          }
        });
        Object.keys(socialsData).forEach(k => {
          if (!visited.has(k) && k !== 'items' && typeof socialsData[k] === 'string' && socialsData[k].trim()) {
            addedPairs.push({ platform: k, url: socialsData[k] });
          }
        });
      }
    }

    if (addedPairs.length === 0) {
      // Default to Facebook and LinkedIn rows ready to use
      listEl.appendChild(createSocialNetworkRow('facebook', ''));
      listEl.appendChild(createSocialNetworkRow('linkedin', ''));
    } else {
      addedPairs.forEach(p => {
        listEl.appendChild(createSocialNetworkRow(p.platform, p.url));
      });
    }
  }

  function collectEmployerSocials() {
    const socials = {};
    const items = [];
    document.querySelectorAll('#employer-socials-list .social-network-row').forEach(row => {
      const platform = row.querySelector('.social-network-select')?.value || 'website';
      const url = row.querySelector('.social-network-url')?.value.trim() || '';
      if (url) {
        socials[platform] = url;
        items.push({ platform, url });
      }
    });

    socials.facebook = socials.facebook || '';
    socials.linkedin = socials.linkedin || '';
    socials.items = items;

    // Sync legacy hidden inputs
    const fbHidden = document.getElementById('field-employer-facebook');
    if (fbHidden) fbHidden.value = socials.facebook;
    const liHidden = document.getElementById('field-employer-linkedin');
    if (liHidden) liHidden.value = socials.linkedin;

    return socials;
  }

  // Add social link button listener
  document.getElementById('btn-add-social-network')?.addEventListener('click', () => {
    const listEl = document.getElementById('employer-socials-list');
    if (!listEl) return;
    const existing = [...listEl.querySelectorAll('.social-network-select')].map(s => s.value);
    const unused = EMPLOYER_SOCIAL_NETWORKS.find(n => !existing.includes(n.id)) || EMPLOYER_SOCIAL_NETWORKS[0];
    const newRow = createSocialNetworkRow(unused.id, '');
    listEl.appendChild(newRow);
    const input = newRow.querySelector('.social-network-url');
    input?.focus();
  });

  // Quick-add presets chips
  document.querySelectorAll('.social-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const platform = chip.dataset.platform;
      const listEl = document.getElementById('employer-socials-list');
      if (!listEl) return;

      const existingRow = [...listEl.querySelectorAll('.social-network-row')].find(row => {
        return row.querySelector('.social-network-select')?.value === platform;
      });

      if (existingRow) {
        const input = existingRow.querySelector('.social-network-url');
        input?.focus();
        existingRow.classList.add('highlight-pulse');
        setTimeout(() => existingRow.classList.remove('highlight-pulse'), 800);
      } else {
        const newRow = createSocialNetworkRow(platform, '');
        listEl.appendChild(newRow);
        const input = newRow.querySelector('.social-network-url');
        input?.focus();
      }
    });
  });

  // Employer Form Submit Handler
  const normalizeWebsiteUrl = value => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return '';
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) return cleaned;
    return `https://${cleaned.replace(/^\/+/, '')}`;
  };
  document.getElementById('field-employer-website')?.addEventListener('blur', event => {
    event.target.value = normalizeWebsiteUrl(event.target.value);
  });

  employerForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (employerStatusState) employerStatusState.textContent = 'Saving…';
    const saveBtn = document.getElementById('save-employer-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
    }
    const split = v => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
    const employer = {
      title: document.getElementById('employer-gutenberg-title')?.value.trim() || '',
      description: document.getElementById('employer-gutenberg-content')?.value.trim() || '',
      originalSlug: employerForm.originalSlug.value,
      slug: (document.getElementById('field-employer-slug')?.value || '').trim() || (document.getElementById('employer-gutenberg-title')?.value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      status: document.getElementById('field-employer-status')?.value || 'publish',
      featured: !!document.getElementById('field-employer-featured')?.checked,
      coverPhoto: document.getElementById('field-employer-cover')?.value.trim() || '',
      email: document.getElementById('field-employer-email')?.value.trim() || '',
      phone: document.getElementById('field-employer-phone')?.value.trim() || '',
      website: normalizeWebsiteUrl(document.getElementById('field-employer-website')?.value),
      foundedDate: document.getElementById('field-employer-founded')?.value.trim() || '',
      companySize: document.getElementById('field-employer-size')?.value.trim() || '',
      profilePhotos: split(document.getElementById('field-employer-photos')?.value),
      address: document.getElementById('field-employer-address')?.value.trim() || '',
      layoutType: employerForm.elements.layoutType?.value || 'default',
      logo: (document.getElementById('field-employer-logo-val')?.value || '').trim(),
      categories: [...(document.getElementById('employer-checklist-categories')?.querySelectorAll('input:checked') || [])].map(x => x.value),
      locations: [...(document.getElementById('employer-checklist-locations')?.querySelectorAll('input:checked') || [])].map(x => x.value),
      socials: collectEmployerSocials(),
      local: true
    };

    let employerSaveSucceeded = false;
    try {
      const res = await fetch('/api/local/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employer)
      });
      const saved = await res.json();
      if (!res.ok) {
        throw new Error(saved.error || 'Could not save the employer.');
      }
      localEmployers = localEmployers.filter(x => x.slug !== employer.originalSlug && x.slug !== saved.slug);
      localEmployers.unshift(saved);
      employerForm.originalSlug.value = saved.slug;
      const deleteBtn = document.getElementById('employer-delete-btn');
      if (deleteBtn) deleteBtn.hidden = false;
      const statusLabel = saved.status === 'publish' ? 'published' : saved.status === 'pending' ? 'saved as pending' : 'saved as a draft';
      if (employerStatusState) employerStatusState.textContent = `Employer ${statusLabel} successfully.`;
      showAdminNotice(`Employer “${saved.title || employer.title}” ${statusLabel} successfully.`);
      employerSaveSucceeded = true;
      updateEmployerPreview();
      renderEmployerRows();

      // If created as part of the "Add Company" flow from Job Editor, return and auto-select
      const returnCtxStr = sessionStorage.getItem('trikonet_job_return_ctx');
      if (returnCtxStr) {
        try {
          const returnCtx = JSON.parse(returnCtxStr);
          returnCtx.selectedEmployer = {
            title: saved.title,
            logo: saved.logo || '',
            slug: saved.slug || ''
          };
          sessionStorage.setItem('trikonet_job_return_ctx', JSON.stringify(returnCtx));
          await loadEmployers();
          populateEmployerDropdown();
          location.hash = returnCtx.returnHash || '#job-new';
          return;
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      const message = err?.message || 'Could not save the employer.';
      if (employerStatusState) employerStatusState.textContent = message;
      showAdminNotice(message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = employerSaveSucceeded ? 'Saved ✓' : 'Save';
        if (employerSaveSucceeded) setTimeout(() => { saveBtn.textContent = 'Save'; }, 1800);
      }
    }
  });

  // Move to trash
  document.querySelector('#employer-delete-btn')?.addEventListener('click', async () => {
    const slug = employerForm.originalSlug.value || document.getElementById('field-employer-slug')?.value;
    const title = document.getElementById('employer-gutenberg-title')?.value || 'this employer';
    if (!slug || !confirm(`Move "${title}" to trash?`)) return;
    await fetch(`/api/local/employers/${encodeURIComponent(slug)}`, { method: 'DELETE' });
    localEmployers = localEmployers.filter(x => x.slug !== slug);
    fillEmployer({});
    renderEmployerRows();
    location.hash = 'employers';
    showAdminNotice(`Employer "${title}" moved to Trash successfully.`);
  });

  // Taxonomy Hierarchy Helper
  function buildHierarchy(terms) {
    const roots = [];
    const byParent = {};
    for (const term of terms) {
      const p = (term.parent || '').trim().toLowerCase();
      if (!p || p === 'none') {
        roots.push(term);
      } else {
        if (!byParent[p]) byParent[p] = [];
        byParent[p].push(term);
      }
    }
    const ordered = [];
    function addBranch(item, depth = 0) {
      ordered.push({ ...item, depth });
      const nameKey = (item.name || '').toLowerCase();
      const slugKey = (item.slug || '').toLowerCase();
      const children = (byParent[nameKey] || []).concat(byParent[slugKey] || []);
      const uniqueChildren = [];
      const seen = new Set();
      for (const c of children) {
        if (!seen.has(c.slug || c.name)) {
          seen.add(c.slug || c.name);
          uniqueChildren.push(c);
        }
      }
      for (const child of uniqueChildren) {
        addBranch(child, depth + 1);
      }
    }
    for (const root of roots) {
      addBranch(root, 0);
    }
    const addedSlugs = new Set(ordered.map(x => x.slug || x.name));
    for (const term of terms) {
      if (!addedSlugs.has(term.slug || term.name)) {
        ordered.push({ ...term, depth: 1 });
      }
    }
    return ordered;
  }

  // Render All 4 Modern Taxonomy Tables
  function renderTaxonomyTables() {
    // 1. Types
    const typeSearch = document.getElementById('search-tax-types')?.value.toLowerCase().trim() || '';
    const filteredTypes = taxonomies.types.filter(t => !typeSearch || t.name.toLowerCase().includes(typeSearch) || t.slug.toLowerCase().includes(typeSearch));
    const tbodyTypes = document.getElementById('tbody-tax-types');
    const typeColorMap = {
      'freelance': { bg: '#ebf7ee', text: '#1b5e20', emp: 'FREELANCE' },
      'full-time': { bg: '#e8f1fd', text: '#0d47a1', emp: 'FULL_TIME' },
      'internship': { bg: '#fff3e0', text: '#e65100', emp: 'INTERN' },
      'part-time': { bg: '#f3e5f5', text: '#4a148c', emp: 'PART_TIME' },
      'temporary': { bg: '#ffebee', text: '#b71c1c', emp: 'TEMPORARY' }
    };
    if (tbodyTypes) {
      tbodyTypes.innerHTML = filteredTypes.length ? filteredTypes.map(t => {
        const fallback = typeColorMap[t.slug] || { bg: '#e8f1fd', text: '#0d47a1', emp: 'FULL_TIME' };
        const bg = t.bgColor || fallback.bg;
        const emp = t.employmentType || fallback.emp;
        return `
        <tr id="tag-${esc(t.slug)}" class="modern-tax-tr">
          <td class="check-col"><input type="checkbox" name="delete_tags[]" value="${esc(t.slug)}" class="modern-checkbox"></td>
          <td class="color-col"><span class="modern-color-dot" style="background:${esc(bg)};" title="${esc(bg)}"></span></td>
          <td class="name-col">
            <div class="modern-tax-title-group">
              <a class="modern-tax-row-title is-parent" href="#jobs">${esc(t.name)}</a>
              <div class="modern-tax-row-actions">
                <a href="#jobs" class="tax-action-btn">Edit</a>
                <span class="tax-action-sep">·</span>
                <a href="#jobs" class="tax-action-btn">Quick Edit</a>
                <span class="tax-action-sep">·</span>
                <button type="button" class="tax-action-btn text-danger" data-del-tax="types" data-slug="${esc(t.slug)}">Delete</button>
                <span class="tax-action-sep">·</span>
                <a href="/jobs?type=${encodeURIComponent(t.name)}" target="_blank" class="tax-action-btn">View ↗</a>
              </div>
            </div>
          </td>
          <td class="desc-col"><span class="modern-tax-desc">${t.description ? esc(t.description) : '<span class="modern-tax-empty">—</span>'}</span></td>
          <td class="slug-col"><span class="modern-tax-slug-pill">${esc(t.slug)}</span></td>
          <td class="emp-col"><span class="modern-tax-emp-badge">${esc(emp)}</span></td>
          <td class="count-col"><span class="modern-tax-count-chip">${Number(t.count || 0).toLocaleString()}</span></td>
        </tr>
      `;
      }).join('') : '<tr><td colspan="7" style="text-align:center;padding:32px 16px;color:#64748b;font-size:13px;">No job types found.</td></tr>';
      const countEl1 = document.getElementById('count-tax-types');
      if (countEl1) countEl1.textContent = `${filteredTypes.length} items`;
    }
    const typeParentSelect = document.getElementById('type-parent');
    if (typeParentSelect) {
      typeParentSelect.innerHTML = `<option value="">None (Top Level)</option>` + taxonomies.types.map(t => `<option value="${esc(t.name)}">${esc(t.name)}</option>`).join('');
    }

    // 2. Categories
    const isPostCat = currentTaxonomyCategoryMode === 'postCategories';
    const isEmpCat = currentTaxonomyCategoryMode === 'employerCategories';
    let catList = [];
    if (isPostCat) {
      catList = (taxonomies.postCategories && taxonomies.postCategories.length ? taxonomies.postCategories : defaults.postCategories).map(c => ({
        ...c,
        count: getPostCategoryCount(c.name)
      }));
    } else if (isEmpCat) {
      catList = taxonomies.employerCategories && taxonomies.employerCategories.length ? taxonomies.employerCategories : (defaults.employerCategories || []);
    } else {
      catList = taxonomies.categories;
    }

    const catSearch = document.getElementById('search-tax-categories')?.value.toLowerCase().trim() || '';
    const hierCats = buildHierarchy(catList);
    const filteredCats = hierCats.filter(c => !catSearch || c.name.toLowerCase().includes(catSearch) || c.slug.toLowerCase().includes(catSearch));
    const tbodyCats = document.getElementById('tbody-tax-categories');
    if (tbodyCats) {
      tbodyCats.innerHTML = filteredCats.length ? filteredCats.map(c => {
        const hasImg = c.image || (!isPostCat && !isEmpCat && c.slug === 'accounting-finance' ? '/assets/category-finance.jpg' : '');
        const targetViewHref = isPostCat ? '#posts' : (isEmpCat ? '#employers' : '#jobs');
        const targetExternalUrl = isPostCat ? `/blog?category=${encodeURIComponent(c.name)}` : (isEmpCat ? `/employers?category=${encodeURIComponent(c.name)}` : `/jobs?category=${encodeURIComponent(c.name)}`);
        const delTaxType = isPostCat ? 'postCategories' : (isEmpCat ? 'employerCategories' : 'categories');

        return `
          <tr id="tag-${esc(c.slug)}" class="modern-tax-tr">
            <td class="check-col"><input type="checkbox" name="delete_tags[]" value="${esc(c.slug)}" class="modern-checkbox"></td>
            <td class="name-col">
              <div class="modern-tax-name-cell">
                ${c.depth ? `<span class="modern-tax-indent depth-${c.depth}"><span class="modern-tree-branch" aria-hidden="true"></span></span>` : `<span class="modern-tax-parent-icon" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>`}
                <div class="modern-tax-title-group">
                  <a class="modern-tax-row-title ${c.depth ? 'is-child' : 'is-parent'}" href="${targetViewHref}">${esc(c.name)}</a>
                  <div class="modern-tax-row-actions">
                    <a href="${targetViewHref}" class="tax-action-btn">Edit</a>
                    <span class="tax-action-sep">·</span>
                    <a href="${targetViewHref}" class="tax-action-btn">Quick Edit</a>
                    <span class="tax-action-sep">·</span>
                    <button type="button" class="tax-action-btn text-danger" data-del-tax="${delTaxType}" data-slug="${esc(c.slug)}">Delete</button>
                    <span class="tax-action-sep">·</span>
                    <a href="${targetExternalUrl}" target="_blank" class="tax-action-btn">View ↗</a>
                  </div>
                </div>
              </div>
            </td>
            <td class="desc-col">${hasImg ? `<div class="modern-cat-thumb-wrap"><img src="${esc(hasImg)}" class="modern-cat-thumb" alt="${esc(c.name)}"><span class="modern-tax-desc">${c.description ? esc(c.description) : '<span class="modern-tax-empty">—</span>'}</span></div>` : `<span class="modern-tax-desc">${c.description ? esc(c.description) : '<span class="modern-tax-empty">—</span>'}</span>`}</td>
            <td class="slug-col"><span class="modern-tax-slug-pill">${esc(c.slug)}</span></td>
            <td class="count-col"><span class="modern-tax-count-chip">${Number(c.count || 0).toLocaleString()}</span></td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="5" style="text-align:center;padding:32px 16px;color:#64748b;font-size:13px;">No ${isPostCat ? 'post ' : (isEmpCat ? 'employer ' : 'job ')}categories found.</td></tr>`;
      const countCat1 = document.getElementById('count-tax-categories');
      if (countCat1) countCat1.textContent = `${filteredCats.length} items`;
    }
    const catParentSelect = document.getElementById('cat-parent');
    if (catParentSelect) {
      catParentSelect.innerHTML = `<option value="">None (Top Level)</option>` + catList.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
    }

    // 3. Locations
    const locSearch = document.getElementById('search-tax-locations')?.value.toLowerCase().trim() || '';
    const hierLocs = buildHierarchy(taxonomies.locations);
    const filteredLocs = hierLocs.filter(l => !locSearch || l.name.toLowerCase().includes(locSearch) || l.slug.toLowerCase().includes(locSearch));
    const tbodyLocs = document.getElementById('tbody-tax-locations');
    if (tbodyLocs) {
      tbodyLocs.innerHTML = filteredLocs.length ? filteredLocs.map(l => {
        return `
          <tr id="tag-${esc(l.slug)}" class="modern-tax-tr">
            <td class="check-col"><input type="checkbox" name="delete_tags[]" value="${esc(l.slug)}" class="modern-checkbox"></td>
            <td class="name-col">
              <div class="modern-tax-name-cell">
                ${l.depth ? `<span class="modern-tax-indent depth-${l.depth}"><span class="modern-tree-branch" aria-hidden="true"></span></span>` : `<span class="modern-tax-parent-icon" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></span>`}
                <div class="modern-tax-title-group">
                  <a class="modern-tax-row-title ${l.depth ? 'is-child' : 'is-parent'}" href="#jobs">${esc(l.name)}</a>
                  <div class="modern-tax-row-actions">
                    <a href="#jobs" class="tax-action-btn">Edit</a>
                    <span class="tax-action-sep">·</span>
                    <a href="#jobs" class="tax-action-btn">Quick Edit</a>
                    <span class="tax-action-sep">·</span>
                    <button type="button" class="tax-action-btn text-danger" data-del-tax="locations" data-slug="${esc(l.slug)}">Delete</button>
                    <span class="tax-action-sep">·</span>
                    <a href="/jobs?location=${encodeURIComponent(l.name)}" target="_blank" class="tax-action-btn">View ↗</a>
                  </div>
                </div>
              </div>
            </td>
            <td class="desc-col"><span class="modern-tax-desc">${l.description ? esc(l.description) : '<span class="modern-tax-empty">—</span>'}</span></td>
            <td class="slug-col"><span class="modern-tax-slug-pill">${esc(l.slug)}</span></td>
            <td class="count-col"><span class="modern-tax-count-chip">${Number(l.count || 0).toLocaleString()}</span></td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="5" style="text-align:center;padding:32px 16px;color:#64748b;font-size:13px;">No locations found.</td></tr>';
      const countLoc1 = document.getElementById('count-tax-locations');
      if (countLoc1) countLoc1.textContent = `${taxonomies.locations.length} items`;
    }
    const locParentSelect = document.getElementById('loc-parent');
    if (locParentSelect) {
      locParentSelect.innerHTML = `<option value="">None (Top Level)</option>` + taxonomies.locations.map(l => `<option value="${esc(l.name)}">${esc(l.name)}</option>`).join('');
    }

    // 4. Tags
    const tagSearch = document.getElementById('search-tax-tags')?.value.toLowerCase().trim() || '';
    const filteredTags = taxonomies.tags.filter(t => !tagSearch || t.name.toLowerCase().includes(tagSearch) || t.slug.toLowerCase().includes(tagSearch));
    const tbodyTags = document.getElementById('tbody-tax-tags');
    if (tbodyTags) {
      tbodyTags.innerHTML = filteredTags.length ? filteredTags.map(t => `
        <tr id="tag-${esc(t.slug)}" class="modern-tax-tr">
          <td class="check-col"><input type="checkbox" name="delete_tags[]" value="${esc(t.slug)}" class="modern-checkbox"></td>
          <td class="name-col">
            <div class="modern-tax-title-group">
              <a class="modern-tax-row-title is-parent" href="#jobs">${esc(t.name)}</a>
              <div class="modern-tax-row-actions">
                <a href="#jobs" class="tax-action-btn">Edit</a>
                <span class="tax-action-sep">·</span>
                <a href="#jobs" class="tax-action-btn">Quick Edit</a>
                <span class="tax-action-sep">·</span>
                <button type="button" class="tax-action-btn text-danger" data-del-tax="tags" data-slug="${esc(t.slug)}">Delete</button>
                <span class="tax-action-sep">·</span>
                <a href="#view" class="tax-action-btn">View ↗</a>
              </div>
            </div>
          </td>
          <td class="desc-col"><span class="modern-tax-desc">${t.description ? esc(t.description) : '<span class="modern-tax-empty">—</span>'}</span></td>
          <td class="slug-col"><span class="modern-tax-slug-pill">${esc(t.slug)}</span></td>
          <td class="count-col"><span class="modern-tax-count-chip">${Number(t.count || 0).toLocaleString()}</span></td>
        </tr>
      `).join('') : '<tr><td colspan="5" style="text-align:center;padding:32px 16px;color:#64748b;font-size:13px;">No tags found.</td></tr>';
      const countTag1 = document.getElementById('count-tax-tags');
      if (countTag1) countTag1.textContent = `${filteredTags.length} items`;
    }

    // Ensure Job Editor checklists have all terms
    ensureTerms('types', taxonomies.types.map(x => x.name));
    ensureTerms('categories', taxonomies.categories.map(x => x.name));
    ensureTerms('locations', taxonomies.locations.map(x => x.name));
    ensureTerms('tags', taxonomies.tags.map(x => x.name));
    renderGutenbergChecklists();
  }

  async function saveTaxonomies() {
    try {
      localStorage.setItem('wp_admin_taxonomies', JSON.stringify(taxonomies));
    } catch {}
    await fetch('/api/local/taxonomies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taxonomies)
    }).catch(() => {});
  }

  // Taxonomy Form Submissions
  document.getElementById('form-add-type')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    if (!name) return;
    const slug = (form.slug.value.trim() || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const parent = form.parent.value;
    const description = form.description.value.trim();
    const bgColor = form.bgColor.value;
    const textColor = form.textColor.value;
    const newTerm = { name, slug, parent, description, bgColor, textColor, count: 0, employmentType: '' };
    taxonomies.types.push(newTerm);
    await saveTaxonomies();
    form.reset();
    renderTaxonomyTables();
  });

  document.getElementById('form-add-category')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    if (!name) return;
    const slug = (form.slug.value.trim() || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const parent = form.parent.value;
    const description = form.description.value.trim();
    const image = form.image.value.trim();
    const newTerm = { name, slug, parent, description, image, count: 0 };
    if (currentTaxonomyCategoryMode === 'postCategories') {
      taxonomies.postCategories = taxonomies.postCategories || [];
      taxonomies.postCategories.push(newTerm);
      await saveTaxonomies();
      form.reset();
      renderTaxonomyTables();
      renderGutenbergPostCategoriesChecklist();
      renderPostCategoryFilterDropdown();
    } else if (currentTaxonomyCategoryMode === 'employerCategories') {
      taxonomies.employerCategories = taxonomies.employerCategories || [];
      taxonomies.employerCategories.push(newTerm);
      await saveTaxonomies();
      form.reset();
      renderTaxonomyTables();
    } else {
      taxonomies.categories = taxonomies.categories || [];
      taxonomies.categories.push(newTerm);
      await saveTaxonomies();
      form.reset();
      renderTaxonomyTables();
    }
  });

  document.getElementById('form-add-location')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    if (!name) return;
    const slug = (form.slug.value.trim() || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const parent = form.parent.value;
    const description = form.description.value.trim();
    const customUrl = form.customUrl.value.trim();
    const newTerm = { name, slug, parent, description, customUrl, count: 0 };
    taxonomies.locations.push(newTerm);
    await saveTaxonomies();
    form.reset();
    renderTaxonomyTables();
  });

  document.getElementById('form-add-tag')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    if (!name) return;
    const slug = (form.slug.value.trim() || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const description = form.description.value.trim();
    const newTerm = { name, slug, description, count: 0 };
    taxonomies.tags.push(newTerm);
    await saveTaxonomies();
    form.reset();
    renderTaxonomyTables();
  });

  // Table Row Delete Action
  document.addEventListener('click', async e => {
    const delBtn = e.target.closest('[data-del-tax]');
    if (delBtn) {
      e.preventDefault();
      const taxType = delBtn.dataset.delTax;
      const slug = delBtn.dataset.slug;
      if (!confirm(`Delete “${slug}”?`)) return;
      if (taxType === 'postCategories') {
        taxonomies.postCategories = (taxonomies.postCategories || []).filter(x => x.slug !== slug);
        await saveTaxonomies();
        renderTaxonomyTables();
        renderGutenbergPostCategoriesChecklist();
        renderPostCategoryFilterDropdown();
      } else {
        taxonomies[taxType] = (taxonomies[taxType] || []).filter(x => x.slug !== slug);
        await saveTaxonomies();
        renderTaxonomyTables();
      }
    }
  });

  // Search Inputs for Taxonomies
  ['types', 'categories', 'locations', 'tags'].forEach(taxKey => {
    const searchInput = document.getElementById(`search-tax-${taxKey}`);
    const searchBtn = document.getElementById(`search-tax-${taxKey}-btn`);
    searchInput?.addEventListener('input', () => renderTaxonomyTables());
    searchBtn?.addEventListener('click', () => renderTaxonomyTables());
  });

  // Color Pickers
  document.querySelectorAll('[data-trigger-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.dataset.triggerColor;
      document.getElementById(inputId)?.click();
    });
  });
  document.querySelectorAll('.wp-color-native').forEach(input => {
    input.addEventListener('input', e => {
      const previewId = e.target.id.replace('-input', '');
      const preview = document.getElementById(`preview-${previewId}`);
      if (preview) preview.style.backgroundColor = e.target.value;
    });
  });

  // Category image upload button
  document.getElementById('cat-img-btn')?.addEventListener('click', () => {
    const url = prompt('Enter Image URL for category (e.g. /assets/category-finance.jpg):', '/assets/category-finance.jpg');
    if (url) {
      document.getElementById('cat-image-url').value = url;
    }
  });

  // Dismissible notices
  document.querySelectorAll('.notice-dismiss').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.wp-notice')?.remove();
    });
  });

  // Select All Checkboxes per taxonomy table
  ['types', 'categories', 'locations', 'tags'].forEach(taxKey => {
    document.getElementById(`cb-select-${taxKey}`)?.addEventListener('change', e => {
      document.querySelectorAll(`#tbody-tax-${taxKey} input[type="checkbox"]`).forEach(box => {
        box.checked = e.target.checked;
      });
    });
  });

  // Select All Checkbox for employers
  document.getElementById('cb-select-employers')?.addEventListener('change', e => {
    document.querySelectorAll('#admin-employer-rows input[type="checkbox"]').forEach(box => {
      box.checked = e.target.checked;
    });
  });

  // Employer row delete action
  document.addEventListener('click', async e => {
    const empDelBtn = e.target.closest('[data-employer-delete]');
    if (empDelBtn) {
      e.preventDefault();
      const slug = empDelBtn.dataset.employerDelete;
      if (!confirm(`Delete employer “${slug}”?`)) return;
      await fetch(`/api/local/employers/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      localEmployers = localEmployers.filter(x => x.slug !== slug);
      remoteEmployers = remoteEmployers.filter(x => x.slug !== slug);
      renderEmployerRows();
    }
  });

  // --- USERS MANAGEMENT ---
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      name: 'Trikonet Admin',
      firstName: 'Trikonet',
      lastName: 'Administrator',
      email: 'admin@trikonet.com',
      role: 'Administrator',
      posts: 15,
      website: 'https://www.trikonet.com',
      color: '#4f46e5',
      initials: 'TA',
      registered: 'Sep 10, 2026',
      status: 'active',
      bio: 'Lead platform administrator and operations manager at Trikonet UAE.'
    },
    {
      id: 2,
      username: 'sarah_editor',
      name: 'Sarah Al-Mansoor',
      firstName: 'Sarah',
      lastName: 'Al-Mansoor',
      email: 'sarah@trikonet.com',
      role: 'Editor',
      posts: 8,
      website: '',
      color: '#0284c7',
      initials: 'SM',
      registered: 'Sep 14, 2026',
      status: 'active',
      bio: 'Senior Content & Recruitment Editor reviewing healthcare and education listings.'
    }
  ];

  let users = (() => {
    try {
      const stored = localStorage.getItem('trikonet_users_cms');
      const list = stored ? JSON.parse(stored) : defaultUsers;
      const filtered = list.filter(u => u.role !== 'Employer' && u.role !== 'Candidate');
      localStorage.setItem('trikonet_users_cms', JSON.stringify(filtered));
      return filtered;
    } catch {
      return defaultUsers;
    }
  })();

  // The authenticated administrator comes from the server database, while the
  // editable table is cached locally. Keep the signed-in account represented in
  // that table so real administrators never disappear behind demo seed users.
  if (activeAdminSession.username || activeAdminSession.email) {
    const username = activeAdminSession.username || activeAdminSession.email;
    const name = activeAdminSession.name || username;
    let signedInUser = users.find(user => user.username === username || (activeAdminSession.email && user.email === activeAdminSession.email));
    if (!signedInUser) {
      const stableId = 900000 + [...String(username)].reduce((total,character) => total + character.charCodeAt(0), 0);
      signedInUser = { id: stableId, username, posts: 0, status: 'active', color: '#b91c1c', registered: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) };
      users.unshift(signedInUser);
    }
    const nameParts = name.trim().split(/\s+/);
    Object.assign(signedInUser, {
      name,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' '),
      email: activeAdminSession.email || signedInUser.email || '',
      role: activeAdminSession.role || signedInUser.role || 'Administrator',
      initials: nameParts.map(part => part[0]).join('').slice(0,2).toUpperCase()
    });
    localStorage.setItem('trikonet_users_cms', JSON.stringify(users));
  }

  async function hashUserPassword(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function signedInAdminUsername() {
    try {
      const raw = localStorage.getItem('trikonet_admin_session') || sessionStorage.getItem('trikonet_admin_session');
      return JSON.parse(raw || '{}').username || '';
    } catch {
      return '';
    }
  }

  function canDeleteUser(user) {
    if (!user || user.username === signedInAdminUsername()) return false;
    if (user.role === 'Administrator' && users.filter(item => item.role === 'Administrator').length <= 1) return false;
    return true;
  }

  function saveUsers() {
    try {
      localStorage.setItem('trikonet_users_cms', JSON.stringify(users));
    } catch {}
    updateUserCountBadges();
  }

  function updateUserCountBadges() {
    const adminUsersCount = document.getElementById('admin-users-count');
    if (adminUsersCount) adminUsersCount.textContent = String(users.length);

    const chipEl = document.getElementById('admin-users-count-chip');
    if (chipEl) chipEl.textContent = `${users.length} team members`;

    const itemsCount = document.getElementById('admin-users-items-count');
    if (itemsCount) itemsCount.textContent = `${users.length} users`;

    const cAll = document.getElementById('count-user-all');
    if (cAll) cAll.textContent = String(users.length);

    const cAdmin = document.getElementById('count-user-admin');
    if (cAdmin) cAdmin.textContent = String(users.filter(u => u.role === 'Administrator').length);

    const cEditor = document.getElementById('count-user-editor');
    if (cEditor) cEditor.textContent = String(users.filter(u => u.role === 'Editor').length);

    const cContentEditor = document.getElementById('count-user-content-editor');
    if (cContentEditor) cContentEditor.textContent = String(users.filter(u => u.role === 'Content Editor').length);
  }

  let currentUserRole = 'all';

  function renderUserRows() {
    updateUserCountBadges();
    const tbody = document.getElementById('admin-user-rows');
    if (!tbody) return;

    const query = document.getElementById('admin-user-search')?.value.toLowerCase().trim() || '';
    const filtered = users.filter(u => {
      if (currentUserRole !== 'all' && u.role !== currentUserRole) return false;
      if (query) {
        const text = `${u.username} ${u.name || ''} ${u.email} ${u.role}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    tbody.innerHTML = filtered.length ? filtered.map(u => {
      const displayName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
      const initials = (u.initials || (displayName.split(/\s+/).map(x => x[0]).join('').slice(0, 2)) || 'U').toUpperCase();
      const roleClass = `pill-role-${(u.role || 'candidate').toLowerCase().replace(/\s+/g, '-')}`;
      return `
        <tr id="user-${u.id}">
          <td class="user-col-cb"><input type="checkbox" name="user_ids[]" value="${u.id}" class="modern-checkbox" ${canDeleteUser(u) ? '' : 'disabled title="Protected account"'}></td>
          <td class="user-col-user">
            <div class="user-profile-cell-wrap">
              <span class="modern-user-avatar" style="background:${u.color || '#4f46e5'};">
                ${esc(initials)}
              </span>
              <div class="user-profile-info">
                <div class="user-name-line">
                  <a class="user-username-link" href="#user-editor" data-user-edit="${u.id}">${esc(u.username)}</a>
                  <span class="user-display-name">${esc(displayName)}</span>
                </div>
                <div class="row-actions">
                  <a href="#user-editor" class="row-action-link edit-link" data-user-edit="${u.id}">Edit</a>
                  <a href="mailto:${esc(u.email)}" class="row-action-link view-link">Email</a>
                  ${canDeleteUser(u) ? `<a href="#" class="row-action-link trash-link" data-user-delete="${u.id}">Delete</a>` : ''}
                </div>
              </div>
            </div>
          </td>
          <td class="user-col-email">
            <a href="mailto:${esc(u.email)}" class="user-email-link">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect width="18" height="14" x="1" y="3" rx="2"/><path d="m1 5 8 6 8-6"/></svg>
              <span>${esc(u.email)}</span>
            </a>
          </td>
          <td class="user-col-role"><span class="pill-role ${roleClass}">${esc(u.role)}</span></td>
          <td class="user-col-posts" style="text-align:center;"><span class="modern-tax-count-chip">${u.posts || 0}</span></td>
          <td class="user-col-status" style="text-align:right;">
            <span class="modern-status-badge ${u.status === 'inactive' ? 'status-inactive' : 'status-active'}">
              <span class="status-pulse-dot"></span>
              <span>${u.status === 'inactive' ? 'Inactive' : 'Active'}</span>
            </span>
          </td>
          <td class="user-col-actions">
            <div class="user-action-buttons">
              <button type="button" class="user-edit-button" data-user-edit="${u.id}" aria-label="Edit ${esc(u.username)}">Edit</button>
              ${canDeleteUser(u)
                ? `<button type="button" class="user-delete-button" data-user-delete="${u.id}" aria-label="Delete ${esc(u.username)}">Delete</button>`
                : `<span class="user-protected-label" title="This administrator can be edited but cannot be deleted">Protected</span>`}
            </div>
          </td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="7" class="modern-table-empty-cell">
          <div class="modern-table-empty-state">
            <div class="modern-empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="modern-empty-title">No users found</div>
            <p class="modern-empty-desc">No team members match your current role filter or search criteria.</p>
          </div>
        </td>
      </tr>
    `;
  }

  async function syncServerAdminUsers() {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) return;
      const serverUsers = await response.json();
      if (!Array.isArray(serverUsers)) return;
      const serverKeys = new Set();
      const merged = serverUsers.map(serverUser => {
        serverKeys.add(String(serverUser.email || '').toLowerCase());
        serverKeys.add(String(serverUser.username || '').toLowerCase());
        const cached = users.find(user => String(user.email || '').toLowerCase() === String(serverUser.email || '').toLowerCase() || String(user.username || '').toLowerCase() === String(serverUser.username || '').toLowerCase());
        return { ...cached, ...serverUser, serverBacked: true };
      });
      merged.push(...users.filter(user => !serverKeys.has(String(user.email || '').toLowerCase()) && !serverKeys.has(String(user.username || '').toLowerCase())));
      users = merged;
      saveUsers();
      renderUserRows();
    } catch {}
  }
  syncServerAdminUsers();

  function fillUser(u = {}) {
    const form = document.getElementById('admin-user-form');
    if (!form) return;
    form.reset();
    document.getElementById('field-user-id').value = u.id || '';
    document.getElementById('user-username').value = u.username || '';
    document.getElementById('user-username').readOnly = false;
    document.getElementById('user-email').value = u.email || '';
    document.getElementById('user-first-name').value = u.firstName || '';
    document.getElementById('user-last-name').value = u.lastName || '';
    document.getElementById('user-website').value = u.website || '';
    document.getElementById('user-role').value = u.role || 'Employer';
    document.getElementById('user-status').value = u.status || 'active';
    document.getElementById('user-bio').value = u.bio || '';
    document.getElementById('user-password').value = '';

    const heading = document.getElementById('user-editor-page-title');
    if (heading) heading.textContent = u.id ? `Edit User: ${u.username}` : 'Add New User';

    const submitBtn = document.getElementById('btn-submit-user');
    if (submitBtn) submitBtn.textContent = u.id ? 'Update User' : 'Add New User';
  }

  // Password generator
  document.getElementById('btn-generate-password')?.addEventListener('click', () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const input = document.getElementById('user-password');
    if (input) {
      input.value = pwd;
      input.type = 'text';
    }
  });

  // User tab filtering
  document.querySelectorAll('#admin-user-tabs a').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('#admin-user-tabs a').forEach(t => t.classList.remove('current'));
      tab.classList.add('current');
      currentUserRole = tab.dataset.userRole || 'all';
      renderUserRows();
    });
  });

  // User search input
  document.getElementById('admin-user-search')?.addEventListener('input', () => {
    renderUserRows();
  });

  document.getElementById('admin-user-search-button')?.addEventListener('click', () => {
    renderUserRows();
  });

  // Select all checkbox for users
  document.getElementById('cb-select-all-users')?.addEventListener('change', e => {
    document.querySelectorAll('#admin-user-rows input[type="checkbox"]').forEach(box => {
      box.checked = e.target.checked;
    });
  });

  // Change Role button
  document.getElementById('btn-change-user-role')?.addEventListener('click', () => {
    const newRole = document.getElementById('filter-user-role-selector')?.value;
    if (!newRole) return;
    const selectedIds = Array.from(document.querySelectorAll('#admin-user-rows input[type="checkbox"]:checked')).map(b => String(b.value));
    if (!selectedIds.length) {
      alert('Please select at least one user.');
      return;
    }
    users.forEach(u => {
      if (selectedIds.includes(String(u.id))) {
        u.role = newRole;
      }
    });
    saveUsers();
    renderUserRows();
  });

  // Bulk actions for users
  document.getElementById('btn-apply-user-bulk')?.addEventListener('click', () => {
    const action = document.getElementById('bulk-action-users-selector')?.value;
    if (action === 'delete') {
      const selectedIds = Array.from(document.querySelectorAll('#admin-user-rows input[type="checkbox"]:checked')).map(b => String(b.value));
      if (!selectedIds.length) {
        alert('Please select users to delete.');
        return;
      }
      if (!confirm(`Delete ${selectedIds.length} selected user(s)?`)) return;
      const blocked = users.filter(u => selectedIds.includes(String(u.id)) && !canDeleteUser(u));
      users = users.filter(u => !selectedIds.includes(String(u.id)) || !canDeleteUser(u));
      saveUsers();
      renderUserRows();
      if (blocked.length) alert('The signed-in account and the last administrator were kept to prevent an account lockout.');
    }
  });

  // User form submission
  document.getElementById('admin-user-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const id = String(form.userId.value || '');
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const website = form.website.value.trim();
    const role = form.role.value;
    const status = form.status.value;
    const password = form.password.value;
    const bio = form.bio.value.trim();
    const name = `${firstName} ${lastName}`.trim() || username;

    if (!username || !email) return;
    if (!id && password.length < 8) {
      alert('New users must have a password of at least 8 characters.');
      return;
    }
    if (users.some(u => String(u.id) !== id && u.username.toLowerCase() === username.toLowerCase())) {
      alert('Username is already taken. Please choose another.');
      return;
    }
    if (users.some(u => String(u.id) !== id && u.email.toLowerCase() === email.toLowerCase())) {
      alert('Email address is already assigned to another user.');
      return;
    }

    const wasEditing = Boolean(id);
    const existing = id ? users.find(user => String(user.id) === id) : null;
    if (existing?.username === signedInAdminUsername() && status === 'inactive') return alert('You cannot deactivate the account you are currently using.');
    if (existing?.role === 'Administrator' && role !== 'Administrator' && users.filter(item => item.role === 'Administrator').length <= 1) return alert('Create another administrator before changing the role of the last administrator.');
    if ((!existing?.serverBacked && password.length < 8) || (password && password.length < 8)) return alert('Set a password of at least 8 characters so this user can sign in.');

    let savedUser;
    try {
      const response = await fetch('/api/admin/users', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:existing?.serverBacked?id:'',username,email,name,role,status,password,website,bio,posts:existing?.posts||0})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save login account.');
      savedUser = result;
    } catch (error) {
      showAdminNotice(error.message || 'Unable to save login account.', 'error');
      return;
    }
    const palette = ['#4f46e5','#0284c7','#059669','#d97706','#dc2626','#7c3aed','#ec4899'];
    const userRecord = {...existing,...savedUser,firstName,lastName,name,website,bio,serverBacked:true,color:existing?.color||palette[Math.floor(Math.random()*palette.length)],initials:(name.split(/\s+/).map(x=>x[0]).join('').slice(0,2)||username.slice(0,2)).toUpperCase(),registered:existing?.registered||new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
    users = users.filter(user => String(user.id)!==id && String(user.email||'').toLowerCase()!==email.toLowerCase());
    users.unshift(userRecord);

    saveUsers();
    showAdminNotice(`User “${username}” ${wasEditing ? 'updated' : 'created'} successfully.`);
    form.reset();
    location.hash = 'users';
  });

  // Click delegation for user edit / delete
  document.addEventListener('click', async e => {
    const editBtn = e.target.closest('[data-user-edit]');
    if (editBtn) {
      e.preventDefault();
      const id = String(editBtn.dataset.userEdit);
      const u = users.find(x => String(x.id) === id);
      if (u) {
        fillUser(u);
        location.hash = 'user-editor';
      }
      return;
    }

    const delBtn = e.target.closest('[data-user-delete]');
    if (delBtn) {
      e.preventDefault();
      const id = String(delBtn.dataset.userDelete);
      const u = users.find(x => String(x.id) === id);
      if (!u) return;
      if (!canDeleteUser(u)) {
        alert(u.username === signedInAdminUsername() ? 'You cannot delete the account you are currently using.' : 'You cannot delete the last administrator account.');
        return;
      }
      if (!confirm(`Are you sure you want to delete user “${u.username}”?`)) return;
      if (u.serverBacked) {
        const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {method:'DELETE'});
        const result = await response.json().catch(()=>({}));
        if (!response.ok) return showAdminNotice(result.error || 'Unable to delete user.', 'error');
      }
      users = users.filter(x => String(x.id) !== id);
      saveUsers();
      renderUserRows();
      showAdminNotice(`User “${u.username}” deleted successfully.`);
    }
  });

  // --- POSTS MANAGEMENT ---
  const defaultPosts = [
    {
      id: 34982,
      title: 'Job Loss Insurance UAE: The Secret Salary Backup You Didn’t Know',
      slug: 'job-loss-insurance-uae-iloe-guide',
      author: 'Trikonet',
      categories: ['Insurance'],
      tags: [],
      views: 6,
      comments: 99,
      date: 'Published 2025/09/26 at 12:16 pm',
      rawDate: '2025-09-26',
      status: 'published',
      isMine: true,
      seoScore: 82,
      keyword: 'Job Loss Insurance',
      schema: 'Article (BlogPosting), FAQPage',
      links: '0 | 0 | 2',
      excerpt: 'Imagine waking up one morning in the UAE to find that your company has closed its doors.',
      content: 'Job Loss Insurance (ILOE) in the UAE provides essential income security for private and public sector employees.'
    },
    {
      id: 34950,
      title: 'How to Manage Work-Related Stress',
      slug: 'ips-to-manage-work-related-stress',
      author: 'Hashim VP',
      categories: ['Health'],
      tags: [],
      views: 1,
      comments: 60,
      date: 'Published 2025/09/08 at 1:19 pm',
      rawDate: '2025-09-08',
      status: 'published',
      isMine: false,
      seoScore: 76,
      keyword: 'Work-Related Stress',
      schema: 'Article (BlogPosting), FAQPage',
      links: '0 | 0 | 3',
      excerpt: 'Work-related stress has become an inevitable part of modern life, impacting productivity and mental wellbeing.',
      content: 'Effective ways to balance daily professional responsibilities and mental wellbeing in demanding work cultures.'
    },
    {
      id: 34948,
      title: 'Importance of Taking Regular Breaks During Work Hours',
      slug: 'regular-breaks-at-work',
      author: 'Hashim VP',
      categories: ['Health'],
      tags: [],
      views: 1,
      comments: 57,
      date: 'Published 2025/09/08 at 1:17 pm',
      rawDate: '2025-09-08',
      status: 'published',
      isMine: false,
      seoScore: 78,
      keyword: 'Regular Breaks',
      schema: 'Article (BlogPosting), FAQPage',
      links: '0 | 0 | 3',
      excerpt: 'In the hustle of modern work culture, regular breaks help sustain focus and energy.',
      content: 'Taking micro-breaks during intense work sprints significantly prevents cognitive burnout and boosts productivity.'
    },
    {
      id: 34945,
      title: 'Resume Tips: Avoid These Common Mistakes for a Stronger Application',
      slug: 'resume-tips-avoid-common-mistakes',
      author: 'Hashim VP',
      categories: ['Career Tips'],
      tags: [],
      views: 1,
      comments: 78,
      date: 'Published 2025/09/08 at 1:08 pm',
      rawDate: '2025-09-08',
      status: 'published',
      isMine: false,
      seoScore: 75,
      keyword: 'Resume Tips',
      schema: 'Article (BlogPosting), FAQPage',
      links: '0 | 0 | 3',
      excerpt: 'Discover actionable strategies to craft a compelling CV that grabs recruiter attention across UAE hiring portals.',
      content: 'Key formatting practices, keyword optimization for applicant tracking systems (ATS), and structuring impact metrics.'
    },
    {
      id: 34941,
      title: 'What is a Stipend? Everything You Need to Know',
      slug: 'what-is-a-stipend',
      author: 'Hashim VP',
      categories: ['Career Tips'],
      tags: [],
      views: 2,
      comments: 52,
      date: 'Published 2025/09/08 at 1:06 pm',
      rawDate: '2025-09-08',
      status: 'published',
      isMine: false,
      seoScore: 69,
      keyword: 'What Is a Stipend',
      schema: 'Article (BlogPosting), FAQPage',
      links: '0 | 0 | 0',
      excerpt: 'Understanding internships, trainee allowances, and compensation structures in the United Arab Emirates.',
      content: 'Clear differences between wages, salary retainers, and educational stipends offered during trainee programs.'
    },
    {
      id: 34938,
      title: 'Top Interview Questions for a Part-Time Job & Best Answers',
      slug: 'top-interview-questions-part-time-job',
      author: 'Shifana',
      categories: ['Part Time Job'],
      tags: [],
      views: 0,
      comments: 11,
      date: 'Published 2025/09/08 at 12:57 pm',
      rawDate: '2025-09-08',
      status: 'published',
      isMine: false,
      seoScore: 67,
      keyword: 'Interview Questions',
      schema: 'Article (BlogPosting)',
      links: '0 | 0 | 0',
      excerpt: 'Ace your next retail, customer support, or flexible role interview with proven answering frameworks.',
      content: 'Step-by-step interview preparation guide with sample responses tailored for UAE university students and part-time workers.'
    },
    {
      id: 34930,
      title: 'Fake Job Offers in the UAE: Common Scams, and How to Protect Yourself',
      slug: 'fake-job-offers-in-the-uae',
      author: 'Sam Alex',
      categories: ['Career Tips'],
      tags: [],
      views: 0,
      comments: 35,
      date: 'Published 2025/08/31 at 1:56 pm',
      rawDate: '2025-08-31',
      status: 'published',
      isMine: true,
      seoScore: 77,
      keyword: 'Fake Job Offers in the UAE',
      schema: 'Article (BlogPosting)',
      links: '1 | 1 | 0',
      excerpt: 'Protect your finances and identity by learning how to detect red flags in fraudulent employment offers.',
      content: 'Comprehensive safety checklist highlighting genuine UAE embassy visa processes, official employment contracts, and reporting procedures.'
    }
  ];

  let posts = (() => {
    try {
      const stored = localStorage.getItem('trikonet_posts_cms');
      return stored ? JSON.parse(stored) : defaultPosts;
    } catch {
      return defaultPosts;
    }
  })();

  function savePosts() {
    try {
      localStorage.setItem('trikonet_posts_cms', JSON.stringify(posts));
    } catch {}
    updatePostCountBadges();
  }

  function updatePostCountBadges() {
    const chip = document.getElementById('admin-posts-count-chip');
    if (chip) chip.textContent = `${posts.length} items`;
    const sidebarCount = document.getElementById('admin-posts-count');
    if (sidebarCount) sidebarCount.textContent = String(posts.length);
    const footerCount = document.getElementById('admin-posts-items-count');
    if (footerCount) footerCount.textContent = `${posts.length} items`;

    const cAll = document.getElementById('count-post-all');
    if (cAll) cAll.textContent = String(posts.length);
    const cMine = document.getElementById('count-post-mine');
    if (cMine) cMine.textContent = String(posts.filter(p => p.isMine).length);
    const cPub = document.getElementById('count-post-published');
    if (cPub) cPub.textContent = String(posts.filter(p => p.status === 'published').length);
    const cSched = document.getElementById('count-post-scheduled');
    if (cSched) cSched.textContent = String(posts.filter(p => p.status === 'scheduled').length);
    const cPillar = document.getElementById('count-post-pillar');
    if (cPillar) cPillar.textContent = '0';
  }

  let postStatusFilter = 'all';

  function decodePostText(value) {
    const box = document.createElement('textarea');
    box.innerHTML = String(value ?? '');
    return box.value;
  }

  let activePostQuickEditId = null;
  function closePostQuickEdit() {
    document.getElementById('post-quick-edit-row')?.remove();
    document.querySelector(`[data-post-id="${activePostQuickEditId}"]`)?.removeAttribute('hidden');
    activePostQuickEditId = null;
  }
  function openPostQuickEdit(postId) {
    closePostQuickEdit();
    const post = posts.find(item => Number(item.id) === Number(postId));
    const original = document.querySelector(`[data-post-id="${postId}"]`);
    if (!post || !original) return;
    activePostQuickEditId = Number(postId);
    original.hidden = true;
    const categories = [...new Set([...(taxonomies?.categories || []).map(item => item.name || item), ...(post.categories || [])])].filter(Boolean);
    const currentCategories = new Set(post.categories || []);
    const row = document.createElement('tr');
    row.id = 'post-quick-edit-row';
    row.className = 'inline-edit-row post-inline-quick-edit';
    row.innerHTML = `<td colspan="5"><div class="inline-edit-wrapper"><div class="inline-edit-col-title">QUICK EDIT</div><div class="inline-edit-fields-grid"><div><div class="inline-edit-label-row"><label class="title">Title</label><input class="inline-edit-input" name="post_qe_title" value="${escapeHtml(post.title || '')}"></div><div class="inline-edit-label-row"><label class="title">Slug</label><input class="inline-edit-input" name="post_qe_slug" value="${escapeHtml(post.slug || '')}"></div><div class="inline-edit-label-row"><label class="title">Date</label><input class="inline-edit-input" type="date" name="post_qe_date" value="${escapeHtml((post.rawDate || '').slice(0,10))}"></div><div class="inline-edit-label-row"><label class="title">Author</label><input class="inline-edit-input" name="post_qe_author" value="${escapeHtml(post.author || 'Trikonet')}"></div></div><div><div class="inline-edit-section-header">Categories</div><div class="inline-edit-checklist-box">${categories.map(category => `<label><input type="checkbox" name="post_qe_category" value="${escapeHtml(category)}" ${currentCategories.has(category)?'checked':''}> ${escapeHtml(category)}</label>`).join('')}</div></div><div><div class="inline-edit-section-header">Tags</div><textarea class="inline-edit-input" name="post_qe_tags" rows="4">${escapeHtml((post.tags || []).join(', '))}</textarea><span class="inline-edit-hint">Separate tags with commas</span><label class="inline-edit-option"><input type="checkbox" name="post_qe_comments" ${post.allowComments === false?'':'checked'}> Allow Comments</label><label class="inline-edit-option"><input type="checkbox" name="post_qe_pings" ${post.allowPings === false?'':'checked'}> Allow Pings</label><div class="inline-edit-label-row"><label class="title">Status</label><select class="inline-edit-input" name="post_qe_status"><option value="published" ${post.status==='published'?'selected':''}>Published</option><option value="draft" ${post.status==='draft'?'selected':''}>Draft</option><option value="scheduled" ${post.status==='scheduled'?'selected':''}>Scheduled</option></select></div></div></div><div class="inline-edit-actions-bar"><button type="button" class="inline-edit-update-btn" data-post-qe-update>Update</button><button type="button" class="inline-edit-cancel-btn" data-post-qe-cancel>Cancel</button></div></div></td>`;
    original.insertAdjacentElement('afterend', row);
    row.querySelector('[data-post-qe-cancel]')?.addEventListener('click', closePostQuickEdit);
    row.querySelector('[data-post-qe-update]')?.addEventListener('click', () => {
      post.title = row.querySelector('[name="post_qe_title"]').value.trim() || post.title;
      post.slug = row.querySelector('[name="post_qe_slug"]').value.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || post.slug;
      post.author = row.querySelector('[name="post_qe_author"]').value.trim() || 'Trikonet';
      post.categories = [...row.querySelectorAll('[name="post_qe_category"]:checked')].map(input => input.value);
      post.tags = row.querySelector('[name="post_qe_tags"]').value.split(',').map(value => value.trim()).filter(Boolean);
      post.status = row.querySelector('[name="post_qe_status"]').value;
      post.allowComments = row.querySelector('[name="post_qe_comments"]').checked;
      post.allowPings = row.querySelector('[name="post_qe_pings"]').checked;
      const date = row.querySelector('[name="post_qe_date"]').value;
      if (date) { post.rawDate = date; post.date = new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
      savePosts();
      activePostQuickEditId = null;
      renderPostRows();
    });
    row.querySelector('[name="post_qe_title"]')?.focus();
  }

  function renderPostRows() {
    const tbody = document.getElementById('admin-post-rows');
    if (!tbody) return;

    updatePostCountBadges();

    const searchInput = document.getElementById('admin-post-search');
    const q = (searchInput?.value || '').toLowerCase().trim();
    const dateVal = document.getElementById('filter-post-date')?.value || '';
    const catVal = document.getElementById('filter-post-category')?.value || '';

    const filtered = posts.filter(p => {
      if (postStatusFilter === 'mine' && !p.isMine) return false;
      if (postStatusFilter === 'published' && p.status !== 'published') return false;
      if (postStatusFilter === 'scheduled' && p.status !== 'scheduled') return false;
      if (postStatusFilter === 'pillar') return false;

      if (dateVal && !p.rawDate?.startsWith(dateVal)) return false;
      if (catVal && !p.categories.includes(catVal)) return false;

      if (q) {
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchAuthor = (p.author || '').toLowerCase().includes(q);
        const matchCat = (p.categories || []).some(c => c.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchCat) return false;
      }
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:36px 16px; color:#94a3b8; font-size:13px;">No posts found matching the criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const initials = (p.author || 'Trikonet').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const primaryCat = (p.categories && p.categories[0]) || 'General';
      const isScheduled = p.status === 'scheduled';
      const statusClass = isScheduled ? 'post-status-pill-clean is-scheduled' : 'post-status-pill-clean';
      const statusLabel = isScheduled ? 'Scheduled' : (p.status === 'draft' ? 'Draft' : 'Published');
      const cleanDate = p.date ? p.date.replace(/^(Published|Scheduled for)\s*/i, '').split(' at ')[0] : 'Sep 23, 2026';

      return `
        <tr data-post-id="${p.id}">
          <td class="post-col-cb">
            <input type="checkbox" value="${p.id}" aria-label="Select ${escapeHtml(p.title)}">
          </td>
          <td class="post-col-title">
            <div class="post-title-cell-wrap">
              <div class="post-article-thumb-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div class="post-title-info-wrap">
                <a href="#post-editor/${encodeURIComponent(p.slug)}" class="post-headline-link" data-post-edit="${p.id}">${escapeHtml(p.title)}</a>
                <div class="post-meta-subrow">
                  <span class="post-pill-category">${escapeHtml(primaryCat)}</span>
                  <span class="post-row-action-dot">•</span>
                  <div class="post-row-actions-bar">
                    <a href="#post-editor/${encodeURIComponent(p.slug)}" class="post-row-action-link" data-post-edit="${p.id}">Edit</a>
                    <span class="post-row-action-dot">•</span>
                    <a href="#" class="post-row-action-link" data-post-quickedit="${p.id}">Quick Edit</a>
                    <span class="post-row-action-dot">•</span>
                    <a href="#" class="post-row-action-link delete-link" data-post-delete="${p.id}">Trash</a>
                    <span class="post-row-action-dot">•</span>
                    <a href="${escapeHtml(p.localUrl || `/blog/${p.slug}`)}" class="post-row-action-link" target="_blank" rel="noopener">View ↗</a>
                  </div>
                </div>
              </div>
            </div>
          </td>
          <td class="post-col-author">
            <div class="post-author-badge">
              <span class="post-author-avatar-chip">${escapeHtml(initials)}</span>
              <span class="post-author-name-text">${escapeHtml(p.author || 'Trikonet')}</span>
            </div>
          </td>
          <td class="post-col-status">
            <span class="${statusClass}">
              <span class="status-indicator-dot"></span>
              ${statusLabel}
            </span>
          </td>
          <td class="post-col-date-views">
            <div class="post-date-primary-text" title="${escapeHtml(p.date || '')}">
              ${isScheduled ? `<span style="color:#0284c7; font-weight:600;">⏰ ${escapeHtml(cleanDate)}</span>` : escapeHtml(cleanDate)}
            </div>
            <div class="post-views-sub-text">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path d="M2.458 10C3.732 6.943 6.643 4.5 10 4.5s6.268 2.443 7.542 5.5c-1.274 3.057-4.185 5.5-7.542 5.5S3.732 13.057 2.458 10z"/></svg>
              ${(p.views ?? 0).toLocaleString()} views
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-post-edit]').forEach(link => {
      link.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();
        const id = Number(link.dataset.postEdit);
        const post = posts.find(item => item.id === id);
        if (!post) return;
        const connectedPost = await loadDatabasePostForEditor(post);
        const index = posts.findIndex(item => item.slug === connectedPost.slug || item.id === connectedPost.id);
        if (index >= 0) posts[index] = connectedPost;
        fillPost(connectedPost);
        location.hash = `post-editor/${encodeURIComponent(connectedPost.slug)}`;
      });
    });
    tbody.querySelectorAll('[data-post-quickedit]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openPostQuickEdit(Number(link.dataset.postQuickedit));
    }));
  }

  // Modern modal confirmation dialog matching Trikonet design system
  function showAdminConfirmModal({
    title = 'Delete Item?',
    message = 'Are you sure you want to proceed? This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    danger = true,
    icon = 'trash'
  } = {}) {
    return new Promise((resolve) => {
      document.getElementById('wp-confirm-modal-backdrop')?.remove();

      const backdrop = document.createElement('div');
      backdrop.className = 'wp-confirm-modal-backdrop';
      backdrop.id = 'wp-confirm-modal-backdrop';

      backdrop.innerHTML = `
        <div class="wp-confirm-modal-card" role="dialog" aria-modal="true" aria-labelledby="wp-confirm-title">
          <button type="button" class="wp-confirm-modal-close" aria-label="Close modal">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="wp-confirm-modal-icon ${icon === 'warning' ? 'is-warning' : (danger ? 'is-danger' : 'is-warning')}">
            ${icon === 'warning' ? `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ` : `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            `}
          </div>
          <h3 class="wp-confirm-modal-title" id="wp-confirm-title">${escapeHtml(title)}</h3>
          <p class="wp-confirm-modal-desc">${escapeHtml(message)}</p>
          <div class="wp-confirm-modal-actions">
            <button type="button" class="wp-confirm-btn-cancel">${escapeHtml(cancelText)}</button>
            <button type="button" class="wp-confirm-btn-confirm ${danger ? 'is-danger' : 'is-primary'}">${escapeHtml(confirmText)}</button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      const cleanup = (result) => {
        window.removeEventListener('keydown', onKeyDown);
        backdrop.classList.add('is-closing');
        setTimeout(() => {
          backdrop.remove();
        }, 160);
        resolve(result);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          cleanup(true);
        }
      };

      window.addEventListener('keydown', onKeyDown);

      backdrop.querySelector('.wp-confirm-modal-close')?.addEventListener('click', () => cleanup(false));
      backdrop.querySelector('.wp-confirm-btn-cancel')?.addEventListener('click', () => cleanup(false));
      backdrop.querySelector('.wp-confirm-btn-confirm')?.addEventListener('click', () => cleanup(true));

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) cleanup(false);
      });

      setTimeout(() => {
        backdrop.querySelector('.wp-confirm-btn-cancel')?.focus();
      }, 50);
    });
  }

  function showImageSourceChooser(options = {}) {
    document.getElementById('wp-image-source-backdrop')?.remove();
    const backdrop = document.createElement('div');
    backdrop.className = 'wp-confirm-modal-backdrop';
    backdrop.id = 'wp-image-source-backdrop';
    backdrop.innerHTML = `
      <div class="wp-image-source-modal" role="dialog" aria-modal="true" aria-labelledby="wp-image-source-title">
        <button type="button" class="wp-confirm-modal-close" data-close-image-source aria-label="Close">×</button>
        <h3 id="wp-image-source-title">${escapeHtml(options.title || 'Choose image source')}</h3>
        <p>Select an image from the Media Library or upload one from your device.</p>
        <div class="wp-image-source-options">
          <button type="button" data-image-source="library">
            <span class="wp-image-source-icon">▦</span><strong>Media Library</strong><small>Choose an existing image</small>
          </button>
          <button type="button" data-image-source="device">
            <span class="wp-image-source-icon">↑</span><strong>From device</strong><small>Upload a new image</small>
          </button>
        </div>
        <div class="wp-block-media-library" hidden>
          <div class="wp-block-media-library-head"><strong>Media Library</strong><button type="button" data-image-source-back>Back</button></div>
          <label class="wp-block-media-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" data-block-media-search placeholder="Search images by name…" aria-label="Search Media Library">
          </label>
          <div class="wp-block-media-grid">
            ${(Array.isArray(media) ? media : []).filter(item => item.url && (item.type === 'image' || item.type === 'logo')).map(item => `
              <button type="button" class="wp-block-media-item" data-block-media-url="${escapeHtml(item.url)}" data-block-media-title="${escapeHtml(String(item.title || 'Image').toLowerCase())}" title="${escapeHtml(item.title || 'Image')}">
                <img src="${escapeHtml(item.url)}" alt=""><span>${escapeHtml(item.title || 'Image')}</span>
              </button>`).join('') || '<p class="wp-block-media-empty">No images are available in the Media Library.</p>'}
          </div>
          <p class="wp-block-media-no-results" hidden>No images match your search.</p>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const close = () => backdrop.remove();
    backdrop.querySelector('[data-close-image-source]')?.addEventListener('click', close);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
    backdrop.querySelector('[data-image-source="device"]')?.addEventListener('click', () => {
      close();
      if (typeof options.onDeviceUpload === 'function') {
        options.onDeviceUpload();
      } else {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = e => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = ev => {
              if (typeof options.onSelect === 'function') options.onSelect(ev.target.result);
            };
            reader.readAsDataURL(file);
          }
        };
        fileInput.click();
      }
    });
    backdrop.querySelector('[data-image-source="library"]')?.addEventListener('click', () => {
      backdrop.querySelector('.wp-image-source-options').hidden = true;
      backdrop.querySelector('.wp-block-media-library').hidden = false;
    });
    backdrop.querySelector('[data-image-source-back]')?.addEventListener('click', () => {
      backdrop.querySelector('.wp-block-media-library').hidden = true;
      backdrop.querySelector('.wp-image-source-options').hidden = false;
    });
    backdrop.querySelector('[data-block-media-search]')?.addEventListener('input', event => {
      const query = event.target.value.trim().toLowerCase();
      let visibleCount = 0;
      backdrop.querySelectorAll('.wp-block-media-item').forEach(item => {
        const matches = !query || (item.dataset.blockMediaTitle || '').includes(query);
        item.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      const noResults = backdrop.querySelector('.wp-block-media-no-results');
      if (noResults) noResults.hidden = visibleCount !== 0;
    });
    backdrop.querySelectorAll('[data-block-media-url]').forEach(button => button.addEventListener('click', () => {
      const url = button.dataset.blockMediaUrl || '';
      close();
      if (typeof options.onSelect === 'function') options.onSelect(url);
    }));
  }

  function showBlockImageSourceChooser(blockId) {
    showImageSourceChooser({
      onDeviceUpload: () => {
        document.querySelector(`[data-block-image-file="${blockId}"]`)?.click();
      },
      onSelect: (url) => {
        const block = postBlocks.find(item => item.id === blockId && item.type === 'image');
        if (!block) return;
        block.src = url;
        block.alt = '';
        isPostDirty = true;
        renderGutenbergBlocks();
      }
    });
  }

  // ==========================================================================
  // WORDPRESS GUTENBERG POST EDITOR ENGINE
  // ==========================================================================
  let postBlocks = [];
  let activeBlockId = null;
  let postFeaturedImgUrl = '';
  let postTags = [];
  let editorDocumentType = 'post';
  let editingPageId = 0;
  let isPostDirty = false;
  let isFillingPost = false;
  let postUndoStack = [];
  let postRedoStack = [];
  let postHistoryTimer = null;
  let isRestoringPostHistory = false;

  const getPostHistorySnapshot = () => JSON.stringify({ blocks: postBlocks, activeBlockId });

  function updatePostHistoryButtons() {
    const undo = document.getElementById('wp-btn-undo');
    const redo = document.getElementById('wp-btn-redo');
    if (undo) undo.classList.toggle('disabled', postUndoStack.length <= 1);
    if (redo) redo.classList.toggle('disabled', postRedoStack.length === 0);
  }

  function resetPostHistory() {
    clearTimeout(postHistoryTimer);
    postUndoStack = [getPostHistorySnapshot()];
    postRedoStack = [];
    updatePostHistoryButtons();
  }

  function recordPostHistory() {
    if (isFillingPost || isRestoringPostHistory) return;
    clearTimeout(postHistoryTimer);
    postHistoryTimer = setTimeout(() => {
      const snapshot = getPostHistorySnapshot();
      if (postUndoStack[postUndoStack.length - 1] !== snapshot) {
        postUndoStack.push(snapshot);
        if (postUndoStack.length > 100) postUndoStack.shift();
        postRedoStack = [];
        updatePostHistoryButtons();
      }
    }, 180);
  }

  function restorePostHistory(snapshot) {
    if (!snapshot) return;
    const state = JSON.parse(snapshot);
    isRestoringPostHistory = true;
    postBlocks = state.blocks || [];
    activeBlockId = state.activeBlockId || postBlocks[0]?.id || null;
    renderGutenbergBlocks();
    updateRankMathScore();
    isPostDirty = true;
    isRestoringPostHistory = false;
    updatePostHistoryButtons();
  }

  function markPostDirty() {
    if (!isFillingPost && document.getElementById('view-post-editor')?.classList.contains('active-view')) {
      isPostDirty = true;
      recordPostHistory();
    }
  }

  function cleanPastedInline(html = '') {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    doc.querySelectorAll('script,style,meta,link,iframe,object,embed').forEach(node => node.remove());
    doc.querySelectorAll('*').forEach(node => {
      const style = String(node.getAttribute('style') || '').toLowerCase();
      if (style.includes('font-weight') && /(?:bold|[6-9]00)/.test(style) && !node.closest('strong,b')) {
        const strong = doc.createElement('strong');
        while (node.firstChild) strong.append(node.firstChild);
        node.append(strong);
      }
      if (style.includes('font-style') && style.includes('italic') && !node.closest('em,i')) {
        const em = doc.createElement('em');
        while (node.firstChild) em.append(node.firstChild);
        node.append(em);
      }
      [...node.attributes].forEach(attr => {
        if (!['href','target','rel','src','alt'].includes(attr.name.toLowerCase())) node.removeAttribute(attr.name);
      });
      if (node.tagName === 'A' && /^javascript:/i.test(node.getAttribute('href') || '')) node.removeAttribute('href');
    });
    return doc.body.firstElementChild?.innerHTML || '';
  }

  function smartPastedBlocks(html, plainText = '') {
    const blocks = [];
    if (html && /<(?:h[1-6]|p|div|ul|ol|table|blockquote|img|br)\b/i.test(html)) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('script,style,meta,link,iframe,object,embed,xml').forEach(node => node.remove());
      const pushNode = node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) blocks.push({ id:genBlockId(), type:'paragraph', content:escapeHtml(text) });
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const tag = node.tagName.toLowerCase();
        const text = node.textContent.replace(/\u00a0/g, ' ').trim();
        if (!text && tag !== 'img') return;
        const cls = String(node.className || '');
        const style = String(node.getAttribute('style') || '');
        const wordLevel = cls.match(/(?:Mso)?Heading\s*([1-6])/i)?.[1] || style.match(/mso-outline-level\s*:\s*([1-6])/i)?.[1];
        if (/^h[1-6]$/.test(tag) || wordLevel) {
          const level = wordLevel ? `h${wordLevel}` : tag;
          blocks.push({ id:genBlockId(), type:'heading', level, content:cleanPastedInline(node.innerHTML) });
        } else if (tag === 'ul' || tag === 'ol') {
          blocks.push({ id:genBlockId(), type:'list', content:cleanPastedInline(node.innerHTML) });
        } else if (tag === 'blockquote') {
          blocks.push({ id:genBlockId(), type:'quote', content:cleanPastedInline(node.innerHTML) });
        } else if (tag === 'table') {
          const tableData = [...node.querySelectorAll('tr')].map(row => [...row.querySelectorAll('th,td')].map(cell => cleanPastedInline(cell.innerHTML))).filter(row => row.length);
          if (tableData.length) blocks.push({ id:genBlockId(), type:'table', tableData, content:node.outerHTML });
        } else if (tag === 'img') {
          const src = node.getAttribute('src') || '';
          if (src) blocks.push({ id:genBlockId(), type:'image', src, alt:node.getAttribute('alt') || '', caption:'', width:'100%', align:'center' });
        } else if (tag === 'p' && /mso-list/i.test(style + cls)) {
          const content = cleanPastedInline(node.innerHTML.replace(/^\s*(?:[•·▪◦]|\d+[.)])\s*/i, ''));
          const previous = blocks[blocks.length - 1];
          if (previous?.type === 'list') previous.content += `<li>${content}</li>`;
          else blocks.push({ id:genBlockId(), type:'list', content:`<li>${content}</li>` });
        } else if (['p','div','section','article'].includes(tag)) {
          const structural = [...node.children].some(child => /^(H[1-6]|P|DIV|UL|OL|TABLE|BLOCKQUOTE|IMG)$/.test(child.tagName));
          if (structural && tag !== 'p') [...node.childNodes].forEach(pushNode);
          else blocks.push({ id:genBlockId(), type:'paragraph', content:cleanPastedInline(node.innerHTML) });
        } else if (['strong','b'].includes(tag) && text.length < 120) {
          blocks.push({ id:genBlockId(), type:'heading', level:'h2', content:cleanPastedInline(node.outerHTML) });
        } else if (node.children.length) [...node.childNodes].forEach(pushNode);
        else if (text) blocks.push({ id:genBlockId(), type:'paragraph', content:cleanPastedInline(node.innerHTML) });
      };
      [...doc.body.childNodes].forEach(pushNode);
    }
    if (!blocks.length && plainText.trim()) {
      const lines = plainText.replace(/\r/g, '').split('\n');
      let list = null;
      const flushList = () => { if (list) { blocks.push(list); list = null; } };
      lines.forEach(raw => {
        const line = raw.trim();
        if (!line) { flushList(); return; }
        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        const bullet = line.match(/^(?:[•●▪◦*+-]|\d+[.)])\s+(.+)$/);
        if (heading) { flushList(); blocks.push({id:genBlockId(),type:'heading',level:`h${heading[1].length}`,content:escapeHtml(heading[2])}); }
        else if (bullet) { if (!list) list={id:genBlockId(),type:'list',content:''}; list.content += `<li>${escapeHtml(bullet[1])}</li>`; }
        else { flushList(); blocks.push({id:genBlockId(),type:'paragraph',content:escapeHtml(line)}); }
      });
      flushList();
    }
    const faqItems=[];
    for(let i=0;i<blocks.length-1;i++){
      const question=blocks[i],answer=blocks[i+1];
      const questionText=String(question.content||'').replace(/<[^>]+>/g,'').trim();
      if ((/^(?:q(?:uestion)?\s*[:.-])/i.test(questionText)||questionText.endsWith('?')) && answer.type==='paragraph') {
        faqItems.push({question:question.content.replace(/^(?:q(?:uestion)?\s*[:.-])\s*/i,''),answer:answer.content.replace(/^(?:a(?:nswer)?\s*[:.-])\s*/i,'')});
        blocks.splice(i,2); i--;
      }
    }
    if(faqItems.length) blocks.push({id:genBlockId(),type:'faq',items:faqItems});
    return blocks;
  }

  function clearPostDirty() {
    isPostDirty = false;
  }

  // Intercept navigation away from post editor when unsaved changes exist
  document.addEventListener('click', async e => {
    const postEditor = document.getElementById('view-post-editor');
    if (!postEditor || !postEditor.classList.contains('active-view')) return;

    const backBtn = e.target.closest('#wp-back-to-posts');
    const navLink = e.target.closest('a[href], .admin-nav-item, .admin-sub-item, .admin-nav-parent, [data-view]');

    if (!backBtn && !isPostDirty) return;
    if (!backBtn && !navLink) return;
    // Don't intercept clicks inside post editor controls (unless it's the back button)
    if (!backBtn && navLink.closest('#view-post-editor')) return;

    // External target or blog preview in new tab
    if (navLink?.target === '_blank' || navLink?.id === 'wp-btn-preview') return;

    const href = backBtn ? backBtn.getAttribute('href') : navLink?.getAttribute('href');
    if (href === '#' || href?.startsWith('#wp-')) return;

    e.preventDefault();
    e.stopPropagation();

    const leave = await showAdminConfirmModal({
      title: isPostDirty ? 'Unsaved Changes' : 'Go Back?',
      message: isPostDirty
        ? 'You have unsaved changes. Going back now will discard your unsaved work. Are you sure you want to leave without saving?'
        : `Are you sure you want to go back to ${editorDocumentType === 'page' ? 'Pages' : 'Posts'}?`,
      confirmText: isPostDirty ? 'Leave without saving' : 'Go back',
      cancelText: 'Keep editing',
      danger: isPostDirty,
      icon: 'warning'
    });

    if (leave) {
      isPostDirty = false;
      if (backBtn) {
        location.hash = editorDocumentType === 'page' ? '#pages-core' : '#posts';
      } else if (href) {
        if (href.startsWith('#')) {
          location.hash = href;
        } else {
          location.href = href;
        }
      } else if (navLink?.dataset?.view) {
        location.hash = navLink.dataset.view;
      }
    }
  }, true);

  window.addEventListener('beforeunload', e => {
    if (isPostDirty && document.getElementById('view-post-editor')?.classList.contains('active-view')) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });

  function configureDocumentEditor(type) {
    editorDocumentType = type;
    const isPage = type === 'page';
    const back = document.getElementById('wp-back-to-posts');
    if (back) { back.href = isPage ? '#pages-core' : '#posts'; back.title = 'Back'; back.setAttribute('aria-label', `Back to ${isPage ? 'Pages' : 'Posts'}`); }
    const postTab = document.getElementById('wp-tab-post');
    if (postTab) postTab.textContent = isPage ? 'Page' : 'Post';
    const publish = document.getElementById('wp-btn-publish');
    if (publish) publish.textContent = isPage ? (editingPageId ? 'Update Page' : 'Publish Page') : (document.getElementById('wp-field-post-id')?.value ? 'Update' : 'Publish');
    document.getElementById('view-post-editor')?.classList.toggle('is-page-document', isPage);
    const bylineBar = document.getElementById('wp-editor-byline-bar');
    const placeholder = document.getElementById('wp-editor-byline-placeholder');
    if (isPage) {
      if (bylineBar) bylineBar.style.display = 'none';
      if (placeholder) placeholder.style.display = 'none';
    } else {
      updateEditorBylinePreview();
    }
    if (!isPage) document.getElementById('wp-home-widget-inspector')?.remove();
  }

  function fillPageInBlogEditor(page = {}) {
    editingPageId = Number(page.id) || 0;
    configureDocumentEditor('page');
    fillPost({
      id: page.id || '', title: page.title || '', slug: page.slug || '', author: page.author || 'Trikonet',
      content: page.content || '', status: page.status || 'published', keyword: page.keyword || '',
      excerpt: '', categories: [], tags: [], localUrl: page.slug === 'home' ? '/' : `/${page.slug || ''}`
    });
    const indicator = document.getElementById('wp-doc-title-indicator');
    if (indicator) indicator.textContent = `${page.title || 'No Title'} - Page`;
    document.getElementById('view-post-editor')?.classList.toggle('is-home-document', page.slug === 'home');
    configureDocumentEditor('page');
  }

  function genBlockId() {
    return 'block-' + Math.random().toString(36).substr(2, 9);
  }

  function ensureTableData(block) {
    if (Array.isArray(block.tableData) && block.tableData.length) return block.tableData;
    const shell = document.createElement('div');
    shell.innerHTML = block.content || '';
    const rows = Array.from(shell.querySelectorAll('tr')).map(row =>
      Array.from(row.querySelectorAll('th,td')).map(cell => cell.innerHTML.trim())
    ).filter(row => row.length);
    block.tableData = rows.length ? rows : [['Topic', 'Key Insight'], ['', '']];
    const width = Math.max(2, ...block.tableData.map(row => row.length));
    block.tableData = block.tableData.map(row => [...row, ...Array(Math.max(0, width - row.length)).fill('')]);
    return block.tableData;
  }

  function renderGutenbergBlocks() {
    const container = document.getElementById('wp-blocks-container');
    if (!container) return;

    if (postBlocks.length === 0) {
      postBlocks = [{
        id: genBlockId(),
        type: 'paragraph',
        content: ''
      }];
    }

    container.innerHTML = postBlocks.map((b, blockIndex) => {
      const isActive = b.id === activeBlockId;
      const typeClass = b.type === 'heading' ? 'is-heading' : (b.type === 'quote' ? 'is-quote' : (b.type === 'code' ? 'is-code' : ''));
      const placeholder = b.type === 'heading' ? 'Heading' : 'Type / to choose a block or // to use Content AI';
      
      let innerContent = '';
      if (b.type.startsWith('home-')) {
        const homeWidget = b.type.slice(5);
        const defaults = {
          hero: { title: 'Trying to Connect', keyword: 'Job Title, Keywords', location: 'Country or City', category: 'All Categories', button: 'Find Jobs', image: '/assets/hero.webp', alt: 'People from different professions' },
          categories: { title: 'Popular Job Categories', subtitle: 'Find Your Perfect Job Here' },
          'how-it-works': { title: 'How It Works?', subtitle: 'Job for Anyone, Anywhere' },
          articles: { title: 'Recent Articles', subtitle: 'Fresh job related content posted each day.' }
        };
        b.settings = { ...(defaults[homeWidget] || {}), ...(b.settings || {}) };
        const s = b.settings;
        const categories = ['Education and Training', 'Accounting or Finance', 'Administration', 'Accountant', 'Teacher Jobs', 'HealthCare'];
        const widgetMarkup = {
          hero: `<div class="wp-home-hero-preview"><h2>${escapeHtml(s.title)}</h2><div class="wp-home-search-preview"><span>⌕ &nbsp; ${escapeHtml(s.keyword)}</span><span>⌖ &nbsp; ${escapeHtml(s.location)}</span><span>${escapeHtml(s.category)}</span><b>${escapeHtml(s.button)}</b></div><img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.alt)}"></div>`,
          categories: `<div class="wp-home-section-heading"><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.subtitle)}</p></div><div class="wp-home-category-preview">${categories.map((name, index) => `<div><i>${['✚','◫','⌂','▤','⚙','♙'][index]}</i><span><strong>${name}</strong><small>Live open positions</small></span></div>`).join('')}</div>`,
          'how-it-works': `<div class="wp-home-section-heading"><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.subtitle)}</p></div><div class="wp-home-steps-preview">${[[s.step1Image || '/assets/step-1.jpg',s.step1Title || 'Register an Account to Start'],[s.step2Image || '/assets/step-2.jpg',s.step2Title || 'Explore Over Thousands of Jobs'],[s.step3Image || '/assets/step-3.jpg',s.step3Title || 'Find the Most Suitable Company and Job']].map(step => `<div><img src="${escapeHtml(step[0])}" alt="${escapeHtml(step[1])}"><strong>${escapeHtml(step[1])}</strong></div>`).join('')}</div>`,
          articles: `<div class="wp-home-section-heading"><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.subtitle)}</p></div><div class="wp-home-articles-preview">${[0,1,2].map((index) => `<div><img src="${escapeHtml(posts[index]?.featuredImage || posts[index]?.image || `/assets/article-${index + 1}.jpg`)}" alt="Recent article" onerror="this.onerror=null;this.src='/assets/article-${index + 1}.jpg';"><strong>${posts[index]?.title || ['Latest career article','Workplace advice','Career guidance'][index]}</strong><small>${posts[index]?.date || 'Published article'}</small></div>`).join('')}</div>`
        };
        const fields = homeWidget === 'hero'
          ? [['title','Heading'],['keyword','Keyword placeholder'],['location','Location placeholder'],['category','Category placeholder'],['button','Button text'],['image','Image URL'],['alt','Image alt text']]
          : [['title','Section heading'],['subtitle','Subtitle']];
        innerContent = `<div class="wp-home-widget-preview" data-home-widget="${homeWidget}" style="${s.background ? `background:${escapeHtml(s.background)};` : ''}${s.textColor ? `color:${escapeHtml(s.textColor)};` : ''}"><button type="button" class="wp-home-edit-widget" data-edit-home-widget="${b.id}">✎ Edit ${homeWidget.replaceAll('-', ' ')}</button><div class="wp-home-widget-badge">Dynamic Home widget</div>${widgetMarkup[homeWidget] || '<p>Home widget</p>'}</div>`;
      } else if (b.type === 'image') {
        const hasImage = Boolean(String(b.src || '').trim());
        const hasAlt = Boolean(b.alt && b.alt.trim());
        const widthVal = b.width ? (parseInt(b.width) || '') : '';
        const currentAlign = b.align || 'center';
        const is25 = b.width === '25%';
        const is50 = b.width === '50%';
        const is75 = b.width === '75%';
        const is100 = !b.width || b.width === '100%';
        innerContent = `
          <div class="wp-image-editor-block" data-image-block-id="${b.id}">
            <!-- Quick Image Control Bar: Alignment & Size Presets -->
            <div class="wp-image-control-bar">
              <div class="wp-image-align-group">
                <button type="button" class="wp-image-ctrl-btn ${currentAlign === 'left' ? 'is-active' : ''}" data-image-align="left" data-block-id="${b.id}" title="Align left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                </button>
                <button type="button" class="wp-image-ctrl-btn ${currentAlign === 'center' ? 'is-active' : ''}" data-image-align="center" data-block-id="${b.id}" title="Align center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                </button>
                <button type="button" class="wp-image-ctrl-btn ${currentAlign === 'right' ? 'is-active' : ''}" data-image-align="right" data-block-id="${b.id}" title="Align right">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
                </button>
              </div>

              <span class="wp-image-ctrl-divider"></span>

              <div class="wp-image-size-presets">
                <button type="button" class="wp-image-size-btn ${is25 ? 'is-active' : ''}" data-image-size="25%" data-block-id="${b.id}">25%</button>
                <button type="button" class="wp-image-size-btn ${is50 ? 'is-active' : ''}" data-image-size="50%" data-block-id="${b.id}">50%</button>
                <button type="button" class="wp-image-size-btn ${is75 ? 'is-active' : ''}" data-image-size="75%" data-block-id="${b.id}">75%</button>
                <button type="button" class="wp-image-size-btn ${is100 ? 'is-active' : ''}" data-image-size="100%" data-block-id="${b.id}">100%</button>
                <button type="button" class="wp-image-size-btn" data-image-size="reset" data-block-id="${b.id}" title="Reset to natural size">Reset</button>
              </div>

              <span class="wp-image-ctrl-divider"></span>

              <div class="wp-image-custom-width-wrap" title="Custom image width in pixels">
                <span class="wp-image-width-icon">↔</span>
                <input type="number" class="wp-image-width-input" data-image-width-id="${b.id}" value="${widthVal}" placeholder="Auto" min="60" max="1400" step="10">
                <span class="wp-image-width-unit">px</span>
              </div>
            </div>

            ${hasImage ? `
            <div class="wp-image-actions" aria-label="Image actions">
              <button type="button" class="wp-image-action-btn" data-change-block-image="${b.id}">Change image</button>
              <button type="button" class="wp-image-action-btn is-danger" data-remove-block-image="${b.id}">Remove image</button>
            </div>

            <!-- Resizable Image Preview Container -->
            <div class="wp-image-preview-wrap align-${currentAlign}" data-block-id="${b.id}">
              <div class="wp-image-resizer-box" style="${b.width ? `width:${b.width}; max-width:100%;` : ''}">
                <img src="${escapeHtml(b.src)}" class="wp-image-preview" alt="${escapeHtml(b.alt || '')}">
                
                <!-- Manual Drag Resize Handles -->
                <div class="wp-image-resize-handle handle-e" data-handle="right" data-block-id="${b.id}" title="Drag to resize width"></div>
                <div class="wp-image-resize-handle handle-se" data-handle="corner" data-block-id="${b.id}" title="Drag corner to resize"></div>
                <div class="wp-image-resize-handle handle-s" data-handle="bottom" data-block-id="${b.id}" title="Drag to resize"></div>
                <div class="wp-image-resize-handle handle-w" data-handle="left" data-block-id="${b.id}" title="Drag to resize width"></div>
                
                <!-- Floating Real-Time Dimension Tooltip -->
                <div class="wp-image-size-tooltip" id="wp-img-tooltip-${b.id}"></div>
              </div>
              <div contenteditable="true" class="wp-block-editable wp-block-caption" data-placeholder="Write caption (optional)…" style="margin-top:8px; font-size:12.5px; color:#64748b; text-align:center;">${escapeHtml(b.caption || '')}</div>
            </div>

            <!-- Alternative Text Box -->
            <div class="wp-image-alt-box">
              <div class="wp-image-alt-header">
                <div class="wp-image-alt-title-group">
                  <span class="wp-image-alt-badge">ALT</span>
                  <span class="wp-image-alt-label">Alternative Text</span>
                  <span class="wp-image-alt-hint">Describes image content for SEO & screen readers</span>
                </div>
                <span class="wp-image-alt-status ${hasAlt ? 'is-filled' : 'is-required'}" id="wp-alt-status-${b.id}">
                  ${hasAlt ? `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Added</span>
                  ` : `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>Required</span>
                  `}
                </span>
              </div>
              <div class="wp-image-alt-input-wrapper">
                <span class="wp-image-alt-input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
                <input type="text" class="wp-image-alt-input" data-image-alt-id="${b.id}" value="${escapeHtml(b.alt || '')}" required placeholder="Describe what is in this image (e.g. Graduation cap resting on gold coins)">
                <button type="button" class="wp-image-alt-clear-btn" data-clear-alt="${b.id}" title="Clear alt text" style="${hasAlt ? '' : 'display:none;'}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            ` : `
            <button type="button" class="wp-image-empty-state" data-change-block-image="${b.id}">
              <span class="wp-image-empty-icon" aria-hidden="true">▧</span>
              <strong>Upload or choose image</strong>
              <small>Click to select an image from your device</small>
            </button>
            `}
            <input type="file" data-block-image-file="${b.id}" accept="image/*" hidden>
          </div>
        `;
      } else if (b.type === 'toc') {
        const isNumbered = (b.listStyle === 'numbered' || b.listStyle === 'ol' || /<ol\b/i.test(b.content || ''));
        b.listStyle = isNumbered ? 'numbered' : 'bullet';
        innerContent = `
          <div class="wp-toc-editor-block">
            <div class="wp-toc-editor-header">
              <div class="wp-toc-header-left">
                <span class="wp-toc-editor-label">TABLE OF CONTENTS</span>
              </div>
              <div class="wp-toc-header-controls">
                <div class="wp-toc-type-toggle" role="group" aria-label="Table of Contents format">
                  <button type="button" class="wp-toc-type-btn ${!isNumbered ? 'is-active' : ''}" data-toc-style="bullet" data-block-id="${b.id}" title="Display as Bullet Points">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="4" cy="6" r="3"/><circle cx="4" cy="12" r="3"/><circle cx="4" cy="18" r="3"/><rect x="10" y="4.5" width="12" height="3" rx="1.5"/><rect x="10" y="10.5" width="12" height="3" rx="1.5"/><rect x="10" y="16.5" width="12" height="3" rx="1.5"/></svg>
                    <span>Bullets</span>
                  </button>
                  <button type="button" class="wp-toc-type-btn ${isNumbered ? 'is-active' : ''}" data-toc-style="numbered" data-block-id="${b.id}" title="Display as Numbered List">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 4.5h1.5v6M2 10.5h3.5M2 16c.4-.8 1.1-1.5 2-1.5s1.8.6 1.8 1.4c0 1.2-1.8 2-2.3 2.6H6"/><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/></svg>
                    <span>Numbered</span>
                  </button>
                </div>
                <button type="button" class="wp-toc-refresh-btn" data-toc-refresh="${b.id}" title="Re-scan and update headings from post">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                  <span>Sync</span>
                </button>
              </div>
            </div>
            <${b.titleLevel || 'h2'} class="wp-toc-title" contenteditable="true">${escapeHtml(b.title || 'Table of Contents')}</${b.titleLevel || 'h2'}>
            <div class="wp-block-editable wp-toc-editable ${isNumbered ? 'is-numbered' : 'is-bullet'}" contenteditable="true" data-block-id="${b.id}" data-placeholder="Add section links…">${b.content || buildTableOfContents(b)}</div>
          </div>`;
      } else if (b.type === 'faq') {
        const items = Array.isArray(b.items) && b.items.length ? b.items : [{ question: '', answer: '' }];
        b.items = items;
        innerContent = `<div class="wp-faq-editor-block">
          ${items.map((item, index) => `<div class="wp-faq-editor-item" data-faq-index="${index}">
            <div class="wp-faq-question-row">
              <div class="wp-faq-question wp-block-editable" contenteditable="true" data-block-id="${b.id}" data-faq-question="${index}" data-placeholder="Enter question">${item.question || ''}</div>
              <button type="button" class="wp-faq-delete-btn" data-delete-faq="${index}" title="Delete this FAQ" aria-label="Delete this FAQ">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            <div class="wp-faq-answer wp-block-editable" contenteditable="true" data-block-id="${b.id}" data-faq-answer="${index}" data-placeholder="Enter answer">${item.answer || ''}</div>
          </div>`).join('')}
          <button type="button" class="wp-faq-add-btn" data-add-faq="${b.id}"><span>+</span> Add new FAQ</button>
        </div>`;
      } else if (b.type === 'table') {
        const rows = ensureTableData(b);
        innerContent = `<div class="wp-table-editor-block">
          <div class="wp-table-scroll"><table class="wp-editable-table"><tbody>${rows.map((row, rowIndex) => `<tr>${row.map((cell, colIndex) => `<${rowIndex === 0 ? 'th' : 'td'} contenteditable="true" data-table-cell="${b.id}" data-row="${rowIndex}" data-col="${colIndex}" data-placeholder="${rowIndex === 0 ? 'Column heading' : 'Enter value'}">${cell}</${rowIndex === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>
          <div class="wp-table-controls">
            <button type="button" data-table-action="add-row" data-table-id="${b.id}">+ Add row</button>
            <button type="button" data-table-action="add-column" data-table-id="${b.id}">+ Add column</button>
            <button type="button" data-table-action="remove-row" data-table-id="${b.id}" ${rows.length <= 1 ? 'disabled' : ''}>− Remove row</button>
            <button type="button" data-table-action="remove-column" data-table-id="${b.id}" ${rows[0].length <= 1 ? 'disabled' : ''}>− Remove column</button>
          </div>
        </div>`;
      } else if (b.type === 'separator') {
        innerContent = `<hr style="border:none; border-top:1px solid #cbd5e1; margin:18px auto; width:120px;">`;
      } else if (b.type === 'list') {
        const raw = String(b.content || '');
        const listItems = /<li\b/i.test(raw)
          ? raw.replace(/^\s*<\/?(?:ul|ol)[^>]*>/gi, '').replace(/<\/?(?:ul|ol)>\s*$/gi, '')
          : raw.split(/<br\s*\/?\s*>|\n/i).map(item => item.replace(/^\s*[•\-*]\s*/, '').trim()).filter(Boolean).map(item => `<li>${item}</li>`).join('');
        innerContent = `<ul class="wp-block-editable wp-editor-bullet-list" contenteditable="true" data-block-id="${b.id}" data-placeholder="List item">${listItems || '<li>List item</li>'}</ul>`;
      } else {
        innerContent = `<div class="wp-block-editable" contenteditable="true" data-placeholder="${placeholder}" data-block-id="${b.id}">${b.content || ''}</div>`;
      }

      return `
        <div class="wp-block-wrapper ${typeClass} ${isActive ? 'is-active' : ''} ${b.width ? `is-${b.width}` : ''}" data-block-id="${b.id}" data-type="${b.type}" data-level="${b.level || 'h2'}" style="${b.align ? `text-align:${b.align};` : ''}">
          <div class="wp-block-mover" role="group" aria-label="Move block">
            <button type="button" class="wp-block-move-btn wp-block-move-up" data-move-up="${b.id}" title="Move up" aria-label="Move block up" ${blockIndex === 0 ? 'disabled' : ''}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button type="button" class="wp-block-drag-handle" draggable="true" data-drag-block="${b.id}" title="Drag to move" aria-label="Drag to reorder block">
              <svg width="14" height="18" viewBox="0 0 16 20" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="4" r="1.8"/>
                <circle cx="11" cy="4" r="1.8"/>
                <circle cx="5" cy="10" r="1.8"/>
                <circle cx="11" cy="10" r="1.8"/>
                <circle cx="5" cy="16" r="1.8"/>
                <circle cx="11" cy="16" r="1.8"/>
              </svg>
            </button>
            <button type="button" class="wp-block-move-btn wp-block-move-down" data-move-down="${b.id}" title="Move down" aria-label="Move block down" ${blockIndex === postBlocks.length - 1 ? 'disabled' : ''}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          ${innerContent}
          <button type="button" class="wp-block-delete-btn" data-delete-block="${b.id}" title="Delete block" aria-label="Delete this block">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <span class="wp-block-delete-tooltip">Delete block</span>
          </button>
          <button type="button" class="wp-block-add-btn" data-after-id="${b.id}" title="Add block">+</button>
        </div>
      `;
    }).join('');

    // Attach block event listeners
    container.querySelectorAll('.wp-block-editable').forEach(el => {
      el.addEventListener('focus', () => {
        const id = el.dataset.blockId || el.closest('.wp-block-wrapper')?.dataset.blockId;
        setActiveBlock(id);
      });

      el.addEventListener('input', () => {
        const id = el.dataset.blockId || el.closest('.wp-block-wrapper')?.dataset.blockId;
        const blk = postBlocks.find(x => x.id === id);
        if (blk) {
          if (blk.type === 'faq') {
            const itemWrap = el.closest('.wp-faq-editor-item');
            const idx = Number(itemWrap?.dataset.faqIndex ?? el.dataset.faqQuestion ?? el.dataset.faqAnswer);
            if (blk.items?.[idx]) {
              if (el.hasAttribute('data-faq-question') || el.classList.contains('wp-faq-question')) {
                blk.items[idx].question = el.innerHTML;
              } else {
                blk.items[idx].answer = el.innerHTML;
              }
            }
          } else if (blk.type === 'image' && el.classList.contains('wp-block-caption')) {
            blk.caption = el.textContent;
          } else {
            blk.content = el.innerHTML;
          }
          isPostDirty = true;
        }
        updateRankMathScore();
      });

      el.addEventListener('paste', event => {
        if (el.closest('.wp-faq-editor-block') || el.classList.contains('wp-block-caption') || el.classList.contains('wp-toc-editable')) return;
        const clipboard = event.clipboardData;
        const html = clipboard?.getData('text/html') || '';
        const plain = clipboard?.getData('text/plain') || '';
        const looksStructured = /<(?:h[1-6]|p|div|ul|ol|table|blockquote|img)\b/i.test(html) || plain.includes('\n');
        if (!looksStructured) return;
        const imported = smartPastedBlocks(html, plain);
        if (!imported.length) return;
        event.preventDefault();
        const currentId = el.dataset.blockId || el.closest('.wp-block-wrapper')?.dataset.blockId;
        const index = postBlocks.findIndex(block => block.id === currentId);
        const current = postBlocks[index];
        const isEmpty = current && !String(current.content || '').replace(/<[^>]+>/g, '').trim();
        if (index >= 0) postBlocks.splice(index + (isEmpty ? 0 : 1), isEmpty ? 1 : 0, ...imported);
        else postBlocks.push(...imported);
        activeBlockId = imported[0].id;
        isPostDirty = true;
        recordPostHistory();
        renderGutenbergBlocks();
        updateRankMathScore();
        setTimeout(() => document.querySelector(`.wp-block-wrapper[data-block-id="${imported[0].id}"] .wp-block-editable`)?.focus(), 0);
      });

      el.addEventListener('keydown', (e) => {
        if (el.classList.contains('wp-faq-question') && e.key === 'Enter') {
          e.preventDefault();
          const itemWrap = el.closest('.wp-faq-editor-item');
          itemWrap?.querySelector('.wp-faq-answer')?.focus();
          return;
        }
        if (e.key === '/' && el.textContent.trim() === '' && !el.closest('.wp-faq-editor-block')) {
          const wrapper = el.closest('.wp-block-wrapper');
          showQuickInserter(wrapper);
        } else if (e.key === 'Enter' && !e.shiftKey && el.closest('.wp-block-wrapper')?.dataset.type === 'paragraph') {
          e.preventDefault();
          const wrapper = el.closest('.wp-block-wrapper');
          const afterId = wrapper?.dataset.blockId;
          addGutenbergBlock('paragraph', '', afterId);
        }
      });
    });

    container.querySelectorAll('.wp-block-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = btn.closest('.wp-block-wrapper');
        showQuickInserter(wrapper);
      });
    });

    container.querySelectorAll('[data-widget-field]').forEach(input => {
      input.addEventListener('input', () => {
        const block = postBlocks.find(item => item.id === input.dataset.widgetBlock);
        if (!block) return;
        block.settings = { ...(block.settings || {}), [input.dataset.widgetField]: input.value };
        isPostDirty = true;
      });
      input.addEventListener('change', () => renderGutenbergBlocks());
      input.addEventListener('focus', () => setActiveBlock(input.dataset.widgetBlock));
    });

    container.querySelectorAll('[data-edit-home-widget]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const block = postBlocks.find(item => item.id === button.dataset.editHomeWidget);
        if (block) showHomeWidgetInspector(block);
      });
    });
    container.querySelectorAll('.wp-home-widget-preview').forEach(preview => {
      preview.addEventListener('click', () => {
        const block = postBlocks.find(item => item.id === preview.closest('.wp-block-wrapper')?.dataset.blockId);
        if (block) showHomeWidgetInspector(block);
      });
    });

    container.querySelectorAll('[data-move-up]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const id = btn.dataset.moveUp;
        const index = postBlocks.findIndex(x => x.id === id);
        if (index > 0) {
          const [moved] = postBlocks.splice(index, 1);
          postBlocks.splice(index - 1, 0, moved);
          activeBlockId = moved.id;
          renderGutenbergBlocks();
          updateRankMathScore();
          container.querySelector(`.wp-block-wrapper[data-block-id="${moved.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    container.querySelectorAll('[data-move-down]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const id = btn.dataset.moveDown;
        const index = postBlocks.findIndex(x => x.id === id);
        if (index >= 0 && index < postBlocks.length - 1) {
          const [moved] = postBlocks.splice(index, 1);
          postBlocks.splice(index + 1, 0, moved);
          activeBlockId = moved.id;
          renderGutenbergBlocks();
          updateRankMathScore();
          container.querySelector(`.wp-block-wrapper[data-block-id="${moved.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    let draggedBlockId = null;
    container.querySelectorAll('[data-drag-block]').forEach(handle => {
      handle.addEventListener('dragstart', event => {
        draggedBlockId = handle.dataset.dragBlock;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', draggedBlockId);
        handle.closest('.wp-block-wrapper')?.classList.add('is-dragging');
      });
      handle.addEventListener('dragend', () => {
        draggedBlockId = null;
        container.querySelectorAll('.wp-block-wrapper').forEach(wrapper => wrapper.classList.remove('is-dragging', 'drag-before', 'drag-after'));
      });
      handle.addEventListener('keydown', event => {
        if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const from = postBlocks.findIndex(block => block.id === handle.dataset.dragBlock);
        const to = event.key === 'ArrowUp' ? from - 1 : from + 1;
        if (from < 0 || to < 0 || to >= postBlocks.length) return;
        [postBlocks[from], postBlocks[to]] = [postBlocks[to], postBlocks[from]];
        renderGutenbergBlocks();
        container.querySelector(`[data-drag-block="${handle.dataset.dragBlock}"]`)?.focus();
      });
    });
    container.querySelectorAll('.wp-block-wrapper').forEach(wrapper => {
      wrapper.addEventListener('dragover', event => {
        if (!draggedBlockId || draggedBlockId === wrapper.dataset.blockId) return;
        event.preventDefault();
        const before = event.clientY < wrapper.getBoundingClientRect().top + wrapper.offsetHeight / 2;
        wrapper.classList.toggle('drag-before', before);
        wrapper.classList.toggle('drag-after', !before);
        event.dataTransfer.dropEffect = 'move';
      });
      wrapper.addEventListener('dragleave', () => wrapper.classList.remove('drag-before', 'drag-after'));
      wrapper.addEventListener('drop', event => {
        if (!draggedBlockId || draggedBlockId === wrapper.dataset.blockId) return;
        event.preventDefault();
        const sourceIndex = postBlocks.findIndex(block => block.id === draggedBlockId);
        let targetIndex = postBlocks.findIndex(block => block.id === wrapper.dataset.blockId);
        if (sourceIndex < 0 || targetIndex < 0) return;
        const before = event.clientY < wrapper.getBoundingClientRect().top + wrapper.offsetHeight / 2;
        const [moved] = postBlocks.splice(sourceIndex, 1);
        targetIndex = postBlocks.findIndex(block => block.id === wrapper.dataset.blockId);
        postBlocks.splice(before ? targetIndex : targetIndex + 1, 0, moved);
        activeBlockId = moved.id;
        renderGutenbergBlocks();
        updateRankMathScore();
      });
    });
    container.querySelectorAll('[data-delete-block]').forEach(btn => {
      btn.addEventListener('click', async event => {
        event.stopPropagation();
        const block = postBlocks.find(item => item.id === btn.dataset.deleteBlock);
        if (!block) return;
        const blockLabels = {
          toc: 'Table of Contents',
          heading: 'Heading',
          paragraph: 'Paragraph',
          image: 'Image',
          quote: 'Quote',
          list: 'List',
          code: 'Code Block',
          table: 'Table',
          faq: 'FAQ Block',
          separator: 'Separator'
        };
        const label = blockLabels[block.type] || `${block.type} block`;
        const confirmed = await showAdminConfirmModal({
          title: `Delete ${label}?`,
          message: `Are you sure you want to remove this ${label.toLowerCase()} from your article? This action cannot be undone.`,
          confirmText: 'Delete block',
          cancelText: 'Cancel',
          danger: true
        });
        if (!confirmed) return;
        postBlocks = postBlocks.filter(item => item.id !== block.id);
        activeBlockId = postBlocks[0]?.id || null;
        renderGutenbergBlocks();
        updateRankMathScore();
      });
    });
    container.querySelectorAll('[data-table-cell]').forEach(cell => {
      cell.addEventListener('input', () => {
        const block = postBlocks.find(item => item.id === cell.dataset.tableCell && item.type === 'table');
        if (!block) return;
        const rows = ensureTableData(block);
        rows[Number(cell.dataset.row)][Number(cell.dataset.col)] = cell.innerHTML;
        updateRankMathScore();
      });
      cell.addEventListener('focus', () => setActiveBlock(cell.dataset.tableCell));
    });
    container.querySelectorAll('[data-table-action]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const block = postBlocks.find(item => item.id === btn.dataset.tableId && item.type === 'table');
        if (!block) return;
        const rows = ensureTableData(block);
        const action = btn.dataset.tableAction;
        if (action === 'add-row') rows.push(Array(rows[0].length).fill(''));
        if (action === 'add-column') rows.forEach(row => row.push(''));
        if (action === 'remove-row' && rows.length > 1) rows.pop();
        if (action === 'remove-column' && rows[0].length > 1) rows.forEach(row => row.pop());
        renderGutenbergBlocks();
        updateRankMathScore();
      });
    });
    container.querySelectorAll('[data-faq-question], [data-faq-answer]').forEach(field => {
      field.addEventListener('focus', () => {
        const wrapper = field.closest('.wp-block-wrapper');
        if (wrapper?.dataset.blockId) setActiveBlock(wrapper.dataset.blockId);
      });
      field.addEventListener('input', () => {
        const wrapper = field.closest('.wp-block-wrapper');
        const block = postBlocks.find(item => item.id === wrapper?.dataset.blockId && item.type === 'faq');
        const index = Number(field.dataset.faqQuestion ?? field.dataset.faqAnswer);
        if (!block?.items?.[index]) return;
        if (field.hasAttribute('data-faq-question')) block.items[index].question = field.innerHTML;
        else block.items[index].answer = field.innerHTML;
        isPostDirty = true;
        updateRankMathScore();
      });
    });
    container.querySelectorAll('[data-delete-faq]').forEach(btn => {
      btn.addEventListener('click', async event => {
        event.stopPropagation();
        const wrapper = btn.closest('.wp-block-wrapper');
        const block = postBlocks.find(item => item.id === wrapper?.dataset.blockId && item.type === 'faq');
        const index = Number(btn.dataset.deleteFaq);
        if (!block?.items?.[index]) return;
        const confirmed = await showAdminConfirmModal({
          title: 'Delete FAQ Item?',
          message: 'Are you sure you want to remove this FAQ item? This action cannot be undone.',
          confirmText: 'Delete item',
          cancelText: 'Cancel',
          danger: true
        });
        if (!confirmed) return;
        block.items.splice(index, 1);
        renderGutenbergBlocks();
        updateRankMathScore();
      });
    });
    container.querySelectorAll('[data-add-faq]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const block = postBlocks.find(item => item.id === btn.dataset.addFaq && item.type === 'faq');
        if (!block) return;
        block.items = Array.isArray(block.items) ? block.items : [];
        block.items.push({ question: '', answer: '' });
        renderGutenbergBlocks();
        container.querySelector(`[data-block-id="${block.id}"] [data-faq-question="${block.items.length - 1}"]`)?.focus();
      });
    });
    container.querySelectorAll('[data-image-alt-id]').forEach(input => {
      const syncAltText = () => {
        const block = postBlocks.find(item => item.id === input.dataset.imageAltId && item.type === 'image');
        if (!block) return;
        block.alt = input.value.trim();
        markPostDirty();
        input.classList.toggle('is-invalid', !block.alt);

        const statusEl = document.getElementById(`wp-alt-status-${block.id}`);
        const clearBtn = input.parentElement?.querySelector('.wp-image-alt-clear-btn');
        if (block.alt) {
          if (statusEl) {
            statusEl.className = 'wp-image-alt-status is-filled';
            statusEl.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Added</span>
            `;
          }
          if (clearBtn) clearBtn.style.display = 'inline-flex';
        } else {
          if (statusEl) {
            statusEl.className = 'wp-image-alt-status is-required';
            statusEl.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Required</span>
            `;
          }
          if (clearBtn) clearBtn.style.display = 'none';
        }
      };
      input.addEventListener('input', syncAltText);
      input.addEventListener('change', syncAltText);
      input.addEventListener('blur', syncAltText);
    });
    container.querySelectorAll('[data-clear-alt]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const id = btn.dataset.clearAlt;
        const block = postBlocks.find(item => item.id === id && item.type === 'image');
        const input = container.querySelector(`[data-image-alt-id="${id}"]`);
        if (!block || !input) return;
        block.alt = '';
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    });

    container.querySelectorAll('[data-change-block-image]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        showBlockImageSourceChooser(btn.dataset.changeBlockImage);
      });
    });
    container.querySelectorAll('[data-block-image-file]').forEach(input => {
      input.addEventListener('change', event => {
        const file = event.target.files?.[0];
        const block = postBlocks.find(item => item.id === input.dataset.blockImageFile && item.type === 'image');
        if (!file || !block) return;
        const reader = new FileReader();
        reader.onload = loadEvent => {
          block.src = String(loadEvent.target?.result || '');
          block.alt = '';
          isPostDirty = true;
          renderGutenbergBlocks();
        };
        reader.readAsDataURL(file);
      });
    });
    container.querySelectorAll('[data-remove-block-image]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const block = postBlocks.find(item => item.id === btn.dataset.removeBlockImage && item.type === 'image');
        if (!block) return;
        block.src = '';
        block.alt = '';
        block.caption = '';
        block.width = '';
        isPostDirty = true;
        renderGutenbergBlocks();
      });
    });

    // Image Resize Handles (Manual Dragging)
    container.querySelectorAll('.wp-image-resize-handle').forEach(handle => {
      handle.addEventListener('pointerdown', event => {
        event.preventDefault();
        event.stopPropagation();

        const blockId = handle.dataset.blockId;
        const blk = postBlocks.find(item => item.id === blockId);
        if (!blk) return;

        const resizerBox = handle.closest('.wp-image-resizer-box');
        const previewWrap = handle.closest('.wp-image-preview-wrap');
        const tooltip = document.getElementById(`wp-img-tooltip-${blockId}`);
        const img = resizerBox?.querySelector('.wp-image-preview');
        const widthInput = container.querySelector(`[data-image-width-id="${blockId}"]`);
        if (!resizerBox || !previewWrap || !img) return;

        setActiveBlock(blockId);

        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = resizerBox.offsetWidth;
        const startHeight = resizerBox.offsetHeight;
        const parentWidth = previewWrap.offsetWidth || 800;
        const aspectRatio = (img.naturalWidth && img.naturalHeight)
          ? (img.naturalHeight / img.naturalWidth)
          : (startHeight > 0 && startWidth > 0 ? startHeight / startWidth : 0.66);
        const handleType = handle.dataset.handle; // 'right', 'left', 'corner', 'bottom'

        resizerBox.classList.add('is-resizing');
        if (tooltip) tooltip.style.display = 'block';

        let lastWidth = startWidth;

        function onPointerMove(moveEvent) {
          moveEvent.preventDefault();
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          let newWidth = startWidth;

          if (handleType === 'right' || handleType === 'corner') {
            newWidth = startWidth + deltaX;
          } else if (handleType === 'left') {
            newWidth = startWidth - deltaX;
          } else if (handleType === 'bottom') {
            const newHeight = Math.max(50, startHeight + deltaY);
            newWidth = aspectRatio > 0 ? (newHeight / aspectRatio) : startWidth;
          }

          newWidth = Math.max(100, Math.min(newWidth, parentWidth));
          lastWidth = Math.round(newWidth);
          const estHeight = Math.round(lastWidth * (aspectRatio || 0.66));
          const pct = Math.round((lastWidth / parentWidth) * 100);

          resizerBox.style.width = `${lastWidth}px`;

          if (tooltip) {
            tooltip.textContent = `${lastWidth} × ${estHeight} px (${pct}%)`;
          }

          if (widthInput) {
            widthInput.value = lastWidth;
          }

          container.querySelectorAll(`[data-image-size][data-block-id="${blockId}"]`).forEach(btn => {
            btn.classList.remove('is-active');
          });
        }

        function onPointerUp() {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          resizerBox.classList.remove('is-resizing');
          if (tooltip) tooltip.style.display = 'none';

          blk.width = `${lastWidth}px`;
          updateRankMathScore();
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
      });
    });

    // Image Size Preset Buttons (25%, 50%, 75%, 100%, Reset)
    container.querySelectorAll('[data-image-size]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const blockId = btn.dataset.blockId;
        const size = btn.dataset.imageSize;
        const blk = postBlocks.find(item => item.id === blockId);
        if (!blk) return;

        const resizerBox = container.querySelector(`.wp-block-wrapper[data-block-id="${blockId}"] .wp-image-resizer-box`);
        const widthInput = container.querySelector(`[data-image-width-id="${blockId}"]`);

        container.querySelectorAll(`[data-image-size][data-block-id="${blockId}"]`).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        if (size === 'reset') {
          delete blk.width;
          if (resizerBox) resizerBox.style.width = '';
          if (widthInput) widthInput.value = '';
        } else {
          blk.width = size;
          if (resizerBox) resizerBox.style.width = size;
          if (widthInput) {
            const previewWrap = resizerBox?.closest('.wp-image-preview-wrap');
            const parentW = previewWrap?.offsetWidth || 800;
            const pctVal = parseInt(size, 10) / 100;
            widthInput.value = Math.round(parentW * pctVal);
          }
        }
        updateRankMathScore();
      });
    });

    // Image Custom Width Input (px)
    container.querySelectorAll('[data-image-width-id]').forEach(input => {
      input.addEventListener('input', () => {
        const blockId = input.dataset.imageWidthId;
        const blk = postBlocks.find(item => item.id === blockId);
        if (!blk) return;

        const val = parseInt(input.value, 10);
        const resizerBox = container.querySelector(`.wp-block-wrapper[data-block-id="${blockId}"] .wp-image-resizer-box`);

        if (val && val >= 50) {
          blk.width = `${val}px`;
          if (resizerBox) resizerBox.style.width = `${val}px`;
        } else if (!input.value.trim()) {
          delete blk.width;
          if (resizerBox) resizerBox.style.width = '';
        }

        container.querySelectorAll(`[data-image-size][data-block-id="${blockId}"]`).forEach(b => b.classList.remove('is-active'));
        updateRankMathScore();
      });
    });

    // Image Alignment Buttons (Left, Center, Right)
    container.querySelectorAll('[data-image-align]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const blockId = btn.dataset.blockId;
        const align = btn.dataset.imageAlign;
        const blk = postBlocks.find(item => item.id === blockId);
        if (!blk) return;

        blk.align = align;
        const previewWrap = container.querySelector(`.wp-block-wrapper[data-block-id="${blockId}"] .wp-image-preview-wrap`);
        if (previewWrap) {
          previewWrap.classList.remove('align-left', 'align-center', 'align-right');
          previewWrap.classList.add(`align-${align}`);
        }

        container.querySelectorAll(`[data-image-align][data-block-id="${blockId}"]`).forEach(b => {
          b.classList.toggle('is-active', b.dataset.imageAlign === align);
        });

        updateRankMathScore();
      });
    });

    container.querySelectorAll('.wp-block-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', event => {
        if (event.target.closest('.wp-block-add-btn')) return;
        setActiveBlock(wrapper.dataset.blockId);
      });
    });
    container.querySelectorAll('.wp-toc-title').forEach(title => {
      title.addEventListener('input', () => {
        const id = title.closest('.wp-block-wrapper')?.dataset.blockId;
        const block = postBlocks.find(item => item.id === id && item.type === 'toc');
        if (block) block.title = title.textContent.trim();
      });
    });

    container.querySelectorAll('[data-toc-style]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const blockId = btn.dataset.blockId;
        const style = btn.dataset.tocStyle;
        if (blockId && style) {
          setTocListStyle(blockId, style);
        }
      });
    });

    container.querySelectorAll('[data-toc-refresh]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const block = postBlocks.find(item => item.id === btn.dataset.tocRefresh && item.type === 'toc');
        if (!block) return;
        block.content = buildTableOfContents(block);
        renderGutenbergBlocks();
        setActiveBlock(block.id);
        updateRankMathScore();
      });
    });
    recordPostHistory();
  }

  function setTocListStyle(blockId, targetStyle) {
    const block = postBlocks.find(item => item.id === blockId && item.type === 'toc');
    if (!block) return;
    block.listStyle = targetStyle;
    if (block.content && (block.content.includes('<ul') || block.content.includes('<ol>'))) {
      const isNum = (targetStyle === 'numbered');
      if (isNum) {
        block.content = block.content.replace(/<ul\b([^>]*)>/gi, '<ol$1>').replace(/<\/ul>/gi, '</ol>');
      } else {
        block.content = block.content.replace(/<ol\b([^>]*)>/gi, '<ul$1>').replace(/<\/ol>/gi, '</ul>');
      }
    } else {
      block.content = buildTableOfContents(block);
    }
    renderGutenbergBlocks();
    setActiveBlock(block.id);
    updateRankMathScore();
  }

  function buildTableOfContents(tocBlock = {}) {
    const isNumbered = (tocBlock.listStyle === 'numbered' || tocBlock.listStyle === 'ol' || /<ol\b/i.test(tocBlock.content || ''));
    const tag = isNumbered ? 'ol' : 'ul';
    const included = tocBlock.includedHeadings || ['h1', 'h2', 'h3'];
    const headings = postBlocks.filter(block => block.type === 'heading' && included.includes(block.level || 'h2') && String(block.content || '').trim());
    if (!headings.length) return `<${tag}><li><a href="#section">Section heading</a></li></${tag}>`;

    const root = [];
    const stack = [{ level: 0, children: root }];
    headings.forEach(block => {
      let label = String(block.content || '').replace(/<[^>]+>/g, '').trim();
      const anchor = label.toLowerCase().replace(/&amp;/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      const level = Number.parseInt(String(block.level || 'h2').slice(1), 10) || 2;
      if (isNumbered) {
        label = label.replace(/^\d+[\.\)]\s+/, '');
      }
      while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
      const node = { level, label, anchor, children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    });

    const renderItems = items => `<${tag}>${items.map(item => `<li data-heading-level="h${item.level}"><a href="#${item.anchor}">${escapeHtml(item.label)}</a>${item.children.length ? renderItems(item.children) : ''}</li>`).join('')}</${tag}>`;
    return renderItems(root);
  }

  function setActiveBlock(id) {
    activeBlockId = id;
    const blk = postBlocks.find(x => x.id === id);
    const container = document.getElementById('wp-blocks-container');
    if (container) {
      container.querySelectorAll('.wp-block-wrapper').forEach(w => {
        w.classList.toggle('is-active', w.dataset.blockId === id);
      });
    }

    const footerBlock = document.getElementById('wp-footer-current-block');
    if (footerBlock) {
      footerBlock.textContent = blk ? (blk.type.charAt(0).toUpperCase() + blk.type.slice(1)) : 'Paragraph';
    }

    if (blk) {
      if (blk.type.startsWith('home-')) showHomeWidgetInspector(blk);
      const iconSvgMap = {
        paragraph: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>`,
        heading: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12h12M6 4v16M18 4v16"/></svg>`,
        list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
        quote: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
        code: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
        image: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
        table: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
        toc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>`,
        separator: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`
      };
      const titleMap = { paragraph: 'Paragraph', heading: 'Heading', list: 'List', quote: 'Quote', code: 'Code', image: 'Image', table: 'Table', toc: 'Table of Contents', separator: 'Separator', 'home-hero': 'Hero Search', 'home-categories': 'Job Categories', 'home-how-it-works': 'How It Works', 'home-articles': 'Recent Articles' };
      const descMap = {
        paragraph: 'Start with the basic building block of all narrative.',
        heading: 'Introduce new sections and organize content structure.',
        list: 'Create an ordered or unordered list of items.',
        quote: 'Highlight a quotation or statement from an authority.',
        code: 'Display code snippets that preserve spacing and formatting.',
        image: 'Insert an illustration or photograph to enrich the story.',
        table: 'Organize data and structured information in columns.',
        toc: 'Create linked navigation from the headings in this article.',
        separator: 'Create a break between sections of content.'
        , 'home-hero': 'Live homepage hero, illustration, and job search form.'
        , 'home-categories': 'Live category grid populated from current job data.'
        , 'home-how-it-works': 'Three illustrated steps explaining how the service works.'
        , 'home-articles': 'Latest published articles, including their images and links.'
      };

      const titleEl = document.getElementById('wp-active-block-title');
      const iconEl = document.getElementById('wp-active-block-icon');
      const descEl = document.getElementById('wp-active-block-desc');
      if (titleEl) titleEl.textContent = titleMap[blk.type] || 'Block';
      if (iconEl) iconEl.innerHTML = iconSvgMap[blk.type] || iconSvgMap.paragraph;
      if (descEl) descEl.textContent = descMap[blk.type] || 'Block settings';
      const tocSettings = document.getElementById('wp-toc-settings');
      if (tocSettings) tocSettings.style.display = blk.type === 'toc' ? 'block' : 'none';
      if (blk.type === 'toc') {
        document.getElementById('wp-tab-block')?.click();
        const titleLevel = document.getElementById('wp-toc-title-level');
        if (titleLevel) titleLevel.value = blk.titleLevel || 'h2';
        const listStyle = document.getElementById('wp-toc-list-style');
        if (listStyle) listStyle.value = blk.listStyle || (/<ol\b/i.test(blk.content || '') ? 'numbered' : 'bullet');
        const included = blk.includedHeadings || ['h1', 'h2', 'h3'];
        document.querySelectorAll('.wp-toc-level-check').forEach(input => { input.checked = !included.includes(input.value); });
      }
    }
  }

  function showHomeWidgetInspector(block) {
    if (!block?.type?.startsWith('home-')) return;
    activeBlockId = block.id;
    const type = block.type.slice(5);
    const defaults = {
      hero: { title: 'Trying to Connect', keyword: 'Job Title, Keywords', location: 'Country or City', category: 'All Categories', button: 'Find Jobs', image: '/assets/hero.webp', alt: 'People from different professions' },
      categories: { title: 'Popular Job Categories', subtitle: 'Find Your Perfect Job Here' },
      'how-it-works': { title: 'How It Works?', subtitle: 'Job for Anyone, Anywhere', step1Title: 'Register an Account to Start', step1Image: '/assets/step-1.jpg', step2Title: 'Explore Over Thousands of Jobs', step2Image: '/assets/step-2.jpg', step3Title: 'Find the Most Suitable Company and Job', step3Image: '/assets/step-3.jpg' },
      articles: { title: 'Recent Articles', subtitle: 'Fresh job related content posted each day.' }
    };
    block.settings = { ...(defaults[type] || {}), ...(block.settings || {}) };
    const s = block.settings;
    const contentFields = type === 'hero'
      ? [['title','Heading'],['keyword','Keyword placeholder'],['location','Location placeholder'],['category','Category placeholder'],['button','Button text'],['image','Hero image URL'],['alt','Image alt text']]
      : type === 'how-it-works'
        ? [['title','Section heading'],['subtitle','Subtitle'],['step1Title','Step 1 title'],['step1Image','Step 1 image'],['step2Title','Step 2 title'],['step2Image','Step 2 image'],['step3Title','Step 3 title'],['step3Image','Step 3 image']]
        : [['title','Section heading'],['subtitle','Subtitle']];
    let inspector = document.getElementById('wp-home-widget-inspector');
    if (!inspector) {
      inspector = document.createElement('aside');
      inspector.id = 'wp-home-widget-inspector';
      document.getElementById('view-post-editor')?.appendChild(inspector);
    }
    inspector.innerHTML = `<div class="wp-elementor-inspector-head"><strong>Edit ${type.replaceAll('-', ' ')}</strong><button type="button" data-close-home-inspector aria-label="Close">×</button></div>
      <div class="wp-elementor-tabs"><button class="is-active" data-inspector-tab="content">✎<span>Content</span></button><button data-inspector-tab="style">◐<span>Style</span></button><button data-inspector-tab="advanced">⚙<span>Advanced</span></button></div>
      <div class="wp-elementor-panel is-active" data-inspector-panel="content"><h3>▾ ${type.replaceAll('-', ' ')}</h3>${contentFields.map(([key,label]) => `<label><span>${label}${key === 'alt' ? ' *' : ''}</span><input type="text" data-inspector-field="${key}" value="${escapeHtml(s[key] || '')}" ${key === 'alt' ? 'required' : ''}></label>`).join('')}</div>
      <div class="wp-elementor-panel" data-inspector-panel="style"><h3>▾ Section Style</h3><label><span>Background color</span><input type="color" data-inspector-field="background" value="${escapeHtml(s.background || '#f4f8ff')}"></label><label><span>Text color</span><input type="color" data-inspector-field="textColor" value="${escapeHtml(s.textColor || '#172033')}"></label></div>
      <div class="wp-elementor-panel" data-inspector-panel="advanced"><h3>▾ Advanced</h3><label><span>CSS class name</span><input type="text" data-inspector-field="className" value="${escapeHtml(s.className || '')}" placeholder="Optional class name"></label></div>`;
    document.getElementById('view-post-editor')?.classList.add('has-home-inspector');
    inspector.querySelector('[data-close-home-inspector]')?.addEventListener('click', () => { inspector.remove(); document.getElementById('view-post-editor')?.classList.remove('has-home-inspector'); });
    inspector.querySelectorAll('[data-inspector-tab]').forEach(tab => tab.addEventListener('click', () => {
      inspector.querySelectorAll('[data-inspector-tab]').forEach(item => item.classList.toggle('is-active', item === tab));
      inspector.querySelectorAll('[data-inspector-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.inspectorPanel === tab.dataset.inspectorTab));
    }));
    inspector.querySelectorAll('[data-inspector-field]').forEach(input => input.addEventListener('change', () => {
      block.settings[input.dataset.inspectorField] = input.value;
      isPostDirty = true;
      renderGutenbergBlocks();
      showHomeWidgetInspector(block);
    }));
  }

  function addGutenbergBlock(type, content = '', afterId = null) {
    const isHeading = (type === 'h2' || type === 'h3' || type === 'h4' || type === 'heading');
    const headingLevel = (type === 'h3' ? 'h3' : (type === 'h4' ? 'h4' : 'h2'));
    const newBlock = {
      id: genBlockId(),
      type: isHeading ? 'heading' : type,
      content: content,
      level: isHeading ? headingLevel : undefined,
      src: type === 'image' ? '' : undefined
    };
    if (type === 'toc') {
      newBlock.title = 'Table of Contents';
      newBlock.titleLevel = 'h2';
      newBlock.listStyle = 'bullet';
      newBlock.includedHeadings = ['h1', 'h2', 'h3'];
      newBlock.content = buildTableOfContents(newBlock);
    }
    if (type === 'faq') {
      newBlock.items = [{ question: '', answer: '' }];
    }
    if (type === 'table') {
      newBlock.tableData = [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3']
      ];
    }
    if (type === 'code') {
      newBlock.content = content || '// Type code snippet here';
    }
    if (type === 'quote') {
      newBlock.content = content || 'Write quote text…';
    }
    if (afterId) {
      const idx = postBlocks.findIndex(x => x.id === afterId);
      if (idx !== -1) {
        postBlocks.splice(idx + 1, 0, newBlock);
      } else {
        postBlocks.push(newBlock);
      }
    } else {
      postBlocks.push(newBlock);
    }

    activeBlockId = newBlock.id;
    renderGutenbergBlocks();
    hideQuickInserter();

    setTimeout(() => {
      const el = document.querySelector(`.wp-block-wrapper[data-block-id="${newBlock.id}"] .wp-block-editable`);
      if (el) {
        el.focus();
      }
    }, 50);

    updateRankMathScore();
  }

  function showQuickInserter(wrapperEl) {
    const popover = document.getElementById('wp-quick-inserter-popover');
    if (!popover || !wrapperEl) return;

    popover.dataset.targetAfterId = wrapperEl.dataset.blockId || '';
    popover.classList.remove('is-expanded', 'is-searching');
    const textEl = popover.querySelector('.wp-quick-browse-text');
    if (textEl) textEl.textContent = 'Browse all';
    const iconEl = popover.querySelector('.wp-quick-browse-icon');
    if (iconEl) iconEl.style.transform = 'rotate(0deg)';

    popover.style.display = 'block';

    const canvas = document.getElementById('wp-post-canvas');
    let targetTop = wrapperEl.offsetTop + wrapperEl.offsetHeight + 8;

    // Check if the popover would overflow past the canvas view, and position higher up so it stays completely visible
    if (canvas) {
      const canvasHeight = canvas.clientHeight || window.innerHeight;
      const scrollPos = canvas.scrollTop || 0;
      const visibleBottom = scrollPos + canvasHeight;
      const popoverEstimatedHeight = 310;
      if (targetTop + popoverEstimatedHeight > visibleBottom && wrapperEl.offsetTop > popoverEstimatedHeight + 20) {
        targetTop = Math.max(10, wrapperEl.offsetTop - popoverEstimatedHeight - 8);
      }
    }

    popover.style.top = `${targetTop}px`;
    popover.style.left = `calc(50% - 165px)`;

    const input = document.getElementById('wp-quick-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    document.querySelectorAll('.wp-quick-tile').forEach(t => t.style.display = '');
  }

  function hideQuickInserter() {
    const popover = document.getElementById('wp-quick-inserter-popover');
    if (popover) popover.style.display = 'none';
  }

  function serializeGutenbergBlocks() {
    return postBlocks.map(b => {
      if (b.type.startsWith('home-')) {
        return `<section data-home-widget="${b.type.slice(5)}" data-home-settings="${encodeURIComponent(JSON.stringify(b.settings || {}))}"></section>`;
      }
      if (b.type === 'heading') {
        const lvl = b.level || 'h2';
        const label = String(b.content || '').replace(/<[^>]+>/g, '').trim();
        const anchor = label.toLowerCase().replace(/&amp;/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        return `<${lvl} id="${anchor}">${b.content || ''}</${lvl}>`;
      }
      if (b.type === 'list') {
        const raw = String(b.content || '');
        const items = /<li\b/i.test(raw) ? raw : raw.split(/<br\s*\/?\s*>|\n/i).filter(Boolean).map(x => `<li>${x.replace(/^\s*[•\-\*]\s*/, '')}</li>`).join('');
        return `<ul>${items.replace(/^\s*<\/?(?:ul|ol)[^>]*>/gi, '').replace(/<\/?(?:ul|ol)>\s*$/gi, '')}</ul>`;
      }
      if (b.type === 'quote') {
        return `<blockquote><p>${b.content || ''}</p></blockquote>`;
      }
      if (b.type === 'code') {
        return `<pre><code>${b.content || ''}</code></pre>`;
      }
      if (b.type === 'image') {
        if (!String(b.src || '').trim()) return '';
        const alignClass = b.align ? ` align${b.align}` : ' aligncenter';
        const widthStyle = b.width ? ` style="width:${b.width};"` : '';
        return `<figure class="wp-block-image${alignClass}"><img src="${b.src}" alt="${escapeHtml(b.alt || '')}"${widthStyle}/><figcaption>${b.caption || ''}</figcaption></figure>`;
      }
      if (b.type === 'table') {
        const rows = ensureTableData(b);
        return `<table class="wp-block-table"><thead><tr>${rows[0].map(cell => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      }
      if (b.type === 'toc') {
        const level = b.titleLevel || 'h2';
        const listStyle = b.listStyle || (/<ol\b/i.test(b.content || '') ? 'numbered' : 'bullet');
        const included = (b.includedHeadings || ['h1', 'h2', 'h3']).join(',');
        return `<div class="wp-block-rank-math-toc-block" data-title-level="${level}" data-list-style="${listStyle}" data-included-headings="${included}"><${level}>${escapeHtml(b.title || 'Table of Contents')}</${level}><nav>${b.content || (listStyle === 'numbered' ? '<ol><li><a href="#section">Section</a></li></ol>' : '<ul><li><a href="#section">Section</a></li></ul>')}</nav></div>`;
      }
      if (b.type === 'faq') {
        const items = Array.isArray(b.items) ? b.items : [];
        return `<div class="wp-block-rank-math-faq-block">${items.map(item => `<div class="rank-math-faq-item"><h3 class="rank-math-question">${item.question || ''}</h3><div class="rank-math-answer">${item.answer || ''}</div></div>`).join('')}</div>`;
      }
      if (b.type === 'separator') {
        return `<hr class="wp-block-separator"/>`;
      }
      const blockClass = b.width === 'wide' ? ' class="alignwide"' : (b.width === 'full' ? ' class="alignfull"' : '');
      const blockStyle = b.align ? ` style="text-align:${b.align}"` : '';
      return `<p${blockClass}${blockStyle}>${b.content || ''}</p>`;
    }).join('\n\n');
  }

  function parseGutenbergBlocks(html) {
    if (!html || !html.trim()) {
      return [{ id: genBlockId(), type: 'paragraph', content: '' }];
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const nodes = Array.from(doc.body.children);
      if (nodes.length === 0) {
        return [{ id: genBlockId(), type: 'paragraph', content: html.trim() }];
      }

      return nodes.map(n => {
        const tag = n.tagName.toLowerCase();
        if (n.dataset.homeWidget) {
          let settings = {};
          try { settings = JSON.parse(decodeURIComponent(n.dataset.homeSettings || '%7B%7D')); } catch {}
          return { id: genBlockId(), type: `home-${n.dataset.homeWidget}`, content: '', settings };
        }
        if (n.classList.contains('wp-block-rank-math-faq-block') || n.querySelector('.rank-math-faq-item')) {
          const items = Array.from(n.querySelectorAll('.rank-math-faq-item')).map(item => ({
            question: (item.querySelector('.rank-math-question, h2, h3, h4, strong')?.innerHTML || '').trim().replace(/^New question$/i, ''),
            answer: (item.querySelector('.rank-math-answer')?.innerHTML || '').trim().replace(/^Add the answer here\.$/i, '')
          }));
          return { id: genBlockId(), type: 'faq', items };
        }
        if (n.classList.contains('wp-block-rank-math-toc-block') || n.id === 'rank-math-toc') {
          const nav = n.querySelector('nav');
          const title = n.querySelector('h1,h2,h3,h4,h5,h6');
          const listStyle = n.dataset.listStyle || (nav && nav.querySelector('ol') ? 'numbered' : (n.querySelector('ol') ? 'numbered' : 'bullet'));
          return { id: genBlockId(), type: 'toc', title: title?.textContent || 'Table of Contents', titleLevel: n.dataset.titleLevel || title?.tagName.toLowerCase() || 'h2', listStyle, includedHeadings: (n.dataset.includedHeadings || 'h1,h2,h3').split(','), content: nav ? nav.innerHTML : n.innerHTML };
        }
        if (/^h[1-6]$/.test(tag)) {
          return { id: genBlockId(), type: 'heading', level: tag, content: n.innerHTML };
        }
        if (tag === 'ul' || tag === 'ol') {
          return { id: genBlockId(), type: 'list', content: n.innerHTML };
        }
        if (tag === 'blockquote') {
          return { id: genBlockId(), type: 'quote', content: n.innerHTML };
        }
        if (tag === 'pre') {
          return { id: genBlockId(), type: 'code', content: n.textContent };
        }
        if (tag === 'figure' && n.querySelector('table')) {
          const table = n.querySelector('table');
          const tableData = Array.from(table.querySelectorAll('tr')).map(row => Array.from(row.querySelectorAll('th,td')).map(cell => cell.innerHTML.trim())).filter(row => row.length);
          return { id: genBlockId(), type: 'table', content: table.outerHTML, tableData };
        }
        if (tag === 'figure' || tag === 'img') {
          const img = tag === 'img' ? n : n.querySelector('img');
          const cap = n.querySelector('figcaption');
          let width = '';
          if (img) {
            width = img.style.width || (img.getAttribute('width') ? (img.getAttribute('width').endsWith('%') || img.getAttribute('width').endsWith('px') ? img.getAttribute('width') : img.getAttribute('width') + 'px') : '');
          }
          let align = '';
          if (n.classList.contains('alignleft')) align = 'left';
          else if (n.classList.contains('alignright')) align = 'right';
          else if (n.classList.contains('aligncenter')) align = 'center';
          return {
            id: genBlockId(),
            type: 'image',
            src: img ? (img.getAttribute('src') || '') : '',
            alt: img ? (img.getAttribute('alt') || '') : '',
            caption: cap ? cap.textContent : '',
            width: width,
            align: align
          };
        }
        if (tag === 'hr') {
          return { id: genBlockId(), type: 'separator', content: '' };
        }
        if (tag === 'table') {
          const tableData = Array.from(n.querySelectorAll('tr')).map(row => Array.from(row.querySelectorAll('th,td')).map(cell => cell.innerHTML.trim())).filter(row => row.length);
          return { id: genBlockId(), type: 'table', content: n.outerHTML, tableData };
        }
        return { id: genBlockId(), type: 'paragraph', content: n.innerHTML };
      });
    } catch (e) {
      return [{ id: genBlockId(), type: 'paragraph', content: html }];
    }
  }

  function updateRankMathScore() {
    const title = document.getElementById('wp-post-title-input')?.value.trim() || '';
    const kw = document.getElementById('wp-focus-keyword')?.value.trim().toLowerCase();
    const content = serializeGutenbergBlocks().toLowerCase();

    let score = 50;
    if (title.length > 10) score += 15;
    if (kw) {
      if (title.toLowerCase().includes(kw)) score += 15;
      if (content.includes(kw)) score += 15;
    }
    if (postBlocks.length > 2) score += 5;
    score = Math.min(100, Math.max(25, score));

    const scoreText = document.getElementById('wp-rankmath-score-text');
    const sidebarScore = document.getElementById('wp-sidebar-score');
    if (scoreText) scoreText.textContent = `${score} / 100`;
    if (sidebarScore) sidebarScore.textContent = `${score} / 100`;
    return score;
  }

  function renderPostTags() {
    const container = document.getElementById('wp-tags-container');
    if (!container) return;
    container.innerHTML = postTags.map(t => `
      <span class="modern-badge" style="background:#eff6ff; color:#1d4ed8; font-size:11px; padding:3px 8px; border-radius:4px; display:inline-flex; align-items:center; gap:4px;">
        ${escapeHtml(t)}
        <span class="remove-post-tag" data-tag="${escapeHtml(t)}" style="cursor:pointer; font-weight:bold;">×</span>
      </span>
    `).join('');

    container.querySelectorAll('.remove-post-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        postTags = postTags.filter(x => x !== tag);
        renderPostTags();
      });
    });
  }

  function updateEditorBylinePreview() {
    const bylineBar = document.getElementById('wp-editor-byline-bar');
    const placeholder = document.getElementById('wp-editor-byline-placeholder');
    if (!bylineBar) return;
    if (editorDocumentType === 'page') {
      bylineBar.style.display = 'none';
      if (placeholder) placeholder.style.display = 'none';
      return;
    }

    const showAuthor = document.getElementById('wp-show-author')?.checked === true;
    const showReviewer = document.getElementById('wp-show-reviewer')?.checked === true;
    const hasAny = showAuthor || showReviewer;

    const showBothInput = document.getElementById('wp-show-byline-both');
    if (showBothInput && document.activeElement !== showBothInput) {
      showBothInput.checked = hasAny;
    }

    const authorCard = document.getElementById('wp-editor-author-card');
    const reviewerCard = document.getElementById('wp-editor-reviewer-card');
    const separator = document.getElementById('wp-editor-byline-sep');
    const restoreAuthorBtn = document.getElementById('wp-btn-restore-author');
    const restoreReviewerBtn = document.getElementById('wp-btn-restore-reviewer');

    if (authorCard) authorCard.style.display = showAuthor ? 'flex' : 'none';
    if (reviewerCard) reviewerCard.style.display = showReviewer ? 'flex' : 'none';
    if (separator) separator.style.display = (showAuthor && showReviewer) ? 'block' : 'none';

    if (restoreAuthorBtn) restoreAuthorBtn.style.display = (!showAuthor && showReviewer) ? 'inline-flex' : 'none';
    if (restoreReviewerBtn) restoreReviewerBtn.style.display = (showAuthor && !showReviewer) ? 'inline-flex' : 'none';

    if (hasAny) {
      bylineBar.style.display = 'flex';
      if (placeholder) placeholder.style.display = 'none';
    } else {
      bylineBar.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
    }

    const authorName = document.getElementById('wp-author-name')?.value || '';
    const authorRole = document.getElementById('wp-author-role')?.value.trim() || 'Written By';
    const authorImg = document.getElementById('wp-author-image')?.value.trim() || '';

    const reviewerName = document.getElementById('wp-reviewer-name')?.value || '';
    const reviewerRole = document.getElementById('wp-reviewer-role')?.value.trim() || 'Reviewed by:';
    const reviewerImg = document.getElementById('wp-reviewer-image')?.value.trim() || '';

    const aNameEl = document.getElementById('wp-editor-author-name-label');
    const aRoleEl = document.getElementById('wp-editor-author-role-label');
    const aAvatarEl = document.getElementById('wp-editor-author-avatar');
    const aPlaceholderEl = document.getElementById('wp-editor-author-placeholder');

    const rNameEl = document.getElementById('wp-editor-reviewer-name-label');
    const rRoleEl = document.getElementById('wp-editor-reviewer-role-label');
    const rAvatarEl = document.getElementById('wp-editor-reviewer-avatar');
    const rPlaceholderEl = document.getElementById('wp-editor-reviewer-placeholder');

    if (aNameEl && document.activeElement !== aNameEl) aNameEl.textContent = authorName;
    if (aRoleEl && document.activeElement !== aRoleEl) aRoleEl.textContent = authorRole;
    if (aAvatarEl && aPlaceholderEl) {
      if (authorImg) {
        aAvatarEl.src = authorImg;
        aAvatarEl.style.display = 'block';
        aPlaceholderEl.style.display = 'none';
      } else {
        aAvatarEl.src = '';
        aAvatarEl.style.display = 'none';
        aPlaceholderEl.style.display = 'flex';
      }
    }

    if (rNameEl && document.activeElement !== rNameEl) rNameEl.textContent = reviewerName;
    if (rRoleEl && document.activeElement !== rRoleEl) rRoleEl.textContent = reviewerRole;
    if (rAvatarEl && rPlaceholderEl) {
      if (reviewerImg) {
        rAvatarEl.src = reviewerImg;
        rAvatarEl.style.display = 'block';
        rPlaceholderEl.style.display = 'none';
      } else {
        rAvatarEl.src = '';
        rAvatarEl.style.display = 'none';
        rPlaceholderEl.style.display = 'flex';
      }
    }

    const sideAuthorPreview = document.getElementById('wp-sidebar-author-img-preview');
    if (sideAuthorPreview) {
      sideAuthorPreview.src = authorImg || '';
      sideAuthorPreview.style.display = authorImg ? 'block' : 'none';
    }
    const sideReviewerPreview = document.getElementById('wp-sidebar-reviewer-img-preview');
    if (sideReviewerPreview) {
      sideReviewerPreview.src = reviewerImg || '';
      sideReviewerPreview.style.display = reviewerImg ? 'block' : 'none';
    }
  }

  function fillPost(post = {}) {
    isFillingPost = true;
    try {
      const idField = document.getElementById('wp-field-post-id');
      if (idField) idField.value = post.id || '';
      
      // Title
      const titleInput = document.getElementById('wp-post-title-input');
      const docTitle = post.title || '';
      if (titleInput) {
        titleInput.value = docTitle;
        titleInput.style.height = 'auto';
        titleInput.style.height = (titleInput.scrollHeight || 48) + 'px';
      }
      const indicator = document.getElementById('wp-doc-title-indicator');
      if (indicator) {
        indicator.textContent = docTitle ? `${docTitle} - Post` : 'No Title - Post';
      }

      // Slug
      const slugInput = document.getElementById('wp-post-slug');
      if (slugInput) {
        slugInput.value = post.slug || '';
        delete slugInput.dataset.manuallyEdited;
      }

      // Author
      const authorSelect = document.getElementById('wp-post-author');
      if (authorSelect) {
        const authorName = post.author || 'Trikonet';
        if (![...authorSelect.options].some(option => option.value === authorName)) authorSelect.add(new Option(authorName, authorName));
        authorSelect.value = authorName;
      }

      const preview = document.getElementById('wp-btn-preview');
      if (preview) preview.href = post.localUrl || `/blog/${post.slug || ''}`;

      // Focus keyword
      const kwInput = document.getElementById('wp-focus-keyword');
      if (kwInput) kwInput.value = post.keyword || '';

      const seoTitle = document.getElementById('wp-seo-title');
      const seoDescription = document.getElementById('wp-seo-description');
      const seoPermalink = document.getElementById('wp-seo-permalink');
      if (seoTitle) seoTitle.value = post.metaTitle || post.seoTitle || docTitle;
      if (seoDescription) seoDescription.value = post.metaDescription || post.excerpt || '';
      if (seoPermalink) seoPermalink.value = post.slug || '';
      const authorProfileFields = {
        'wp-author-name': post.authorName !== undefined ? post.authorName : (post.author && post.author !== 'Trikonet' ? post.author : ''),
        'wp-author-role': post.authorRole || 'Written By',
        'wp-author-image': post.authorImage || '',
        'wp-author-link': post.authorLink || '#',
        'wp-reviewer-name': post.reviewer || '',
        'wp-reviewer-role': post.reviewerRole || 'Reviewed by:',
        'wp-reviewer-image': post.reviewerImage || '',
        'wp-reviewer-link': post.reviewerLink || '#'
      };
      Object.entries(authorProfileFields).forEach(([id, value]) => { const field = document.getElementById(id); if (field) field.value = value; });
      const showAuthorInput = document.getElementById('wp-show-author');
      const showReviewerInput = document.getElementById('wp-show-reviewer');
      if (showAuthorInput) showAuthorInput.checked = Boolean(post.showAuthor);
      if (showReviewerInput) showReviewerInput.checked = Boolean(post.showReviewer);
      updateEditorBylinePreview();

      // Excerpt
      const excerptInput = document.getElementById('wp-post-excerpt');
      if (excerptInput) excerptInput.value = post.excerpt || '';

      // Featured Image
      postFeaturedImgUrl = post.featuredImage || (post.image || '');
      const imgPreview = document.getElementById('wp-featured-img-preview');
      const imgPlaceholder = document.getElementById('wp-featured-img-placeholder');
      const btnRemoveImg = document.getElementById('wp-btn-remove-featured-img');
      if (postFeaturedImgUrl && imgPreview && imgPlaceholder && btnRemoveImg) {
        imgPreview.src = postFeaturedImgUrl;
        imgPreview.style.display = 'block';
        imgPlaceholder.style.display = 'none';
        btnRemoveImg.style.display = 'block';
      } else if (imgPreview && imgPlaceholder && btnRemoveImg) {
        imgPreview.style.display = 'none';
        imgPlaceholder.style.display = 'block';
        btnRemoveImg.style.display = 'none';
      }

      // Categories checkboxes
      const cats = post.categories || ['Career Tips'];
      renderGutenbergPostCategoriesChecklist(cats);

      // Tags
      postTags = post.tags || ['Career', 'UAE'];
      renderPostTags();

      // Parse blocks
      postBlocks = parseGutenbergBlocks(post.content || '');
      postBlocks.filter(block => block.type === 'toc').forEach(block => {
        block.content = buildTableOfContents(block);
      });
      activeBlockId = postBlocks[0]?.id || null;
      renderGutenbergBlocks();
      updateRankMathScore();

      // Scheduled Date / Publish date
      const scheduleDatetimeInput = document.getElementById('wp-post-schedule-datetime');
      const publishVal = document.getElementById('wp-publish-date-val');
      const schedulePanel = document.getElementById('wp-schedule-panel');
      const pubBtn = document.getElementById('wp-btn-publish');

      if (post.status === 'scheduled' && post.scheduledAt) {
        if (scheduleDatetimeInput) scheduleDatetimeInput.value = post.scheduledAt;
        const d = new Date(post.scheduledAt);
        const formatted = !isNaN(d.getTime()) ? d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }) : post.scheduledAt;
        if (publishVal) publishVal.textContent = formatted;
        if (pubBtn) pubBtn.textContent = 'Schedule';
        if (schedulePanel) schedulePanel.style.display = 'block';
      } else {
        if (scheduleDatetimeInput) scheduleDatetimeInput.value = '';
        if (publishVal) publishVal.textContent = 'Immediately';
        if (schedulePanel) schedulePanel.style.display = 'none';
        if (pubBtn) pubBtn.textContent = post.id ? 'Update' : 'Publish';
      }
    } finally {
      isFillingPost = false;
      isPostDirty = false;
      resetPostHistory();
    }
  }

  async function loadDatabasePostForEditor(post) {
    if (!post?.slug) return post;
    try {
      const response = await fetch(`/api/wp/posts?slug=${encodeURIComponent(post.slug)}`);
      if (!response.ok) return post;
      const wp = (await response.json())[0];
      if (!wp) return post;
      return {
        ...post,
        id: wp.id,
        title: wp.title?.rendered || post.title,
        slug: wp.slug,
        author: wp.author_name || post.author || 'Trikonet',
        authorUrl: wp.author_url || '',
        localUrl: wp.local_url || `/blog/${wp.slug}`,
        categories: Object.values(wp.metas?._post_category || {}).map(decodePostText),
        tags: Object.values(wp.metas?._post_tag || {}).map(decodePostText),
        excerpt: wp.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '',
        content: wp.content?.rendered || '',
        featuredImage: wp.featured_image || post.featuredImage || '',
        databaseSource: true
      };
    } catch {
      return post;
    }
  }

  // --- PAGES MANAGEMENT ---
  const defaultPages = [
    {
      id: 101,
      title: 'About — Elementor',
      slug: 'about',
      author: 'Trikonet',
      views: 35,
      comments: '—',
      date: 'Published 2021/03/10 at 9:29 am',
      rawDate: '2021-03-10',
      status: 'published',
      seoScore: 73,
      keyword: 'About',
      schema: 'Off',
      links: '1 | 1 | 2',
      content: 'Trikonet is the UAE premier career and recruitment destination.'
    },
    {
      id: 102,
      title: 'Alerts Jobs — Elementor',
      slug: 'alerts-jobs',
      author: 'Trikonet',
      views: 15,
      comments: '—',
      date: 'Published 2021/04/07 at 1:51 am',
      rawDate: '2021-04-07',
      status: 'published',
      seoScore: null,
      keyword: 'Not Set',
      schema: 'Off',
      links: '1 | 0 | 0',
      content: 'Configure personalized job notifications and daily email digests.'
    },
    {
      id: 103,
      title: 'Applicants Jobs',
      slug: 'applicants-jobs',
      author: 'Trikonet',
      views: 0,
      comments: '—',
      date: 'Published 2021/04/07 at 1:17 am',
      rawDate: '2021-04-07',
      status: 'published',
      seoScore: null,
      keyword: 'Not Set',
      schema: 'Off',
      links: '0 | 0 | 0',
      content: 'Candidate applications tracking dashboard.'
    },
    {
      id: 104,
      title: 'Approve User',
      slug: 'approve-user',
      author: 'Trikonet',
      views: 1,
      comments: '—',
      date: 'Published 2021/04/06 at 10:27 am',
      rawDate: '2021-04-06',
      status: 'published',
      seoScore: null,
      keyword: 'Not Set',
      schema: 'Off',
      links: '0 | 0 | 0',
      content: 'Admin account verification gateway.'
    },
    {
      id: 105,
      title: 'Blog — Posts Page',
      slug: 'blog',
      author: 'Trikonet',
      views: 15,
      comments: '—',
      date: 'Published 2021/03/10 at 9:29 am',
      rawDate: '2021-03-10',
      status: 'published',
      seoScore: null,
      keyword: 'Not Set',
      schema: 'Off',
      links: '0 | 0 | 0',
      content: 'Editorial article archive and latest career insights.'
    },
    {
      id: 106,
      title: 'Blog — Draft',
      slug: 'blog-draft',
      author: 'Trikonet',
      views: null,
      comments: '—',
      date: 'Last Modified 2024/07/02 at 5:32 pm',
      rawDate: '2024-07-02',
      status: 'draft',
      seoScore: null,
      keyword: 'Not Set',
      schema: 'Off',
      links: '0 | 0 | 0',
      content: 'Upcoming magazine layout draft.'
    },
    {
      id: 107,
      title: 'Contact Us',
      slug: 'contact',
      author: 'Trikonet',
      views: 42,
      comments: '—',
      date: 'Published 2021/03/15 at 11:10 am',
      rawDate: '2021-03-15',
      status: 'published',
      seoScore: 80,
      keyword: 'Contact',
      schema: 'ContactPage',
      links: '2 | 0 | 1',
      content: 'Get in touch with the Trikonet support and business development team in Dubai.'
    },
    {
      id: 108,
      title: 'FAQ',
      slug: 'faq',
      author: 'Trikonet',
      views: 28,
      comments: '—',
      date: 'Published 2021/03/15 at 11:30 am',
      rawDate: '2021-03-15',
      status: 'published',
      seoScore: 85,
      keyword: 'FAQ',
      schema: 'FAQPage',
      links: '2 | 1 | 3',
      content: 'Frequently asked questions regarding job postings, employer accounts, and candidate profiles.'
    },
    {
      id: 109,
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      author: 'Trikonet',
      views: 19,
      comments: '—',
      date: 'Published 2021/03/15 at 11:20 am',
      rawDate: '2021-03-15',
      status: 'published',
      seoScore: 68,
      keyword: 'Privacy Policy',
      schema: 'Off',
      links: '1 | 0 | 0',
      content: 'Our commitment to data privacy, GDPR compliance, and confidential candidate storage.'
    },
    {
      id: 110,
      title: 'Terms & Conditions',
      slug: 'terms',
      author: 'Trikonet',
      views: 24,
      comments: '—',
      date: 'Published 2021/03/15 at 11:25 am',
      rawDate: '2021-03-15',
      status: 'published',
      seoScore: 71,
      keyword: 'Terms',
      schema: 'Off',
      links: '1 | 0 | 0',
      content: 'Terms and conditions governing recruitment services, employer portal usage, and applicant listings.'
    }
  ];

  let pages = (() => {
    try {
      const stored = localStorage.getItem('trikonet_pages_cms');
      return stored ? JSON.parse(stored) : defaultPages;
    } catch {
      return defaultPages;
    }
  })();
  const homeEditorContent = `<section data-home-widget="hero"></section>
    <section data-home-widget="categories"></section>
    <section data-home-widget="how-it-works"></section>
    <section data-home-widget="articles"></section>`;
  const requiredDestinationPages = [
    { id: -1, title: 'Home', slug: 'home', author: 'Trikonet', views: 0, comments: '—', date: 'Published', rawDate: '', status: 'published', seoScore: 90, keyword: 'Trikonet', schema: 'WebPage', links: '0 | 0 | 0', content: homeEditorContent, systemPage: true },
    { id: -2, title: 'Employers Directory', slug: 'employers', author: 'Trikonet', views: 0, comments: '—', date: 'Published', rawDate: '', status: 'published', seoScore: 90, keyword: 'Employers', schema: 'CollectionPage', links: '0 | 0 | 0', content: 'Main company and employer destination page.', systemPage: true }
  ];
  requiredDestinationPages.forEach(required => {
    const existing = pages.find(page => page.slug === required.slug);
    if (!existing) pages.unshift(required);
    else if (required.slug === 'home' && !String(existing.content || '').includes('data-home-widget=')) existing.content = homeEditorContent;
  });

  function savePages() {
    try {
      localStorage.setItem('trikonet_pages_cms', JSON.stringify(pages));
    } catch {}
    updatePageCountBadges();
  }

  function updatePageCountBadges() {
    const chip = document.getElementById('admin-pages-count-chip');
    if (chip) chip.textContent = `${pages.length} items`;
    const sidebarCount = document.getElementById('admin-pages-count');
    if (sidebarCount) sidebarCount.textContent = String(pages.length);
    const footerCount = document.getElementById('admin-pages-items-count');
    if (footerCount) footerCount.textContent = `${pages.length} items`;

    ['core', 'jobs', 'companies', 'other'].forEach(group => {
      const count = document.getElementById(`count-page-${group}`);
      if (count) count.textContent = String(pages.filter(page => getPageGroup(page) === group).length);
    });
  }

  function getPageGroup(page = {}) {
    const slug = String(page.slug || '').toLowerCase();
    const title = String(page.title || '').toLowerCase();
    const value = `${slug} ${title}`;
    const coreSlugs = new Set(['', 'home', 'jobs', 'employers', 'about', 'about-us', 'contact', 'contact-us', 'blog', 'faq', 'terms', 'terms-and-conditions', 'privacy-policy']);
    if (coreSlugs.has(slug) || /\b(home|about us|contact us|privacy policy|terms|faq|blog)\b/.test(value)) return 'core';
    // Account, alert, application and CV tools are supporting utilities rather
    // than public job-destination landing pages.
    if (/\b(alert|alerts|applicant|applicants|application|applications|resume|cv|shortlist|login|registration|register|dashboard|subscription)\b/.test(value)) return 'other';
    if (/\b(job|jobs|career|careers|candidate|candidates|designation)\b/.test(value)) return 'jobs';
    if (/\b(company|companies|employer|employers|recruiter|recruiters|organisation|organization)\b/.test(value)) return 'companies';
    return 'other';
  }

  let pageGroupFilter = 'core';

  function renderPageRows() {
    const tbody = document.getElementById('admin-page-rows');
    if (!tbody) return;

    updatePageCountBadges();

    const searchInput = document.getElementById('admin-page-search');
    const q = (searchInput?.value || '').toLowerCase().trim();
    const dateVal = document.getElementById('filter-page-date')?.value || '';

    const filtered = pages.filter(p => {
      if (getPageGroup(p) !== pageGroupFilter) return false;

      if (dateVal && !p.rawDate?.startsWith(dateVal)) return false;

      if (q) {
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchSlug = (p.slug || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSlug) return false;
      }
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:36px 16px; color:#94a3b8; font-size:13px;">No pages found matching the criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const initials = (p.author || 'Trikonet').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const cleanDate = p.date ? p.date.replace(/^(Published|Scheduled for)\s*/i, '').split(' at ')[0] : 'Sep 23, 2026';
      const seoScoreHtml = p.seoScore !== null && p.seoScore !== undefined
        ? `<span class="pill-seo-score ${p.seoScore >= 80 ? 'seo-good' : 'seo-ok'}">🎯 ${p.seoScore} / 100</span>`
        : `<span class="pill-seo-score seo-na">N/A</span>`;

      return `
        <tr data-page-id="${p.id}">
          <td class="post-col-cb">
            <input type="checkbox" value="${p.id}" aria-label="Select ${escapeHtml(p.title)}">
          </td>
          <td class="post-col-title">
            <div class="post-title-cell-wrap">
              <div class="post-article-thumb-icon" style="background:linear-gradient(135deg, #eff6ff, #dbeafe); border-color:#bfdbfe; color:#2563eb;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div class="post-title-info-wrap">
                <a href="#page-editor/${encodeURIComponent(p.slug)}" class="post-headline-link" data-page-edit="${p.id}">${escapeHtml(p.title)}</a>
                <div class="post-meta-subrow">
                  <span class="post-pill-category" style="background:#f1f5f9; color:#475569;">/${escapeHtml(p.slug || '')}</span>
                  <span class="post-row-action-dot">•</span>
                  <div class="post-row-actions-bar">
                    <a href="#page-editor/${encodeURIComponent(p.slug)}" class="post-row-action-link" data-page-edit="${p.id}">Edit</a>
                    <span class="post-row-action-dot">•</span>
                    <a href="#" class="post-row-action-link" data-page-quickedit="${p.id}">Quick Edit</a>
                    <span class="post-row-action-dot">•</span>
                    <a href="#" class="post-row-action-link delete-link" data-page-delete="${p.id}">Trash</a>
                    <span class="post-row-action-dot">•</span>
                    <a href="/${p.slug}" class="post-row-action-link" target="_blank" rel="noopener">View ↗</a>
                  </div>
                </div>
              </div>
            </div>
          </td>
          <td class="post-col-author">
            <div class="post-author-badge">
              <span class="post-author-avatar-chip" style="background:#dbeafe; color:#1d4ed8; border-color:#bfdbfe;">${escapeHtml(initials)}</span>
              <span class="post-author-name-text">${escapeHtml(p.author || 'Trikonet')}</span>
            </div>
          </td>
          <td style="text-align:center;">
            <div class="post-views-sub-text" style="font-weight:600; color:#334155; font-size:12.5px; justify-content:center;">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path d="M2.458 10C3.732 6.943 6.643 4.5 10 4.5s6.268 2.443 7.542 5.5c-1.274 3.057-4.185 5.5-7.542 5.5S3.732 13.057 2.458 10z"/></svg>
              ${p.views !== null && p.views !== undefined ? p.views.toLocaleString() : '—'}
            </div>
          </td>
          <td style="text-align:center;">
            <span style="font-size:12px; color:#94a3b8; font-weight:500;">${p.comments || '—'}</span>
          </td>
          <td class="post-col-date-views">
            <div class="post-date-primary-text">${escapeHtml(cleanDate)}</div>
            <div class="post-views-sub-text" style="text-transform:capitalize;">${escapeHtml(p.status || 'Published')}</div>
          </td>
          <td class="post-col-seodetails">
            <div class="modern-seo-cell">
              ${seoScoreHtml}
              <div class="modern-seo-meta-line"><b>Keyword:</b> ${escapeHtml(p.keyword || 'Not Set')}</div>
              <div class="modern-seo-meta-line"><b>Schema:</b> ${escapeHtml(p.schema || 'Off')}</div>
              <div class="modern-seo-links-line">Links: 🔗 ${p.links || '0 | 0 | 0'}</div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  let pageBlocks = [];
  const pageBlockId = () => `page-block-${Math.random().toString(36).slice(2, 10)}`;

  function parsePageBlocks(content = '') {
    if (!String(content).trim()) return [{ id: pageBlockId(), type: 'paragraph', content: '' }];
    const doc = new DOMParser().parseFromString(String(content), 'text/html');
    const nodes = [...doc.body.children];
    if (!nodes.length) return [{ id: pageBlockId(), type: 'paragraph', content: escapeHtml(String(content)) }];
    return nodes.map(node => {
      const tag = node.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) return { id: pageBlockId(), type: 'heading', level: tag, content: node.innerHTML };
      if (tag === 'img' || (tag === 'figure' && node.querySelector('img'))) {
        const image = tag === 'img' ? node : node.querySelector('img');
        return { id: pageBlockId(), type: 'image', src: image.getAttribute('src') || '', alt: image.getAttribute('alt') || '' };
      }
      if (tag === 'section') return { id: pageBlockId(), type: 'section', title: node.querySelector('h1,h2,h3')?.innerHTML || '', content: node.querySelector('p,div')?.innerHTML || node.innerHTML };
      return { id: pageBlockId(), type: 'paragraph', content: node.innerHTML };
    });
  }

  function serializePageBlocks() {
    return pageBlocks.map(block => {
      if (block.type === 'heading') return `<${block.level || 'h2'}>${block.content || ''}</${block.level || 'h2'}>`;
      if (block.type === 'image') return `<figure class="page-image"><img src="${escapeHtml(block.src || '')}" alt="${escapeHtml(block.alt || '')}"></figure>`;
      if (block.type === 'section') return `<section><h2>${block.title || ''}</h2><div>${block.content || ''}</div></section>`;
      return `<p>${block.content || ''}</p>`;
    }).join('\n');
  }

  function renderPageBlocks() {
    const editor = document.getElementById('page-blocks-editor');
    if (!editor) return;
    editor.innerHTML = pageBlocks.map((block, index) => `<div class="page-builder-block" data-page-block-id="${block.id}">
      <button type="button" class="page-block-grip" draggable="true" title="Drag section" aria-label="Drag section">⠿</button>
      <span class="page-block-kind">${block.type}</span>
      ${block.type === 'heading' ? `<div class="page-block-content page-block-heading" contenteditable="true" data-page-field="content" data-placeholder="Heading">${block.content || ''}</div>` : ''}
      ${block.type === 'paragraph' ? `<div class="page-block-content" contenteditable="true" data-page-field="content" data-placeholder="Write text…">${block.content || ''}</div>` : ''}
      ${block.type === 'section' ? `<div class="page-section-fields"><div class="page-block-content page-block-heading" contenteditable="true" data-page-field="title" data-placeholder="Section title">${block.title || ''}</div><div class="page-block-content" contenteditable="true" data-page-field="content" data-placeholder="Section content…">${block.content || ''}</div></div>` : ''}
      ${block.type === 'image' ? `<div class="page-image-fields"><img src="${escapeHtml(block.src || '/assets/article-1.jpg')}" alt="${escapeHtml(block.alt || '')}"><label>Image URL<input type="text" data-page-field="src" value="${escapeHtml(block.src || '/assets/article-1.jpg')}"></label><label>Alt text<input type="text" data-page-field="alt" value="${escapeHtml(block.alt || '')}" required></label></div>` : ''}
      <div class="page-block-actions"><button type="button" data-page-move="up" ${index === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button type="button" data-page-move="down" ${index === pageBlocks.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button type="button" class="is-delete" data-delete-page-block aria-label="Delete section">Delete</button></div>
    </div>`).join('');
    editor.querySelectorAll('[data-page-field]').forEach(field => field.addEventListener('input', () => {
      const block = pageBlocks.find(item => item.id === field.closest('[data-page-block-id]')?.dataset.pageBlockId);
      if (block) block[field.dataset.pageField] = field.matches('input') ? field.value : field.innerHTML;
      document.getElementById('page-content').value = serializePageBlocks();
    }));
    editor.querySelectorAll('[data-delete-page-block]').forEach(button => button.addEventListener('click', () => {
      const id = button.closest('[data-page-block-id]').dataset.pageBlockId;
      pageBlocks = pageBlocks.filter(block => block.id !== id);
      if (!pageBlocks.length) pageBlocks.push({ id: pageBlockId(), type: 'paragraph', content: '' });
      renderPageBlocks();
    }));
    editor.querySelectorAll('[data-page-move]').forEach(button => button.addEventListener('click', () => {
      const id = button.closest('[data-page-block-id]').dataset.pageBlockId, from = pageBlocks.findIndex(block => block.id === id), to = button.dataset.pageMove === 'up' ? from - 1 : from + 1;
      if (to < 0 || to >= pageBlocks.length) return;
      [pageBlocks[from], pageBlocks[to]] = [pageBlocks[to], pageBlocks[from]]; renderPageBlocks();
    }));
    let dragged = '';
    editor.querySelectorAll('[data-page-block-id]').forEach(element => {
      element.addEventListener('dragstart', event => { if (!event.target.closest('.page-block-grip')) { event.preventDefault(); return; } dragged = element.dataset.pageBlockId; element.classList.add('is-dragging'); });
      element.addEventListener('dragend', () => { dragged = ''; editor.querySelectorAll('.page-builder-block').forEach(item => item.classList.remove('is-dragging', 'drag-over')); });
      element.addEventListener('dragover', event => { if (dragged && dragged !== element.dataset.pageBlockId) { event.preventDefault(); element.classList.add('drag-over'); } });
      element.addEventListener('dragleave', () => element.classList.remove('drag-over'));
      element.addEventListener('drop', event => { event.preventDefault(); const from = pageBlocks.findIndex(block => block.id === dragged), target = pageBlocks.findIndex(block => block.id === element.dataset.pageBlockId); if (from < 0 || target < 0) return; const [moved] = pageBlocks.splice(from, 1); pageBlocks.splice(target, 0, moved); renderPageBlocks(); });
    });
    document.getElementById('page-content').value = serializePageBlocks();
  }

  function fillPage(page = {}) {
    const form = document.getElementById('admin-page-form');
    if (!form) return;
    document.getElementById('field-page-id').value = page.id || '';
    document.getElementById('page-title').value = page.title || '';
    document.getElementById('page-slug').value = page.slug || '';
    document.getElementById('page-status').value = page.status === 'draft' ? 'Draft' : 'Published';
    pageBlocks = parsePageBlocks(page.content || '');
    renderPageBlocks();

    const pageTitle = document.getElementById('page-editor-page-title');
    const badge = document.getElementById('page-editor-badge');
    const submitBtn = document.getElementById('btn-submit-page');

    if (page.id) {
      if (pageTitle) pageTitle.textContent = 'Edit Page';
      if (badge) badge.textContent = 'Update Layout';
      if (submitBtn) submitBtn.textContent = 'Update Page';
    } else {
      if (pageTitle) pageTitle.textContent = 'Add Page';
      if (badge) badge.textContent = 'Landing & System';
      if (submitBtn) submitBtn.textContent = 'Publish Page';
    }
  }

  // --- MEDIA LIBRARY MANAGEMENT ---
  const defaultMedia = [
    {
      id: 1,
      title: 'forward_hospitality_logo.jpg',
      url: '/assets/forward_hospitality_logo.jpg',
      dimensions: '400 × 400',
      size: '24 KB',
      type: 'image',
      date: 'Sep 23, 2026'
    },
    {
      id: 2,
      title: 'trikonet-logo.png',
      url: '/assets/trikonet-logo.png',
      dimensions: '800 × 240',
      size: '42 KB',
      type: 'logo',
      date: 'Sep 22, 2026'
    },
    {
      id: 3,
      title: 'logo-black.png',
      url: '/assets/logo-black.png',
      dimensions: '800 × 240',
      size: '38 KB',
      type: 'logo',
      date: 'Sep 22, 2026'
    },
    {
      id: 4,
      title: 'logo-white.png',
      url: '/assets/logo-white.png',
      dimensions: '800 × 240',
      size: '39 KB',
      type: 'logo',
      date: 'Sep 22, 2026'
    },
    {
      id: 5,
      title: 'article-1.jpg',
      url: '/assets/article-1.jpg',
      dimensions: '1200 × 800',
      size: '145 KB',
      type: 'image',
      date: 'Sep 08, 2025'
    },
    {
      id: 6,
      title: 'article-2.jpg',
      url: '/assets/article-2.jpg',
      dimensions: '1200 × 800',
      size: '132 KB',
      type: 'image',
      date: 'Sep 08, 2025'
    },
    {
      id: 7,
      title: 'article-3.jpg',
      url: '/assets/article-3.jpg',
      dimensions: '1200 × 800',
      size: '158 KB',
      type: 'image',
      date: 'Sep 08, 2025'
    },
    {
      id: 8,
      title: 'favicon.svg',
      url: '/favicon.svg',
      dimensions: '512 × 512',
      size: '4 KB',
      type: 'logo',
      date: 'Sep 22, 2026'
    }
  ];

  let media = (() => {
    try {
      const stored = localStorage.getItem('trikonet_media_cms');
      return stored ? JSON.parse(stored) : defaultMedia;
    } catch {
      return defaultMedia;
    }
  })();

  function saveMedia() {
    try {
      localStorage.setItem('trikonet_media_cms', JSON.stringify(media));
    } catch {}
    const chip = document.getElementById('admin-media-count-chip');
    if (chip) chip.textContent = `${media.length} files`;
  }

  let mediaPage = 1;
  const mediaPageSize = 60;
  function renderMediaGrid() {
    const grid = document.getElementById('admin-media-grid');
    if (!grid) return;

    saveMedia();

    const searchInput = document.getElementById('admin-media-search');
    const q = (searchInput?.value || '').toLowerCase().trim();
    const typeVal = document.getElementById('filter-media-type')?.value || 'all';

    const filtered = media.filter(m => {
      if (typeVal === 'image' && m.type !== 'image') return false;
      if (typeVal === 'logo' && m.type !== 'logo') return false;
      if (q && !(m.title || '').toLowerCase().includes(q)) return false;
      return true;
    });

    if (!filtered.length) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#94a3b8; font-size:13px;">No media assets found matching the filter.</div>`;
      return;
    }

    const pageCount = Math.max(1, Math.ceil(filtered.length / mediaPageSize));
    if (mediaPage > pageCount) mediaPage = pageCount;
    const visible = filtered.slice((mediaPage - 1) * mediaPageSize, mediaPage * mediaPageSize);
    grid.innerHTML = visible.map(m => `
      <div class="modern-media-card" data-media-id="${m.id}">
        <div class="modern-media-thumb">
          <img src="${m.url}" alt="${escapeHtml(m.title)}" loading="lazy">
        </div>
        <div class="modern-media-info">
          <div class="modern-media-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</div>
          <div class="modern-media-meta">
            <span>${m.dimensions || 'Image'}</span>
            <span>${m.size || ''}</span>
          </div>
          <div class="modern-media-actions">
            <button type="button" class="modern-media-btn" data-copy-url="${m.url}">Copy URL</button>
            <button type="button" class="modern-media-btn danger" data-media-delete="${m.id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('') + (pageCount > 1 ? `<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:18px;padding:22px 0;"><button class="modern-filter-btn" data-media-page="${mediaPage - 1}" ${mediaPage === 1 ? 'disabled' : ''}>← Previous</button><strong style="font-size:13px;color:#475569;">Page ${mediaPage} of ${pageCount}</strong><button class="modern-filter-btn" data-media-page="${mediaPage + 1}" ${mediaPage === pageCount ? 'disabled' : ''}>Next →</button></div>` : '');
  }

  // --- POSTS EVENT LISTENERS ---
  document.querySelectorAll('#admin-post-tabs a').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('#admin-post-tabs a').forEach(t => t.classList.remove('current'));
      tab.classList.add('current');
      postStatusFilter = tab.dataset.postStatus || 'all';
      renderPostRows();
    });
  });

  document.getElementById('admin-post-search')?.addEventListener('input', renderPostRows);
  document.getElementById('admin-post-search-button')?.addEventListener('click', renderPostRows);
  document.getElementById('btn-filter-posts')?.addEventListener('click', renderPostRows);
  document.getElementById('filter-post-date')?.addEventListener('change', renderPostRows);
  document.getElementById('filter-post-category')?.addEventListener('change', renderPostRows);

  document.getElementById('cb-select-all-posts')?.addEventListener('change', e => {
    document.querySelectorAll('#admin-post-rows input[type="checkbox"]').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  document.getElementById('btn-apply-posts-bulk')?.addEventListener('click', () => {
    const action = document.getElementById('bulk-action-posts-selector')?.value;
    const selected = Array.from(document.querySelectorAll('#admin-post-rows input[type="checkbox"]:checked')).map(cb => Number(cb.value));
    if (!selected.length) {
      alert('Please select at least one post.');
      return;
    }
    if (action === 'trash') {
      if (!confirm(`Delete ${selected.length} selected post(s)?`)) return;
      posts = posts.filter(p => !selected.includes(p.id));
      savePosts();
      renderPostRows();
    } else if (action === 'edit') {
      const p = posts.find(x => x.id === selected[0]);
      if (p) {
        fillPost(p);
        location.hash = `post-editor/${encodeURIComponent(p.slug)}`;
      }
    }
  });

  // --- WORDPRESS GUTENBERG EVENT LISTENERS ---

  // Title input auto-resize & document status indicator
  document.getElementById('wp-post-title-input')?.addEventListener('input', e => {
    const val = e.target.value;
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight || 48) + 'px';
    const indicator = document.getElementById('wp-doc-title-indicator');
    if (indicator) {
      const label = editorDocumentType === 'page' ? 'Page' : 'Post';
      indicator.textContent = val.trim() ? `${val.trim()} - ${label}` : `No Title - ${label}`;
    }
    const slugInput = document.getElementById('wp-post-slug');
    if (slugInput && !slugInput.dataset.manuallyEdited) {
      slugInput.value = val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    updateRankMathScore();
  });

  document.getElementById('wp-post-slug')?.addEventListener('input', e => {
    e.target.dataset.manuallyEdited = 'true';
  });

  // Toggle Left Inserter Drawer
  document.getElementById('wp-btn-toggle-inserter')?.addEventListener('click', () => {
    const drawer = document.getElementById('wp-post-inserter-drawer');
    const btn = document.getElementById('wp-btn-toggle-inserter');
    if (drawer) {
      drawer.classList.toggle('collapsed');
      const isOpen = !drawer.classList.contains('collapsed');
      btn?.classList.toggle('is-active', isOpen);
      if (isOpen) {
        document.getElementById('wp-inserter-search')?.focus();
      }
    }
  });

  // Inserter Search filter
  document.getElementById('wp-inserter-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.wp-inserter-tile').forEach(tile => {
      const label = tile.textContent.toLowerCase();
      tile.style.display = label.includes(q) ? 'flex' : 'none';
    });
  });

  // Drawer tile clicks
  document.querySelectorAll('.wp-inserter-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const type = tile.dataset.blockType;
      addGutenbergBlock(type, '', activeBlockId);
    });
  });

  // Quick Inserter popover tile clicks (delegated to grid to support all dynamic & extra blocks)
  document.getElementById('wp-quick-grid')?.addEventListener('click', e => {
    const tile = e.target.closest('.wp-quick-tile');
    if (!tile) return;
    const type = tile.dataset.quickType;
    const popover = document.getElementById('wp-quick-inserter-popover');
    const afterId = popover?.dataset.targetAfterId || activeBlockId;
    hideQuickInserter();
    addGutenbergBlock(type, '', afterId);
  });

  // "Browse all" in quick inserter: expands in-place to show all available blocks
  document.getElementById('wp-quick-browse-all')?.addEventListener('click', e => {
    e.stopPropagation();
    const popover = document.getElementById('wp-quick-inserter-popover');
    if (!popover) return;
    const isExpanded = popover.classList.toggle('is-expanded');
    const textEl = popover.querySelector('.wp-quick-browse-text');
    const iconEl = popover.querySelector('.wp-quick-browse-icon');
    if (textEl) textEl.textContent = isExpanded ? 'Show less' : 'Browse all';
    if (iconEl) iconEl.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';

    // Elevate popup position if expansion reaches beyond the canvas view
    const canvas = document.getElementById('wp-post-canvas');
    if (canvas && isExpanded) {
      setTimeout(() => {
        const popoverRect = popover.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        if (popoverRect.bottom > canvasRect.bottom - 16) {
          const diff = popoverRect.bottom - (canvasRect.bottom - 16);
          const currentTop = parseFloat(popover.style.top) || 0;
          popover.style.top = `${Math.max(10, currentTop - diff)}px`;
        }
      }, 10);
    }
  });

  // Close quick inserter when clicking outside
  document.addEventListener('click', e => {
    const popover = document.getElementById('wp-quick-inserter-popover');
    if (popover && popover.style.display !== 'none') {
      if (!popover.contains(e.target) && !e.target.closest('.wp-block-add-btn')) {
        hideQuickInserter();
      }
    }
  });

  // Quick search filter: instantly reveals any matching blocks across all categories
  document.getElementById('wp-quick-search-input')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    const popover = document.getElementById('wp-quick-inserter-popover');
    const tiles = document.querySelectorAll('.wp-quick-tile');
    if (q) {
      popover?.classList.add('is-searching');
      tiles.forEach(tile => {
        const label = tile.textContent.toLowerCase();
        tile.style.display = label.includes(q) ? 'flex' : 'none';
      });
    } else {
      popover?.classList.remove('is-searching');
      tiles.forEach(tile => {
        tile.style.display = '';
      });
    }
  });

  // Toggle Right Settings Sidebar
  document.getElementById('wp-btn-toggle-sidebar')?.addEventListener('click', () => {
    const sidebar = document.getElementById('wp-post-sidebar');
    const btn = document.getElementById('wp-btn-toggle-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      btn?.classList.toggle('is-active', !sidebar.classList.contains('collapsed'));
    }
  });
  document.getElementById('wp-btn-close-sidebar')?.addEventListener('click', () => {
    const sidebar = document.getElementById('wp-post-sidebar');
    const btn = document.getElementById('wp-btn-toggle-sidebar');
    if (sidebar) {
      sidebar.classList.add('collapsed');
      btn?.classList.remove('is-active');
    }
  });

  // Sidebar Tab Switcher (Post vs Block)
  document.getElementById('wp-tab-post')?.addEventListener('click', () => {
    document.getElementById('wp-tab-post')?.classList.add('active');
    document.getElementById('wp-tab-block')?.classList.remove('active');
    const panelPost = document.getElementById('wp-sidebar-panel-post');
    const panelBlock = document.getElementById('wp-sidebar-panel-block');
    if (panelPost) panelPost.style.display = 'flex';
    if (panelBlock) panelBlock.style.display = 'none';
  });
  document.getElementById('wp-tab-block')?.addEventListener('click', () => {
    document.getElementById('wp-tab-block')?.classList.add('active');
    document.getElementById('wp-tab-post')?.classList.remove('active');
    const panelPost = document.getElementById('wp-sidebar-panel-post');
    const panelBlock = document.getElementById('wp-sidebar-panel-block');
    if (panelPost) panelPost.style.display = 'none';
    if (panelBlock) panelBlock.style.display = 'flex';
  });

  document.getElementById('wp-toc-list-style')?.addEventListener('change', event => {
    const block = postBlocks.find(item => item.id === activeBlockId && item.type === 'toc');
    if (!block) return;
    setTocListStyle(block.id, event.target.value);
  });
  document.getElementById('wp-toc-title-level')?.addEventListener('change', event => {
    const block = postBlocks.find(item => item.id === activeBlockId && item.type === 'toc');
    if (!block) return;
    block.titleLevel = event.target.value;
    renderGutenbergBlocks();
  });
  document.querySelectorAll('.wp-toc-level-check').forEach(input => {
    input.addEventListener('change', () => {
      const block = postBlocks.find(item => item.id === activeBlockId && item.type === 'toc');
      if (!block) return;
      const excluded = [...document.querySelectorAll('.wp-toc-level-check:checked')].map(item => item.value);
      block.includedHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].filter(level => !excluded.includes(level));
      block.content = buildTableOfContents(block);
      renderGutenbergBlocks();
    });
  });

  // WordPress-style contextual toolbar for selected editor text.
  let wpSavedTextRange = null;
  let wpSelectedEditable = null;
  const selectionToolbar = document.getElementById('wp-selection-toolbar');

  function syncSelectedBlockContent() {
    if (!wpSelectedEditable) return;
    const wrapper = wpSelectedEditable.closest('.wp-block-wrapper');
    const block = postBlocks.find(item => item.id === wrapper?.dataset.blockId);
    if (block) {
      if (block.type === 'faq') {
        const itemWrap = wpSelectedEditable.closest('.wp-faq-editor-item');
        const qEl = itemWrap?.querySelector('[data-faq-question]');
        const aEl = itemWrap?.querySelector('[data-faq-answer]');
        const idx = Number(itemWrap?.dataset.faqIndex ?? -1);
        if (block.items?.[idx]) {
          if (qEl) block.items[idx].question = qEl.innerHTML;
          if (aEl) block.items[idx].answer = aEl.innerHTML;
        }
      } else if (block.type === 'table') {
        const cell = wpSelectedEditable.closest('[data-table-cell]');
        if (cell) {
          const rows = ensureTableData(block);
          const r = Number(cell.dataset.row);
          const c = Number(cell.dataset.col);
          if (rows[r] && rows[r][c] !== undefined) rows[r][c] = cell.innerHTML;
        }
      } else {
        block.content = wpSelectedEditable.innerHTML;
      }
      isPostDirty = true;
    }
    updateRankMathScore();
  }

  function restoreSelectedText() {
    if (!wpSavedTextRange) return false;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(wpSavedTextRange);
    return true;
  }

  function closeAllToolbarMenus() {
    document.getElementById('wp-tb-block-menu')?.setAttribute('hidden', '');
    document.getElementById('wp-tb-block-dropdown-wrap')?.classList.remove('is-open');
    document.getElementById('wp-tb-align-menu')?.setAttribute('hidden', '');
    document.getElementById('wp-tb-align-dropdown-wrap')?.classList.remove('is-open');
    document.getElementById('wp-tb-more-menu')?.setAttribute('hidden', '');
    document.getElementById('wp-tb-more-dropdown-wrap')?.classList.remove('is-open');
    document.getElementById('wp-tb-link-popover')?.setAttribute('hidden', '');
  }

  function toggleToolbarMenu(menuId, wrapId) {
    const menu = document.getElementById(menuId);
    const wrap = document.getElementById(wrapId);
    if (!menu) return;
    const isOpen = !menu.hasAttribute('hidden');
    closeAllToolbarMenus();
    if (!isOpen) {
      menu.removeAttribute('hidden');
      wrap?.classList.add('is-open');
    }
  }

  function updateToolbarActiveStates() {
    if (!selectionToolbar || selectionToolbar.hasAttribute('hidden')) return;

    const selection = window.getSelection();
    const range = (selection && selection.rangeCount > 0) ? selection.getRangeAt(0) : wpSavedTextRange;
    const container = range ? (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement) : null;

    // Primary command states
    try {
      selectionToolbar.querySelector('[data-inline-cmd="bold"]')?.classList.toggle('is-active', !!document.queryCommandState('bold'));
      selectionToolbar.querySelector('[data-inline-cmd="italic"]')?.classList.toggle('is-active', !!document.queryCommandState('italic'));
      selectionToolbar.querySelector('[data-inline-cmd="underline"]')?.classList.toggle('is-active', !!document.queryCommandState('underline'));
      selectionToolbar.querySelector('[data-inline-cmd="strikeThrough"]')?.classList.toggle('is-active', !!document.queryCommandState('strikeThrough'));
      selectionToolbar.querySelector('[data-inline-cmd="subscript"]')?.classList.toggle('is-active', !!document.queryCommandState('subscript'));
      selectionToolbar.querySelector('[data-inline-cmd="superscript"]')?.classList.toggle('is-active', !!document.queryCommandState('superscript'));
    } catch (e) {
      // Query command state may fail on edge environments
    }

    // Link, highlight, and inline code states
    const isLink = !!container?.closest('a');
    const isHighlight = !!container?.closest('mark');
    const isCode = !!container?.closest('code');

    selectionToolbar.querySelector('#wp-tb-link-btn')?.classList.toggle('is-active', isLink);
    selectionToolbar.querySelector('#wp-tb-highlight-btn')?.classList.toggle('is-active', isHighlight);
    selectionToolbar.querySelector('[data-inline-cmd="inlineCode"]')?.classList.toggle('is-active', isCode);

    // Update block transform button label and icon
    const wrapper = wpSelectedEditable?.closest('.wp-block-wrapper') || document.querySelector(`.wp-block-wrapper[data-block-id="${activeBlockId}"]`);
    const block = postBlocks.find(item => item.id === (wrapper?.dataset.blockId || activeBlockId));
    if (block) {
      const blockLabelEl = document.getElementById('wp-tb-block-label');
      const blockIconEl = document.getElementById('wp-tb-block-icon');
      const alignIconEl = document.getElementById('wp-tb-align-icon');

      const typeKey = block.type === 'heading' ? `heading:${block.level || 'h2'}` : block.type;
      const labelMap = {
        paragraph: 'Paragraph',
        'heading:h2': 'Heading 2',
        'heading:h3': 'Heading 3',
        'heading:h4': 'Heading 4',
        list: 'Bullet List',
        quote: 'Quote',
        code: 'Code'
      };
      if (blockLabelEl) blockLabelEl.textContent = labelMap[typeKey] || 'Paragraph';

      const iconSvgMap = {
        paragraph: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`,
        'heading:h2': `<span style="font-weight:700;font-size:12px;">H2</span>`,
        'heading:h3': `<span style="font-weight:700;font-size:12px;">H3</span>`,
        'heading:h4': `<span style="font-weight:700;font-size:12px;">H4</span>`,
        list: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="2" fill="currentColor"/><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="4" cy="18" r="2" fill="currentColor"/></svg>`,
        quote: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>`,
        code: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
      };
      if (blockIconEl) blockIconEl.innerHTML = iconSvgMap[typeKey] || iconSvgMap.paragraph;

      // Update block menu active item
      document.querySelectorAll('#wp-tb-block-menu .wp-tb-menu-item').forEach(item => {
        item.classList.toggle('is-selected', item.dataset.transformType === typeKey);
      });

      // Update align menu active item & icon
      const align = block.align || 'left';
      document.querySelectorAll('#wp-tb-align-menu .wp-tb-menu-item').forEach(item => {
        item.classList.toggle('is-selected', item.dataset.alignType === align);
      });

      const alignSvgMap = {
        left: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="15" y1="18" x2="3" y2="18"/></svg>`,
        center: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>`,
        right: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/></svg>`,
        justify: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>`
      };
      if (alignIconEl) alignIconEl.innerHTML = alignSvgMap[align] || alignSvgMap.left;
    }
  }

  function transformBlockType(typeStr) {
    const wrapper = wpSelectedEditable?.closest('.wp-block-wrapper') || document.querySelector(`.wp-block-wrapper[data-block-id="${activeBlockId}"]`);
    const blockId = wrapper?.dataset.blockId || activeBlockId;
    const block = postBlocks.find(item => item.id === blockId);
    if (!block) return;

    const [type, level] = typeStr.split(':');
    const oldType = block.type;
    block.type = type;
    block.level = level || (type === 'heading' ? 'h2' : undefined);

    // If converting between list and normal paragraph, clean up bullets or add bullets
    if (type === 'list' && oldType !== 'list') {
      if (block.content && !/<li\b/i.test(block.content)) {
        const temp = document.createElement('div');
        temp.innerHTML = String(block.content).replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/p>|<\/div>/gi, '\n');
        const lines = temp.textContent.split('\n').map(line => line.trim()).filter(Boolean);
        block.content = lines.map(line => `<li>${escapeHtml(line)}</li>`).join('');
      }
    } else if (oldType === 'list' && type !== 'list') {
      if (block.content) {
        const temp = document.createElement('div');
        temp.innerHTML = `<ul>${block.content}</ul>`;
        block.content = Array.from(temp.querySelectorAll('li')).map(item => item.innerHTML).join('<br>');
      }
    }

    renderGutenbergBlocks();
    updateRankMathScore();
    closeAllToolbarMenus();

    const newWrapper = document.querySelector(`.wp-block-wrapper[data-block-id="${blockId}"]`);
    const newEditable = newWrapper?.querySelector('.wp-block-editable');
    if (newEditable) {
      newEditable.focus();
      setActiveBlock(blockId);
      wpSelectedEditable = newEditable;
    }
  }

  function setBlockAlignment(alignType) {
    const wrapper = wpSelectedEditable?.closest('.wp-block-wrapper') || document.querySelector(`.wp-block-wrapper[data-block-id="${activeBlockId}"]`);
    const blockId = wrapper?.dataset.blockId || activeBlockId;
    const block = postBlocks.find(item => item.id === blockId);
    if (!block) return;

    block.align = alignType;
    if (wrapper) wrapper.style.textAlign = alignType;

    renderGutenbergBlocks();
    closeAllToolbarMenus();

    const newWrapper = document.querySelector(`.wp-block-wrapper[data-block-id="${blockId}"]`);
    const newEditable = newWrapper?.querySelector('.wp-block-editable');
    if (newEditable) {
      newEditable.focus();
      setActiveBlock(blockId);
      wpSelectedEditable = newEditable;
    }
  }

  function openLinkPopover() {
    if (!selectionToolbar) return;
    const popover = document.getElementById('wp-tb-link-popover');
    const input = document.getElementById('wp-tb-link-input');
    const blankCheckbox = document.getElementById('wp-tb-link-blank');
    const unlinkBtn = document.getElementById('wp-tb-link-unlink');
    if (!popover || !input) return;

    // Toggle popover if already open
    if (!popover.hasAttribute('hidden')) {
      popover.setAttribute('hidden', '');
      return;
    }

    closeAllToolbarMenus();

    // Check if selection is inside an anchor
    let currentLink = null;
    if (wpSavedTextRange) {
      const container = wpSavedTextRange.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? wpSavedTextRange.commonAncestorContainer
        : wpSavedTextRange.commonAncestorContainer.parentElement;
      currentLink = container?.closest('a');
    }

    if (currentLink) {
      input.value = currentLink.getAttribute('href') || '';
      if (blankCheckbox) blankCheckbox.checked = currentLink.getAttribute('target') === '_blank';
      if (unlinkBtn) unlinkBtn.style.display = 'inline-flex';
    } else {
      input.value = '';
      if (blankCheckbox) blankCheckbox.checked = true;
      if (unlinkBtn) unlinkBtn.style.display = 'none';
    }

    popover.removeAttribute('hidden');
    input.focus();
    input.select();
  }

  function applyLink() {
    const input = document.getElementById('wp-tb-link-input');
    const blankCheckbox = document.getElementById('wp-tb-link-blank');
    let url = input?.value?.trim() || '';
    if (!url) return;

    if (!/^([a-z]+:|\/|#)/i.test(url)) {
      url = 'https://' + url;
    }

    restoreSelectedText();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    const currentLink = container?.closest('a');

    if (currentLink) {
      currentLink.setAttribute('href', url);
      if (blankCheckbox?.checked) {
        currentLink.setAttribute('target', '_blank');
        currentLink.setAttribute('rel', 'noopener noreferrer');
      } else {
        currentLink.removeAttribute('target');
        currentLink.removeAttribute('rel');
      }
    } else {
      if (!range.collapsed) {
        document.execCommand('createLink', false, url);
        const targetContainer = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement;
        const createdLinks = targetContainer?.querySelectorAll(`a[href="${url}"]`);
        createdLinks?.forEach(a => {
          if (blankCheckbox?.checked) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
          }
        });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.textContent = url;
        if (blankCheckbox?.checked) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        range.insertNode(a);
      }
    }

    syncSelectedBlockContent();
    closeAllToolbarMenus();
    updateToolbarActiveStates();
  }

  function removeLink() {
    restoreSelectedText();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
    const currentLink = container?.closest('a');

    if (currentLink) {
      const parent = currentLink.parentNode;
      while (currentLink.firstChild) parent.insertBefore(currentLink.firstChild, currentLink);
      parent.removeChild(currentLink);
    } else {
      document.execCommand('unlink', false, null);
    }

    syncSelectedBlockContent();
    closeAllToolbarMenus();
    updateToolbarActiveStates();
  }

  function toggleHighlight() {
    restoreSelectedText();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const markEl = (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement)?.closest('mark');

    if (markEl) {
      const parent = markEl.parentNode;
      while (markEl.firstChild) parent.insertBefore(markEl.firstChild, markEl);
      parent.removeChild(markEl);
    } else if (!range.collapsed) {
      const mark = document.createElement('mark');
      mark.className = 'wp-highlight';
      try {
        const fragment = range.extractContents();
        mark.appendChild(fragment);
        range.insertNode(mark);

        const sel = window.getSelection();
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(mark);
        sel.addRange(newRange);
        wpSavedTextRange = newRange.cloneRange();
      } catch (e) {
        document.execCommand('hiliteColor', false, '#fef08a');
      }
    }

    syncSelectedBlockContent();
    updateToolbarActiveStates();
  }

  function toggleInlineCode() {
    restoreSelectedText();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const codeEl = (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement)?.closest('code');

    if (codeEl) {
      const parent = codeEl.parentNode;
      while (codeEl.firstChild) parent.insertBefore(codeEl.firstChild, codeEl);
      parent.removeChild(codeEl);
    } else if (!range.collapsed) {
      const code = document.createElement('code');
      try {
        const fragment = range.extractContents();
        code.appendChild(fragment);
        range.insertNode(code);

        const sel = window.getSelection();
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(code);
        sel.addRange(newRange);
        wpSavedTextRange = newRange.cloneRange();
      } catch (e) {
        const text = range.toString() || '';
        document.execCommand('insertHTML', false, `<code>${escapeHtml(text)}</code>`);
      }
    }

    syncSelectedBlockContent();
    closeAllToolbarMenus();
    updateToolbarActiveStates();
  }

  function clearFormatting() {
    restoreSelectedText();
    document.execCommand('removeFormat', false, null);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const ancestor = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
      if (ancestor) {
        ancestor.querySelectorAll('mark, code').forEach(el => {
          if (range.intersectsNode(el)) {
            const parent = el.parentNode;
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
          }
        });
      }
    }

    syncSelectedBlockContent();
    closeAllToolbarMenus();
    updateToolbarActiveStates();
  }

  // Prevent losing selection on toolbar clicks (except input / checkbox)
  selectionToolbar?.addEventListener('mousedown', event => {
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'LABEL') {
      event.preventDefault();
    }
  });

  // Dropdown Triggers
  document.getElementById('wp-tb-block-btn')?.addEventListener('click', () => {
    toggleToolbarMenu('wp-tb-block-menu', 'wp-tb-block-dropdown-wrap');
  });

  document.getElementById('wp-tb-align-btn')?.addEventListener('click', () => {
    toggleToolbarMenu('wp-tb-align-menu', 'wp-tb-align-dropdown-wrap');
  });

  document.getElementById('wp-tb-more-btn')?.addEventListener('click', () => {
    toggleToolbarMenu('wp-tb-more-menu', 'wp-tb-more-dropdown-wrap');
  });

  document.getElementById('wp-tb-link-btn')?.addEventListener('click', () => {
    openLinkPopover();
  });

  document.getElementById('wp-tb-highlight-btn')?.addEventListener('click', () => {
    toggleHighlight();
  });

  // Dropdown Item Selectors
  document.querySelectorAll('#wp-tb-block-menu .wp-tb-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.transformType;
      if (type) transformBlockType(type);
    });
  });

  document.querySelectorAll('#wp-tb-align-menu .wp-tb-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const align = item.dataset.alignType;
      if (align) setBlockAlignment(align);
    });
  });

  // Inline Command Buttons
  selectionToolbar?.querySelectorAll('[data-inline-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.inlineCmd;
      if (!cmd) return;

      if (cmd === 'inlineCode') {
        toggleInlineCode();
      } else if (cmd === 'removeFormat') {
        clearFormatting();
      } else {
        restoreSelectedText();
        document.execCommand(cmd, false, null);
        syncSelectedBlockContent();
        closeAllToolbarMenus();
        updateToolbarActiveStates();
      }
    });
  });

  // Link Popover Actions
  document.getElementById('wp-tb-link-apply')?.addEventListener('click', () => {
    applyLink();
  });

  document.getElementById('wp-tb-link-unlink')?.addEventListener('click', () => {
    removeLink();
  });

  document.getElementById('wp-tb-link-input')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyLink();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAllToolbarMenus();
    }
  });

  // Close menus when clicking outside
  document.addEventListener('mousedown', event => {
    if (!selectionToolbar?.contains(event.target)) {
      closeAllToolbarMenus();
    }
  });

  // Position and display toolbar on selectionchange
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      const linkPopover = document.getElementById('wp-tb-link-popover');
      if (!selectionToolbar?.contains(document.activeElement) && linkPopover?.hasAttribute('hidden')) {
        selectionToolbar?.setAttribute('hidden', '');
        closeAllToolbarMenus();
      }
      return;
    }

    const range = selection.getRangeAt(0);
    const element = (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement)?.closest?.('.wp-block-editable, .wp-toc-title, .wp-faq-question, .wp-faq-answer, [data-table-cell]');
    if (!element || !document.getElementById('view-post-editor')?.classList.contains('active-view')) return;

    wpSavedTextRange = range.cloneRange();
    wpSelectedEditable = element;
    const wrapper = element.closest('.wp-block-wrapper');
    if (wrapper) {
      setActiveBlock(wrapper.dataset.blockId);
    }

    const rect = range.getBoundingClientRect();
    if (!selectionToolbar || (!rect.width && !rect.height)) return;
    selectionToolbar.removeAttribute('hidden');

    const toolbarWidth = selectionToolbar.offsetWidth || 440;
    const toolbarHeight = selectionToolbar.offsetHeight || 42;

    let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    left = Math.max(12, Math.min(left, window.innerWidth - toolbarWidth - 12));

    let top = rect.top - toolbarHeight - 10;
    if (top < 10) {
      top = rect.bottom + 10;
    }

    selectionToolbar.style.left = `${Math.round(left)}px`;
    selectionToolbar.style.top = `${Math.round(top)}px`;

    updateToolbarActiveStates();
  });

  // Font Size Buttons in Block settings
  document.querySelectorAll('.wp-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wp-size-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.fontWeight = 'normal';
      });
      btn.classList.add('active');
      btn.style.background = '#ffffff';
      btn.style.fontWeight = '600';
      const size = btn.dataset.size;
      const activeEl = document.querySelector(`.wp-block-wrapper[data-block-id="${activeBlockId}"] .wp-block-editable`);
      if (activeEl) {
        activeEl.style.fontSize = size;
      }
    });
  });

  // Color Pickers
  document.getElementById('wp-block-color-picker')?.addEventListener('input', e => {
    const activeEl = document.querySelector(`.wp-block-wrapper[data-block-id="${activeBlockId}"] .wp-block-editable`);
    if (activeEl) activeEl.style.color = e.target.value;
  });
  document.getElementById('wp-block-bg-picker')?.addEventListener('input', e => {
    const activeEl = document.querySelector(`.wp-block-wrapper[data-block-id="${activeBlockId}"]`);
    if (activeEl) activeEl.style.background = e.target.value;
  });



  // Rank Math Focus Keyword
  document.getElementById('wp-focus-keyword')?.addEventListener('input', updateRankMathScore);

  // Featured Image Upload
  document.getElementById('wp-featured-img-box')?.addEventListener('click', () => {
    document.getElementById('wp-featured-img-file')?.click();
  });
  document.getElementById('wp-featured-img-file')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        postFeaturedImgUrl = ev.target.result;
        const imgPreview = document.getElementById('wp-featured-img-preview');
        const imgPlaceholder = document.getElementById('wp-featured-img-placeholder');
        const btnRemove = document.getElementById('wp-btn-remove-featured-img');
        if (imgPreview && imgPlaceholder && btnRemove) {
          imgPreview.src = postFeaturedImgUrl;
          imgPreview.style.display = 'block';
          imgPlaceholder.style.display = 'none';
          btnRemove.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    }
  });
  document.getElementById('wp-btn-remove-featured-img')?.addEventListener('click', (e) => {
    e.stopPropagation();
    postFeaturedImgUrl = '';
    const imgPreview = document.getElementById('wp-featured-img-preview');
    const imgPlaceholder = document.getElementById('wp-featured-img-placeholder');
    const btnRemove = document.getElementById('wp-btn-remove-featured-img');
    if (imgPreview && imgPlaceholder && btnRemove) {
      imgPreview.style.display = 'none';
      imgPlaceholder.style.display = 'block';
      btnRemove.style.display = 'none';
    }
  });

  function openAuthorPhotoChooser() {
    showImageSourceChooser({
      title: 'Choose author photo',
      onDeviceUpload: () => {
        document.getElementById('wp-author-img-file')?.click();
      },
      onSelect: (url) => {
        const input = document.getElementById('wp-author-image');
        if (input) input.value = url;
        updateEditorBylinePreview();
        markPostDirty();
      }
    });
  }

  function openReviewerPhotoChooser() {
    showImageSourceChooser({
      title: 'Choose reviewer photo',
      onDeviceUpload: () => {
        document.getElementById('wp-reviewer-img-file')?.click();
      },
      onSelect: (url) => {
        const input = document.getElementById('wp-reviewer-image');
        if (input) input.value = url;
        updateEditorBylinePreview();
        markPostDirty();
      }
    });
  }

  // Author & Reviewer Photo Upload Handlers
  document.getElementById('wp-btn-upload-author-photo')?.addEventListener('click', openAuthorPhotoChooser);
  document.getElementById('wp-btn-change-author-img')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openAuthorPhotoChooser();
  });
  document.getElementById('wp-author-img-file')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const input = document.getElementById('wp-author-image');
        if (input) input.value = ev.target.result;
        updateEditorBylinePreview();
        markPostDirty();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  });
  document.getElementById('wp-btn-default-author-photo')?.addEventListener('click', () => {
    const input = document.getElementById('wp-author-image');
    if (input) input.value = '';
    updateEditorBylinePreview();
    markPostDirty();
  });

  document.getElementById('wp-btn-upload-reviewer-photo')?.addEventListener('click', openReviewerPhotoChooser);
  document.getElementById('wp-btn-change-reviewer-img')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openReviewerPhotoChooser();
  });
  document.getElementById('wp-reviewer-img-file')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const input = document.getElementById('wp-reviewer-image');
        if (input) input.value = ev.target.result;
        updateEditorBylinePreview();
        markPostDirty();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  });
  document.getElementById('wp-btn-default-reviewer-photo')?.addEventListener('click', () => {
    const input = document.getElementById('wp-reviewer-image');
    if (input) input.value = '';
    updateEditorBylinePreview();
    markPostDirty();
  });

  // Live typing sync for author and reviewer inputs
  ['wp-author-name', 'wp-author-role', 'wp-author-image', 'wp-author-link', 'wp-reviewer-name', 'wp-reviewer-role', 'wp-reviewer-image', 'wp-reviewer-link'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      updateEditorBylinePreview();
      isPostDirty = true;
    });
  });

  // Live typing sync from canvas in-between byline editable elements to sidebar inputs
  ['wp-editor-author-name-label', 'wp-editor-author-role-label', 'wp-editor-reviewer-name-label', 'wp-editor-reviewer-role-label'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      if (id === 'wp-editor-author-name-label') {
        const inp = document.getElementById('wp-author-name');
        if (inp) inp.value = el.textContent.trim();
      } else if (id === 'wp-editor-author-role-label') {
        const inp = document.getElementById('wp-author-role');
        if (inp) inp.value = el.textContent.trim();
      } else if (id === 'wp-editor-reviewer-name-label') {
        const inp = document.getElementById('wp-reviewer-name');
        if (inp) inp.value = el.textContent.trim();
      } else if (id === 'wp-editor-reviewer-role-label') {
        const inp = document.getElementById('wp-reviewer-role');
        if (inp) inp.value = el.textContent.trim();
      }
      isPostDirty = true;
    });
    el.addEventListener('click', e => e.stopPropagation());
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur();
      }
    });
  });

  // Show/hide both together
  document.getElementById('wp-show-byline-both')?.addEventListener('change', e => {
    const isChecked = e.target.checked;
    const authorCb = document.getElementById('wp-show-author');
    const reviewerCb = document.getElementById('wp-show-reviewer');
    if (authorCb) authorCb.checked = isChecked;
    if (reviewerCb) reviewerCb.checked = isChecked;
    updateEditorBylinePreview();
    markPostDirty();
  });

  // Show/hide individually in sidebar
  ['wp-show-author', 'wp-show-reviewer'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const showAuthor = document.getElementById('wp-show-author')?.checked === true;
      const showReviewer = document.getElementById('wp-show-reviewer')?.checked === true;
      const bothCb = document.getElementById('wp-show-byline-both');
      if (bothCb) bothCb.checked = (showAuthor || showReviewer);
      updateEditorBylinePreview();
      markPostDirty();
    });
  });

  // Canvas Byline Bar: Hide individual cards
  document.getElementById('wp-btn-hide-author')?.addEventListener('click', e => {
    e.stopPropagation();
    const authorCb = document.getElementById('wp-show-author');
    if (authorCb) authorCb.checked = false;
    updateEditorBylinePreview();
    markPostDirty();
  });
  document.getElementById('wp-btn-hide-reviewer')?.addEventListener('click', e => {
    e.stopPropagation();
    const reviewerCb = document.getElementById('wp-show-reviewer');
    if (reviewerCb) reviewerCb.checked = false;
    updateEditorBylinePreview();
    markPostDirty();
  });

  // Canvas Byline Bar: Restore individual cards
  document.getElementById('wp-btn-restore-author')?.addEventListener('click', e => {
    e.stopPropagation();
    const authorCb = document.getElementById('wp-show-author');
    if (authorCb) authorCb.checked = true;
    updateEditorBylinePreview();
    markPostDirty();
  });
  document.getElementById('wp-btn-restore-reviewer')?.addEventListener('click', e => {
    e.stopPropagation();
    const reviewerCb = document.getElementById('wp-show-reviewer');
    if (reviewerCb) reviewerCb.checked = true;
    updateEditorBylinePreview();
    markPostDirty();
  });

  // Canvas Byline Bar: Hide / Restore both together
  document.getElementById('wp-btn-hide-both')?.addEventListener('click', e => {
    e.stopPropagation();
    const bothCb = document.getElementById('wp-show-byline-both');
    const authorCb = document.getElementById('wp-show-author');
    const reviewerCb = document.getElementById('wp-show-reviewer');
    if (bothCb) bothCb.checked = false;
    if (authorCb) authorCb.checked = false;
    if (reviewerCb) reviewerCb.checked = false;
    updateEditorBylinePreview();
    markPostDirty();
  });
  document.getElementById('wp-btn-restore-both')?.addEventListener('click', e => {
    e.stopPropagation();
    const bothCb = document.getElementById('wp-show-byline-both');
    const authorCb = document.getElementById('wp-show-author');
    const reviewerCb = document.getElementById('wp-show-reviewer');
    if (bothCb) bothCb.checked = true;
    if (authorCb) authorCb.checked = true;
    if (reviewerCb) reviewerCb.checked = true;
    updateEditorBylinePreview();
    markPostDirty();
  });

  // Direct avatar clicks on canvas to upload/change photo
  document.getElementById('wp-btn-upload-author-avatar-wrap')?.addEventListener('click', e => {
    e.stopPropagation();
    openAuthorPhotoChooser();
  });
  document.getElementById('wp-btn-upload-reviewer-avatar-wrap')?.addEventListener('click', e => {
    e.stopPropagation();
    openReviewerPhotoChooser();
  });

  // Tags input
  document.getElementById('wp-post-tags-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = e.target.value.replace(/,/g, '').trim();
      if (val && !postTags.includes(val)) {
        postTags.push(val);
        renderPostTags();
      }
      e.target.value = '';
    }
  });

  // Add category toggle
  document.getElementById('wp-btn-add-cat-toggle')?.addEventListener('click', () => {
    const box = document.getElementById('wp-new-cat-inline');
    if (box) {
      const isHidden = box.style.display === 'none' || !box.style.display;
      box.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) document.getElementById('wp-new-cat-name')?.focus();
    }
  });

  const saveGutenbergNewPostCategory = async () => {
    const input = document.getElementById('wp-new-cat-name');
    const parentSel = document.getElementById('wp-new-cat-parent');
    const catName = input?.value.trim();
    if (catName) {
      taxonomies.postCategories = taxonomies.postCategories || [];
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const parent = parentSel ? parentSel.value : '';
      const existing = taxonomies.postCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
      if (!existing) {
        taxonomies.postCategories.push({ name: catName, slug, parent, description: '', count: 0 });
        await saveTaxonomies();
        renderPostCategoryFilterDropdown();
      } else if (parent && !existing.parent) {
        existing.parent = parent;
        await saveTaxonomies();
        renderPostCategoryFilterDropdown();
      }
      const currentSelected = Array.from(document.querySelectorAll('input[name="wp-categories"]:checked')).map(cb => cb.value);
      if (!currentSelected.includes(catName)) currentSelected.push(catName);
      renderGutenbergPostCategoriesChecklist(currentSelected);
      markPostDirty();
      input.value = '';
      if (parentSel) parentSel.value = '';
      document.getElementById('wp-new-cat-inline').style.display = 'none';
    }
  };

  document.getElementById('wp-btn-save-new-cat')?.addEventListener('click', saveGutenbergNewPostCategory);
  document.getElementById('wp-new-cat-name')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveGutenbergNewPostCategory();
    }
  });

  // Post Publishing and Saving Function
  function syncImageMetadataFromEditor() {
    document.querySelectorAll('[data-image-alt-id]').forEach(input => {
      const block = postBlocks.find(item => item.id === input.dataset.imageAltId && item.type === 'image');
      if (block) block.alt = String(input.value || '').trim();
    });
    document.querySelectorAll('.wp-block-wrapper[data-block-id]').forEach(wrapper => {
      const block = postBlocks.find(item => item.id === wrapper.dataset.blockId && item.type === 'image');
      const caption = wrapper.querySelector('.wp-block-caption');
      if (block && caption) block.caption = caption.textContent.trim();
    });
  }

  function saveGutenbergPage(status = 'published') {
    syncImageMetadataFromEditor();
    const title = document.getElementById('wp-post-title-input')?.value.trim() || 'Untitled Page';
    const slug = document.getElementById('wp-post-slug')?.value.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const content = serializeGutenbergBlocks();
    const pageStatus = status === 'draft' ? 'draft' : 'published';
    let page = pages.find(item => item.id === editingPageId);
    if (page) {
      Object.assign(page, { title, slug, content, status: pageStatus, metaTitle: document.getElementById('wp-seo-title')?.value.trim() || title, metaDescription: document.getElementById('wp-seo-description')?.value.trim() || '', schema: page.schema === 'Off' ? 'WebPage' : (page.schema || 'WebPage') });
    } else {
      page = { id: Date.now(), title, slug, content, status: pageStatus, metaTitle: document.getElementById('wp-seo-title')?.value.trim() || title, metaDescription: document.getElementById('wp-seo-description')?.value.trim() || '', author: 'Trikonet', views: 0, comments: '—', date: `Published ${new Date().toLocaleDateString('en-US')}`, rawDate: new Date().toISOString().slice(0, 10), seoScore: updateRankMathScore(), keyword: document.getElementById('wp-focus-keyword')?.value.trim() || 'Not Set', schema: 'WebPage', links: '0 | 0 | 0' };
      pages.unshift(page);
    }
    editingPageId = Number(page.id);
    isPostDirty = false;
    savePages();
    renderPageRows();
    location.hash = `pages-${getPageGroup(page)}`;
  }

  function saveGutenbergPost(status = 'published') {
    syncImageMetadataFromEditor();
    const missingAlt = postBlocks.find(block => block.type === 'image' && String(block.src || '').trim() && !String(block.alt || '').trim());
    if (missingAlt) {
      activeBlockId = missingAlt.id;
      renderGutenbergBlocks();
      const input = document.querySelector(`[data-image-alt-id="${missingAlt.id}"]`);
      input?.classList.add('is-invalid');
      input?.focus();
      alert('Alt text is required for every image before saving.');
      return;
    }
    if (editorDocumentType === 'page') {
      saveGutenbergPage(status);
      return;
    }
    const id = Number(document.getElementById('wp-field-post-id')?.value) || 0;
    const title = document.getElementById('wp-post-title-input')?.value.trim() || 'Untitled Post';
    const slug = document.getElementById('wp-post-slug')?.value.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const author = document.getElementById('wp-author-name')?.value.trim() || document.getElementById('wp-post-author')?.value.trim() || 'Trikonet';
    const keyword = document.getElementById('wp-focus-keyword')?.value.trim() || '';
    const excerpt = document.getElementById('wp-post-excerpt')?.value.trim() || '';
    const selectedCats = Array.from(document.querySelectorAll('input[name="wp-categories"]:checked')).map(cb => cb.value);
    const category = selectedCats.length ? selectedCats[0] : 'Career Tips';
    const content = serializeGutenbergBlocks();
    const seoScore = updateRankMathScore();

    const scheduleDatetime = document.getElementById('wp-post-schedule-datetime')?.value;
    let finalStatus = status;
    let finalDate = `Published ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}`;
    let finalRawDate = new Date().toISOString().slice(0, 10);
    let finalScheduledAt = null;

    if (status !== 'draft' && scheduleDatetime) {
      const targetTime = new Date(scheduleDatetime);
      if (!isNaN(targetTime.getTime()) && targetTime > new Date()) {
        finalStatus = 'scheduled';
        finalScheduledAt = scheduleDatetime;
        const formattedDateStr = targetTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const formattedTimeStr = targetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        finalDate = `Scheduled for ${formattedDateStr} at ${formattedTimeStr}`;
        finalRawDate = scheduleDatetime.slice(0, 10);
      }
    }

    if (id) {
      const existing = posts.find(p => p.id === id);
      if (existing) {
        existing.title = title;
        existing.slug = slug;
        existing.categories = selectedCats.length ? selectedCats : [category];
        existing.author = author;
        existing.keyword = keyword;
        existing.excerpt = excerpt;
        existing.metaTitle = document.getElementById('wp-seo-title')?.value.trim() || title;
        existing.metaDescription = document.getElementById('wp-seo-description')?.value.trim() || excerpt;
        existing.authorName = document.getElementById('wp-author-name')?.value.trim() || '';
        existing.authorRole = document.getElementById('wp-author-role')?.value.trim() || 'Written By';
        existing.authorImage = document.getElementById('wp-author-image')?.value.trim() || '';
        existing.authorLink = document.getElementById('wp-author-link')?.value.trim() || '#';
        existing.showAuthor = document.getElementById('wp-show-author')?.checked === true;
        existing.reviewer = document.getElementById('wp-reviewer-name')?.value.trim() || '';
        existing.reviewerRole = document.getElementById('wp-reviewer-role')?.value.trim() || 'Reviewed by:';
        existing.reviewerImage = document.getElementById('wp-reviewer-image')?.value.trim() || '';
        existing.reviewerLink = document.getElementById('wp-reviewer-link')?.value.trim() || '#';
        existing.showReviewer = document.getElementById('wp-show-reviewer')?.checked === true;
        existing.content = content;
        existing.status = finalStatus;
        existing.scheduledAt = finalScheduledAt;
        if (finalStatus === 'scheduled') {
          existing.date = finalDate;
          existing.rawDate = finalRawDate;
        }
        existing.seoScore = seoScore;
        if (postFeaturedImgUrl) existing.featuredImage = postFeaturedImgUrl;
        if (postTags.length) existing.tags = postTags;
      }
    } else {
      const newPost = {
        id: Date.now(),
        title,
        slug,
        author,
        categories: selectedCats.length ? selectedCats : [category],
        tags: postTags,
        views: 0,
        comments: 0,
        date: finalDate,
        rawDate: finalRawDate,
        status: finalStatus,
        scheduledAt: finalScheduledAt,
        isMine: true,
        seoScore: seoScore,
        keyword: keyword || 'Career Advice',
        schema: 'Article (BlogPosting)',
        links: '1 | 1 | 2',
        excerpt,
        metaTitle: document.getElementById('wp-seo-title')?.value.trim() || title,
        metaDescription: document.getElementById('wp-seo-description')?.value.trim() || excerpt,
        authorName: document.getElementById('wp-author-name')?.value.trim() || '',
        authorRole: document.getElementById('wp-author-role')?.value.trim() || 'Written By',
        authorImage: document.getElementById('wp-author-image')?.value.trim() || '',
        authorLink: document.getElementById('wp-author-link')?.value.trim() || '#',
        showAuthor: document.getElementById('wp-show-author')?.checked === true,
        reviewer: document.getElementById('wp-reviewer-name')?.value.trim() || '',
        reviewerRole: document.getElementById('wp-reviewer-role')?.value.trim() || 'Reviewed by:',
        reviewerImage: document.getElementById('wp-reviewer-image')?.value.trim() || '',
        reviewerLink: document.getElementById('wp-reviewer-link')?.value.trim() || '#',
        showReviewer: document.getElementById('wp-show-reviewer')?.checked === true,
        content,
        featuredImage: postFeaturedImgUrl || '/assets/article-1.jpg'
      };
      posts.unshift(newPost);
    }

    isPostDirty = false;
    savePosts();
    renderPostRows();
    renderPostCategoryFilterDropdown();
    location.hash = 'posts';
  }

  function handleScheduleChange() {
    const input = document.getElementById('wp-post-schedule-datetime');
    const publishVal = document.getElementById('wp-publish-date-val');
    const pubBtn = document.getElementById('wp-btn-publish');
    const hint = document.getElementById('wp-schedule-hint');
    const postId = document.getElementById('wp-field-post-id')?.value;

    if (!input || !publishVal) return;
    const val = input.value;
    if (val) {
      const dt = new Date(val);
      if (!isNaN(dt.getTime())) {
        const isFuture = dt > new Date();
        const formatted = dt.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
        publishVal.textContent = formatted;
        if (isFuture) {
          if (pubBtn) pubBtn.textContent = 'Schedule';
          if (hint) hint.innerHTML = `<span style="color:#0284c7; font-weight:600;">✓ Scheduled for ${formatted}</span>`;
        } else {
          if (pubBtn) pubBtn.textContent = postId ? 'Update' : 'Publish';
          if (hint) hint.innerHTML = `<span style="color:#64748b;">Past/current date. Will publish immediately.</span>`;
        }
        return;
      }
    }
    publishVal.textContent = 'Immediately';
    if (pubBtn) pubBtn.textContent = postId ? 'Update' : 'Publish';
    if (hint) hint.textContent = 'Select a future date & time to schedule this post.';
  }

  document.getElementById('wp-publish-date-val')?.addEventListener('click', () => {
    const panel = document.getElementById('wp-schedule-panel');
    if (!panel) return;
    const isClosed = panel.style.display === 'none' || !panel.style.display;
    panel.style.display = isClosed ? 'block' : 'none';
    if (isClosed) {
      const input = document.getElementById('wp-post-schedule-datetime');
      if (input && !input.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const y = tomorrow.getFullYear();
        const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const d = String(tomorrow.getDate()).padStart(2, '0');
        const h = String(tomorrow.getHours()).padStart(2, '0');
        const min = String(tomorrow.getMinutes()).padStart(2, '0');
        input.value = `${y}-${m}-${d}T${h}:${min}`;
        handleScheduleChange();
      }
    }
  });

  document.getElementById('wp-post-schedule-datetime')?.addEventListener('input', handleScheduleChange);
  document.getElementById('wp-post-schedule-datetime')?.addEventListener('change', handleScheduleChange);

  document.getElementById('wp-btn-reset-schedule')?.addEventListener('click', () => {
    const input = document.getElementById('wp-post-schedule-datetime');
    if (input) input.value = '';
    handleScheduleChange();
    const panel = document.getElementById('wp-schedule-panel');
    if (panel) panel.style.display = 'none';
  });

  document.getElementById('wp-btn-publish')?.addEventListener('click', () => saveGutenbergPost('published'));
  document.getElementById('wp-btn-save-draft')?.addEventListener('click', () => saveGutenbergPost('draft'));

  function updateSeoSnippetPreview() {
    const title = document.getElementById('wp-seo-title')?.value.trim() || document.getElementById('wp-post-title-input')?.value.trim() || 'Page title';
    const slug = document.getElementById('wp-seo-permalink')?.value.trim().replace(/^\/+|\/+$/g, '') || '';
    const description = document.getElementById('wp-seo-description')?.value.trim() || 'Add a concise description for search results.';
    const keyword = document.getElementById('wp-focus-keyword')?.value.trim().toLowerCase() || '';
    document.getElementById('wp-seo-preview-title').textContent = title;
    document.getElementById('wp-seo-preview-url').textContent = `https://www.trikonet.com/${slug}`;
    document.getElementById('wp-seo-preview-description').textContent = description;
    document.getElementById('wp-seo-title-count').textContent = `${title.length} / 60`;
    document.getElementById('wp-seo-slug-count').textContent = `${slug.length} / 75`;
    document.getElementById('wp-seo-description-count').textContent = `${description === 'Add a concise description for search results.' ? 0 : description.length} / 160`;
    const checks = [
      [title.length > 0 && title.length <= 60, 'SEO title is present and within 60 characters.'],
      [description.length > 30 && description.length <= 160, 'Meta description has a useful search-result length.'],
      [slug.length > 0 && slug.length <= 75, 'URL is concise and readable.'],
      [!keyword || title.toLowerCase().includes(keyword), keyword ? 'Focus keyword appears in the SEO title.' : 'Add a focus keyword for additional checks.']
    ];
    document.getElementById('wp-seo-checks').innerHTML = checks.map(([ok,text]) => `<p class="${ok ? 'is-good' : 'is-warning'}"><b>${ok ? '✓' : '×'}</b>${text}</p>`).join('');
  }
  document.getElementById('wp-btn-seo-snippet')?.addEventListener('click', () => {
    const title = document.getElementById('wp-post-title-input')?.value.trim() || '';
    const slug = document.getElementById('wp-post-slug')?.value.trim() || '';
    const excerpt = document.getElementById('wp-post-excerpt')?.value.trim() || '';
    if (!document.getElementById('wp-seo-title').value) document.getElementById('wp-seo-title').value = title;
    if (!document.getElementById('wp-seo-permalink').value) document.getElementById('wp-seo-permalink').value = slug;
    if (!document.getElementById('wp-seo-description').value) document.getElementById('wp-seo-description').value = excerpt;
    document.getElementById('wp-seo-modal').classList.add('is-open');
    document.getElementById('wp-seo-modal').setAttribute('aria-hidden', 'false');
    updateSeoSnippetPreview();
  });
  document.querySelectorAll('[data-close-seo-modal]').forEach(button => button.addEventListener('click', () => { document.getElementById('wp-seo-modal').classList.remove('is-open'); document.getElementById('wp-seo-modal').setAttribute('aria-hidden', 'true'); }));
  ['wp-seo-title','wp-seo-permalink','wp-seo-description'].forEach(id => document.getElementById(id)?.addEventListener('input', updateSeoSnippetPreview));
  document.getElementById('wp-seo-apply')?.addEventListener('click', () => {
    const slug = document.getElementById('wp-seo-permalink').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    document.getElementById('wp-seo-permalink').value = slug;
    const slugField = document.getElementById('wp-post-slug');
    if (slugField) { slugField.value = slug; slugField.dataset.manuallyEdited = 'true'; }
    document.getElementById('wp-seo-modal').classList.remove('is-open');
    markPostDirty();
  });

  const postEditorRootEl = document.getElementById('view-post-editor');
  postEditorRootEl?.addEventListener('input', () => markPostDirty());
  postEditorRootEl?.addEventListener('change', () => markPostDirty());

  document.getElementById('wp-btn-undo')?.addEventListener('click', () => {
    clearTimeout(postHistoryTimer);
    const current = getPostHistorySnapshot();
    if (postUndoStack[postUndoStack.length - 1] !== current) postUndoStack.push(current);
    if (postUndoStack.length <= 1) return updatePostHistoryButtons();
    postRedoStack.push(postUndoStack.pop());
    restorePostHistory(postUndoStack[postUndoStack.length - 1]);
  });

  document.getElementById('wp-btn-redo')?.addEventListener('click', () => {
    clearTimeout(postHistoryTimer);
    if (!postRedoStack.length) return updatePostHistoryButtons();
    const snapshot = postRedoStack.pop();
    postUndoStack.push(snapshot);
    restorePostHistory(snapshot);
  });

  document.querySelector('[data-chrome-panel="footer"] .site-logo-field')?.insertAdjacentHTML('beforebegin', '<label class="site-size-control"><span>Section-title size <output id="site-footer-title-size-output">18 px</output></span><input type="range" id="site-footer-title-size" min="14" max="32" step="1" value="18"><small>Original website size: 18 px</small></label>');
  const siteChromeDefaults = {
    headerLayout: 'classic', headerLogo: '/assets/logo-black.png', headerMenu: 'Home | /\nBlogs | /blog\nJobs | /jobs\nEmployers List | /employers\nContact Us | /contact\nAbout Us | /about', headerBg: '#ffffff', headerText: '#202124', headerAccent: '#b00008',
    footerLayout: 'trikonet-wide', footerTitleSize: '18', footerLogo: '/assets/logo-white.png', footerEmail: 'info@trikonet.com', footerExploreTitle: 'Explore', footerMenu: 'About Us | /about\nContact Us | /contact\nTerms | /terms\nFAQ | /faq\nPrivacy Policy | /privacy-policy', footerCandidateTitle: 'For Candidates', footerCandidateMenu: 'Browse Jobs | /jobs\nJob Alerts | /alerts-jobs', footerEmployerTitle: 'For Employers', footerEmployerMenu: 'Employers List | /employers\nSubmit Job | /submit-job', footerCopyright: '© 2026 Trikonet. All Right Reserved.', footerBg: '#202124', footerText: '#ffffff', footerLink: '#979797'
  };
  const siteChromeFieldMap = { headerLayout:'site-header-layout', headerLogo:'site-header-logo', headerMenu:'site-header-menu', headerBg:'site-header-bg', headerText:'site-header-text', headerAccent:'site-header-accent', footerLayout:'site-footer-layout', footerTitleSize:'site-footer-title-size', footerLogo:'site-footer-logo', footerEmail:'site-footer-email', footerExploreTitle:'site-footer-explore-title', footerMenu:'site-footer-menu', footerCandidateTitle:'site-footer-candidate-title', footerCandidateMenu:'site-footer-candidate-menu', footerEmployerTitle:'site-footer-employer-title', footerEmployerMenu:'site-footer-employer-menu', footerCopyright:'site-footer-copyright', footerBg:'site-footer-bg', footerText:'site-footer-text', footerLink:'site-footer-link' };
  const readSiteChromeSettings = () => Object.fromEntries(Object.entries(siteChromeFieldMap).map(([key,id]) => [key, document.getElementById(id)?.value ?? siteChromeDefaults[key]]));
  const parseChromeMenu = text => String(text || '').split('\n').map(line => line.split('|').map(value => value.trim())).filter(item => item[0]);
  function renderChromeMenuEditor(type) {
    const source = document.getElementById(`site-${type}-menu`);
    const editor = document.getElementById(`site-${type}-menu-editor`);
    if (!source || !editor) return;
    const items = parseChromeMenu(source.value);
    editor.innerHTML = items.map(([label,url,depth], index) => `<div class="site-menu-row${Number(depth) ? ' is-submenu' : ''}" data-menu-index="${index}" data-depth="${Number(depth) ? 1 : 0}"><span class="site-menu-grip">⋮⋮</span><input class="modern-input site-menu-label" aria-label="Menu label" value="${esc(label)}" placeholder="Menu name"><input class="modern-input site-menu-url" aria-label="Menu URL" value="${esc(url || '/') }" placeholder="/page-url"><button type="button" data-menu-action="outdent" title="Move to main menu">←</button><button type="button" data-menu-action="indent" title="Make submenu">→</button><button type="button" data-menu-action="up" title="Move up">↑</button><button type="button" data-menu-action="down" title="Move down">↓</button><button type="button" data-menu-action="remove" title="Remove">×</button></div>`).join('') || '<p class="site-menu-empty">No menu items. Select “Add menu item” to create one.</p>';
  }
  function syncChromeMenuEditor(type) {
    const source = document.getElementById(`site-${type}-menu`);
    if (!source) return;
    source.value = [...document.querySelectorAll(`#site-${type}-menu-editor .site-menu-row`)].map(row => `${row.querySelector('.site-menu-label')?.value.trim() || 'Menu item'} | ${row.querySelector('.site-menu-url')?.value.trim() || '/'} | ${row.dataset.depth || 0}`).join('\n');
    renderSiteChromePreview();
  }
  ['header','footer','footer-candidate','footer-employer'].forEach(type => {
    const editor = document.getElementById(`site-${type}-menu-editor`);
    editor?.addEventListener('input', () => syncChromeMenuEditor(type));
    editor?.addEventListener('click', event => {
      const button = event.target.closest('[data-menu-action]');
      const row = button?.closest('.site-menu-row');
      if (!button || !row) return;
      if (button.dataset.menuAction === 'remove') row.remove();
      if (button.dataset.menuAction === 'indent' && row.previousElementSibling?.classList.contains('site-menu-row')) { row.dataset.depth = '1'; row.classList.add('is-submenu'); }
      if (button.dataset.menuAction === 'outdent') { row.dataset.depth = '0'; row.classList.remove('is-submenu'); }
      if (button.dataset.menuAction === 'up' && row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
      if (button.dataset.menuAction === 'down' && row.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row);
      syncChromeMenuEditor(type);
    });
  });
  document.querySelectorAll('.site-add-menu-item').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.menuTarget;
    const source = document.getElementById(`site-${type}-menu`);
    if (!source) return;
    source.value += `${source.value.trim() ? '\n' : ''}New item | /`;
    renderChromeMenuEditor(type);
    document.querySelector(`#site-${type}-menu-editor .site-menu-row:last-child .site-menu-label`)?.focus();
    renderSiteChromePreview();
  }));
  function renderSiteChromePreview() {
    const target = document.getElementById('site-chrome-preview-frame');
    if (!target) return;
    const s = readSiteChromeSettings();
    target.style.setProperty('--preview-footer-title-size', `${s.footerTitleSize || 18}px`);
    const titleSizeOutput = document.getElementById('site-footer-title-size-output');
    if (titleSizeOutput) titleSizeOutput.textContent = `${s.footerTitleSize || 18} px`;
    const headerLinks = parseChromeMenu(s.headerMenu);
    const footerLinks = parseChromeMenu(s.footerMenu);
    target.innerHTML = `<div class="site-preview-page"><header class="layout-${esc(s.headerLayout)}" style="background:${esc(s.headerBg)};color:${esc(s.headerText)}"><img src="${esc(s.headerLogo)}" alt="Logo"><nav>${headerLinks.map(([label,,depth])=>`<span class="${Number(depth)?'preview-submenu':''}">${Number(depth)?'↳ ':''}${esc(label)}</span>`).join('')}</nav><b style="background:${esc(s.headerAccent)}">Action</b></header><main><div></div><div></div><div></div></main><footer class="layout-${esc(s.footerLayout)}" style="background:${esc(s.footerBg)};color:${esc(s.footerText)}"><div><img src="${esc(s.footerLogo)}" alt="Footer logo"><small>${esc(s.footerEmail)}</small></div><div><strong>${esc(s.footerExploreTitle)}</strong><nav>${footerLinks.map(([label])=>`<span style="color:${esc(s.footerLink)}">${esc(label)}</span>`).join('')}</nav></div><div><strong>${esc(s.footerCandidateTitle)}</strong></div><div><strong>${esc(s.footerEmployerTitle)}</strong></div><small>${esc(s.footerCopyright)}</small></footer></div>`;
  }
  try {
    const saved = { ...siteChromeDefaults, ...JSON.parse(localStorage.getItem('trikonet_site_chrome') || '{}') };
    Object.entries(siteChromeFieldMap).forEach(([key,id]) => { const field = document.getElementById(id); if (field) field.value = saved[key]; });
  } catch {}
  renderChromeMenuEditor('header');
  renderChromeMenuEditor('footer');
  renderChromeMenuEditor('footer-candidate');
  renderChromeMenuEditor('footer-employer');
  Object.values(siteChromeFieldMap).forEach(id => document.getElementById(id)?.addEventListener('input', renderSiteChromePreview));
  const syncHeaderLogoPreview = () => {
    const preview = document.getElementById('site-header-logo-preview');
    const value = document.getElementById('site-header-logo')?.value.trim();
    if (preview && value) preview.src = value;
  };
  document.getElementById('site-header-logo')?.addEventListener('input', syncHeaderLogoPreview);
  document.getElementById('site-header-logo-choose')?.addEventListener('click', () => {
    showImageSourceChooser({
      title: 'Choose header logo',
      onSelect: url => {
        const field = document.getElementById('site-header-logo');
        if (field) field.value = url;
        syncHeaderLogoPreview();
        renderSiteChromePreview();
      }
    });
  });
  syncHeaderLogoPreview();
  const syncFooterLogoPreview = () => {
    const preview = document.getElementById('site-footer-logo-preview');
    const value = document.getElementById('site-footer-logo')?.value.trim();
    if (preview && value) preview.src = value;
  };
  document.getElementById('site-footer-logo')?.addEventListener('input', syncFooterLogoPreview);
  document.getElementById('site-footer-logo-choose')?.addEventListener('click', () => {
    showImageSourceChooser({ title: 'Choose footer logo', onSelect: url => {
      const field = document.getElementById('site-footer-logo');
      if (field) field.value = url;
      syncFooterLogoPreview();
      renderSiteChromePreview();
    }});
  });
  syncFooterLogoPreview();
  document.getElementById('site-chrome-save')?.addEventListener('click', () => {
    localStorage.setItem('trikonet_site_chrome', JSON.stringify(readSiteChromeSettings()));
    const button = document.getElementById('site-chrome-save');
    if (button) { button.textContent = 'Saved'; setTimeout(() => { button.textContent = 'Save changes'; }, 1400); }
  });
  document.querySelectorAll('[data-preview-device]').forEach(button => button.addEventListener('click', () => {
    const device = button.dataset.previewDevice || 'desktop';
    document.querySelectorAll('[data-preview-device]').forEach(item => item.classList.toggle('active', item === button));
    const stage = document.querySelector('.site-preview-stage');
    if (stage) stage.dataset.device = device;
  }));
  document.getElementById('apply-trikonet-footer')?.addEventListener('click', () => {
    const values = { 'site-footer-layout':'trikonet-wide', 'site-footer-title-size':'18', 'site-footer-bg':'#202124', 'site-footer-text':'#ffffff', 'site-footer-link':'#979797' };
    Object.entries(values).forEach(([id,value]) => { const field = document.getElementById(id); if (field) field.value = value; });
    renderSiteChromePreview();
  });
  renderSiteChromePreview();

  // --- PAGES EVENT LISTENERS ---
  document.querySelectorAll('#admin-page-tabs a').forEach(tab => {
    tab.addEventListener('click', e => {
      document.querySelectorAll('#admin-page-tabs a').forEach(t => t.classList.remove('current'));
      tab.classList.add('current');
      pageGroupFilter = tab.dataset.pageGroup || 'core';
      renderPageRows();
    });
  });

  document.getElementById('admin-page-search')?.addEventListener('input', renderPageRows);
  document.getElementById('admin-page-search-button')?.addEventListener('click', renderPageRows);
  document.getElementById('btn-filter-pages')?.addEventListener('click', renderPageRows);
  document.getElementById('filter-page-date')?.addEventListener('change', renderPageRows);

  document.getElementById('cb-select-all-pages')?.addEventListener('change', e => {
    document.querySelectorAll('#admin-page-rows input[type="checkbox"]').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  document.getElementById('btn-apply-pages-bulk')?.addEventListener('click', () => {
    const action = document.getElementById('bulk-action-pages-selector')?.value;
    const selected = Array.from(document.querySelectorAll('#admin-page-rows input[type="checkbox"]:checked')).map(cb => Number(cb.value));
    if (!selected.length) {
      alert('Please select at least one page.');
      return;
    }
    if (action === 'trash') {
      if (!confirm(`Delete ${selected.length} selected page(s)?`)) return;
      pages = pages.filter(p => !selected.includes(p.id));
      savePages();
      renderPageRows();
    } else if (action === 'edit') {
      const p = pages.find(x => x.id === selected[0]);
      if (p) {
        fillPageInBlogEditor(p);
        location.hash = `page-editor/${encodeURIComponent(p.slug)}`;
      }
    }
  });

  document.getElementById('admin-page-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const id = Number(document.getElementById('field-page-id').value);
    const title = form.title.value.trim();
    const slug = (form.slug.value.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    const status = form.status.value === 'Draft' ? 'draft' : 'published';
    const content = form.content.value.trim();

    if (!title) return;

    if (id) {
      const existing = pages.find(p => p.id === id);
      if (existing) {
        existing.title = title;
        existing.slug = slug;
        existing.status = status;
        existing.content = content;
      }
    } else {
      const newPage = {
        id: Date.now(),
        title,
        slug,
        author: 'Trikonet',
        views: 0,
        comments: '—',
        date: `Published ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}`,
        rawDate: new Date().toISOString().slice(0, 10),
        status,
        seoScore: 75,
        keyword: 'Not Set',
        schema: 'Off',
        links: '1 | 0 | 0',
        content
      };
      pages.unshift(newPage);
    }

    savePages();
    form.reset();
    location.hash = 'pages';
  });

  document.querySelectorAll('[data-add-page-block]').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.addPageBlock;
    const block = { id: pageBlockId(), type, content: '' };
    if (type === 'heading') block.level = 'h2';
    if (type === 'section') block.title = '';
    if (type === 'image') { block.src = '/assets/article-1.jpg'; block.alt = ''; }
    pageBlocks.push(block);
    renderPageBlocks();
    document.querySelector(`[data-page-block-id="${block.id}"] [contenteditable], [data-page-block-id="${block.id}"] input`)?.focus();
  }));

  // --- MEDIA LIBRARY EVENT LISTENERS ---
  const toggleMediaUploadBtn = document.getElementById('btn-toggle-media-uploader');
  const mediaUploadContainer = document.getElementById('media-upload-container');
  toggleMediaUploadBtn?.addEventListener('click', () => {
    if (mediaUploadContainer) {
      const isHidden = mediaUploadContainer.style.display === 'none';
      mediaUploadContainer.style.display = isHidden ? 'block' : 'none';
    }
  });

  const browseMediaBtn = document.getElementById('btn-browse-media');
  const mediaFileInput = document.getElementById('media-file-input');

  browseMediaBtn?.addEventListener('click', () => mediaFileInput?.click());

  function handleMediaFiles(files) {
    if (!files || !files.length) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const url = evt.target.result;
        const img = new Image();
        img.onload = () => {
          const newMedia = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: file.name,
            url,
            dimensions: `${img.width} × ${img.height}`,
            size: `${Math.round(file.size / 1024)} KB`,
            type: 'image',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };
          media.unshift(newMedia);
          saveMedia();
          renderMediaGrid();
          if (mediaUploadContainer) mediaUploadContainer.style.display = 'none';
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });
  }

  mediaFileInput?.addEventListener('change', e => handleMediaFiles(e.target.files));

  mediaUploadContainer?.addEventListener('dragover', e => {
    e.preventDefault();
    mediaUploadContainer.style.borderColor = '#0284c7';
    mediaUploadContainer.style.background = '#f0f9ff';
  });
  mediaUploadContainer?.addEventListener('dragleave', e => {
    e.preventDefault();
    mediaUploadContainer.style.borderColor = '#cbd5e1';
    mediaUploadContainer.style.background = '#f8fafc';
  });
  mediaUploadContainer?.addEventListener('drop', e => {
    e.preventDefault();
    mediaUploadContainer.style.borderColor = '#cbd5e1';
    mediaUploadContainer.style.background = '#f8fafc';
    handleMediaFiles(e.dataTransfer.files);
  });

  document.getElementById('admin-media-search')?.addEventListener('input', () => { mediaPage = 1; renderMediaGrid(); });
  document.getElementById('filter-media-type')?.addEventListener('change', () => { mediaPage = 1; renderMediaGrid(); });

  // Global click delegation for Posts, Pages, and Media
  document.addEventListener('click', async e => {
    // Post actions
    const postEdit = e.target.closest('[data-post-edit]');
    if (postEdit) {
      e.preventDefault();
      const id = Number(postEdit.dataset.postEdit);
      const p = posts.find(x => x.id === id);
      if (p) {
        const connectedPost = await loadDatabasePostForEditor(p);
        const index = posts.findIndex(item => item.slug === connectedPost.slug || item.id === connectedPost.id);
        if (index >= 0) posts[index] = connectedPost;
        fillPost(connectedPost);
        location.hash = `post-editor/${encodeURIComponent(connectedPost.slug)}`;
      }
      return;
    }

    const postDel = e.target.closest('[data-post-delete]');
    if (postDel) {
      e.preventDefault();
      const id = Number(postDel.dataset.postDelete);
      const p = posts.find(x => x.id === id);
      if (p && confirm(`Move post “${p.title}” to trash?`)) {
        posts = posts.filter(x => x.id !== id);
        savePosts();
        renderPostRows();
      }
      return;
    }

    // Page actions
    const pageEdit = e.target.closest('[data-page-edit]');
    if (pageEdit) {
      e.preventDefault();
      const id = Number(pageEdit.dataset.pageEdit);
      const pg = pages.find(x => x.id === id);
      if (pg) {
        fillPageInBlogEditor(pg);
        location.hash = `page-editor/${encodeURIComponent(pg.slug)}`;
      }
      return;
    }

    const pageDel = e.target.closest('[data-page-delete]');
    if (pageDel) {
      e.preventDefault();
      const id = Number(pageDel.dataset.pageDelete);
      const pg = pages.find(x => x.id === id);
      if (pg && confirm(`Move page “${pg.title}” to trash?`)) {
        pages = pages.filter(x => x.id !== id);
        savePages();
        renderPageRows();
      }
      return;
    }

    // Media actions
    const mediaPageBtn = e.target.closest('[data-media-page]');
    if (mediaPageBtn && !mediaPageBtn.disabled) {
      e.preventDefault();
      mediaPage = Math.max(1, Number(mediaPageBtn.dataset.mediaPage) || 1);
      renderMediaGrid();
      document.getElementById('view-media')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const copyUrlBtn = e.target.closest('[data-copy-url]');
    if (copyUrlBtn) {
      e.preventDefault();
      const url = copyUrlBtn.dataset.copyUrl;
      navigator.clipboard.writeText(url).then(() => {
        copyUrlBtn.textContent = 'Copied!';
        setTimeout(() => { copyUrlBtn.textContent = 'Copy URL'; }, 1500);
      });
      return;
    }

    const mediaDel = e.target.closest('[data-media-delete]');
    if (mediaDel) {
      e.preventDefault();
      const id = Number(mediaDel.dataset.mediaDelete);
      const m = media.find(x => x.id === id);
      if (m && confirm(`Delete media asset “${m.title}”?`)) {
        media = media.filter(x => x.id !== id);
        saveMedia();
        renderMediaGrid();
      }
      return;
    }

    // Candidate actions
    const candEdit = e.target.closest('[data-candidate-edit]');
    if (candEdit) {
      e.preventDefault();
      const id = Number(candEdit.dataset.candidateEdit);
      const c = candidates.find(x => x.id === id);
      if (c) {
        fillCandidate(c);
        location.hash = 'candidate-editor';
      }
      return;
    }

    const candFeature = e.target.closest('[data-candidate-toggle-feature]');
    if (candFeature) {
      e.preventDefault();
      const id = Number(candFeature.dataset.candidateToggleFeature);
      const c = candidates.find(x => x.id === id);
      if (c) {
        c.featured = !c.featured;
        saveCandidates();
        renderCandidateRows();
      }
      return;
    }

    const candDel = e.target.closest('[data-candidate-delete]');
    if (candDel) {
      e.preventDefault();
      const id = Number(candDel.dataset.candidateDelete);
      const c = candidates.find(x => x.id === id);
      if (c && confirm(`Delete candidate profile “${c.name}”?`)) {
        candidates = candidates.filter(x => x.id !== id);
        saveCandidates();
        renderCandidateRows();
      }
      return;
    }
  });

  // --- CANDIDATES STATE & HELPERS ---
  const defaultCandidates = [
    {
      id: 101,
      name: 'Ahmed Al-Hammadi',
      slug: 'ahmed-al-hammadi',
      jobTitle: 'Senior Project Manager & Civil Engineer',
      email: 'ahmed.hammadi@trikonet.ae',
      phone: '+971 50 889 2314',
      category: 'Engineering',
      location: 'Dubai',
      experience: '8+ Years',
      qualification: 'M.Sc. Civil Engineering',
      status: 'Active',
      featured: true,
      bio: 'PMP certified senior civil engineer and infrastructure project leader with 8+ years across prime UAE developers and municipal highway projects.',
      date: '2026-09-18'
    },
    {
      id: 102,
      name: 'Sarah Jenkins',
      slug: 'sarah-jenkins',
      jobTitle: 'Lead Product Designer & UX Researcher',
      email: 'sarah.j@designlabs.io',
      phone: '+971 52 441 8970',
      category: 'Information Technology',
      location: 'Dubai',
      experience: '6+ Years',
      qualification: 'B.A. Interaction Design',
      status: 'Active',
      featured: true,
      bio: 'Fintech and enterprise SaaS design lead with deep expertise in Figma design systems, customer journey mapping, and mobile app ergonomics.',
      date: '2026-09-19'
    },
    {
      id: 103,
      name: 'Dr. Tariq Mansoor',
      slug: 'tariq-mansoor',
      jobTitle: 'Specialist Cardiologist & Clinical Director',
      email: 'tariq.mansoor@medcare.ae',
      phone: '+971 55 901 3345',
      category: 'Healthcare & Medical',
      location: 'Abu Dhabi',
      experience: '12+ Years',
      qualification: 'MD, MRCP (UK)',
      status: 'Active',
      featured: false,
      bio: 'DHA and DOH licensed specialist physician with extensive experience in interventional cardiology and cardiac emergency management.',
      date: '2026-09-15'
    },
    {
      id: 104,
      name: 'Fatima Al-Zahra',
      slug: 'fatima-al-zahra',
      jobTitle: 'VP Corporate Finance & Investment Analyst',
      email: 'f.alzahra@adcb-holdings.ae',
      phone: '+971 50 712 9940',
      category: 'Finance & Banking',
      location: 'Abu Dhabi',
      experience: '9+ Years',
      qualification: 'CFA Charterholder, MBA Finance',
      status: 'Active',
      featured: true,
      bio: 'Seasoned investment banker and risk management analyst overseeing portfolio strategies and equity research across GCC markets.',
      date: '2026-09-20'
    },
    {
      id: 105,
      name: 'Kashif Mehmood',
      slug: 'kashif-mehmood',
      jobTitle: 'Senior Cloud DevOps Architect',
      email: 'kashif.devops@trikonet.ae',
      phone: '+971 54 332 1089',
      category: 'Information Technology',
      location: 'Sharjah',
      experience: '7+ Years',
      qualification: 'B.S. Software Engineering',
      status: 'Active',
      featured: false,
      bio: 'Kubernetes, AWS & GCP certified cloud specialist automating CI/CD pipelines, container orchestration, and zero-trust security postures.',
      date: '2026-09-12'
    },
    {
      id: 106,
      name: 'Elena Rostova',
      slug: 'elena-rostova',
      jobTitle: 'Global Brand & Growth Marketing Director',
      email: 'elena.rostova@marketgrowth.ae',
      phone: '+971 58 601 4452',
      category: 'Marketing & Sales',
      location: 'Dubai',
      experience: '6+ Years',
      qualification: 'M.Sc. Strategic Marketing',
      status: 'Pending',
      featured: false,
      bio: 'Omnichannel B2B and B2C brand strategist driving paid acquisition, organic brand authority, and community growth for luxury retail and hospitality.',
      date: '2026-09-21'
    }
  ];

  const candidateDataVersion = 'fresh-candidate-accounts-v1';
  let candidates = (() => {
    try {
      if (localStorage.getItem('trikonet_candidates_version') !== candidateDataVersion) {
        localStorage.setItem('trikonet_candidates_cms', '[]');
        localStorage.setItem('trikonet_candidates_version', candidateDataVersion);
        return [];
      }
      const stored = localStorage.getItem('trikonet_candidates_cms');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  let candidateStatusFilter = 'all';

  function saveCandidates() {
    try {
      localStorage.setItem('trikonet_candidates_cms', JSON.stringify(candidates));
    } catch {}
    updateCandidateCountBadges();
  }

  function candidateCreatedTime(candidate) {
    const timestamp = Date.parse(candidate.createdAt || candidate.date || candidate.registered || '');
    if (Number.isFinite(timestamp)) return timestamp;
    const numericId = Number(candidate.id);
    return numericId > 1_000_000_000_000 ? numericId : 0;
  }

  function updateCandidateCountBadges() {
    const sidebarCount = document.getElementById('admin-candidates-count');
    if (sidebarCount) sidebarCount.textContent = String(candidates.length);
    const chip = document.getElementById('admin-candidates-count-chip');
    if (chip) chip.textContent = `${candidates.length} Profiles`;

    const cAll = document.getElementById('count-candidate-all');
    if (cAll) cAll.textContent = `(${candidates.length})`;
    const cActive = document.getElementById('count-candidate-active');
    if (cActive) cActive.textContent = `(${candidates.filter(c => c.status === 'Active').length})`;
    const cFeatured = document.getElementById('count-candidate-featured');
    if (cFeatured) cFeatured.textContent = `(${candidates.filter(c => c.featured || c.status === 'Featured').length})`;
    const cPending = document.getElementById('count-candidate-pending');
    if (cPending) cPending.textContent = `(${candidates.filter(c => c.status === 'Pending').length})`;
  }

  function fillCandidate(c = {}) {
    const form = document.getElementById('admin-candidate-form');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('candidate-editor-title');
    if (titleEl) titleEl.textContent = c.id ? `Edit Candidate: ${c.name}` : 'Add New Candidate';

    document.getElementById('candidate-id').value = c.id || '';
    document.getElementById('candidate-original-slug').value = c.slug || '';
    document.getElementById('candidate-name').value = c.name || '';
    document.getElementById('candidate-slug').value = c.slug || '';
    document.getElementById('candidate-job-title').value = c.jobTitle || '';
    document.getElementById('candidate-email').value = c.email || '';
    document.getElementById('candidate-phone').value = c.phone || '';
    if (c.category) document.getElementById('candidate-category').value = c.category;
    if (c.location) document.getElementById('candidate-location').value = c.location;
    document.getElementById('candidate-experience').value = c.experience || '';
    document.getElementById('candidate-qualification').value = c.qualification || '';
    document.getElementById('candidate-status').value = c.status || 'Active';
    document.getElementById('candidate-featured').checked = !!c.featured;
    document.getElementById('candidate-bio').value = c.bio || '';
  }

  function renderCandidateRows() {
    const tbody = document.getElementById('admin-candidate-rows');
    if (!tbody) return;

    updateCandidateCountBadges();

    const searchInput = document.getElementById('admin-candidate-search');
    const q = (searchInput?.value || '').toLowerCase().trim();
    const catVal = document.getElementById('filter-candidate-category')?.value || '';
    const locVal = document.getElementById('filter-candidate-location')?.value || '';

    const filtered = candidates.filter(c => {
      if (candidateStatusFilter === 'active' && c.status !== 'Active') return false;
      if (candidateStatusFilter === 'featured' && !c.featured && c.status !== 'Featured') return false;
      if (candidateStatusFilter === 'pending' && c.status !== 'Pending') return false;

      if (catVal && c.category !== catVal) return false;
      if (locVal && !(c.location || '').toLowerCase().includes(locVal.toLowerCase())) return false;

      if (q) {
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchTitle = (c.jobTitle || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchCat = (c.category || '').toLowerCase().includes(q);
        const matchLoc = (c.location || '').toLowerCase().includes(q);
        if (!matchName && !matchTitle && !matchEmail && !matchCat && !matchLoc) return false;
      }
      return true;
    }).sort((a, b) => candidateCreatedTime(b) - candidateCreatedTime(a));

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:#94a3b8; font-size:13px;">No candidates found matching the criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      const initials = (c.name || 'Candidate')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      let statusBadge = '';
      if (c.featured || c.status === 'Featured') {
        statusBadge = `<span class="pill-active" style="background:#fef3c7; color:#b45309; font-weight:600; font-size:11px; padding:3px 8px; border-radius:999px;">★ Featured</span>`;
      } else if (c.status === 'Active') {
        statusBadge = `<span class="pill-active" style="background:#ecfdf5; color:#047857; font-weight:600; font-size:11px; padding:3px 8px; border-radius:999px;">● Active</span>`;
      } else {
        statusBadge = `<span class="pill-active" style="background:#f1f5f9; color:#64748b; font-weight:600; font-size:11px; padding:3px 8px; border-radius:999px;">⏳ Pending</span>`;
      }

      return `
        <tr data-candidate-id="${c.id}">
          <th scope="row" class="check-column"><input type="checkbox" value="${c.id}" aria-label="Select ${escapeHtml(c.name)}"></th>
          <td class="column-candidate-name">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #0284c7, #3b82f6); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                ${initials}
              </div>
              <div>
                <strong><a href="#candidate-editor" class="row-title" data-candidate-edit="${c.id}">${escapeHtml(c.name)}</a></strong>
                <div style="font-size:11px; color:#64748b; margin-top:2px;">
                  ${escapeHtml(c.email || '—')} ${c.phone ? `· ${escapeHtml(c.phone)}` : ''}
                </div>
                <div class="row-actions modern-tax-row-actions">
                  <span><a href="#candidate-editor" data-candidate-edit="${c.id}">Edit</a> | </span>
                  <span><a href="#" data-candidate-toggle-feature="${c.id}">${c.featured ? 'Unfeature' : 'Feature'}</a> | </span>
                  <span class="trash"><a href="#" data-candidate-delete="${c.id}">Trash</a> | </span>
                  <span><a href="/candidate/${c.slug}" target="_blank" rel="noopener">View ↗</a></span>
                </div>
              </div>
            </div>
          </td>
          <td class="column-candidate-title">
            <span style="font-weight:500; color:#0f172a; font-size:13px;">${escapeHtml(c.jobTitle || 'Candidate')}</span>
          </td>
          <td class="column-candidate-category">
            <span class="modern-badge" style="background:#eff6ff; color:#1d4ed8; font-weight:500; font-size:11px; padding:3px 8px; border-radius:6px;">
              ${escapeHtml(c.category || 'General')}
            </span>
          </td>
          <td class="column-candidate-location">
            <span style="font-size:12px; color:#475569; display:inline-flex; align-items:center; gap:4px;">
              📍 ${escapeHtml(c.location || 'UAE')}
            </span>
          </td>
          <td class="column-candidate-exp">
            <div style="font-size:12px; color:#334155; font-weight:500;">${escapeHtml(c.experience || '—')}</div>
            <div style="font-size:11px; color:#94a3b8;">${escapeHtml(c.qualification || '')}</div>
          </td>
          <td class="column-candidate-status">
            ${statusBadge}
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- CANDIDATE EVENT LISTENERS ---
  document.querySelectorAll('#admin-candidate-tabs a').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('#admin-candidate-tabs a').forEach(t => t.classList.remove('current'));
      tab.classList.add('current');
      candidateStatusFilter = tab.dataset.candidateStatus || 'all';
      renderCandidateRows();
    });
  });

  document.getElementById('admin-candidate-search')?.addEventListener('input', renderCandidateRows);
  document.getElementById('btn-filter-candidates')?.addEventListener('click', renderCandidateRows);
  document.getElementById('filter-candidate-category')?.addEventListener('change', renderCandidateRows);
  document.getElementById('filter-candidate-location')?.addEventListener('change', renderCandidateRows);

  document.getElementById('cb-select-all-candidates')?.addEventListener('change', e => {
    document.querySelectorAll('#admin-candidate-rows input[type="checkbox"]').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  document.getElementById('btn-apply-candidates-bulk')?.addEventListener('click', () => {
    const action = document.getElementById('bulk-action-candidates-selector')?.value;
    const selected = Array.from(document.querySelectorAll('#admin-candidate-rows input[type="checkbox"]:checked')).map(cb => Number(cb.value));
    if (!selected.length) {
      alert('Please select at least one candidate.');
      return;
    }
    if (action === 'trash') {
      if (!confirm(`Delete ${selected.length} selected candidate(s)?`)) return;
      candidates = candidates.filter(c => !selected.includes(c.id));
      saveCandidates();
      renderCandidateRows();
    } else if (action === 'feature') {
      candidates.forEach(c => {
        if (selected.includes(c.id)) c.featured = true;
      });
      saveCandidates();
      renderCandidateRows();
    } else if (action === 'activate') {
      candidates.forEach(c => {
        if (selected.includes(c.id)) c.status = 'Active';
      });
      saveCandidates();
      renderCandidateRows();
    }
  });

  document.getElementById('admin-candidate-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const id = Number(document.getElementById('candidate-id').value);
    const name = form.name.value.trim();
    const slug = form.slug.value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const jobTitle = form.jobTitle.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const category = form.category.value;
    const locationVal = form.location.value;
    const experience = form.experience.value.trim();
    const qualification = form.qualification.value.trim();
    const status = form.status.value;
    const featured = form.featured.checked;
    const bio = form.bio.value.trim();

    if (!name || !email) return;

    if (id) {
      const existing = candidates.find(c => c.id === id);
      if (existing) {
        existing.name = name;
        existing.slug = slug;
        existing.jobTitle = jobTitle;
        existing.email = email;
        existing.phone = phone;
        existing.category = category;
        existing.location = locationVal;
        existing.experience = experience;
        existing.qualification = qualification;
        existing.status = status;
        existing.featured = featured;
        existing.bio = bio;
      }
    } else {
      const newCand = {
        id: Date.now(),
        name,
        slug,
        jobTitle,
        email,
        phone,
        category,
        location: locationVal,
        experience,
        qualification,
        status,
        featured,
        bio,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      };
      candidates.unshift(newCand);
    }

    saveCandidates();
    form.reset();
    location.hash = 'candidates';
  });


  // Initial routing and data loading
  handleRoute();
  await loadData();
  renderPostCategoryFilterDropdown();
  renderGutenbergPostCategoriesChecklist();
  handleRoute();
}
