import {isClosedJob} from './job-availability.js';
import {employerProfileHref} from './employer-link.js';
import { publicJobPath } from './job-urls.js';
import { formatCompanyName, formatJobTitle } from './company-name.js?v=20261021-title-trash-1';
function applicationAction(record,m){
  if(isClosedJob(record))return '<p class="application-unavailable" role="status">Applications closed. This vacancy is no longer accepting applications.</p>';
  const rawMethod=record.applyType||m._job_apply_type||'External URL';
  let method=({external:'External URL',with_email:'By Email'})[rawMethod]||rawMethod;
  const sourceUrl=String(record.applyUrl||m._job_apply_url||'').trim();
  const embeddedEmail=/^mailto:/i.test(sourceUrl)?sourceUrl.replace(/^(?:mailto:)+/i,'').split('?')[0]:'';
  if (embeddedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(embeddedEmail)) method='By Email';
  if(method==='Walk-in')return `<div class="walk-in-details"><strong>Walk-in Interview</strong><p>${esc(record.walkInDetails||m._job_walk_in_details||'Contact the employer for interview details.').replaceAll('\n','<br>')}</p></div>`;
  let href=record.applyUrl||m._job_apply_url||'#',label='Apply Now';
  if(method==='By Email'){href='mailto:'+(record.applyEmail||m._job_apply_email||embeddedEmail||'');label='Apply by Email';}
  if(method==='WhatsApp'){href='https://wa.me/'+String(record.applyWhatsApp||m._job_apply_whatsapp||'').replace(/\D/g,'');label='Apply on WhatsApp';}
  const usable=method==='By Email'?/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href):method==='WhatsApp'?/^https:\/\/wa.me\/\d{7,15}$/.test(href):/^https?:\/\/[^\s/]+/i.test(href);
  if(!usable)return '<p class="application-unavailable" role="status">Application details are unavailable. Please verify this vacancy on the employer’s official careers website.</p>';
  return `<a class="primary apply" href="${esc(href)}"${method === 'By Email' ? '' : ' target="_blank"'} rel="noopener noreferrer nofollow">${label}</a>`;
}
const bateelJobs = [
  ['Corporate Accounting Manager','corporate-accounting-manager','Accountant, Accounting or Finance','Dubai'],
  ['Human Resources Business Partner','human-resources-business-partner-9','Human Resource','Dubai'],
  ['Financial Planning and Analysis Manager','financial-planning-and-analysis-manager-2','Accounting or Finance','Dubai'],
  ['Accountant','accountant-347','Accountant, Accounting or Finance','Dubai'],
  ['Assistant Manager Internal Audit','assistant-manager-internal-audit-6','Accounting or Finance','Dubai'],
];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode = value => {
  if (typeof document !== 'undefined') {
    const node = document.createElement('textarea');
    node.innerHTML = String(value ?? '');
    return node.value;
  }
  return String(value ?? '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#039;', "'").replaceAll('&#8211;', '–');
};
const values = value => value && typeof value === 'object' ? Object.values(value).map(decode).join(', ') : '';
const orderedValues = (value,ids) => value && typeof value === 'object' ? (ids?.length ? ids.map(id=>value[id]).filter(Boolean) : Object.values(value)).map(decode).join(', ') : '';

export function splitCommaCategories(str) {
  const decoded = decode(str).trim();
  if (!decoded) return [];
  if (/^health,\s*safety,\s*environment$/i.test(decoded)) {
    return ['Health, Safety, Environment'];
  }
  if (decoded.includes(',')) {
    return decoded.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [decoded];
}

export function parseCategories(record) {
  if (!record) return [];
  if (record.local && Array.isArray(record.categories) && record.categories.length) {
    return record.categories.map(decode).map(s => String(s).trim()).filter(Boolean);
  }
  const m = record.metas || {};
  if (m._job_category) {
    if (typeof m._job_category === 'object') {
      const ids = record.job_listing_category;
      const list = (ids?.length ? ids.map(id => m._job_category[id]).filter(Boolean) : Object.values(m._job_category));
      if (list.length) {
        return list.map(decode).map(s => String(s).trim()).filter(Boolean);
      }
    }
    if (typeof m._job_category === 'string' && m._job_category.trim()) {
      return splitCommaCategories(m._job_category);
    }
  }
  if (Array.isArray(record.categories) && record.categories.length) {
    return record.categories.map(decode).map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof record.category === 'string' && record.category.trim()) {
    return splitCommaCategories(record.category);
  }
  return [];
}

export function parseLocations(record) {
  if (!record) return [];
  if (record.local && Array.isArray(record.locations) && record.locations.length) {
    return record.locations.map(decode).map(s => String(s).trim()).filter(Boolean);
  }
  const m = record.metas || {};
  if (m._job_location) {
    if (typeof m._job_location === 'object') {
      const ids = record.job_listing_location;
      const list = (ids?.length ? ids.map(id => m._job_location[id]).filter(Boolean) : Object.values(m._job_location));
      if (list.length) {
        return list.map(decode).map(s => String(s).trim()).filter(Boolean);
      }
    }
    if (typeof m._job_location === 'string' && m._job_location.trim()) {
      return m._job_location.split(',').map(s => decode(s).trim()).filter(Boolean);
    }
  }
  if (Array.isArray(record.locations) && record.locations.length) {
    return record.locations.map(decode).map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof record.location === 'string' && record.location.trim()) {
    return record.location.split(',').map(s => decode(s).trim()).filter(Boolean);
  }
  return [];
}
export const formatJobDate = value => {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === 'invalid date') return '';
    if (/^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test(trimmed)) return trimmed;
  }
  let d = new Date(value);
  if (isNaN(d.getTime())) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      d = new Date(`${value.slice(0, 10)}T00:00:00`);
    }
  }
  if (isNaN(d.getTime())) {
    return '';
  }
  const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return formatted === 'Invalid Date' ? '' : formatted;
};

export const resolveJobDate = record => {
  if (!record) return '';
  const m = record.metas || {};
  let target = '';
  if (record.updatedDate) {
    target = record.updatedDate;
  } else if (record.updatedAt && record.createdAt && record.updatedAt !== record.createdAt) {
    target = record.updatedAt;
  } else if (record.modified && record.date && record.modified !== record.date) {
    target = record.modified;
  } else {
    target = record.publishedDate || record.postedDate || record.date || record.createdAt || m._job_posted_date || '';
  }
  return formatJobDate(target);
};

export const resolveJobDeadline = record => {
  if (!record) return '';
  const m = record.metas || {};
  const explicit = record.deadline || record.expiryDate || m._job_application_deadline_date || m._job_expiry_date;
  if (explicit) {
    const formatted = formatJobDate(explicit);
    if (formatted) return formatted;
  }
  return '';
};

const dateLabel = formatJobDate;
const phoneMask = value => value ? `${value.slice(0,-3)}***` : '';
const slugFromUrl = value => { try { return new URL(value).pathname; } catch { return '#'; } };
const filterSlug = value => decode(value).trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function jobCard([title,slug,category,location,type,publishedDate],logo='') {
  const cleanTitle = formatJobTitle(decode(title));
  const cleanCat = decode(category);
  const cleanLoc = decode(location);
  const published = formatJobDate(publishedDate);
  const catItems = cleanCat ? splitCommaCategories(cleanCat).slice(0, 1) : [];
  const locItems = cleanLoc ? cleanLoc.split(',').map(s => s.trim()).filter(Boolean) : [];

  const catLinks = catItems.map(c => `<a href="/category/${esc(filterSlug(c))}">${esc(c)}</a>`).join(', ');
  const locLinks = locItems.map(l => `<a href="/job-location/${esc(filterSlug(l))}">${esc(l)}</a>`).join(', ');

  const meta = [
    catLinks ? `<span><svg class="detail-row-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>${catLinks}</span>` : '',
    locLinks ? `<span><svg class="detail-row-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>${locLinks}</span>` : ''
  ].filter(Boolean).join('');
  const fallback = esc((cleanTitle || 'J').charAt(0));
  const logoHtml = logo
    ? `<img src="${esc(logo)}" alt="" onerror="this.outerHTML='<div class=&quot;detail-job-logo-fallback&quot;>${fallback}</div>'">`
    : `<div class="detail-job-logo-fallback">${fallback}</div>`;
  return `<article class="detail-job-row"><a href="/job/${esc(slug)}" aria-label="View ${esc(cleanTitle)}">${logoHtml}</a><div class="detail-job-row-main"><h3><a href="/job/${esc(slug)}">${esc(cleanTitle)}</a></h3>${meta ? `<p>${meta}</p>` : ''}<span class="detail-pill">${esc(type || 'Full Time')}</span>${published ? `<span class="detail-job-published" style="display:inline-block;margin-left:12px;color:#64748b;font-size:13px">Published ${esc(published)}</span>` : ''}</div><span class="detail-bookmark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span></article>`;
}

