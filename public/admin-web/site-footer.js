const escapeAttr = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
const footerGuideRows = [
  {
    id: 'job-categories',
    defaultOpen: true,
    columns: [
      {
        title: 'Healthcare & Nursing Jobs',
        links: [
          { label: 'Staff Nurse in Dubai', url: '/nurse-jobs-in-uae' },
          { label: 'Registered Nurse Jobs', url: '/category/registered-nurse-jobs' },
          { label: 'Nurse Jobs in UAE', url: '/category/nurse-jobs' },
          { label: 'Healthcare Jobs UAE', url: '/category/healthcare' },
          { label: 'Consultant Doctor Jobs', url: '/category/consultant-doctor-jobs' },
          { label: 'General Practitioner Jobs', url: '/category/general-practitioner-jobs' },
          { label: 'Pharmacist Jobs UAE', url: '/category/pharmacist-jobs' },
          { label: 'Medical Laboratory Jobs', url: '/category/medical-laboratory-jobs' }
        ]
      },
      {
        title: 'Finance & Banking Jobs',
        links: [
          { label: 'Accounting & Finance Jobs', url: '/category/accounting-finance' },
          { label: 'Accountant Jobs in UAE', url: '/category/accountant' },
          { label: 'Finance & Accounts Manager', url: '/category/finance-accounts-manager-jobs' },
          { label: 'Financial Auditor Jobs', url: '/category/financial-auditor-jobs' },
          { label: 'Chartered Accountant Jobs', url: '/category/chartered-accountant-jobs' },
          { label: 'Banking Careers in UAE', url: '/jobs?q=Bank' },
          { label: 'Tax & Payroll Specialist', url: '/jobs?q=Payroll' }
        ]
      },
      {
        title: 'IT, Software & Tech Jobs',
        links: [
          { label: 'Engineering Jobs in UAE', url: '/category/engineering' },
          { label: 'Full Stack & Web Developer', url: '/jobs?q=Developer' },
          { label: 'Cloud & DevOps Engineer', url: '/jobs?q=DevOps' },
          { label: 'Cyber Security Specialist', url: '/jobs?q=Cyber+Security' },
          { label: 'IT Support & Systems', url: '/jobs?q=IT+Support' },
          { label: 'Graphic Designer Jobs', url: '/category/graphic-designer-jobs' },
          { label: 'Data Analyst Jobs', url: '/category/data-analyst' }
        ]
      },
      {
        title: 'Sales, Marketing & HR Jobs',
        links: [
          { label: 'Human Resource Jobs', url: '/category/human-resource' },
          { label: 'HR Officer Jobs', url: '/category/human-resources-officer-jobs' },
          { label: 'Talent Acquisition Specialist', url: '/category/talent-acquisition-specialist-jobs' },
          { label: 'Digital Marketing Jobs', url: '/category/digital-marketing' },
          { label: 'Marketing & Sales Jobs', url: '/category/marketing-and-sales' },
          { label: 'Social Media Marketing', url: '/category/social-media-coordinator-jobs' },
          { label: 'Customer Service Jobs', url: '/category/customer-service-associate-jobs' }
        ]
      }
    ]
  }
];

function footerCategoriesAccordion() {
  const rowsHtml = footerGuideRows.map(row => {
    const cols = row.columns;
    const headerColsHtml = cols.map((col, idx) => {
      const isLast = idx === cols.length - 1;
      return `<div class="footer-acc-header-col${isLast ? ' footer-acc-header-col-last' : ''}">
        <span class="footer-acc-header-title">${escapeAttr(col.title)}</span>
        ${isLast ? `
        <span class="footer-acc-arrow-indicator" aria-hidden="true">
          <svg class="footer-acc-chevron-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>` : ''}
      </div>`;
    }).join('');

    const bodyColsHtml = cols.map(col => `
      <div class="footer-acc-col">
        <h4 class="footer-acc-col-mobile-title">${escapeAttr(col.title)}</h4>
        <ul class="footer-acc-links">
          ${col.links.map(l => `<li><a href="${escapeAttr(l.url)}">${escapeAttr(l.label)}</a></li>`).join('')}
        </ul>
      </div>
    `).join('');

    return `
      <div class="footer-acc-row${row.defaultOpen ? ' open' : ''}" data-acc-row="${escapeAttr(row.id)}">
        <button type="button" class="footer-acc-header" aria-expanded="${row.defaultOpen ? 'true' : 'false'}">
          <div class="footer-acc-header-grid">
            ${headerColsHtml}
          </div>
        </button>
        <div class="footer-acc-drawer">
          <div class="footer-acc-drawer-inner">
            <div class="footer-acc-body-grid">
              ${bodyColsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="wrap footer-categories-container">
    <div class="footer-acc-wrapper">
      ${rowsHtml}
    </div>
  </div>`;
}

function footerQuickBar() {
  return `<div class="footer-quick-bar">
    <div class="wrap footer-quick-container">
      <div class="footer-quick-links">
        <a href="/jobs">Browse All Jobs</a>
        <span class="footer-quick-sep">|</span>
        <a href="/employers">Top Employers</a>
        <span class="footer-quick-sep">|</span>
        <a href="/about">About Us</a>
        <span class="footer-quick-sep">|</span>
        <a href="/contact">Contact</a>
        <span class="footer-quick-sep">|</span>
        <a href="/privacy-policy">Privacy Policy</a>
        <span class="footer-quick-sep">|</span>
        <a href="/terms">Terms of Service</a>
        <a href="/employer-terms">Employer Terms</a>
      </div>
    </div>
  </div>`;
}

export function renderSiteFooter(siteChrome = {}){
  return `<footer class="footer site-footer-columns site-footer-standard" style="background:#202124;color:#ffffff">
    <div class="wrap footer-grid">
      <div>
        <img src="${escapeAttr(siteChrome.footerLogo || '/assets/logo-white.png')}" alt="Trikonet">
        <p>${escapeAttr(siteChrome.footerEmail||'info@trikonet.com')}</p>
      </div>
      <div class="footer-intro-cta">
        <p class="footer-intro-kicker">CAREERS ACROSS THE UAE &amp; GCC</p>
        <h2>Connect with the right opportunity.</h2>
        <p>Discover verified roles or find qualified professionals for your growing team.</p>
        <div class="footer-intro-actions">
          <a href="/jobs">Browse Jobs</a>
          <a href="/submit-job">Post a Job</a>
        </div>
      </div>
    </div>
    ${footerCategoriesAccordion()}
    ${footerQuickBar()}
    <div class="wrap footer-bottom">
      <div class="footer-bottom-info">
        <p class="footer-legal-note">${escapeAttr(siteChrome.footerLegalNote||'Trikonet Recruitment Services | Registered in Dubai, United Arab Emirates. Connecting certified professionals with leading healthcare providers, schools, corporate firms, and technology groups across the UAE & GCC.')}</p>
        <p class="footer-copy-text">${escapeAttr(siteChrome.footerCopyright||'© 2026 Trikonet. All Right Reserved.')}</p>
      </div>
    </div>
  </footer>`;
}
