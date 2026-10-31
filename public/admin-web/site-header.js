const escapeAttr = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
export function renderSiteHeader({ path = '/', currentUser = null, siteChrome = {}, calculateCandidateCompletion = () => 0 } = {}){
  const nurseHeader=path==='/nurse-jobs-in-uae';
  const isJobs = path.startsWith('/job') || path === '/nurse-jobs-in-uae';
  const isEmployers = path.startsWith('/employer');
  const isServices = path.startsWith('/services') || path === '/resume-library' || path === '/resume-maker' || path === '/ats-resume-builder' || path === '/medical-coder-class';
  const navArrow = `<svg class="nav-arrow" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1.25L5 4.75L9 1.25"/></svg>`;
  let candidateAvatar = currentUser?.avatar || currentUser?.photo || currentUser?.profile?.photo || '';
  if (currentUser && !candidateAvatar) {
    try { candidateAvatar = JSON.parse(localStorage.getItem('cvBuilderPluginState') || '{}').photo || ''; } catch {}
  }
  const candidateInitial = escapeAttr((currentUser?.name || 'U').charAt(0).toUpperCase());
  const candidateComp = calculateCandidateCompletion(currentUser?.profile);
  const isProfileComplete = candidateComp >= 85;
  const profileBadge = isProfileComplete ? '' : `<span class="nav-profile-badge" aria-label="1 notification" title="Profile ${candidateComp}% complete — complete your profile to get verified">1</span>`;
  const accountIcon = pathData => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${pathData}</svg>`;
  const profileAvatar = `<div class="nav-account-menu">
    <button class="nav-profile-avatar" type="button" id="navAccountToggle" aria-label="Open account menu" aria-haspopup="menu" aria-expanded="false" title="Account menu">
      <span class="nav-profile-photo"><span class="nav-profile-initial">${candidateInitial}</span>${candidateAvatar ? `<img src="${escapeAttr(candidateAvatar)}" alt="${escapeAttr(currentUser?.name || 'Account')}">` : ''}</span>${profileBadge}
    </button>
    <div class="nav-account-dropdown" id="navAccountDropdown" role="menu" aria-hidden="true">
      <div class="nav-account-summary">
        <span class="nav-account-summary-avatar"><span>${candidateInitial}</span>${candidateAvatar ? `<img src="${escapeAttr(candidateAvatar)}" alt="">` : ''}</span>
        <div><strong>${escapeAttr(currentUser?.name || 'My account')}</strong><small>${escapeAttr(currentUser?.email || 'Signed in')}</small></div>
      </div>
      <a class="nav-account-score" href="/profile" role="menuitem">
        <span><strong>Account score</strong><small>${candidateComp >= 85 ? 'Your profile is recruiter-ready' : 'Complete your profile to improve visibility'}</small></span>
        <b>${candidateComp}%</b>
        <i><span style="width:${candidateComp}%"></span></i>
      </a>
      <div class="nav-account-links">
        <a href="/profile" role="menuitem"><span class="nav-account-link-icon">${accountIcon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')}</span><span><strong>Account information</strong><small>Profile and contact details</small></span><b>›</b></a>
        <a href="/resume-library" role="menuitem"><span class="nav-account-link-icon">${accountIcon('<path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h7M9 16h7"/>')}</span><span><strong>Résumé library</strong><small>Build and manage résumés</small></span><b>›</b></a>
        <a href="/saved-jobs" role="menuitem"><span class="nav-account-link-icon">${accountIcon('<path d="M6 3h12v18l-6-4-6 4z"/>')}</span><span><strong>Saved jobs</strong><small>Your shortlisted opportunities</small></span><b>›</b></a>
        <a href="/applied-jobs" role="menuitem"><span class="nav-account-link-icon">${accountIcon('<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4h8v2M8 12l3 3 5-6"/>')}</span><span><strong>Applied jobs</strong><small>Track your applications</small></span><b>›</b></a>
        <a href="/followed-companies" role="menuitem"><span class="nav-account-link-icon">${accountIcon('<path d="M3 21h18M5 21V6l7-3v18M12 9h7v12M8 9v1M8 13v1M8 17v1M16 13v1M16 17v1"/>')}</span><span><strong>Followed companies</strong><small>Employers you follow</small></span><b>›</b></a>
      </div>
      <button class="nav-account-signout" type="button" id="navAccountLogout" role="menuitem">${accountIcon('<path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/>')}<span>Sign out</span></button>
    </div>
  </div>`;

  return `<header class="topbar${nurseHeader?' nurse-page-header':''} site-header-${escapeAttr(siteChrome.headerLayout||'classic')}" style="background:${escapeAttr(siteChrome.headerBg||'#ffffff')};color:${escapeAttr(siteChrome.headerText||'#202124')}">
    <div class="wrap nav">
      <a class="brand" href="/"><img src="${escapeAttr(siteChrome.headerLogo || '/assets/logo-black.png')}" alt="Trikonet logo"></a>
      <nav class="links">
        <!-- 1. JOBS MEGA MENU -->
        <div class="nav-item nav-has-mega">
          <a class="nav-link${isJobs?' active':''}" href="/jobs">
            Jobs ${navArrow}
          </a>
          <div class="nav-mega-panel nav-jobs-mega">
            <div class="mega-grid">
              <div class="mega-col mega-categories-col">
                <div class="mega-head">
                  <span class="mega-eyebrow">POPULAR CATEGORIES</span>
                  <a href="/jobs" class="mega-view-all">All Categories →</a>
                </div>
                <div class="mega-category-grid">
                  <a href="/category/healthcare" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Healthcare</strong>
                      <small>762 Open Jobs</small>
                    </div>
                  </a>
                  <a href="/nurse-jobs-in-uae" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Nurse Jobs</strong>
                      <small>706 Open Jobs</small>
                    </div>
                  </a>
                  <a href="/category/accounting-or-finance" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Accounting & Finance</strong>
                      <small>1,767 Open Jobs</small>
                    </div>
                  </a>
                  <a href="/category/education-and-training" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Education & Training</strong>
                      <small>3,148 Open Jobs</small>
                    </div>
                  </a>
                  <a href="/category/administration" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Administration</strong>
                      <small>1,302 Open Jobs</small>
                    </div>
                  </a>
                  <a href="/jobs?q=IT" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>IT & Software</strong>
                      <small>Tech & Systems</small>
                    </div>
                  </a>
                  <a href="/category/marketing-and-sales" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Marketing & Sales</strong>
                      <small>627 Open Jobs</small>
                    </div>
                  </a>
                  <a href="/category/human-resource" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Human Resource</strong>
                      <small>654 Open Jobs</small>
                    </div>
                  </a>
                  <a href="/jobs?q=Medical+Coder" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Medical Coder Jobs</strong>
                      <small>Hospital Coding</small>
                    </div>
                  </a>
                </div>
              </div>
              <div class="mega-col mega-side-col">
                <div class="mega-head">
                  <span class="mega-eyebrow">BY REGION</span>
                </div>
                <div class="mega-region-list">
                  <a href="/jobs?location=Dubai" class="mega-region-pill">
                    <span>Jobs in Dubai</span>
                    <span class="mega-region-arrow">›</span>
                  </a>
                  <a href="/jobs?location=Abu+Dhabi" class="mega-region-pill">
                    <span>Jobs in Abu Dhabi</span>
                    <span class="mega-region-arrow">›</span>
                  </a>
                  <a href="/jobs?location=Sharjah" class="mega-region-pill">
                    <span>Jobs in Sharjah</span>
                    <span class="mega-region-arrow">›</span>
                  </a>
                </div>
                <div class="mega-cta-card">
                  <span class="mega-badge">13,600+ LISTINGS</span>
                  <h4>Find Your Role in UAE</h4>
                  <p>Verified vacancies from top hospitals, schools & enterprises.</p>
                  <a href="/jobs" class="mega-cta-btn">Browse All Jobs →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. EMPLOYERS MENU (Hospitals, Labs, Schools, etc.) -->
        <div class="nav-item nav-has-mega">
          <a class="nav-link${isEmployers?' active':''}" href="/employers">
            Employers ${navArrow}
          </a>
          <div class="nav-mega-panel nav-employers-mega">
            <div class="mega-grid">
              <div class="mega-col mega-categories-col">
                <div class="mega-head">
                  <span class="mega-eyebrow">POPULAR CATEGORIES</span>
                  <a href="/employers" class="mega-view-all">All Companies (2,700+) →</a>
                </div>
                <div class="mega-category-grid">
                  <a href="/employers?q=Hospital" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Top Hospitals</strong>
                      <small>450+ Active</small>
                    </div>
                  </a>
                  <a href="/employers?q=Clinic" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Clinics & Day Surgery</strong>
                      <small>600+ Clinics</small>
                    </div>
                  </a>
                  <a href="/employers?q=Lab" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Medical Laboratories</strong>
                      <small>180+ Labs</small>
                    </div>
                  </a>
                  <a href="/employers?q=Pharmacy" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Pharmacies & Pharma</strong>
                      <small>290+ Chains</small>
                    </div>
                  </a>
                  <a href="/employers?q=School" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Schools & Academies</strong>
                      <small>320+ Schools</small>
                    </div>
                  </a>
                  <a href="/employers?q=Group" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Corporate Groups</strong>
                      <small>850+ Groups</small>
                    </div>
                  </a>
                  <a href="/employers?q=Bank" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Banking & Financial</strong>
                      <small>Top UAE Banks</small>
                    </div>
                  </a>
                  <a href="/employers?q=Technology" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>IT & Technology</strong>
                      <small>Tech Companies</small>
                    </div>
                  </a>
                  <a href="/employers?q=Retail" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Retail & Aviation</strong>
                      <small>Top Conglomerates</small>
                    </div>
                  </a>
                  <a href="/employers?q=Government" class="mega-cat-item">
                    <div class="mega-cat-info">
                      <strong>Government Entities</strong>
                      <small>Public Sector</small>
                    </div>
                  </a>
                </div>
              </div>
              <div class="mega-col mega-side-col">
                <div class="mega-head">
                  <span class="mega-eyebrow">BY REGION</span>
                </div>
                <div class="mega-region-list">
                  <a href="/employers?location=Dubai" class="mega-region-pill">
                    <span>Employers in Dubai</span>
                    <span class="mega-region-arrow">›</span>
                  </a>
                  <a href="/employers?location=Abu+Dhabi" class="mega-region-pill">
                    <span>Employers in Abu Dhabi</span>
                    <span class="mega-region-arrow">›</span>
                  </a>
                  <a href="/employers?location=Sharjah" class="mega-region-pill">
                    <span>Employers in Sharjah</span>
                    <span class="mega-region-arrow">›</span>
                  </a>
                </div>
                <div class="mega-cta-card">
                  <span class="mega-badge">2,700+ COMPANIES</span>
                  <h4>Top Employers in UAE</h4>
                  <p>Explore verified hiring companies, direct career pages & hospital networks.</p>
                  <a href="/employers" class="mega-cta-btn">Browse All Employers →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. SERVICES MENU (Resume Maker) -->
        <div class="nav-item nav-has-dropdown">
          <a class="nav-link${isServices?' active':''}" href="/resume-library">
            Services ${navArrow}
          </a>
          <div class="nav-services-dropdown">
            <a href="/resume-library" class="service-item">
              <div class="service-text">
                <div class="service-title-row">
                  <strong>Resume Maker</strong>
                  <span class="service-tag">Popular</span>
                </div>
                <p>Create polished, modern CVs tailored for UAE hiring managers</p>
              </div>
            </a>
          </div>
        </div>

        <div class="mobile-nav-actions">
          ${currentUser?`<div class="mobile-account-panel">
            <div class="mobile-account-user">
              <span class="mobile-account-avatar"><span>${candidateInitial}</span>${candidateAvatar ? `<img src="${escapeAttr(candidateAvatar)}" alt="">` : ''}</span>
              <div><strong>${escapeAttr(currentUser?.name || 'My account')}</strong><small>${escapeAttr(currentUser?.email || '')}</small></div>
            </div>
            <a class="mobile-account-score" href="/profile"><span><strong>Account score</strong><small>Complete your profile to improve visibility</small></span><b>${candidateComp}%</b><i><span style="width:${candidateComp}%"></span></i></a>
            <div class="mobile-account-links">
              <a href="/profile">${accountIcon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')}<span>Account information</span><b>›</b></a>
              <a href="/resume-library">${accountIcon('<path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h7M9 16h7"/>')}<span>Résumé library</span><b>›</b></a>
              <a href="/saved-jobs">${accountIcon('<path d="M6 3h12v18l-6-4-6 4z"/>')}<span>Saved jobs</span><b>›</b></a>
              <a href="/applied-jobs">${accountIcon('<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4h8v2M8 12l3 3 5-6"/>')}<span>Applied jobs</span><b>›</b></a>
              <a href="/followed-companies">${accountIcon('<path d="M3 21h18M5 21V6l7-3v18M12 9h7v12M8 9v1M8 13v1M8 17v1M16 13v1M16 17v1"/>')}<span>Followed companies</span><b>›</b></a>
            </div>
            <button type="button" id="mobileLogoutBtn" class="mobile-account-signout">${accountIcon('<path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/>')} Sign out</button>
          </div>`:`<a class="mobile-btn-auth" href="/login">Login / Register</a>`}
          ${currentUser?'':`<a class="mobile-btn-primary" href="/submit-job">+ Add Job</a>`}
        </div>
      </nav>
      <div class="nav-actions">
        ${currentUser?`${profileAvatar}`:`<a class="nav-btn-auth" href="/login">Login / Register</a>`}
        ${currentUser?'':`<a class="nav-btn-primary" href="/submit-job"><span>+ Add Job</span></a>`}
      </div>
      <button class="hamb" aria-label="Toggle navigation" aria-expanded="false">
        <svg class="hamb-open" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        <svg class="hamb-close" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  </header>`;
}