function relatedJobCard(record, employerLogo = '') {
  const m = record?.metas || {};
  const title = record?.title?.rendered || record?.title || '';
  const category = record?.local ? (record.categories || []).join(', ') : orderedValues(m._job_category, record?.job_listing_category) || record?.category || '';
  const location = record?.local ? (record.locations || []).join(', ') : values(m._job_location) || record?.location || '';
  let type = record?.local ? (record.types || []).join(', ') : values(m._job_type) || '';
  if (!type || type === 'job_listing') {
    type = (record?.type && record?.type !== 'job_listing') ? record.type : 'Full Time';
  }
  const logo = record?.logo || m._job_logo || employerLogo;
  const publishedDate=record?.publishedDate || record?.datePosted || record?.postedDate || record?.date || record?.createdAt || '';
  return jobCard([title, record?.slug || '', category, location, type, publishedDate], logo);
}

function formatSocialLinks(socials) {
  const links = [];
  if (socials && typeof socials === 'object') {
    if (Array.isArray(socials.items)) {
      socials.items.forEach(it => {
        if (it?.url) links.push({ name: it.platform ? it.platform.charAt(0).toUpperCase() + it.platform.slice(1) : 'Link', url: it.url });
      });
    } else {
      Object.keys(socials).forEach(k => {
        if (k !== 'items' && typeof socials[k] === 'string' && socials[k].trim()) {
          links.push({ name: k.charAt(0).toUpperCase() + k.slice(1), url: socials[k].trim() });
        }
      });
    }
  }
  const unique = [];
  const seen = new Set();
  links.forEach(l => {
    if (!seen.has(l.url)) {
      seen.add(l.url);
      unique.push(l);
    }
  });
  if (!unique.length) return '';
  return `<div class="detail-social-links" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${unique.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer nofollow" class="detail-social-pill" style="display:inline-flex;align-items:center;padding:2px 8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;font-size:11.5px;color:#1d4ed8;text-decoration:none;">${esc(l.name)} ↗</a>`).join('')}</div>`;
}

function resolveEmployerProfile(record, jobEmployerUrl = '', company = '') {
  return employerProfileHref({employerSlug:record?.slug, employerUrl:jobEmployerUrl||record?.link, company});
}

function renderAboutCompanySection(employer, company, logo, location, jobEmployerUrl = '', website = '', category = '') {
  if (!employer && !company) return '';
  const m = employer?.metas || {};
  const compName = decode(employer?.title?.rendered || employer?.title || company || 'Company');
  const profileUrl = employer ? resolveEmployerProfile(employer, jobEmployerUrl, compName) : '/employers';
  const empLogo = employer?.logo || m._employer_logo || m._employer_featured_image_img || logo || '';
  
  // Category
  const compCatList = (category ? splitCommaCategories(category) : [])
    .concat(employer?.local ? (employer.categories || []) : (m._employer_category ? (typeof m._employer_category === 'object' ? Object.values(m._employer_category) : [m._employer_category]) : []))
    .map(decode).map(s => String(s).trim()).filter(Boolean);
  const uniqueCompCats = [...new Set(compCatList)];
  // Location
  const compLoc = location || (employer?.local ? (employer.locations || []).join(', ') : values(m._employer_location)) || 'United Arab Emirates';
  // Size
  const compSize = employer?.companySize || m._employer_company_size || '';
  // Founded
  const compFounded = employer?.foundedDate || m._employer_founded_date || '';
  // Website
  const compWebsite = website || employer?.website || m._employer_website || '';
  // Tagline
  const compTagline = employer?.tagline || m._employer_tagline || compLoc;

  // Rating
  const explicitRating = employer?.rating || m._employer_rating || null;
  const explicitReviewCount = employer?.reviewCount || m._employer_review_count || 0;
  const hasRating = Boolean(explicitRating && Number(explicitRating) > 0);
  const ratingScore = hasRating ? Number(explicitRating).toFixed(1) : null;

  // Bio / Content taken from the employer page
  const empDesc = employer?.description || '';
  const hasEmpHtml = /<[a-z][\s\S]*>/i.test(empDesc);
  const rawContent = employer?.local
    ? (hasEmpHtml ? empDesc : (empDesc ? empDesc.split(/\n\s*\n/).map(p => `<p>${esc(p).replaceAll('\n', '<br>')}</p>`).join('') : ''))
    : employer?.content?.rendered || '';

  const cleanBio = rawContent || '';
  const socialsHtml = formatSocialLinks(employer?.socials);

  return `
    <section class="detail-about-company-card" aria-label="About ${esc(compName)}">
      <div class="detail-about-company-header">
        <a href="${esc(profileUrl)}" class="detail-about-company-logo-link">
          ${empLogo ? `<img src="${esc(empLogo)}" alt="${esc(compName)}" class="detail-about-company-logo">` : `<div class="detail-about-company-fallback">${esc((compName || 'CO').slice(0, 2).toUpperCase())}</div>`}
        </a>
        <div class="detail-about-company-meta-col">
          <div class="detail-about-company-name-row">
            <h3 class="detail-about-company-name"><a href="${esc(profileUrl)}">${esc(compName)}</a></h3>
          </div>

          ${hasRating ? `
            <div class="detail-about-rating-row">
              <span class="emp-rating-star">★</span>
              <strong>${ratingScore}</strong>
              <span class="detail-about-rating-count">(${explicitReviewCount} reviews)</span>
            </div>
          ` : ''}

          ${compTagline ? `<p class="detail-about-company-tagline">${esc(compTagline)}</p>` : ''}

          <div class="detail-about-company-pills">
            ${uniqueCompCats.map(c => `<span class="detail-about-pill">🏢 ${esc(c)}</span>`).join('')}
            ${compLoc ? `<span class="detail-about-pill">📍 ${esc(compLoc)}</span>` : ''}
            ${compSize ? `<span class="detail-about-pill">👥 ${esc(compSize)}</span>` : ''}
            ${compFounded ? `<span class="detail-about-pill">🗓 Founded ${esc(compFounded)}</span>` : ''}
          </div>
        </div>

        ${employer ? `<div class="detail-about-company-action">
          <a href="${esc(profileUrl)}" class="detail-about-profile-btn">
            View Company Profile
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>` : ''}
      </div>

      <div class="detail-about-company-body">
        <h4 class="detail-about-heading">About ${esc(compName)}</h4>
        <div class="wordpress-content detail-about-bio">
          ${cleanBio}
        </div>
      </div>

      ${(compWebsite || socialsHtml) ? `
        <div class="detail-about-company-footer">
          ${compWebsite ? `<a href="${esc(compWebsite)}" target="_blank" rel="noopener noreferrer nofollow" class="detail-about-website-btn">🌐 Official Website ↗</a>` : ''}
          ${socialsHtml}
        </div>
      ` : ''}
    </section>
  `;
}

function renderSameOrgJobsSidebar(orgJobs, company, employer, employerPath) {
  const compName = decode(company || employer?.title?.rendered || employer?.title || 'Organisation');
  const totalCount = Array.isArray(orgJobs) ? orgJobs.length : 0;
  
  return `
    <aside class="detail-org-jobs-box">
      <div class="detail-org-jobs-header">
        <div class="detail-org-jobs-heading-wrap">
          <span class="detail-org-jobs-eyebrow">SAME ORGANISATION</span>
          <h3 class="detail-org-jobs-title">Other Jobs at ${esc(compName)}</h3>
        </div>
        ${totalCount > 0 ? `<span class="detail-org-jobs-badge">${totalCount} Active</span>` : ''}
      </div>

      <div class="detail-org-jobs-list">
        ${totalCount > 0 ? orgJobs.slice(0, 5).map(job => {
          const jTitle = formatJobTitle(decode(job.title?.rendered || job.title || 'Job Opening'));
          const jCat = job.category || (job.categories || []).join(', ') || values(job.metas?._job_category) || '';
          const jLoc = job.location || (job.locations || []).join(', ') || values(job.metas?._job_location) || '';
          let jType = values(job.metas?._job_type) || (job.types || []).join(', ') || '';
          if (!jType || jType === 'job_listing') {
            jType = (job.type && job.type !== 'job_listing') ? job.type : 'Full Time';
          }
          const jDate = resolveJobDate(job);
          return `
            <a class="detail-org-job-card" href="/job/${esc(job.slug)}">
              <div class="detail-org-job-info">
                <h4 class="detail-org-job-title">${esc(jTitle)}</h4>
                <div class="detail-org-job-subline">
                  ${jLoc ? `<span class="detail-org-job-loc">${esc(jLoc)}</span>` : ''}
                  ${(jLoc && jCat) ? `<span class="detail-org-job-sep">•</span>` : ''}
                  ${jCat ? `<span class="detail-org-job-cat">${esc(jCat)}</span>` : ''}
                </div>
                <div class="detail-org-job-meta-row">
                  <span class="detail-org-job-type-pill">${esc(jType)}</span>
                  ${jDate ? `<span class="detail-org-job-date">${esc(jDate)}</span>` : ''}
                </div>
              </div>
              <div class="detail-org-job-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </a>
          `;
        }).join('') : `
          <div class="detail-org-jobs-empty">
            <p>No other active vacancies posted currently by ${esc(compName)}.</p>
            <a href="${esc(employerPath)}" class="detail-org-jobs-viewall-btn">View All ${esc(compName)} Details →</a>
          </div>
        `}
      </div>

      ${totalCount > 0 ? `
        <div class="detail-org-jobs-footer">
          <a href="${esc(employerPath)}" class="detail-org-jobs-all-link">
            Explore All ${totalCount + 1} Openings at ${esc(compName)} →
          </a>
        </div>
      ` : ''}
    </aside>
  `;
}

export function renderJobDetail(record, employer, path, orgJobs = [], relatedJobs = []) {
  if (!record) return '<main class="detail-page"><div class="wrap detail-empty"><h1>Job not found</h1><a href="/jobs">Browse Jobs</a></div></main>';
  const m=record.metas||{};
  const title=formatJobTitle(decode(record.title?.rendered||record.title));
  const company=m._job_employer_name||record.company||'';
  const seenCategories = new Set();
  const catList = parseCategories(record).filter(category => {
    const key = category.replace(/\s+/g, ' ').toLocaleLowerCase();
    if (seenCategories.has(key)) return false;
    seenCategories.add(key);
    return true;
  });
  const categoryLinks = categories => categories.map(c => `<a class="detail-meta-link" href="/category/${esc(filterSlug(c))}">${esc(c)}</a>`).join(', ');
  const locList = parseLocations(record);
  const category = catList.join(', ');
  const location = locList.join(', ');
  const type = record.local ? (record.types || []).join(', ') : values(m._job_type) || record.type || '';
  const date = resolveJobDate(record);
  const expiry = resolveJobDeadline(record);
  const isBateel = record.slug === 'bateel-international' || employer?.slug === 'bateel-international';
  const logo = record.logo || m._job_logo || employer?.logo || employer?.metas?._employer_logo || employer?.metas?._employer_featured_image_img || employer?.metas?._employer_featured_image || (isBateel ? '/assets/bateel.jpg' : '');
  const employerPath = resolveEmployerProfile(employer, record.employerUrl || m._job_employer_url, company);
  const desc = record.description || '';
  const hasHtml = /<[a-z][\s\S]*>/i.test(desc);
  const content = record.local ? (hasHtml ? desc : (desc ? desc.split(/\n\s*\n/).map(p => `<p>${esc(p).replaceAll('\n', '<br>')}</p>`).join('') : '<p>Job description is not available.</p>')) : (record.content?.rendered || '<p>Job description is not available.</p>');
  const experience = record.experience || m['custom-text-27987527'] || '';
  const qualification = record.qualification || m['custom-text-28953441'] || '';
  const shareUrl = encodeURIComponent(`https://www.trikonet.com${publicJobPath(record)}`);
  const currentCompany = (m._job_employer_name || record.company || employer?.title?.rendered || employer?.title || '').trim().toLowerCase();
  const currentEmployerId = m._job_employer_posted_by || employer?.id;
  const isSameCompany = (job) => {
    const comp = (job?.metas?._job_employer_name || job?.company || '').trim().toLowerCase();
    if (currentCompany && comp && (comp === currentCompany || comp.includes(currentCompany) || currentCompany.includes(comp))) return true;
    if (currentEmployerId && job?.metas?._job_employer_posted_by && String(job.metas._job_employer_posted_by) === String(currentEmployerId)) return true;
    return false;
  };
  const related = (relatedJobs || []).filter(item => item && item.slug !== record.slug && !isSameCompany(item)).slice(0, 4);
  const catMeta = catList.length ? `<span class="detail-meta-item detail-category-meta"><svg class="meta-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><span class="detail-category-text">${categoryLinks(catList.slice(0, 2))}</span></span>` : '';
  const locMeta = locList.length ? `<span class="detail-meta-item"><svg class="meta-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${locList.map(l => `<a class="detail-meta-link" href="/job-location/${esc(filterSlug(l))}">${esc(l)}</a>`).join(', ')}</span>` : '';
  const dateMeta = date ? `<span><svg class="meta-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${esc(date)}</span>` : '';
  const metaSpans = [catMeta, locMeta, dateMeta].filter(Boolean).join('');

  const aboutCompanyHtml = renderAboutCompanySection(employer, company, logo, location, record.employerUrl||m._job_employer_url, employer?.website||m._job_employer_website, category);
  const orgJobsHtml = renderSameOrgJobsSidebar(orgJobs, company, employer, employerPath);

  return `<main class="detail-page detail-exact">
    <section class="detail-hero">
      <div class="wrap detail-hero-inner">
        <a href="${esc(employerPath)}" class="detail-logo-card">
          ${logo ? `<img class="detail-logo" src="${esc(logo)}" alt="${esc(company)}">` : `<div class="detail-logo-fallback">${esc((company || title || 'J').charAt(0))}</div>`}
        </a>
        <div class="detail-title">
          <h1>${esc(title)}</h1>
          ${metaSpans ? `<div class="detail-meta">${metaSpans}</div>` : ''}
          ${type ? `<span class="detail-pill">${esc(type)}</span>` : ''}
        </div>
        <div class="detail-action-group">
        <button class="detail-report-job-btn detail-report-corner-btn" type="button" id="openJobReportBtn" aria-label="Report this job"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg><span>Report this job</span></button>
        <div class="detail-actions">
          ${applicationAction(record,m)}
          <button class="save" type="button" aria-label="Save job"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
        </div>
          <a class="detail-resume-promo" href="/resume-builder"><span class="detail-resume-promo-link">Build a free resume <span aria-hidden="true">→</span></span></a>
        </div>
      </div>
    </section>
    <div class="wrap detail-grid">
      <article class="job-description">
        <h2 class="job-desc-heading">
          <span>Job Description</span>
        </h2>
        <div class="job-description-copy" id="jobDescriptionCopy">
          <div class="wordpress-content">${content}</div>
        </div>
        <button type="button" class="job-description-toggle" id="jobDescriptionToggle" aria-expanded="false" aria-controls="jobDescriptionCopy">
          <span>Read more</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        ${(record.local ? (record.tags || []) : (record.tags || [])).length ? `
          <div class="detail-tags-row">
            <span class="detail-tags-label">Tags:</span>
            <div class="detail-tags-list">
              ${(record.local ? record.tags : record.tags).map(t => `<span class="detail-tag-pill">${esc(t)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${catList.length > 2 ? `<div class="detail-extra-categories"><span class="detail-extra-categories-label">More categories:</span><div>${categoryLinks(catList.slice(2))}</div></div>` : ''}

        <!-- About The Company (Bottom Below Job Description) -->
        ${aboutCompanyHtml}

        <div class="share">
          <div class="share-header">
            <h3>Share this job</h3>
            <span class="share-subtitle">Know someone looking for this role?</span>
          </div>
          <div class="share-btns">
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener noreferrer nofollow" class="detail-share-pill share-linkedin" aria-label="Share on LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn
            </a>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title + ': https://www.trikonet.com' + path)}" target="_blank" rel="noopener noreferrer nofollow" class="detail-share-pill share-wa" aria-label="Share on WhatsApp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              WhatsApp
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener noreferrer nofollow" class="detail-share-pill share-fb" aria-label="Share on Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
              Facebook
            </a>
            <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer nofollow" class="detail-share-pill share-x" aria-label="Share on X">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </a>
          </div>
        </div>
        ${related.length?`<section class="related-list"><h3>Related Jobs</h3>${related.map(item => relatedJobCard(item)).join('')}</section>`:''}
      </article>

      <div class="detail-sidebar">
        <aside class="overview">
          <div class="overview-header">
            <span class="overview-eyebrow">QUICK SUMMARY</span>
            <h2 class="overview-heading">Job Overview</h2>
          </div>
          <div class="overview-list">
            ${date ? `
            <div class="overview-item overview-date">
              <div class="overview-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="overview-content">
                <span class="overview-title">Date Posted</span>
                <span class="overview-val">${esc(date)}</span>
              </div>
            </div>` : ''}

            ${location ? `
            <div class="overview-item overview-location">
              <div class="overview-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="overview-content">
                <span class="overview-title">Location</span>
                <span class="overview-val">${esc(location)}</span>
              </div>
            </div>` : ''}

            ${type ? `
            <div class="overview-item overview-type">
              <div class="overview-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="overview-content">
                <span class="overview-title">Job Type</span>
                <span class="overview-val">${esc(type)}</span>
              </div>
            </div>` : ''}

            ${experience ? `
            <div class="overview-item">
              <div class="overview-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div class="overview-content">
                <span class="overview-title">Experience</span>
                <span class="overview-val">${esc(experience)}</span>
              </div>
            </div>` : ''}

            ${qualification ? `
            <div class="overview-item">
              <div class="overview-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div class="overview-content">
                <span class="overview-title">Qualification</span>
                <span class="overview-val">${esc(qualification)}</span>
              </div>
            </div>` : ''}

          </div>
        </aside>

        <!-- Same Organisation Other Jobs (Right Side Sidebar) -->
        ${orgJobsHtml}
      </div>
    </div>
  </main>
  <div class="job-report-modal" id="jobReportModal" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="jobReportTitle">
    <div class="job-report-card">
      <button type="button" class="job-report-close" id="closeJobReportBtn" aria-label="Close report form">×</button>
      <span class="job-report-eyebrow">HELP KEEP TRIKONET ACCURATE</span>
      <h2 id="jobReportTitle">Report this job</h2>
      <p>Tell us what is wrong with this listing. Our team will review your report.</p>
      <form id="jobReportForm">
        <input type="hidden" name="jobSlug" value="${esc(record.slug || '')}">
        <input type="hidden" name="jobTitle" value="${esc(title)}">
        <div class="job-report-options">
          <label><input type="radio" name="reason" value="broken_link" required><span>Application link is not working</span></label>
          <label><input type="radio" name="reason" value="expired"><span>Job has expired or is no longer available</span></label>
          <label><input type="radio" name="reason" value="incorrect"><span>Incorrect job information</span></label>
          <label><input type="radio" name="reason" value="duplicate"><span>Duplicate job listing</span></label>
          <label><input type="radio" name="reason" value="suspicious"><span>Suspicious or misleading job</span></label>
          <label><input type="radio" name="reason" value="other"><span>Other issue</span></label>
        </div>
        <label class="job-report-details">Additional details <span>(optional)</span><textarea name="details" rows="3" maxlength="1000" placeholder="Share any details that can help us review this listing"></textarea></label>
        <p class="job-report-message" aria-live="polite"></p>
        <button type="submit" class="job-report-submit">Submit report</button>
      </form>
    </div>
  </div>`;
}

export function renderEmployerDetail(record, path, jobs = []) {
  if (!record) return '<main class="detail-page"><div class="wrap detail-empty"><h1>Employer not found</h1><a href="/employers">Browse Employers</a></div></main>';
  const m = record.metas || {};
  const title = formatCompanyName(decode(record.title?.rendered || record.title || ''));
  const category = record.local ? (record.categories || []).join(', ') : values(m._employer_category);
  const location = record.local ? (record.locations || []).join(', ') : values(m._employer_location);
  const isBateel = record.slug === 'bateel-international';
  const logo = record.logo || m._employer_logo || (isBateel ? '/assets/bateel.jpg' : '');
  const phoneRaw = record.phone || record.mobile || m._employer_phone || m._employer_mobile || m._company_phone || '';
  const phone = Array.isArray(phoneRaw) ? String(phoneRaw[0] || '').trim() : String(phoneRaw || '').trim();
  const phoneHref = phone.replace(/[^\d+]/g, '');
  const emailRaw = record.email || m._employer_email || m._company_email || '';
  const email = Array.isArray(emailRaw) ? String(emailRaw[0] || '').trim() : String(emailRaw || '').trim();
  const website = record.website || m._employer_website || '';
  const founded = record.foundedDate || m._employer_founded_date || '2012';
  const size = record.companySize || m._employer_company_size || '501-1,000';
  const hq = location || 'Dubai, United Arab Emirates';
  
  let positions = [];
  if (Array.isArray(jobs) && jobs.length) {
    const normalizedEmployer = title.trim().toLowerCase();
    const employerSlug = String(record.slug || '').trim().toLowerCase();
    const matchingJobs = jobs.filter(job => {
      if (record.jobPagination) return true; // The backend has already matched and paginated these jobs.
      if (Array.isArray(job)) return false;
      const jobCompany = String(job.company || job.employerName || '').trim().toLowerCase();
      const jobEmployerSlug = String(job.employerSlug || '').trim().toLowerCase();
      let urlSlug = '';
      try { urlSlug = new URL(job.employerUrl || '', window.location.origin).pathname.split('/').filter(Boolean).pop()?.toLowerCase() || ''; } catch {}
      return (jobCompany && jobCompany === normalizedEmployer) ||
        (employerSlug && jobEmployerSlug === employerSlug) ||
        (employerSlug && urlSlug === employerSlug);
    });
    positions = matchingJobs.map(job => {
      if (Array.isArray(job)) return job;
      return [
        job.title || '',
        job.slug || '',
        (job.categories || []).join(', ') || job.category || '',
        (job.locations || []).join(', ') || job.location || '',
        job.type || 'Full Time',
        job.publishedDate || job.datePosted || job.postedDate || job.date || job.createdAt || ''
      ];
    });
  }
  if (!positions.length && isBateel && !record.jobPagination && !record.jobsLoadError) positions = bateelJobs;

  // Count only the vacancies actually matched to this employer. API page-size
  // limits and stale employer metadata must never be shown as a job count.
  const totalOpenJobs = record.jobPagination ? record.jobPagination.total : positions.length;
  const jobsPages = Math.max(1, Math.ceil(totalOpenJobs / 10));
  const requestedPage = Number(new URLSearchParams(window.location.search).get('jobsPage'));
  const jobsPage = record.jobPagination?.page || Math.min(jobsPages, Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  const pagePositions = record.jobPagination ? positions : positions.slice((jobsPage - 1) * 10, jobsPage * 10);
  const pageHref = page => {
    const url = new URL(window.location.href);
    url.searchParams.set('jobsPage', String(page));
    url.searchParams.set('tab', 'jobs');
    url.hash = 'panel-jobs';
    return esc(url.pathname + url.search + url.hash);
  };
  const pageNumbers = [...new Set([1, jobsPage - 1, jobsPage, jobsPage + 1, jobsPages])].filter(p => p >= 1 && p <= jobsPages).sort((a,b) => a-b);
  const jobsPagination = totalOpenJobs ? `<nav class="employer-jobs-pagination" aria-label="Employer jobs pagination">
    <p>Showing ${(jobsPage - 1) * 10 + 1}–${Math.min(jobsPage * 10, totalOpenJobs)} of ${totalOpenJobs} jobs</p>
    <div class="pagination-pages">
      ${jobsPage > 1 ? `<a class="pagination-btn" href="${pageHref(jobsPage - 1)}">Previous</a>` : '<span class="pagination-btn disabled" aria-disabled="true">Previous</span>'}
      ${pageNumbers.map((p, i) => `${i && p - pageNumbers[i-1] > 1 ? '<span>…</span>' : ''}<a class="pagination-btn${p === jobsPage ? ' active' : ''}" ${p === jobsPage ? 'aria-current="page"' : ''} href="${pageHref(p)}">${p}</a>`).join('')}
      ${jobsPage < jobsPages ? `<a class="pagination-btn" href="${pageHref(jobsPage + 1)}">Next</a>` : '<span class="pagination-btn disabled" aria-disabled="true">Next</span>'}
    </div></nav>` : '';
  const empDesc = record.description || '';
  const hasEmpHtml = /<[a-z][\s\S]*>/i.test(empDesc);
  const rawContent = record.local
    ? (hasEmpHtml ? empDesc : (empDesc ? empDesc.split(/\n\s*\n/).map(p => `<p>${esc(p).replaceAll('\n', '<br>')}</p>`).join('') : ''))
    : record.content?.rendered || '';

  const cleanBio = rawContent || `<p>${esc(title)} is a leading employer operating across the UAE and GCC region, providing top-tier professional career opportunities, modern workplace culture, and continuous development for talent.</p>`;

  // Extract primary company category
  let companyCategory = '';
  if (typeof category === 'string' && category.trim() && !category.startsWith('a:')) {
    companyCategory = category.split(',')[0].trim();
  } else if (category && typeof category === 'object') {
    const vals = Object.values(category).filter(v => typeof v === 'string' && v.trim() && !v.startsWith('a:'));
    if (vals.length) companyCategory = vals[0].trim();
  }
  if (!companyCategory && Array.isArray(record.categories) && record.categories.length) {
    const valid = record.categories.find(c => typeof c === 'string' && c.trim() && !c.startsWith('a:'));
    if (valid) companyCategory = valid.trim();
  }
  if (!companyCategory && typeof record.category === 'string' && record.category.trim() && !record.category.startsWith('a:')) {
    companyCategory = record.category.split(',')[0].trim();
  }
  if (!companyCategory && m._employer_category) {
    if (typeof m._employer_category === 'object') {
      const vals = Object.values(m._employer_category).filter(v => typeof v === 'string' && v.trim() && !v.startsWith('a:'));
      if (vals.length) companyCategory = vals[0].trim();
    } else if (typeof m._employer_category === 'string') {
      const raw = m._employer_category.trim();
      if (!raw.startsWith('a:')) {
        companyCategory = raw.split(',')[0].trim();
      } else {
        const idMatch = raw.match(/i:\d+;i:(\d+);/) || raw.match(/i:(\d+);/);
        if (idMatch) {
          const termMap = {
            187: 'Healthcare', 207: 'Construction', 267: 'Agriculture and Forestry',
            268: 'Mining and Extraction', 269: 'Construction', 270: 'Manufacturing',
            271: 'Utilities', 272: 'Warehousing and Logistics', 273: 'Information Technology',
            274: 'Telecommunications', 275: 'Retail', 276: 'Finance and Insurance',
            277: 'Real Estate', 278: 'Healthcare', 279: 'Educational Services',
            280: 'Entertainment', 281: 'Other Services', 282: 'Food and Dining',
            283: 'Automotive', 294: 'Construction & Engineering', 297: 'Wholesale',
            300: 'Conglomerate', 330: 'Accounting', 350: 'Business Consulting and Services',
            595: 'Airlines and Aviation', 599: 'Oil and Gas', 600: 'Advertising Services',
            602: 'Banking', 626: 'Transportation', 627: 'Procurement and Supply Chain',
            636: 'Hospital', 637: 'Medical Company', 638: 'Medical Clinic',
            639: 'Medical Center', 641: 'Healthcare Group', 642: 'Pharmacy',
            757: 'Hospitality', 759: 'Legal Services', 760: 'Architecture and Planning',
            779: 'Investment Management', 782: 'Wellness & Fitness', 795: 'Pharmaceutical Manufacturing',
            816: 'Marketing Services', 862: 'Software Development', 892: 'Staffing and Recruiting',
            899: 'School', 988: 'University', 1008: 'Food & Beverages', 1022: 'IT Services and IT Consulting'
          };
          companyCategory = termMap[Number(idMatch[1])] || '';
        }
      }
    }
  }
  if (!companyCategory && Array.isArray(positions) && positions.length) {
    for (const pos of positions) {
      const posCat = Array.isArray(pos) ? pos[2] : (pos.category || (pos.categories || []).join(', '));
      if (posCat && typeof posCat === 'string' && posCat.trim()) {
        companyCategory = posCat.split(',')[0].trim();
        break;
      }
    }
  }
  if (!companyCategory) {
    const fullText = `${title} ${record.description || record.content?.rendered || record.content || ''}`.toLowerCase();
    if (/hospital|clinic|healthcare|medical|medicine|patient care|doctor|nursing/.test(fullText)) companyCategory = 'Healthcare';
    else if (/school|college|university|education|academy|nursery/.test(fullText)) companyCategory = 'Educational Services';
    else if (/bank|financial|insurance|investment|exchange|accounting|audit/.test(fullText)) companyCategory = 'Finance and Banking';
    else if (/hotel|resort|restaurant|catering|hospitality|cafe/.test(fullText)) companyCategory = 'Hospitality';
    else if (/construction|contracting|electromechanical|engineering|building materials/.test(fullText)) companyCategory = 'Construction';
    else if (/software|technology|it services|digital|tech/.test(fullText)) companyCategory = 'Information Technology';
    else if (/logistics|freight|transportation|shipping|supply chain/.test(fullText)) companyCategory = 'Warehousing and Logistics';
    else if (/real estate|properties|property|realty/.test(fullText)) companyCategory = 'Real Estate';
    else if (/retail|supermarket|hypermarket|fashion|store|mall/.test(fullText)) companyCategory = 'Retail';
    else companyCategory = 'Corporate & Business';
  }

  // Rating: ONLY if there is any real rating! Otherwise NO NEED.
  const explicitRating = record.rating || m._employer_rating || null;
  const explicitReviewCount = record.reviewCount || m._employer_review_count || 0;
  const hasRating = Boolean(explicitRating && Number(explicitRating) > 0);
  const ratingScore = hasRating ? Number(explicitRating).toFixed(1) : null;
  const reviewCount = explicitReviewCount;

  // Short tagline / subtitle
  let tagline = record.tagline || m._employer_tagline || '';
  if (!tagline && location) {
    tagline = location;
  }
  const employerLocationFilter = String(location || '').split(',')[0].trim();

  return `
  <main class="emp-profile-page">
    <div class="wrap">
      
      <!-- Top Profile Header Card -->
      <section class="emp-profile-header-card" aria-label="Employer Profile Header">
        <div class="emp-profile-header-main">
          <div class="emp-profile-logo-wrap">
            ${logo ? `<img src="${esc(logo)}" alt="${esc(title)}" class="emp-profile-logo-img">` : `<div class="emp-profile-logo-fallback">${esc(title.slice(0, 2).toUpperCase() || 'CO')}</div>`}
          </div>
          
          <div class="emp-profile-meta-col">
            <div class="emp-profile-name-row">
              <h1 class="emp-profile-name">${esc(title)}</h1>
            </div>

            <div class="emp-profile-pills-row">
              ${companyCategory ? `<a href="/employers?category=${encodeURIComponent(companyCategory)}" class="emp-meta-pill emp-cat-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>${esc(companyCategory)}</a>` : ''}
              ${location ? `<a href="/employers?location=${encodeURIComponent(employerLocationFilter)}" class="emp-meta-pill emp-location-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>${esc(location)}</a>` : ''}
            </div>
          </div>
        </div>

        <div class="emp-profile-header-actions">
          <button type="button" class="emp-follow-btn" data-slug="${esc(record.slug)}">+ Follow</button>
          <button type="button" class="emp-profile-claim-link" id="empOpenClaimBtn" data-slug="${esc(record.slug)}" data-name="${esc(title)}">Own this company? <strong>Claim profile</strong></button>
        </div>
      </section>

      <!-- Navigation Tabs Bar -->
      <div class="emp-profile-tabs-strip">
        <button type="button" class="emp-profile-tab-item active" data-tab="overview">Overview</button>
        <button type="button" class="emp-profile-tab-item" data-tab="jobs">Jobs <span class="emp-tab-badge">${totalOpenJobs}</span></button>
        <button type="button" class="emp-profile-tab-item" data-tab="reviews">Reviews <span class="emp-tab-badge" id="empTabReviewsBadge">${reviewCount || 0}</span></button>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="emp-profile-layout">
        
        <!-- Left Content Pane -->
        <div class="emp-profile-left-col">
          
          <!-- Tab 1: Overview Tab Panel -->
          <div class="emp-tab-panel active" id="panel-overview" data-panel="overview">
            
            <!-- More Information Card -->
            <section class="emp-card-block">
              <h2 class="emp-card-title">More Information</h2>
              <div class="emp-info-grid">
                <div class="emp-info-item">
                  <span class="emp-info-label">Type</span>
                  <span class="emp-info-val">Private</span>
                </div>
                <div class="emp-info-item">
                  <span class="emp-info-label">Founded</span>
                  <span class="emp-info-val">${esc(founded)}</span>
                </div>
                <div class="emp-info-item">
                  <span class="emp-info-label">Company Size</span>
                  <span class="emp-info-val">${esc(size)} employees</span>
                </div>
                <div class="emp-info-item">
                  <span class="emp-info-label">Headquarters</span>
                  <span class="emp-info-val">${esc(hq)}</span>
                </div>
                ${phone ? `
                  <div class="emp-info-item">
                    <span class="emp-info-label">Phone</span>
                    <span class="emp-info-val"><a href="tel:${esc(phoneHref)}" class="emp-link-external">${esc(phone)}</a></span>
                  </div>
                ` : ''}
                ${email ? `
                  <div class="emp-info-item">
                    <span class="emp-info-label">Email</span>
                    <span class="emp-info-val"><a href="mailto:${esc(email)}" class="emp-link-external">${esc(email)}</a></span>
                  </div>
                ` : ''}
                <div class="emp-info-item emp-info-full">
                  <span class="emp-info-label">Website</span>
                  <span class="emp-info-val">
                    ${website ? `<a href="${esc(website)}" target="_blank" rel="noopener noreferrer nofollow" class="emp-link-external">${esc(website)} ↗</a>` : '—'}
                  </span>
                </div>
                ${category ? `
                  <div class="emp-info-item emp-info-full">
                    <span class="emp-info-label">Industry Sectors</span>
                    <span class="emp-info-val">${esc(category)}</span>
                  </div>
                ` : ''}
              </div>
            </section>


            <!-- About Company Card -->
            <section class="emp-card-block emp-about-block">
              <h2 class="emp-card-title">About ${esc(title)}</h2>
              <div class="emp-about-content" id="empAboutText">
                <div class="emp-about-rendered wordpress-content">
                  ${cleanBio}
                </div>
              </div>
              <button type="button" class="emp-readmore-btn" id="empReadMoreBtn" onclick="const p = document.getElementById('empAboutText'); p.classList.toggle('expanded'); this.textContent = p.classList.contains('expanded') ? 'Show less' : 'Read more';">Read more</button>
            </section>

          </div>

          <!-- Tab 2: Jobs Tab Panel -->
          <div class="emp-tab-panel" id="panel-jobs" data-panel="jobs">
            <section class="emp-card-block">
              <div class="emp-card-header-flex">
                <h2 class="emp-card-title">Open Positions at ${esc(title)} (${totalOpenJobs})</h2>
                <a href="/jobs?q=${encodeURIComponent(title)}" class="emp-card-sublink">View all on search portal →</a>
              </div>
              <div class="emp-positions-list">
                ${positions.length ? pagePositions.map(item => jobCard(item, logo)).join('') : `
                  <div class="emp-no-jobs-box">
                    <p>No active openings currently published for ${esc(title)}. Check back regularly for new vacancies.</p>
                  </div>
                `}
              </div>
              ${jobsPagination}
            </section>
          </div>

          <!-- Tab 3: Reviews Tab Panel -->
          <div class="emp-tab-panel" id="panel-reviews" data-panel="reviews">
            <section class="emp-card-block">
              <div class="emp-card-header-flex">
                <div>
                  <h2 class="emp-card-title">Employee Reviews & Workplace Feedback</h2>
                  <p class="emp-card-desc">Verified feedback and ratings from current and former employees</p>
                </div>
                <div class="emp-reviews-header-actions">
                  <span class="emp-rating-pill-lg" id="empReviewsHeaderRatingPill" style="display:none;">★ 0.0 Overall Rating</span>
                  <button type="button" class="emp-rate-company-btn" id="openRateCompanyBtn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Rate Company
                  </button>
                </div>
              </div>

              <!-- Rating Score Overview Card (Dynamic - shown only when reviews exist) -->
              <div class="emp-rating-score-banner" id="empRatingScoreBanner" style="display:none;">
                <div class="emp-rating-big-score">
                  <div class="num" id="empBigOverallScore">5.0</div>
                  <div class="stars-gold" id="empBigOverallStars">★★★★★</div>
                  <div class="label" id="empReviewsCountLabel">Based on employee reviews</div>
                </div>
                <div class="emp-rating-score-stats">
                  <div class="stat-item">
                    <span class="val" id="empRecommendVal">100%</span>
                    <span class="lbl">Recommend to a friend</span>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <span class="val" id="empLeadershipVal">100%</span>
                    <span class="lbl">Approve of workplace</span>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <span class="val" id="empSecurityVal">5.0</span>
                    <span class="lbl">Job security index</span>
                  </div>
                </div>
              </div>

              <!-- Category Ratings Breakdown (Dynamic) -->
              <div class="emp-speaks-list" id="empSpeaksListWrapper" style="display:none; margin-top: 24px;">
                <div class="emp-speaks-row">
                  <span class="label">Salary & Benefits</span>
                  <div class="progress-bar"><div class="fill" id="fill_salary" style="width: 100%;"></div></div>
                  <span class="stars" id="score_salary">★ 5.0</span>
                </div>
                <div class="emp-speaks-row">
                  <span class="label">Work Life Balance</span>
                  <div class="progress-bar"><div class="fill" id="fill_workLife" style="width: 100%;"></div></div>
                  <span class="stars" id="score_workLife">★ 5.0</span>
                </div>
                <div class="emp-speaks-row">
                  <span class="label">Work Satisfaction</span>
                  <div class="progress-bar"><div class="fill" id="fill_satisfaction" style="width: 100%;"></div></div>
                  <span class="stars" id="score_satisfaction">★ 5.0</span>
                </div>
                <div class="emp-speaks-row">
                  <span class="label">Skill Development</span>
                  <div class="progress-bar"><div class="fill" id="fill_skills" style="width: 100%;"></div></div>
                  <span class="stars" id="score_skills">★ 5.0</span>
                </div>
                <div class="emp-speaks-row">
                  <span class="label">Company Culture</span>
                  <div class="progress-bar"><div class="fill" id="fill_culture" style="width: 100%;"></div></div>
                  <span class="stars" id="score_culture">★ 5.0</span>
                </div>
                <div class="emp-speaks-row">
                  <span class="label">Job Security</span>
                  <div class="progress-bar"><div class="fill" id="fill_security" style="width: 100%;"></div></div>
                  <span class="stars" id="score_security">★ 5.0</span>
                </div>
              </div>

              <!-- Live User Reviews Feed (NO DUMMY REVIEWS) -->
              <div class="emp-reviews-feed" style="margin-top: 28px;">
                <h3 class="emp-feed-heading">Recent Workplace Reviews</h3>
                <div id="empUserReviewsList" class="emp-reviews-container">
                  <!-- Dynamically populated from submitted reviews -->
                </div>
                <div id="empNoReviewsEmptyState" class="emp-empty-reviews-state">
                  <div class="emp-empty-reviews-icon">★</div>
                  <h4>No reviews yet for ${esc(title)}</h4>
                  <p>Be the first employee to share your workplace rating and experience with fellow job seekers.</p>
                </div>
              </div>

            </section>
          </div>

        </div>

        <!-- Right Sidebar Pane -->
        <aside class="emp-profile-right-col">
          
          <!-- Recruiter CTA Widget -->
          <div class="emp-sidebar-widget emp-recruiter-widget">
            <div class="emp-recruiter-content">
              <h3>Love jobs by ${esc(title)}?</h3>
              <p>Register with Trikonet and let employer talent scouts and recruiters discover your profile directly.</p>
              <a href="/register" class="emp-recruiter-btn">Register Now</a>
            </div>
            <div class="emp-recruiter-icon-wrap" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
            </div>
          </div>

        </aside>

      </div>

    </div>

    <!-- Claim Company Verification Modal -->
    <div class="emp-claim-modal-overlay" id="empClaimModal" style="display:none;" aria-hidden="true" role="dialog" aria-labelledby="claimModalTitle">
      <div class="emp-claim-modal-card">
        <button type="button" class="emp-modal-close" id="empCloseClaimBtn" aria-label="Close modal">×</button>
        
        <!-- Step 1: Claim Submission Form -->
        <div id="empClaimFormWrap">
          <div class="emp-modal-head">
            <div class="emp-modal-shield-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h2 id="claimModalTitle">Claim ${esc(title)} Profile</h2>
              <p>Submit official business verification to claim ownership of this employer page. Once approved, login credentials will be dispatched to manage profile details and post vacancies.</p>
            </div>
          </div>

          <form id="empClaimSubmitForm" class="emp-claim-form" onsubmit="event.preventDefault(); window.handleEmployerClaimSubmit && window.handleEmployerClaimSubmit(this);">
            <input type="hidden" name="employerSlug" value="${esc(record.slug)}">
            <input type="hidden" name="employerName" value="${esc(title)}">

            <div class="emp-form-row">
              <label>
                <span>Authorized Representative Name *</span>
                <input type="text" name="applicantName" placeholder="e.g. Sarah Al Hashimi" required>
              </label>
              <label>
                <span>Official Designation / Title *</span>
                <input type="text" name="designation" placeholder="e.g. Head of Human Resources" required>
              </label>
            </div>

            <div class="emp-form-row">
              <label>
                <span>Work / Corporate Email *</span>
                <input type="email" name="workEmail" placeholder="e.g. hr@${esc(record.slug)}.ae" required>
                <small class="emp-field-hint">Must match official company domain</small>
              </label>
              <label>
                <span>Phone / WhatsApp Contact *</span>
                <input type="tel" name="phone" placeholder="+971 50 123 4567" required>
              </label>
            </div>

            <div class="emp-form-row">
              <label>
                <span>Verification Document Type *</span>
                <select name="documentType" required>
                  <option value="UAE Trade License">UAE Trade License / Commercial License</option>
                  <option value="Company Establishment Card">Company Establishment Card (MOHRE / Immigration)</option>
                  <option value="Power of Attorney / Authorization Letter">Power of Attorney / Official Authorization Letter</option>
                  <option value="VAT / TRN Certificate">Federal Tax Authority (TRN) Certificate</option>
                </select>
              </label>
            </div>

            <div class="emp-form-group">
              <label>
                <span>Upload Official Verification Document (PDF, JPG, PNG) *</span>
                <div class="emp-doc-upload-box" id="empDocDropBox">
                  <input type="file" id="empDocFileInput" name="documentFile" accept=".pdf,.jpg,.jpeg,.png" required style="display:none;" onchange="window.handleClaimFileSelect && window.handleClaimFileSelect(this)">
                  <div class="emp-upload-prompt" onclick="document.getElementById('empDocFileInput').click()">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span id="empUploadLabelText">Click or drag & drop trade license / document here</span>
                    <small>Maximum size: 10MB (PDF, PNG, JPG)</small>
                  </div>
                </div>
              </label>
            </div>

            <div class="emp-form-group">
              <label>
                <span>Additional Remarks / Corporate Verification Notes</span>
                <textarea name="notes" rows="2" placeholder="Provide any additional verification notes, branch details, or official verification links."></textarea>
              </label>
            </div>

            <div class="emp-modal-footer">
              <button type="button" class="emp-btn-cancel" onclick="document.getElementById('empClaimModal').style.display='none'">Cancel</button>
              <button type="submit" class="emp-btn-submit" id="empClaimSubmitBtn">Submit Claim Request</button>
            </div>
          </form>
        </div>

        <!-- Step 2: Submission Success State -->
        <div id="empClaimSuccessWrap" style="display:none;" class="emp-claim-success-wrap">
          <div class="emp-success-icon-badge">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3>Claim Request Submitted!</h3>
          <p class="emp-success-msg">Your claim request for <strong>${esc(title)}</strong> has been registered with reference <code id="empClaimRefCode">#CLM-109283</code>.</p>
          <div class="emp-success-steps-box">
            <h4>What happens next?</h4>
            <ol>
              <li>Our verification team will review your business credentials and company domain within <strong>24 – 48 business hours</strong>.</li>
              <li>Once authenticated, official administrative login credentials (username and temporary password) will be sent to your work email address.</li>
              <li>You can log in to Trikonet Console to edit your employer profile, publish job listings, and manage applicants directly.</li>
            </ol>
          </div>
          <button type="button" class="emp-btn-close-success" onclick="document.getElementById('empClaimModal').style.display='none'">Done</button>
        </div>

      </div>
    </div>

    <!-- Rate & Review Employer Modal -->
    <div class="emp-claim-modal-overlay" id="empRateModal" style="display:none;" aria-hidden="true" role="dialog" aria-labelledby="rateModalTitle">
      <div class="emp-claim-modal-card emp-rate-modal-card">
        <button type="button" class="emp-modal-close" id="empCloseRateBtn" aria-label="Close modal">×</button>
        
        <!-- Step 1: Rate Submission Form -->
        <div id="empRateFormWrap">
          <div class="emp-modal-head">
            <div class="emp-modal-star-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <h2 id="rateModalTitle">Rate ${esc(title)}</h2>
              <p>Share your authentic workplace experience, salary insights, and culture feedback to assist fellow job seekers.</p>
            </div>
          </div>

          <form id="empRateSubmitForm" class="emp-claim-form" onsubmit="event.preventDefault(); window.handleEmployerRateSubmit && window.handleEmployerRateSubmit(this);">
            <input type="hidden" name="employerSlug" value="${esc(record.slug)}">
            <input type="hidden" name="employerName" value="${esc(title)}">
            <input type="hidden" id="empSelectedRatingScore" name="ratingScore" value="5">

            <!-- Rate Each Section / Workplace Aspect (Interactive) -->
            <div class="emp-section-ratings-block">
              <div class="emp-section-ratings-header">
                <span class="emp-rate-picker-label">Rate Each Workplace Aspect (1 to 5 Stars) *</span>
                <span class="emp-rate-picker-hint">Click stars for each section to rate your experience</span>
              </div>

              <div class="emp-section-ratings-grid">
                <!-- 1. Salary & Benefits -->
                <div class="emp-section-star-row" data-section="salary">
                  <div class="emp-sec-label-box">
                    <span class="emp-sec-icon">💰</span>
                    <span class="emp-sec-title">Salary & Benefits</span>
                  </div>
                  <div class="emp-sec-stars-group">
                    <button type="button" class="emp-sec-star-btn active" data-section="salary" data-rating="1">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="salary" data-rating="2">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="salary" data-rating="3">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="salary" data-rating="4">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="salary" data-rating="5">★</button>
                    <span class="emp-sec-score-badge" id="scoreBadge_salary">5.0</span>
                    <input type="hidden" name="rating_salary" id="input_rating_salary" value="5">
                  </div>
                </div>

                <!-- 2. Work Life Balance -->
                <div class="emp-section-star-row" data-section="workLife">
                  <div class="emp-sec-label-box">
                    <span class="emp-sec-icon">⚖️</span>
                    <span class="emp-sec-title">Work Life Balance</span>
                  </div>
                  <div class="emp-sec-stars-group">
                    <button type="button" class="emp-sec-star-btn active" data-section="workLife" data-rating="1">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="workLife" data-rating="2">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="workLife" data-rating="3">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="workLife" data-rating="4">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="workLife" data-rating="5">★</button>
                    <span class="emp-sec-score-badge" id="scoreBadge_workLife">5.0</span>
                    <input type="hidden" name="rating_workLife" id="input_rating_workLife" value="5">
                  </div>
                </div>

                <!-- 3. Work Satisfaction -->
                <div class="emp-section-star-row" data-section="satisfaction">
                  <div class="emp-sec-label-box">
                    <span class="emp-sec-icon">🎯</span>
                    <span class="emp-sec-title">Work Satisfaction</span>
                  </div>
                  <div class="emp-sec-stars-group">
                    <button type="button" class="emp-sec-star-btn active" data-section="satisfaction" data-rating="1">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="satisfaction" data-rating="2">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="satisfaction" data-rating="3">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="satisfaction" data-rating="4">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="satisfaction" data-rating="5">★</button>
                    <span class="emp-sec-score-badge" id="scoreBadge_satisfaction">5.0</span>
                    <input type="hidden" name="rating_satisfaction" id="input_rating_satisfaction" value="5">
                  </div>
                </div>

                <!-- 4. Skill Development -->
                <div class="emp-section-star-row" data-section="skills">
                  <div class="emp-sec-label-box">
                    <span class="emp-sec-icon">🚀</span>
                    <span class="emp-sec-title">Skill Development</span>
                  </div>
                  <div class="emp-sec-stars-group">
                    <button type="button" class="emp-sec-star-btn active" data-section="skills" data-rating="1">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="skills" data-rating="2">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="skills" data-rating="3">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="skills" data-rating="4">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="skills" data-rating="5">★</button>
                    <span class="emp-sec-score-badge" id="scoreBadge_skills">5.0</span>
                    <input type="hidden" name="rating_skills" id="input_rating_skills" value="5">
                  </div>
                </div>

                <!-- 5. Company Culture -->
                <div class="emp-section-star-row" data-section="culture">
                  <div class="emp-sec-label-box">
                    <span class="emp-sec-icon">🤝</span>
                    <span class="emp-sec-title">Company Culture</span>
                  </div>
                  <div class="emp-sec-stars-group">
                    <button type="button" class="emp-sec-star-btn active" data-section="culture" data-rating="1">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="culture" data-rating="2">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="culture" data-rating="3">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="culture" data-rating="4">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="culture" data-rating="5">★</button>
                    <span class="emp-sec-score-badge" id="scoreBadge_culture">5.0</span>
                    <input type="hidden" name="rating_culture" id="input_rating_culture" value="5">
                  </div>
                </div>

                <!-- 6. Job Security -->
                <div class="emp-section-star-row" data-section="security">
                  <div class="emp-sec-label-box">
                    <span class="emp-sec-icon">🛡️</span>
                    <span class="emp-sec-title">Job Security</span>
                  </div>
                  <div class="emp-sec-stars-group">
                    <button type="button" class="emp-sec-star-btn active" data-section="security" data-rating="1">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="security" data-rating="2">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="security" data-rating="3">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="security" data-rating="4">★</button>
                    <button type="button" class="emp-sec-star-btn active" data-section="security" data-rating="5">★</button>
                    <span class="emp-sec-score-badge" id="scoreBadge_security">5.0</span>
                    <input type="hidden" name="rating_security" id="input_rating_security" value="5">
                  </div>
                </div>
              </div>

              <!-- Overall Computed Score -->
              <div class="emp-overall-calc-box">
                <div class="emp-overall-calc-label">
                  <span>Overall Rating:</span>
                  <strong class="emp-calc-overall-num" id="empCalcOverallVal">5.0</strong>
                  <span class="emp-star-status-tag" id="empStarStatusTag">5.0 - Excellent</span>
                </div>
              </div>
            </div>

            <div class="emp-form-row">
              <label>
                <span>Your Role / Job Title *</span>
                <input type="text" name="jobTitle" placeholder="e.g. Registered Nurse, Accountant, Sales Associate" required>
              </label>
              <label>
                <span>Employment Status *</span>
                <select name="employmentStatus" required>
                  <option value="Current Employee">Current Employee</option>
                  <option value="Former Employee">Former Employee</option>
                  <option value="Contractor / Consultant">Contractor / Consultant</option>
                  <option value="Intern">Intern</option>
                </select>
              </label>
            </div>

            <div class="emp-form-row">
              <label>
                <span>Location / City</span>
                <input type="text" name="location" placeholder="e.g. Dubai, Abu Dhabi, Sharjah">
              </label>
              <label>
                <span>Years of Experience at Company</span>
                <select name="yearsExp">
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1 to 2 years">1 to 2 years</option>
                  <option value="3 to 5 years">3 to 5 years</option>
                  <option value="More than 5 years">More than 5 years</option>
                </select>
              </label>
            </div>

            <div class="emp-form-group">
              <label>
                <span>Review Title *</span>
                <input type="text" name="reviewTitle" placeholder="e.g. Supportive leadership, great team environment and prompt salary" required>
              </label>
            </div>

            <div class="emp-form-group">
              <label>
                <span>Your Workplace Feedback / Experience *</span>
                <textarea name="feedback" rows="3" placeholder="Share specific details about what you liked, company benefits, work-life balance, and advice for future candidates." required></textarea>
              </label>
            </div>

            <div class="emp-modal-footer">
              <button type="button" class="emp-btn-cancel" onclick="document.getElementById('empRateModal').style.display='none'">Cancel</button>
              <button type="submit" class="emp-btn-submit" id="empRateSubmitBtn">Submit Rating</button>
            </div>
          </form>
        </div>

        <!-- Step 2: Rating Success State -->
        <div id="empRateSuccessWrap" style="display:none;" class="emp-claim-success-wrap">
          <div class="emp-success-icon-badge" style="background: #fefce8; color: #ca8a04;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3>Thank You for Rating!</h3>
          <p class="emp-success-msg">Your rating and workplace feedback for <strong>${esc(title)}</strong> has been verified and published.</p>
          <div class="emp-success-steps-box">
            <h4>Your contribution helps the community</h4>
            <p style="font-size:13.5px;color:#475569;margin:0;">Job seekers on Trikonet rely on authentic feedback from professionals like you to evaluate workplace culture and compensation.</p>
          </div>
          <button type="button" class="emp-btn-close-success" onclick="document.getElementById('empRateModal').style.display='none'">Done</button>
        </div>

      </div>
    </div>

  </main>`;
}
