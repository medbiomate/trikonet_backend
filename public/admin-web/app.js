import {initSearchCategoryPickers} from './category-picker.js?v=20261031-both-2';
import {recentEmployerPage} from './recent-employers.js';
import {createJobLogoResolver} from './job-employer-logo.js';
const resolveJobLogos = createJobLogoResolver((...args) => fetch(...args));
import {renderEmployerDirectory} from './employer-directory.js?v=20261031-recent-companies';
import {isClosedJob} from './job-availability.js';
import {renderHomeHero} from './home-hero.js';
import {initDisplayAds} from './display-ads.js?v=20261021-pagination';
import { protectJobNavigation } from './job-navigation.js';
import { loadContentRecord } from './content-record.js?v=20261022-employer-alias';
import { renderSiteHeader } from './site-header.js';
import { renderSiteFooter } from './site-footer.js';
import { revealPage } from './page-ready.js?v=20261018-ready';
import { initGoogleSignIn } from './google-sign-in.js?v=20261018-profile-welcome-30';
import { publicJobPath } from './job-urls.js';
import {publicJobPage} from './public-job-page.js';
import { uniqueJobs } from './job-list-identity.js';
import { restoreArticleImages } from './article-images.js';
import { getVerifiedAdmin, refreshAdminSession, initPublicAdminBar, signalAdminSessionChange } from './admin-session.js?v=20261021-publish-tabs-2';
let renderJobDetail, renderEmployerDetail;
import { formatCompanyName, formatJobTitle } from './company-name.js?v=20261021-title-trash-1';
import { employerProfileHref } from './employer-link.js';
import { renderCategoryLinks, renderAllCategories } from './category-links.js';
let renderAdmin, initAdmin;
import { renderSeoLanding } from './seo-public.js?v=1';
import { JOBS_SEO_TITLE, JOBS_SEO_DESCRIPTION } from './jobs-seo.js';
import { legalPageForPath, renderLegalContent, legalStyles } from './legal-pages.js';

const seed = {
  jobs:[
    {id:1,title:'Corporate Accounting Manager',company:'Bateel International',category:'Accountant, Accounting or Finance',location:'Dubai',type:'Full Time',date:'September 22, 2026',slug:'corporate-accounting-manager'},
    {id:2,title:'Consultant, Ophthalmology',company:'Danat Al Emarat Hospital for Women & Children',category:'Consultant doctor Jobs',location:'Abu Dhabi',type:'Full Time',date:'September 22, 2026',slug:'consultant-ophthalmology'},
    {id:3,title:'Consultant, Maternal and Fetal Medicine',company:'Danat Al Emarat Hospital for Women & Children',category:'Consultant doctor Jobs',location:'Abu Dhabi',type:'Full Time',date:'September 22, 2026',slug:'consultant-maternal-and-fetal-medicine'},
    {id:4,title:'Registered Nurse',company:'Amana Healthcare',category:'HealthCare, Nurse Jobs',location:'Abu Dhabi',type:'Full Time',date:'September 22, 2026',slug:'registered-nurse'}
  ],
  employers:[],
  posts:[
    {title:'Job Loss Insurance UAE: The Secret Salary Backup You Didn’t Know',slug:'job-loss-insurance-uae-iloe-guide',category:'blog',categoryName:'Insurance',urlPrefix:'insurance',localUrl:'/insurance/job-loss-insurance-uae-iloe-guide',date:'September 26, 2025',excerpt:'Imagine waking up one morning in the UAE to find that your company has closed its doors.',featuredImage:'/uploads/media/34983.jpg',author:'Athira Susan James',authorRole:'Written By',authorImage:'/assets/athira-susan-james.png',reviewer:'Mayur Kacholiya',reviewerRole:'Reviewed by:',reviewerImage:'/assets/mayur-kacholiya.png'},
    {title:'How to Manage Work-Related Stress',slug:'ips-to-manage-work-related-stress',category:'blog',categoryName:'Health & Wellness',urlPrefix:'health',localUrl:'/health/ips-to-manage-work-related-stress',date:'September 8, 2025',excerpt:'Work-related stress has become an inevitable part of modern life, impacting productivity and mental wellbeing.',featuredImage:'/uploads/media/15727.jpg',author:'Athira Susan James',authorRole:'Written By',authorImage:'/assets/athira-susan-james.png',reviewer:'Mayur Kacholiya',reviewerRole:'Reviewed by:',reviewerImage:'/assets/mayur-kacholiya.png'},
    {title:'Importance of Taking Regular Breaks During Work Hours',slug:'regular-breaks-at-work',category:'blog',categoryName:'Health & Wellness',urlPrefix:'health',localUrl:'/health/regular-breaks-at-work',date:'September 8, 2025',excerpt:'In the hustle of modern work culture, regular breaks help sustain focus and energy.',featuredImage:'/uploads/media/15736.jpg',author:'Athira Susan James',authorRole:'Written By',authorImage:'/assets/athira-susan-james.png',reviewer:'Mayur Kacholiya',reviewerRole:'Reviewed by:',reviewerImage:'/assets/mayur-kacholiya.png'}
  ],
  pages:{about:{title:'About Us',content:'Welcome to Trikonet! We are Konets, and this is not just a job portal—we’re your gateway to limitless career opportunities in the UAE and beyond.'}}
};
const store = {get(){try{return JSON.parse(localStorage.getItem('trikonetCMS'))||structuredClone(seed)}catch{return structuredClone(seed)}},set(v){localStorage.setItem('trikonetCMS',JSON.stringify(v))},reset(){localStorage.removeItem('trikonetCMS');location.reload()}};
const data=store.get();
const resolvedJobUrl = JSON.parse(document.getElementById('job-url-data')?.textContent || 'null');
let path=resolvedJobUrl ? `/job/${resolvedJobUrl.slug}` : location.pathname.replace(/\/$/,'')||'/';
const SITE_ORIGIN='https://www.trikonet.com';
const MEMBER_PATHS=['/login','/signin','/sign-in','/login-register','/register','/signup','/sign-up','/profile','/saved-jobs','/applied-jobs','/followed-companies'];
let seoPagePayload=null, seoPageDraft=false, seoInternalLinks=[];
async function loadSeoPages() {
  if (path === '/' || path.startsWith('/admin') || path.startsWith('/job/') || path.startsWith('/employer/') || path === '/employers' || legalPageForPath(path)) return;
  if (MEMBER_PATHS.includes(path) || document.getElementById('public-content-data')) return;
  // Related links and page metadata are independent; avoid a network waterfall.
  const linksReady = (async () => {
    try {
    const embedded=document.getElementById('category-directory-data');
    const cachedLinks=embedded?JSON.parse(embedded.textContent):[];
    if(cachedLinks.length)seoInternalLinks=cachedLinks;
    else {const linksResponse=await fetch('/api/job-category-links',{signal:AbortSignal.timeout(3000)});if(linksResponse.ok)seoInternalLinks=await linksResponse.json();}
    } catch {}
  })();
  try {
    const destinationSlug=path.startsWith('/category/') ? path.slice('/category/'.length) : path.slice(1);
    if(['/', '/jobs','/job-list','/job-openings','/job-categories','/employers'].includes(path) || destinationSlug.includes('/'))return;
    const response=await fetch(`/api/seo-job-pages/${encodeURIComponent(destinationSlug)}?page=${Math.max(1,Number(new URLSearchParams(location.search).get('page'))||1)}`, {signal:AbortSignal.timeout(3000)});
    const payload=await response.json();
    if(response.ok && payload.page){
      seoPagePayload=payload;
      if(path.startsWith('/category/')){
        path=`/${payload.page.slug}`;
        history.replaceState(null,'',path+location.search+location.hash);
      }
    }
    else if(payload.seoPage)seoPageDraft=true;
  }catch{} finally { await linksReady; }
}
const defaultTopCategories = [
  { name: 'Education and Training', slug: 'education-and-training', count: 3148 },
  { name: 'Accounting or Finance', slug: 'accounting-finance', count: 1767 },
  { name: 'Administration', slug: 'administration', count: 1302 },
  { name: 'HealthCare', slug: 'healthcare', count: 762 },
  { name: 'Nurse Jobs', slug: 'nurse-jobs', count: 706 },
  { name: 'Human Resource', slug: 'human-resource', count: 654 },
  { name: 'Digital Marketing Jobs', slug: 'digital-marketing', count: 636 },
  { name: 'Marketing and Sales', slug: 'marketing-and-sales', count: 627 },
  { name: 'Customer Service Associate Jobs', slug: 'customer-service-associate-jobs', count: 231 },
  { name: 'Engineering', slug: 'engineering', count: 179 }
];
function slugifyCategory(cat) {
  const str = (typeof cat === 'object' && cat !== null) ? (cat.slug || cat.name) : String(cat || '');
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
function findCategoryBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).toLowerCase().trim();
  const allCats = [
    ...(Array.isArray(data.taxonomies?.categories) ? data.taxonomies.categories : []),
    ...defaultTopCategories
  ];
  let found = allCats.find(c => (c.slug && c.slug.toLowerCase() === cleanSlug) || slugifyCategory(c.name) === cleanSlug || slugifyCategory(c.slug) === cleanSlug);
  if (!found) {
    const noOr = cleanSlug.replace(/-or-/g, '-').replace(/-and-/g, '-');
    found = allCats.find(c => {
      const cSlugNorm = (c.slug || slugifyCategory(c.name)).replace(/-or-/g, '-').replace(/-and-/g, '-');
      return cSlugNorm === noOr;
    });
  }
  if (!found) {
    for (const c of allCats) {
      const cSlug = c.slug || slugifyCategory(c.name);
      if (cSlug && cleanSlug.startsWith(cSlug + '-')) {
        const remainder = cleanSlug.slice(cSlug.length + 1);
        const secondCat = allCats.find(c2 => (c2.slug || slugifyCategory(c2.name)) === remainder);
        if (secondCat) {
          found = c;
          break;
        }
      }
    }
  }
  if (!found) {
    const humanName = cleanSlug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bOr\b/g, 'or')
      .replace(/\bAnd\b/g, 'and');
    return { name: humanName, slug: cleanSlug, count: 0 };
  }
  return found;
}
export const POST_SLUG_PREFIXES = {
  'job-loss-insurance-uae-iloe-guide': 'insurance',
  'resume-tips': 'career-tips',
  'ips-to-manage-work-related-stress': 'health',
  'regular-breaks-at-work': 'health',
  'what-is-a-stipend': 'career-tips',
  'interview-questions-for-a-part-time-job': 'part-time-job',
  'fake-job-offers-in-the-uae': 'career-tips',
  'seasonal-jobs-in-dubai': 'part-time-job',
  'what-is-a-part-time-job': 'part-time-job',
  'how-to-stay-away-from-labour-and-visa-fraud': 'visa',
  'signs-of-job-burnout': 'health',
  'part-time-jobs-for-students': 'part-time-job',
  'online-jobs-for-students': 'part-time-job',
  'side-jobs-for-full-time-workers': 'part-time-job',
  'how-to-find-part-time-jobs': 'blog',
  'iloe-dubai-insurance': 'visa',
  'types-of-visa-in-uae': 'visa',
  'freelance-visa-in-dubai': 'visa',
  'how-to-save-money-in-dubai': 'guides',
  'uae-visa-online': 'visa',
  'uae-golden-visa': 'visa',
  'healthy-eating-tips-for-busy-professionals': 'health',
  'dubai-visa-rejection': 'visa',
  'nursing-interview-questions-and-answers': 'interview',
  'how-to-avoid-back-pain-in-desk-jobs': 'health',
  'how-to-negotiate-salary-offer': 'interview',
  'simple-exercises-for-office-workers': 'health',
  'physical-health-at-work': 'health',
  'work-life-balance': 'health',
  'mental-health-in-the-workplace': 'health',
  'how-to-develop-leadership-skills': 'career-tips',
  'career-development-plan': 'career-tips',
  'uae-visa-application-status': 'visa',
  'how-to-apply-for-a-dubai-tourist-visa': 'visa',
  'dubai-visa-renewal': 'visa',
  'dubai-visa-processing-time': 'visa',
  'how-to-apply-for-job-seekers-visa-in-dubai': 'visa',
  'top-20-golden-visa-benefits-in-the-uae': 'visa',
  'how-to-improve-work-from-home-productivity': 'career-tips',
  'what-is-personal-branding': 'career-tips',
  'how-to-use-linkedin-to-get-a-job': 'career-tips',
  'how-to-extend-your-dubai-visit-visa': 'visa',
  'how-to-sponsor-your-family-in-the-uae': 'visa',
  'mistakes-to-avoid-when-applying-for-a-visa': 'visa',
  'residence-visa-vs-work-visa-in-dubai': 'visa',
  'seo-interview-questions-and-answers': 'blog',
  'how-to-become-a-laboratory-assistant': 'types-of-jobs',
  'what-are-your-strengths-and-weaknesses': 'career-tips',
  'dubai-work-visa': 'visa',
  'how-to-handle-career-gaps-in-resume': 'career-tips',
  'tips-for-video-interview': 'career-tips',
  'top-mistakes-to-avoid-in-job-applications': 'career-tips',
  'how-to-stay-focused-during-long-work-hours': 'health',
  'simple-desk-exercises-to-improve-posture': 'health',
  'how-to-build-an-job-portfolio': 'career-tips',
  'freelancing-skills-in-demand-for-2025': 'career-tips',
  'medical-coding-interview-questions': 'interview',
  'what-is-medical-coder': 'types-of-jobs',
  'cost-of-living-in-dubai': 'guides',
  'things-you-have-to-know-before-working-in-dubai': 'career-tips',
  'minimum-wage-in-dubai': 'career-tips',
  'how-to-find-a-job-in-dubai-on-a-visit-visa': 'visa',
  'how-to-write-a-cover-letter': 'career-tips',
  'work-from-home-jobs': 'types-of-jobs',
  'how-to-find-jobs-in-dubai': 'career-tips',
  'how-to-improve-your-linkedin-profile': 'career-tips',
  'how-to-apply-doh-exam': 'exam',
  'what-is-a-gastroenterologist': 'types-of-jobs',
  'how-to-write-a-resume': 'career-tips',
  'what-is-moh-exam': 'exam',
  'what-is-a-gynecologist': 'types-of-jobs',
  'what-is-a-neurologist': 'types-of-jobs',
  'what-is-an-seo-analyst': 'types-of-jobs',
  'engineering-interview-questions': 'interview',
  'interview-tips-for-freshers': 'interview',
  'pharmacy-interview-questions': 'interview',
  'medical-laboratory-assistant-interview-questions': 'interview',
  'teacher-interview-questions': 'interview',
  'how-to-prepare-for-a-job-interview': 'interview',
  'who-is-clinical-nurse-specialist': 'types-of-jobs',
  'what-is-a-nurse': 'types-of-jobs',
  'part-time-jobs-for-women-over-40': 'part-time-job',
  'how-to-apply-for-dha-exam': 'exam',
  'what-is-a-phlebotomist': 'types-of-jobs',
  'what-is-a-cardiologist': 'types-of-jobs',
  'urologist-vs-nephrologist': 'types-of-jobs',
  'highest-paying-jobs-in-dubai': 'types-of-jobs',
  'what-is-biomedical-engineering': 'types-of-jobs'
};

export const BLOG_CATEGORY_PREFIXES = [
  'insurance',
  'health',
  'career-tips',
  'part-time-job',
  'visa',
  'guides',
  'interview',
  'types-of-jobs',
  'exam',
  'blog'
];

export const CATEGORY_PREFIX_LABELS = {
  'insurance': 'Insurance',
  'health': 'Health & Wellness',
  'career-tips': 'Career Tips',
  'part-time-job': 'Part-Time Jobs',
  'visa': 'Visa & Labour Laws',
  'guides': 'Dubai Guides',
  'interview': 'Interview Questions & Tips',
  'types-of-jobs': 'Types of Jobs',
  'exam': 'Medical Exams',
  'blog': 'Career Advice'
};

export function getPostUrl(postOrSlug) {
  if (!postOrSlug) return '/blog';
  const slug = typeof postOrSlug === 'string' ? postOrSlug : (postOrSlug.slug || '');
  if (!slug) return '/blog';
  const prefix = POST_SLUG_PREFIXES[slug]
    || (typeof postOrSlug === 'object' && (postOrSlug.urlPrefix || postOrSlug.url_prefix))
    || 'blog';
  return `/${prefix}/${slug}`;
}

const UAE_CANONICAL_ORDER = [
  'uae',
  'united arab emirates',
  'abu dhabi',
  'dubai',
  'sharjah',
  'ajman',
  'umm al quwain',
  'ras al khaimah',
  'fujairah',
  'al ain'
];

export function sortUaeLocations(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const nameA = String((a && (a.name || a.title)) || a || '').trim().toLowerCase();
    const nameB = String((b && (b.name || b.title)) || b || '').trim().toLowerCase();
    const indexA = UAE_CANONICAL_ORDER.indexOf(nameA);
    const indexB = UAE_CANONICAL_ORDER.indexOf(nameB);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return nameA.localeCompare(nameB);
  });
}

const defaultLocations = [
  { id: 258, name: 'UAE', slug: 'uae', count: 4833 },
  { id: 259, name: 'Abu Dhabi', slug: 'abu-dhabi', count: 3422 },
  { id: 260, name: 'Dubai', slug: 'dubai', count: 6252 },
  { id: 261, name: 'Sharjah', slug: 'sharjah-uae', count: 819 },
  { id: 262, name: 'Ajman', slug: 'ajman', count: 389 },
  { id: 263, name: 'Umm Al Quwain', slug: 'umm-al-quwain-uae', count: 17 },
  { id: 264, name: 'Ras Al Khaimah', slug: 'ras-al-khaimah', count: 229 },
  { id: 265, name: 'Fujairah', slug: 'fujairah', count: 37 },
  { id: 843, name: 'Al Ain', slug: 'al-ain', count: 333 }
];

data.counts={job_listing:0,employer:0,post:0};
data.taxonomies={types:[],categories:[...defaultTopCategories],locations:[...defaultLocations],tags:[],employerCategories:[],employerLocations:[]};
let queryParams=new URLSearchParams(location.search),currentPage=Math.max(Number(queryParams.get('page'))||1,1);
const locationPathMatch=path.match(/^\/job-location\/([^/]+)$/);
if(locationPathMatch&&!queryParams.get('location')){
  queryParams.set('location',decodeURIComponent(locationPathMatch[1]).replace(/-/g,' ').replace(/\b\w/g,char=>char.toUpperCase()));
}
const pageSize=path==='/employers'?10:30;
const jobsPageSize=10;
const escapeAttr=value=>String(value||'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const icons={search:'⌕',pin:'⌖',bag:'▣'};
let wpRecord=null,wpEmployer=null,profileJobs=[],orgJobs=[],categoryJobs=[],currentUser=null,emailCampaigns=[];
async function loadAccount(){
  try {
    const response=await fetch('/api/auth/me', {signal:AbortSignal.timeout(path === '/' ? 1500 : 3000)});
    if(!response.ok)return;
    currentUser=(await response.json()).user;
    if(currentUser && !['/','/jobs','/job-list','/job-openings','/nurse-jobs-in-uae'].includes(path) && !/^\/(?:job|category|job-location)\//.test(path)){
      const profileResponse=await fetch('/api/candidate/profile', {signal:AbortSignal.timeout(path === '/' ? 1500 : 3000)});
      if(profileResponse.ok){
        const saved=await profileResponse.json();
        currentUser.profile=saved.profile || currentUser.profile || {};
        currentUser.name=currentUser.profile.name||currentUser.name;currentUser.email=currentUser.profile.email||currentUser.email;
        currentUser.completionPercentage=saved.completionPercentage;
        currentUser.id ||= currentUser.userId;
      }else{
        currentUser.profileLoadError=true;
      }
    }
    if(path.startsWith('/admin') && currentUser){const campaigns=await fetch('/api/email-campaigns');if(campaigns.ok)emailCampaigns=await campaigns.json()}
  }catch{if(currentUser)currentUser.profileLoadError=true;}
}
let jobExtrasReady;
async function loadWordPressRecord(){const match=path.match(/^\/(job|employer)\/([^/]+)$/);if(!match)return;const type=match[1]==='job'?'job_listing':'employer',slug=match[2];try{const embedded=document.getElementById('public-content-data');
wpRecord=embedded?JSON.parse(embedded.textContent):await loadContentRecord(fetch,'',type,slug);if(type==='job_listing'){jobExtrasReady=(async()=>{try{let employerSlug='';if(wpRecord?.metas?._job_employer_url){try{employerSlug=new URL(wpRecord.metas._job_employer_url).pathname.split('/').filter(Boolean).pop()||'';}catch{}}if(!employerSlug&&wpRecord?.employerSlug){employerSlug=wpRecord.employerSlug;}if(!employerSlug&&(wpRecord?.metas?._job_employer_name||wpRecord?.company)){const comp=wpRecord.metas?._job_employer_name||wpRecord.company;employerSlug=comp.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}if(employerSlug){wpEmployer=await loadContentRecord(fetch,'','employer',employerSlug);}if(!wpEmployer&&wpRecord?.metas?._job_employer_posted_by){const employerResponse=await fetch(`/api/wp/employer?id=${encodeURIComponent(wpRecord.metas._job_employer_posted_by)}`);if(employerResponse.ok){const emps=await employerResponse.json();wpEmployer=emps[0]||null;}}if(wpEmployer){try{const query=wpEmployer.id?`employer_id=${wpEmployer.id}`:`employer_slug=${encodeURIComponent(wpEmployer.slug)}`;const jobsRes=await fetch(`/api/wp/job_listing?${query}&per_page=20`);if(jobsRes.ok){const list=await jobsRes.json();orgJobs=list.filter(j=>j.slug!==slug);}}catch{}}if(!orgJobs.length&&(wpEmployer?.title?.rendered||wpEmployer?.title||wpRecord?.metas?._job_employer_name||wpRecord?.company)){const cName=wpEmployer?.title?.rendered||wpEmployer?.title||wpRecord?.metas?._job_employer_name||wpRecord?.company;try{const searchRes=await fetch(`/api/wp/job_listing?q=${encodeURIComponent(cName)}&per_page=20`);if(searchRes.ok){const sList=await searchRes.json();orgJobs=sList.filter(j=>j.slug!==slug&&((j.metas?._job_employer_name&&j.metas._job_employer_name.toLowerCase()===cName.toLowerCase())||(j.company&&j.company.toLowerCase()===cName.toLowerCase())));}}catch{}}
categoryJobs=[];
const extractJobCats = (rec) => {
  if (!rec) return [];
  if (rec.local) return Array.isArray(rec.categories) ? rec.categories : [];
  const m = rec.metas || {};
  if (m._job_category) {
    if (typeof m._job_category === 'object') return Object.values(m._job_category);
    if (typeof m._job_category === 'string') return m._job_category.split(',').map(s => s.trim());
  }
  if (rec.job_listing_category) {
    return Array.isArray(rec.job_listing_category) ? rec.job_listing_category : [rec.job_listing_category];
  }
  return rec.category ? [rec.category] : [];
};
const cats = extractJobCats(wpRecord).filter(c => c && c.toLowerCase() !== 'all categories');
if (cats.length) {
  try {
    const catPromises = cats.slice(0, 2).map(c =>
      fetch(`/api/wp/job_listing?category=${encodeURIComponent(c)}&per_page=25&_fields=id,slug,title,status,date,metas`)
        .then(r => r.ok ? r.json() : [])
        .catch(() => [])
    );
    const catResults = await Promise.all(catPromises);
    const localResponse=await fetch('/api/local/jobs');
    const localCandidates=localResponse.ok?await localResponse.json():[];
    const localRelated=localCandidates.filter(job=>extractJobCats(job).some(category=>cats.some(c=>c.toLowerCase()===category.toLowerCase())));
    const overrides=new Map(localCandidates.map(job=>[job.slug,job]));
    const publishedTime=job=>Date.parse(job.publishedAt||job.publishedDate || job.datePosted || job.postedDate || job.date || job.createdAt || '') || 0;
    categoryJobs=uniqueJobs([...catResults.flat().map(job=>overrides.get(job.slug)||job),...localRelated]).filter(job=>job && job.slug).sort((a,b)=>publishedTime(b)-publishedTime(a));
  } catch {}
}}catch(error){console.warn('Related job data unavailable:',error);}})();}}catch{wpRecord=null}}
const fieldValues=value=>value&&typeof value==='object'?Object.values(value).join(', '):'';
async function loadEmployerJobPage() {
  if (!wpRecord?.slug) return;
  const page = new URLSearchParams(location.search).get('jobsPage') || '1';
  try {
    const response = await fetch(`/api/employer-jobs/${encodeURIComponent(wpRecord.slug)}?page=${encodeURIComponent(page)}`);
    if (!response.ok) throw new Error('Employer jobs unavailable');
    const result = await response.json();
    profileJobs = result.jobs.map(mapJob);
    wpRecord.jobPagination = {total:result.total,page:result.page};
  } catch { profileJobs = []; wpRecord.jobsLoadError = true; }
}
export function formatJobDate(value) {
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
}
export function resolveJobDate(record) {
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
}
export function resolveJobDeadline(record) {
  if (!record) return '';
  const m = record.metas || {};
  const explicit = record.deadline || record.expiryDate || m._job_application_deadline_date || m._job_expiry_date;
  if (explicit) {
    const formatted = formatJobDate(explicit);
    if (formatted) return formatted;
  }
  return '';
}
function mapJob(record){
  const m=record.metas||{};
  const date=resolveJobDate(record);
  const deadline=resolveJobDeadline(record);
  const rawExcerpt=record.excerpt?.rendered||record.content?.rendered||record.excerpt||record.description||'';
  const cleanExcerpt=rawExcerpt.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,160);
  return {
    ...record,
    description:record.local ? (record.description ?? '') : (record.content?.rendered || record.description || ''),
    id:record.id,
    title:formatJobTitle(decodeHtml(record.title?.rendered||record.title||'')),
    company:formatCompanyName(decodeHtml(m._job_employer_name||record.company||'')),
    category:fieldValues(m._job_category)||(record.categories||[]).join(', ')||record.category||'',
    location:fieldValues(m._job_location)||(record.locations||[]).join(', ')||record.location||'',
    type:fieldValues(m._job_type)||(record.types||[]).join(', ')||record.type||'',
    publishedDate:record.publishedDate || record.datePosted || record.postedDate || record.date || record.createdAt || m._job_date_posted || '',
    date:date,
    deadline:deadline,
    expiryDate:deadline,
    slug:record.slug,
    logo:m._job_logo||record.logo||'',
    employerUrl:m._job_employer_url||record.employerUrl||'',
    employerSlug:record.employerSlug||'',
    excerpt:cleanExcerpt,
    source:record.local?'local':'database',
    local:!!record.local
  };
}
let taxonomyRequest;
function fetchTaxonomies(options) {
  if (!taxonomyRequest) {
    taxonomyRequest = fetch('/api/wp/taxonomies', options).then(response => {
      if (!response.ok) taxonomyRequest = null;
      return response;
    }).catch(error => { taxonomyRequest = null; throw error; });
  }
  return taxonomyRequest.then(response => response.clone());
}
async function loadDirectoryTaxonomies() {
  try {
    const response = await fetchTaxonomies({signal:AbortSignal.timeout(4000)});
    if (!response.ok) return;
    data.taxonomies = await response.json();
    if (Array.isArray(data.taxonomies.locations)) data.taxonomies.locations = sortUaeLocations(data.taxonomies.locations);
    if (Array.isArray(data.taxonomies.employerLocations)) data.taxonomies.employerLocations = sortUaeLocations(data.taxonomies.employerLocations);
  } catch {}
}
async function loadLocalJobs(){
  data.jobsLoadError = false;
  const embedded=document.getElementById('initial-job-list');
  if(embedded){try{const total=Number(embedded.dataset.total);if(Number.isFinite(total)){data.counts.job_listing=total;data.counts.category=total;data.counts.nurse=total;}data.jobs=JSON.parse(embedded.textContent).map(mapJob);return;}catch{}}
  try{
    const isCategoryPage = path.startsWith('/category/');
    if (isCategoryPage && (!data.taxonomies?.categories || data.taxonomies.categories.length <= defaultTopCategories.length)) {
      try {
        const taxRes = await fetchTaxonomies();
        if (taxRes.ok) {
          data.taxonomies = await taxRes.json();
          if (Array.isArray(data.taxonomies?.locations)) data.taxonomies.locations = sortUaeLocations(data.taxonomies.locations);
        }
      } catch {}
    }
    const catSlug = isCategoryPage ? path.replace('/category/', '').split('/')[0].split('?')[0] : '';
    const catObj = isCategoryPage ? findCategoryBySlug(catSlug) : null;
    const pageLimit = jobsPageSize;
    const filters=new URLSearchParams({per_page:String(pageLimit),page:String(currentPage)});
    if(path==='/nurse-jobs-in-uae'&&!queryParams.get('q'))filters.set('q','nurse');
    if(isCategoryPage && catObj && !queryParams.get('category')) filters.set('category', catObj.name);
    for(const key of ['q','location','category','job_type']){
      const val=queryParams.get(key);
      if(val&&val!=='Country or City'&&val!=='All Categories')filters.set(key,val);
    }
    const response=await fetch(`/api/public/jobs?${filters}`, {signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw Error('Jobs unavailable');
    data.jobs=(await resolveJobLogos(await response.json())).map(mapJob);
  }catch(error){data.jobs=[];data.jobsLoadError=true;console.warn('Job listing unavailable:',error.message);}
}
async function loadLocalEmployers(){
  data.employersLoadError=false;
  const embedded=document.getElementById('initial-employer-list');
  if(embedded){try{const payload=JSON.parse(embedded.textContent);data.employers=payload.employers;data.employerResultTotal=payload.total;return}catch{}}
  try{
    if(queryParams.get('sort')==='recent'){
      const result=await recentEmployerPage(async path=>{const response=await fetch(path);if(!response.ok)throw Error('Companies unavailable');return response.json();},queryParams,pageSize);
      data.employers=result.employers.map(record=>({...record,title:record.title?.rendered??record.title??'',logo:record.logo||record.metas?._employer_logo||record.metas?._employer_featured_image||'',categories:record.categories||Object.values(record.metas?._employer_category||{}),locations:record.locations||Object.values(record.metas?._employer_location||{}),openJobs:Number(record.openJobs??record.metas?._employer_open_jobs)||0}));
      data.employerResultTotal=result.total;return;
    }
    const filters=new URLSearchParams({per_page:String(pageSize),page:String(currentPage)});
    for(const key of ['q','location','category','min_jobs'])if(queryParams.get(key))filters.set(key,queryParams.get(key));
    const [wpResponse,localResponse,localJobsResponse]=await Promise.all([fetch(`/api/wp/employer?${filters}`),fetch('/api/local/employers').catch(()=>null),Promise.resolve(null)]);
    if(!wpResponse.ok)throw Error('Employers unavailable');
    const wp=await wpResponse.json();
    const local=localResponse?.ok?await localResponse.json():[];
    const localJobs=localJobsResponse?.ok?await localJobsResponse.json():[];
    const normalizedKey=value=>String(value||'').trim().toLowerCase();
    const localJobCounts=localJobs.reduce((counts,job)=>{
      if((job.status||'publish')!=='publish'||job.filled===true)return counts;
      const keys=new Set([normalizedKey(job.employerSlug),normalizedKey(job.company)].filter(Boolean));
      keys.forEach(key=>counts.set(key,(counts.get(key)||0)+1));
      return counts;
    },new Map());
    const mapWp=record=>{const m=record.metas||{};return {title:record.title?.rendered||record.title||'',slug:record.slug,description:record.content?.rendered||'',logo:m._employer_logo||m._employer_featured_image_img||m._employer_featured_image||'',categories:Object.values(m._employer_category||{}),locations:Object.values(m._employer_location||{}),email:m._employer_email||'',phone:m._employer_phone||'',website:m._employer_website||'',openJobs:Number(m._employer_open_jobs)||0,source:'database'}};
    const mapLocal=record=>({title:record.title||'',slug:record.slug||'',description:record.description||'',logo:record.logo||'',categories:Array.isArray(record.categories)?record.categories:[],locations:Array.isArray(record.locations)?record.locations:[],email:record.email||'',phone:record.phone||'',website:record.website||'',openJobs:Math.max(Number(record.openJobs)||0,localJobCounts.get(normalizedKey(record.slug))||0,localJobCounts.get(normalizedKey(record.title))||0),status:record.status||'publish',local:true,source:'local'});
    const q=String(queryParams.get('q')||'').trim().toLowerCase();
    const location=String(queryParams.get('location')||'').trim().toLowerCase();
    const category=String(queryParams.get('category')||'').trim().toLowerCase();
    const minJobs=Number(queryParams.get('min_jobs')||0);
    const matches=employer=>{
      const text=[employer.title,employer.description,employer.email,employer.website,...(employer.categories||[]),...(employer.locations||[])].filter(Boolean).join(' ').toLowerCase();
      return (!q||text.includes(q))&&(!location||(employer.locations||[]).some(item=>String(item).toLowerCase().includes(location)))&&(!category||(employer.categories||[]).some(item=>String(item).toLowerCase().includes(category)))&&(!minJobs||Number(employer.openJobs||0)>=minJobs);
    };
    const wpMapped=wp.map(mapWp).filter(matches);
    const localMatched=local.map(mapLocal).filter(item=>item.status==='publish').filter(matches);
    const merged=[...(currentPage===1?localMatched:[]),...wpMapped];
    data.employers=[...new Map(merged.map(item=>[item.slug||item.title.toLowerCase(),item])).values()].slice(0,pageSize);
    data.employerResultTotal=q||location||category||minJobs?data.employers.length:Math.max(Number(data.counts?.employer||0)+localMatched.length,data.employers.length);
  }catch{data.employers=[];data.employersLoadError=true}
}
async function loadTopEmployers(){try{const res=await fetch('/api/wp/top-employers?min_jobs=20&limit=20', {signal:AbortSignal.timeout(10000)});if(res.ok){const list=await res.json();if(Array.isArray(list)&&list.length>0){data.topEmployers=list.map(record=>{const m=record.metas||{};const rawText=(record.content?.rendered||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();return {title:record.title?.rendered||'',slug:record.slug,excerpt:rawText.slice(0,120),logo:m._employer_logo||m._employer_featured_image_img||m._employer_featured_image||'',logoBackup:record.logoBackup||'',locations:Array.isArray(m._employer_location)?m._employer_location:Object.values(m._employer_location||{}),categories:Array.isArray(m._employer_category)?m._employer_category:Object.values(m._employer_category||{}),openJobs:Number(m._employer_open_jobs)||0,source:'database'}})}}}catch{}}
function updateLiveJobCountUI(){
  const liveCount = (data.counts && data.counts.job_listing) ? data.counts.job_listing : 13621;
  const formattedCount = Number(liveCount).toLocaleString() + '+';
  document.querySelectorAll('.hero-live-job-count').forEach(el => {
    el.textContent = formattedCount;
  });
  document.querySelectorAll('[data-live-job-count]').forEach(el => {
    el.textContent = formattedCount;
  });
}

let baseCountsFetched = false;
const COUNT_REFRESH_MS = 300000;
let countsRequest = null;
let countsRequestedAt = -Infinity;
function loadCounts(){
  if (countsRequest) return countsRequest;
  if (Date.now() - countsRequestedAt < COUNT_REFRESH_MS) return Promise.resolve();
  countsRequestedAt = Date.now();
  countsRequest = fetchCounts().finally(() => { countsRequest = null; });
  return countsRequest;
}
async function fetchCounts(){
  try{
    if (!baseCountsFetched) {
      const response=await fetch('/api/wp/counts');
      if(response.ok) {
        data.counts=await response.json();
        baseCountsFetched = true;
        updateLiveJobCountUI();
      }
    }
    if(path==='/nurse-jobs-in-uae'){
      const filters=new URLSearchParams();
      filters.set('type','job_listing');
      filters.set('q',queryParams.get('q')||'nurse');
      for(const key of ['location','category','job_type']){
        const val=queryParams.get(key);
        if(val&&val!=='Country or City'&&val!=='All Categories')filters.set(key,val);
      }
      const filtered=await fetch(`/api/wp/count?${filters}`);
      if(filtered.ok)data.counts.nurse=(await filtered.json()).total;
    }else if(path.startsWith('/category/')){
      const catSlug = path.replace('/category/', '').split('/')[0].split('?')[0];
      const catObj = findCategoryBySlug(catSlug);
      const hasExtraFilters = ['location','job_type','q'].some(k => queryParams.get(k) && queryParams.get(k) !== 'Country or City');
      if (!hasExtraFilters && catObj?.count) {
        data.counts.category = catObj.count;
      } else {
        const filters=new URLSearchParams();
        filters.set('type','job_listing');
        if(catObj) filters.set('category', queryParams.get('category') || catObj.name);
        for(const key of ['q','location','job_type']){
          const val=queryParams.get(key);
          if(val&&val!=='Country or City')filters.set(key,val);
        }
        const filtered=await fetch(`/api/wp/count?${filters}`);
        if(filtered.ok)data.counts.category=(await filtered.json()).total;
      }
    }else if(path==='/jobs'||path==='/job-list'||path==='/job-openings'||path.startsWith('/job-location/')||(path==='/employers'&&[...queryParams].some(([key])=>['q','location','category','min_jobs'].includes(key)))){
      const filters=new URLSearchParams(queryParams);
      filters.set('type',path==='/employers'?'employer':'job_listing');
      filters.delete('page');
      const filtered=await fetch(`/api/wp/count?${filters}`);
      if(filtered.ok)data.counts[path==='/employers'?'employer':'job_listing']=(await filtered.json()).total;
    }
  }catch{}
}

if(typeof window!=='undefined'){
  window.addEventListener('focus',()=>{loadCounts().catch(()=>{})});
  setInterval(()=>{if(document.visibilityState==='visible')loadCounts().catch(()=>{})},COUNT_REFRESH_MS);
}
export function detectBlogCategory(title = '', excerpt = '') {
  const t = (title + ' ' + excerpt).toLowerCase();
  if (t.includes('interview question') || t.includes('questions and answers') || t.includes('questions to prepare') || t.includes('interview questions')) {
    return 'Interview Questions';
  }
  if (
    t.includes('interview tip') ||
    t.includes('interview tips') ||
    t.includes('prepare for a job interview') ||
    t.includes('video interview') ||
    t.includes('ace your virtual interview') ||
    t.includes('ace your next interview') ||
    t.includes('telephonic interview') ||
    t.includes('cracking your dream job interview') ||
    t.includes('job interview') ||
    t.includes('walk-in interview') ||
    t.includes('walk in interview') ||
    t.includes('interview') ||
    t.includes('strengths and weaknesses')
  ) {
    return 'Interview Tips';
  }
  if (t.includes('resume') || t.includes('cv') || t.includes('cover letter') || t.includes('curriculum vitae')) {
    return 'Resume & ATS';
  }
  if (
    t.includes('visa') ||
    t.includes('iloe') ||
    t.includes('labour') ||
    t.includes('labor') ||
    t.includes('mohre') ||
    t.includes('job scam') ||
    t.includes('fake job') ||
    t.includes('insurance') ||
    t.includes('residence visa') ||
    t.includes('golden visa') ||
    t.includes('gratuity') ||
    t.includes('contract')
  ) {
    return 'Visa & Labour Laws';
  }
  if (
    t.includes('stress') ||
    t.includes('break') ||
    t.includes('burnout') ||
    t.includes('health') ||
    t.includes('wellness') ||
    t.includes('work-life') ||
    t.includes('mental health') ||
    t.includes('healthy eating') ||
    t.includes('desk exercises') ||
    t.includes('posture') ||
    t.includes('back pain')
  ) {
    return 'Health & Wellness';
  }
  return 'Career Advice';
}

async function loadConnectedContent(){
  try{
    const pathParts=path.split('/').filter(Boolean);
    const candidateSlug=pathParts.at(-1)||'';
    const isArticlePath=pathParts.length===2&&(pathParts[0]==='blog'||BLOG_CATEGORY_PREFIXES.includes(pathParts[0])||Boolean(POST_SLUG_PREFIXES[candidateSlug]));
    const postQuery=isArticlePath
      ? `/api/wp/posts?slug=${encodeURIComponent(candidateSlug)}&per_page=1`
      : `/api/wp/posts?per_page=${path==='/'?6:path==='/jobs'||path.startsWith('/category/')?3:30}&summary=1`;
    const contentOptions = path === '/' ? {signal:AbortSignal.timeout(10000)} : {};
    const embeddedPost=isArticlePath?document.getElementById('public-content-data'):null;
    const [taxonomyResponse,postsResponse]=await Promise.all([isArticlePath?Promise.resolve({ok:false}):fetchTaxonomies(contentOptions),embeddedPost?Promise.resolve({ok:true,json:async()=>[JSON.parse(embeddedPost.textContent)]}):fetch(postQuery,contentOptions)]);
    if(taxonomyResponse.ok){
      data.taxonomies=await taxonomyResponse.json();
      if(Array.isArray(data.taxonomies?.locations)) data.taxonomies.locations = sortUaeLocations(data.taxonomies.locations);
      if(Array.isArray(data.taxonomies?.employerLocations)) data.taxonomies.employerLocations = sortUaeLocations(data.taxonomies.employerLocations);
    }
    if(postsResponse.ok){
      const posts=await postsResponse.json();
      if(posts.length)data.posts=posts.map(post=>{const rawTitle=post.title?.rendered||'';const rawExcerpt=(post.excerpt?.rendered||'').replace(/<[^>]+>/g,'').trim();const prefix=POST_SLUG_PREFIXES[post.slug]||post.url_prefix||'blog';const cat=post.categoryName||post.category_name||CATEGORY_PREFIX_LABELS[prefix]||detectBlogCategory(rawTitle,rawExcerpt);const authorName=(post.author_display_name||(post.author_name&&post.author_name!=='Trikonet'?post.author_name:''))||'Athira Susan James';return {id:post.id,title:rawTitle,slug:post.slug,category:'blog',categoryName:cat,urlPrefix:prefix,localUrl:`/${prefix}/${post.slug}`,date:new Date(`${post.date}Z`).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),excerpt:rawExcerpt,content:post.content?.rendered||'',featuredImage:post.featured_image||'',author:authorName,authorRole:'Written By',authorImage:post.author_avatar||'/assets/athira-susan-james.png',authorLink:'#',reviewer:post.reviewer_name||'Mayur Kacholiya',reviewerRole:'Reviewed by:',reviewerImage:post.reviewer_avatar||'/assets/mayur-kacholiya.png',reviewerLink:'#'}})
    }
  }catch{}
}
const siteChrome=(()=>{try{return JSON.parse(localStorage.getItem('trikonet_site_chrome')||'{}')}catch{return {}}})();
const LOGO_VERSION = 'v=20260929_footer_brand_v3';
const resolveLogo = (logo, fallback) => {
  const chosen = (logo && typeof logo === 'string' && !logo.startsWith('data:')) ? logo : fallback;
  if (!chosen) return `/assets/logo-black.png?${LOGO_VERSION}`;
  const base = chosen.split('?')[0];
  if (base.endsWith('/assets/logo-black.png') || base.endsWith('/assets/logo-white.png') || base.endsWith('/assets/trikonet-logo.png')) {
    return `${base.replace(/\.png$/, '.webp')}?${LOGO_VERSION}`;
  }
  return chosen;
};
document.documentElement.style.setProperty('--footer-title-size',`${Number(siteChrome.footerTitleSize)||18}px`);
const chromeMenu=(value,fallback)=>String(value||fallback).split('\n').map(line=>{const [label,url,depth]=line.split('|').map(v=>v.trim());return [label,url,Number(depth)||0]}).filter(item=>item[0]&&item[1]);
function renderHeaderMenu(items){const groups=[];items.forEach(([label,url,depth])=>{if(depth&&groups.length)groups[groups.length-1].children.push([label,url]);else groups.push({label,url,children:[]})});return groups.map(item=>item.children.length?`<div class="nav-dropdown"><a href="${escapeAttr(item.url)}">${escapeAttr(item.label)} <span>⌄</span></a><div class="nav-submenu">${item.children.map(([label,url])=>`<a href="${escapeAttr(url)}">${escapeAttr(label)}</a>`).join('')}</div></div>`:`<a href="${escapeAttr(item.url)}">${escapeAttr(item.label)}</a>`).join('')}
function header(){ return renderSiteHeader({ path, currentUser, calculateCandidateCompletion, siteChrome: { ...siteChrome, headerLogo: resolveLogo(siteChrome.headerLogo, '/assets/logo-black.png') } }); }
function footer(){ return renderSiteFooter({ ...siteChrome, footerLogo: resolveLogo(siteChrome.footerLogo, '/assets/logo-white.png') }); }
const optionList=(items,placeholder,selected)=>{
  const isLocList = Array.isArray(items) && items.some(i => UAE_CANONICAL_ORDER.includes(String(i?.name || i || '').trim().toLowerCase()));
  const list = isLocList ? sortUaeLocations(items) : (items || []);
  return `<option value="">${placeholder}</option>${list.map(item=>{
    const val = typeof item === 'object' && item !== null ? item.name : item;
    return `<option value="${escapeAttr(val)}"${selected===val?' selected':''}>${val}</option>`;
  }).join('')}`;
};
function customSelect(name, items, defaultLabel, selectedValue) {
  let list = items || [];
  if (name === 'location' || list.some(i => UAE_CANONICAL_ORDER.includes(String(i?.name || i || '').trim().toLowerCase()))) {
    list = sortUaeLocations(list);
  }
  const currentVal = selectedValue || '';
  const currentItem = list.find(item => (typeof item === 'object' ? item.name : item) === currentVal);
  const currentLabel = currentItem ? (typeof currentItem === 'object' ? currentItem.name : currentItem) : defaultLabel;
  
  const optionsHtml = [
    { name: '', label: defaultLabel },
    ...list.map(item => {
      const val = typeof item === 'object' && item !== null ? item.name : item;
      return { name: val, label: val };
    })
  ].map(opt => {
    const isSelected = opt.name === currentVal;
    return `<li class="custom-select-option${isSelected ? ' selected' : ''}" data-value="${escapeAttr(opt.name)}" role="option" aria-selected="${isSelected ? 'true' : 'false'}">
      <span>${escapeAttr(opt.label)}</span>
      ${isSelected ? `<svg class="custom-select-check" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>` : ''}
    </li>`;
  }).join('');

  return `<div class="custom-select-wrapper" data-name="${escapeAttr(name)}">
    <input type="hidden" name="${escapeAttr(name)}" value="${escapeAttr(currentVal)}">
    <button type="button" class="custom-select-trigger" aria-haspopup="listbox" aria-expanded="false">
      <span class="custom-select-label">${escapeAttr(currentLabel)}</span>
      <svg class="custom-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
    <div class="custom-select-dropdown">
      <ul class="custom-select-list" role="listbox">
        ${optionsHtml}
      </ul>
    </div>
  </div>`;
}
function searchBar(settings={}){const action=settings.action||(path==='/nurse-jobs-in-uae'?'/nurse-jobs-in-uae':'/jobs'),locationLabel=settings.location||'Country or City',categoryLabel=settings.category||'All Categories',selectedLocation=queryParams.get('location')||locationLabel,selectedCategory=queryParams.get('category')||categoryLabel;return `<form class="searchbar" action="${escapeAttr(action)}"><label class="field"><b>${icons.search}</b><input name="q" value="${escapeAttr(queryParams.get('q'))}" placeholder="${escapeAttr(settings.keyword||'Job Title, Keywords')}" aria-label="Job title"></label><label class="field"><b>${icons.pin}</b><select name="location" aria-label="Location">${optionList(data.taxonomies.locations,locationLabel,selectedLocation)}</select></label><label class="field"><select name="category" aria-label="Category">${optionList(data.taxonomies.categories,categoryLabel,selectedCategory)}</select></label><button class="primary">${escapeAttr(settings.button||'Find Jobs')}</button></form>`}
const homeSectionClass=s=>(s&&s.className?` ${escapeAttr(s.className)}`:'');
const homeSectionStyle=s=>{if(!s)return '';const styles=[s.background?`background:${escapeAttr(s.background)};`:'',s.textColor?`color:${escapeAttr(s.textColor)};`:''].filter(Boolean).join('');return styles?` style="${styles}"`:'';};
const homeSectionAttrs=s=>`${homeSectionClass(s)}"${homeSectionStyle(s)}`;
function homeHero(s={}){return renderHomeHero(s,{data,queryParams,customSelect});}
function getCategorySvg(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('educat') || n.includes('teach') || n.includes('school') || n.includes('academic')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
  }
  if (n.includes('account') || n.includes('financ') || n.includes('audit') || n.includes('bank') || n.includes('cashier')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
  }
  if (n.includes('nurse')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`;
  }
  if (n.includes('health') || n.includes('doctor') || n.includes('medic') || n.includes('clinic') || n.includes('hospital')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 9v6m-3-3h6"/></svg>`;
  }
  if (n.includes('human') || n.includes('hr') || n.includes('talent') || n.includes('recruit')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  }
  if (n.includes('digital') || n.includes('marketing') || n.includes('seo') || n.includes('media')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`;
  }
  if (n.includes('sale') || n.includes('retail') || n.includes('customer')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
  }
  if (n.includes('engineer') || n.includes('tech') || n.includes('software') || n.includes('comput')) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  }
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
}

function homeCategories(s = {}) {
  const sourceList = (data.taxonomies?.categories?.length) ? data.taxonomies.categories : defaultTopCategories;
  const mainCategories = sourceList.filter(c => !c.parent || ['Nurse Jobs'].includes(c.name));
  const cats = [...(mainCategories.length >= 9 ? mainCategories : sourceList)]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 9);
  return `<section class="section home-categories-section${homeSectionAttrs(s)}">
    <div class="wrap">
      <div class="categories-header">
        <div class="categories-header-text">
          <span class="categories-eyebrow">BROWSE BY INDUSTRY</span>
          <h2 class="categories-title">${escapeAttr(s.title || 'Popular Job Categories')}</h2>
          <p class="categories-subtitle">${escapeAttr(s.subtitle || 'Explore thousands of active vacancies across top in-demand industries in the UAE')}</p>
        </div>
        <a href="/jobs" class="categories-all-link">
          <span>Explore All Categories</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
      <div class="category-grid">
        ${cats.map((c) => `
          <a class="category-card" href="/category/${slugifyCategory(c)}">
            <div class="category-card-icon">
              ${getCategorySvg(c.name)}
            </div>
            <div class="category-card-body">
              <h3 class="category-card-title">${escapeAttr(c.name)}</h3>
              <span class="category-card-count">${Number(c.count || 0).toLocaleString()} open positions</span>
            </div>
            <div class="category-card-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  </section>`;
}
const companyTaglineMap = {
  'gems-education': "World-class private education and international curricula across UAE.",
  'aldar-education': "Leading educational group with British & IB curriculum schools.",
  'nmc-healthcare': "Pioneering private healthcare and specialized clinical excellence.",
  'american-hospital': "Mayo Clinic Network care and advanced multi-specialty services.",
  'al-futtaim': "Conglomerate leader across automotive, retail, and real estate.",
  'seha': "Transforming public & private clinical health services across UAE.",
  'mediclinic': "International private hospital network operating across Dubai & GCC.",
  'aster-dm-healthcare': "Integrated healthcare provider with world-class hospitals & clinics.",
  'dubai-health-authority': "Delivering public health protection and patient-centered services.",
  'adnoc': "Energy, oil & gas engineering leader driving sustainable innovation.",
  'emirates-group': "Global aviation, airline operations, and hospitality leader.",
  'emaar': "Iconic real estate, luxury developments, and hospitality in Dubai."
};

const TOP_HIRING_COMPANIES_FALLBACK = [
  { title: 'GEMS Education', slug: 'gems-education', openJobs: 511, locations: ['Dubai'], categories: ['Educational Services'], logo: '/uploads/employers/11640.png' },
  { title: 'Aldar Education', slug: 'aldar-education', openJobs: 400, locations: ['Abu Dhabi'], categories: ['Educational Services'], logo: '/uploads/employers/10464.jpeg' },
  { title: 'NMC Healthcare', slug: 'nmc-healthcare', openJobs: 206, locations: ['UAE'], categories: ['Healthcare'], logo: '/uploads/employers/11660.png' },
  { title: 'American Hospital', slug: 'american-hospital-dubai', openJobs: 184, locations: ['Dubai'], categories: ['Healthcare'], logo: '/uploads/employers/11646.png' },
  { title: 'Al-Futtaim', slug: 'alfuttaim', openJobs: 157, locations: ['Dubai'], categories: ['Retail', 'Conglomerate'], logo: '/uploads/employers/9380.jpg' },
  { title: 'Seha Abudhabi Health Services CO', slug: 'seha-abu-dhabi-health-services-co-2', openJobs: 144, locations: ['Abu Dhabi'], categories: ['Healthcare'], logo: '/uploads/employers/12777.jpg' },
  { title: 'Mediclinic', slug: 'mediclinic', openJobs: 115, locations: ['UAE'], categories: ['Healthcare'], logo: '/uploads/employers/12103.jpg' },
  { title: 'Nord Anglia Education', slug: 'nord-anglia-education', openJobs: 108, locations: ['Dubai'], categories: ['Educational Services'], logo: '/uploads/employers/31623.jpg' },
  { title: 'Jumeirah', slug: 'jumeirah', openJobs: 101, locations: ['Dubai'], categories: ['Hospitality'], logo: '/uploads/employers/28110.jpg' },
  { title: 'Wynn Al Marjan Island', slug: 'wynn-al-marjan-island', openJobs: 92, locations: ['Ras Al Khaimah'], categories: ['Hospitality'], logo: '/uploads/employers/29164.jpg' },
  { title: 'Saudi German Health', slug: 'saudigerman', openJobs: 91, locations: ['UAE'], categories: ['Healthcare'], logo: '/uploads/employers/9222.jpg' },
  { title: "King's College Hospital London – UAE", slug: 'kings-college-hospital-london-uae', openJobs: 88, locations: ['Dubai'], categories: ['Healthcare'], logo: '/uploads/employers/12975.jpg' },
  { title: 'First Abu Dhabi Bank (FAB)', slug: 'first-abu-dhabi-bank', openJobs: 81, locations: ['Abu Dhabi'], categories: ['Banking'], logo: '/uploads/employers/9867.jpg' },
  { title: 'Mashreq', slug: 'mashreq-bank', openJobs: 79, locations: ['Dubai'], categories: ['Banking'], logo: '/uploads/employers/9915.jpg' },
  { title: 'United Arab Emirates University', slug: 'united-arab-emirates-university', openJobs: 79, locations: ['Al Ain'], categories: ['Educational Services'], logo: '/uploads/employers/38913.jpg' },
  { title: 'Majid Al Futtaim', slug: 'majid-al-futtaim', openJobs: 76, locations: ['Dubai'], categories: ['Retail'], logo: '/uploads/employers/9891.jpg' }
];

function homeTopCompanies(s = {}) {
  let employers = (data.topEmployers && data.topEmployers.length) 
    ? [...data.topEmployers] 
    : [...(data.employers || [])];

  if (!employers.length) {
    employers = [...TOP_HIRING_COMPANIES_FALLBACK];
  }

  // Strictly sort by highest open jobs descending!
  employers.sort((a, b) => (Number(b.openJobs) || 0) - (Number(a.openJobs) || 0));

  if ((Number(employers[0]?.openJobs) || 0) < 20) {
    employers = [...TOP_HIRING_COMPANIES_FALLBACK];
  }

  const cardsHtml = employers.slice(0, 16).map(e => {
    const displayTitle = formatCompanyName(decodeHtml(e.title || ''));
    const initials = escapeAttr(displayTitle.slice(0, 2).toUpperCase() || 'TC');
    const rawLoc = (e.locations && e.locations[0]) || '';
    const cleanLoc = (!rawLoc || /^\d+$/.test(rawLoc) || rawLoc === 'United Arab Emirates') ? 'UAE' : decodeHtml(rawLoc);
    
    // Extract category
    const validCats = (e.categories || []).filter(c => typeof c === 'string' && c.trim() && !/^\d+$/.test(c));
    const catText = validCats.length ? decodeHtml(validCats.slice(0, 2).join(' • ')) : decodeHtml(e.category || 'Top Employer');
    const openJobsCount = Number(e.openJobs) || 20;

    return `
      <a class="featured-company-card" href="/employer/${escapeAttr(e.slug)}" aria-label="View jobs at ${escapeAttr(displayTitle)}" style="text-decoration:none;color:inherit">
        <div class="featured-company-logo-wrap">
          ${e.logo ? `<img src="${escapeAttr(e.logo)}" alt="${escapeAttr(displayTitle)}" loading="lazy" decoding="async" data-backup="${escapeAttr(e.logoBackup||'')}" onerror="if(this.dataset.backup&&!this.dataset.retried){this.dataset.retried='1';this.src=this.dataset.backup;}else{this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';}">` : ''}
          <div class="featured-company-logo-fallback" style="${e.logo ? 'display:none;' : 'display:flex;'}">
            ${initials}
          </div>
        </div>

        <div class="featured-company-info-box">
          <h3 class="featured-company-name" title="${escapeAttr(displayTitle)}">${escapeAttr(displayTitle)}</h3>
          <div class="featured-company-jobs-badge">
            <svg class="featured-company-job-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span class="company-jobs-count-text"><strong>${openJobsCount}</strong> Open Jobs</span>
            <span class="company-jobs-sep">•</span>
            <span class="company-jobs-loc">${escapeAttr(cleanLoc)}</span>
          </div>
        </div>

        <div class="featured-company-category-tag">
          <span class="company-cat-pill">${escapeAttr(catText)}</span>
        </div>

        <span class="featured-company-view-btn">View jobs</span>
      </a>
    `;
  }).join('');

  const sectionTitle = (s.title && s.title !== 'Featured companies actively hiring') ? s.title : 'Top Companies Hiring';

  return `<section class="featured-companies-section"${homeSectionAttrs(s)}>
    <div class="wrap">
      <div class="featured-companies-header">
        <h2 class="featured-companies-title">${escapeAttr(sectionTitle)}</h2>
      </div>

      <div class="featured-companies-carousel-wrap">
        <button type="button" class="carousel-arrow carousel-arrow-prev" aria-label="Previous companies">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div class="featured-companies-track">
          ${cardsHtml}
        </div>

        <button type="button" class="carousel-arrow carousel-arrow-next" aria-label="Next companies">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div class="featured-companies-footer">
        <a class="btn-all-companies-pill" href="/employers">View all companies</a>
      </div>
    </div>
  </section>`;
}
function homeHowItWorks(s = {}) {
  const steps = [
    {
      title: s.step1Title || 'Register an Account to Start',
      image: s.step1Image || '/assets/step-1.jpg'
    },
    {
      title: s.step2Title || 'Explore Over Thousands of Jobs',
      image: s.step2Image || '/assets/step-2.jpg'
    },
    {
      title: s.step3Title || 'Find the Most Suitable Company and Job',
      image: s.step3Image || '/assets/step-3.jpg'
    }
  ];

  return `<section class="section alt how-it-works-section${homeSectionAttrs(s)}" id="howItWorksSection">
    <div class="wrap">
      <div class="section-title">
        <h2>${escapeAttr(s.title || 'How It Works?')}</h2>
        <p>${escapeAttr(s.subtitle || 'Job for Anyone, Anywhere')}</p>
      </div>
      <div class="how-steps-wrap">
        <div class="how-steps-track" id="howStepsTrack">
          ${steps.map((st, i) => `
            <div class="how-step-item" data-step="${i}">
              <div class="how-step-icon">
                <img src="${escapeAttr(st.image)}" alt="${escapeAttr(st.title)}" loading="lazy">
              </div>
              <h3 class="how-step-title">${escapeAttr(st.title)}</h3>
            </div>
          `).join('')}
        </div>
        <div class="how-slider-dots" id="howSliderDots" aria-label="Step slider navigation">
          <button type="button" class="how-dot active" data-index="0" aria-label="Step 1"></button>
          <button type="button" class="how-dot" data-index="1" aria-label="Step 2"></button>
          <button type="button" class="how-dot" data-index="2" aria-label="Step 3"></button>
        </div>
      </div>
    </div>
  </section>`;
}
function homeWidgets(){const fallback=['hero','categories','top-companies','how-it-works','articles'].map(type=>({type,settings:{}}));try{const pages=JSON.parse(localStorage.getItem('trikonet_pages_cms')||'[]');const page=pages.find(item=>item.slug==='home');if(!page?.content)return fallback;const doc=new DOMParser().parseFromString(page.content,'text/html');const widgets=[...doc.querySelectorAll('[data-home-widget]')].map(node=>{let settings={};try{settings=JSON.parse(decodeURIComponent(node.dataset.homeSettings||'%7B%7D'))}catch{}return {type:node.dataset.homeWidget,settings}}).filter(item=>['hero','categories','top-companies','how-it-works','articles'].includes(item.type));if(widgets.length&&!widgets.some(w=>w.type==='top-companies')){const catIdx=widgets.findIndex(w=>w.type==='categories');if(catIdx>=0)widgets.splice(catIdx+1,0,{type:'top-companies',settings:{}});else widgets.push({type:'top-companies',settings:{}})}return widgets.length?widgets:fallback}catch{return fallback}}
function home(){const renderers={hero:homeHero,categories:homeCategories,'top-companies':homeTopCompanies,'how-it-works':homeHowItWorks,articles:(s)=>articleSection(s)};return `<main>${homeWidgets().map(item=>renderers[item.type]?.(item.settings)||'').join('')}</main>`}
function getPaginationRange(current, total) {
  const start = Math.floor((current - 1) / 5) * 5 + 1;
  return Array.from({ length: Math.min(5, total - start + 1) }, (_, i) => start + i);
}

function pager(base, total, size = pageSize) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return '';
  const safeCurrent = Math.min(Math.max(currentPage, 1), pages);
  const pageLink = page => {
    const params = new URLSearchParams(queryParams);
    params.set('page', page);
    return `${base}?${params.toString()}`;
  };

  const range = getPaginationRange(safeCurrent, pages);

  const prevBtn = safeCurrent > 1
    ? `<a class="pagination-btn pagination-prev" href="${pageLink(safeCurrent - 1)}" aria-label="Previous page">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        <span>Previous</span>
      </a>`
    : `<span class="pagination-btn pagination-prev disabled" aria-disabled="true">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        <span>Previous</span>
      </span>`;

  const nextBtn = safeCurrent < pages
    ? `<a class="pagination-btn pagination-next" href="${pageLink(safeCurrent + 1)}" aria-label="Next page">
        <span>Next</span>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </a>`
    : `<span class="pagination-btn pagination-next disabled" aria-disabled="true">
        <span>Next</span>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </span>`;

  const pageItems = range.map(item => {
    if (item === '...') {
      return `<span class="pagination-ellipsis" aria-hidden="true">&hellip;</span>`;
    }
    if (item === safeCurrent) {
      return `<span class="pagination-num active" aria-current="page">${item}</span>`;
    }
    return `<a class="pagination-num" href="${pageLink(item)}" aria-label="Page ${item}">${item}</a>`;
  }).join('');

  return `
    <nav class="data-pagination" aria-label="Pagination">
      <div class="pagination-info">
        Page <span class="highlight">${safeCurrent}</span> of <span class="highlight">${pages}</span>
        ${total ? `<span class="total-count">(${Number(total).toLocaleString()} total)</span>` : ''}
      </div>
      <div class="pagination-controls">
        ${prevBtn}
        <div class="pagination-pages">
          ${pageItems}
        </div>
        ${nextBtn}
      </div>
    </nav>
  `;
}
function getRecentArticles() {
  const posts = [...(data.posts || [])];
  posts.sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    if (timeB && timeA && timeB !== timeA) return timeB - timeA;
    return (b.id || 0) - (a.id || 0);
  });
  return posts.slice(0, Math.max(10, Math.min(14, posts.length)));
}

function decodeArticleHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ');
}

function articleSection(s = {}) {
  const slider = path === '/';
  const recentArticles = getRecentArticles();
  if (!recentArticles.length) return '';

  return `
    <section class="recent-section${slider ? ' recent-slider' : ''}"${homeSectionAttrs(s)}>
      <div class="wrap">
        <div class="recent-articles-header-bar">
          <div class="recent-articles-header-text">
            <h2 class="recent-articles-heading">${escapeAttr(s.title || 'Recent Articles & Career Insights')}</h2>
            <p class="recent-articles-subheading">${escapeAttr(s.subtitle || 'Fresh UAE job-market intelligence, resume strategies, and workplace advice posted daily.')}</p>
          </div>

          ${slider ? `
            <div class="recent-articles-nav-controls">
              <a class="recent-articles-viewall-link" href="/blog">
                <span>View all articles</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>
          ` : ''}
        </div>

        <div class="articles-carousel-wrap">
          <div class="articles" ${slider ? 'id="recent-articles" tabindex="0" aria-label="Recent articles slider"' : ''}>
            ${recentArticles.map((p, i) => {
              const postUrl = getPostUrl(p);
              const rawTitle = p.title?.rendered || p.title || 'Career Guide';
              const title = decodeArticleHtml(rawTitle);
              const rawDate = p.date || '';
              let formattedDate = 'Recent';
              if (rawDate) {
                try {
                  const d = new Date(rawDate);
                  if (!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                } catch {}
              }
              const category = decodeArticleHtml(p.categoryName || p.category_name || (p.category_slug ? p.category_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Career Advice'));
              const image = p.featuredImage || p.featured_image || p.image || `/assets/article-${(i % 3) + 1}.jpg`;
              
              let rawExcerpt = (p.excerpt?.rendered || p.excerpt || '').replace(/<[^>]+>/g, '').trim();
              if (!rawExcerpt && p.content?.rendered) {
                rawExcerpt = p.content.rendered.replace(/<[^>]+>/g, '').trim().slice(0, 140);
              }
              const cleanedExcerpt = decodeArticleHtml(rawExcerpt);
              const excerpt = cleanedExcerpt ? (cleanedExcerpt.slice(0, 105) + (cleanedExcerpt.length > 105 ? '…' : '')) : 'Discover actionable career strategies, salary insights, and professional growth tips for UAE jobseekers.';
              const readTime = Math.max(3, Math.min(8, Math.round(((cleanedExcerpt || title).length / 45) + 3))) + ' min read';

              return `
                <article class="article modern-article-card">
                  <div class="article-cover-wrap">
                    <a href="${postUrl}" class="article-cover-link" aria-label="${escapeAttr(title)}">
                      <img class="article-cover" src="${escapeAttr(image)}" alt="${escapeAttr(title)}" loading="lazy" onerror="this.onerror=null;this.src='/assets/article-${(i % 3) + 1}.jpg';">
                    </a>
                    <span class="article-badge-category">${escapeAttr(category)}</span>
                    <span class="article-badge-readtime">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      ${readTime}
                    </span>
                  </div>

                  <div class="article-body">
                    <div class="article-meta-row">
                      <span class="article-meta-date">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${escapeAttr(formattedDate)}
                      </span>
                      <span class="article-meta-dot">•</span>
                      <span class="article-meta-author">Trikonet Insights</span>
                    </div>

                    <h3 class="article-title">
                      <a href="${postUrl}">${escapeAttr(title)}</a>
                    </h3>

                    <p class="article-excerpt">${escapeAttr(excerpt)}</p>

                    <div class="article-card-footer">
                      <a class="article-read-link" href="${postUrl}">
                        <span>Read Full Guide</span>
                        <svg class="article-arrow-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </a>
                      <a class="article-card-arrow-circle" href="${postUrl}" aria-label="Open article">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </a>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>

        ${slider ? `
          <div class="recent-slider-dots" id="recentArticlesDots" aria-label="Article navigation dots">
            ${recentArticles.map((_, idx) => `
              <button type="button" class="recent-dot${idx === 0 ? ' active' : ''}" data-index="${idx}" aria-label="Go to article slide ${idx + 1}"></button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </section>
  `;
}
function jobs(){
  const total = data.counts.job_listing || data.jobs.length;
  const start = total ? (currentPage - 1) * jobsPageSize + 1 : 0;
  const end = Math.min(start + data.jobs.length - 1, total);
  const selectedType = queryParams.get('job_type') || '';
  const selectedLoc = queryParams.get('location') || '';
  const selectedCat = queryParams.get('category') || '';
  const qTerm = (queryParams.get('q') || '').trim();
  const isSearchResults = !!(qTerm || (selectedLoc && selectedLoc !== 'Country or City') || (selectedCat && selectedCat !== 'All Categories'));
  const jobsBase = path.startsWith('/job-location/') ? path : '/jobs';

  const iconBriefcase = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
  const iconPin = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const iconClock = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const iconBell = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
  const iconBookmark = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
  const latestArticles = (data.posts || []).filter(article => article && article.slug && article.title).slice(0, 3);

  const makeFilterUrl = (key, val) => {
    const p = new URLSearchParams(queryParams);
    if (p.get(key) === val) p.delete(key);
    else p.set(key, val);
    p.delete('page');
    const qs = p.toString();
    return qs ? '/jobs?' + qs : '/jobs';
  };
  const makeRemoveUrl = (key) => {
    const p = new URLSearchParams(queryParams);
    p.delete(key);
    p.delete('page');
    const qs = p.toString();
    return qs ? '/jobs?' + qs : '/jobs';
  };

  const hasAnyFilter = !!(qTerm || selectedType || (selectedLoc && selectedLoc !== 'Country or City') || (selectedCat && selectedCat !== 'All Categories'));

  return `<main>
    <section class="jobs-head">
      <div class="wrap">${searchBar()}</div>
    </section>

    <div class="wrap jobs-layout nurse-results-layout${isSearchResults ? ' search-results-mode' : ''}">
      <!-- LEFT FILTER SIDEBAR -->
      <aside class="filters jobs-filter-card nurse-site-filters">
        <div class="jobs-filter-card-header">
          <div class="jobs-filter-header-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            <h3>Filter Jobs</h3>
          </div>
          ${hasAnyFilter ? `<a href="/jobs" class="jobs-filter-clear">Clear all</a>` : ''}
          <button type="button" class="jobs-filter-mobile-toggle" aria-expanded="false" aria-label="Show job filters">
            <span>Show filters</span>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>

        <div class="jobs-filter-collapsible">
        <!-- Job Type Filter Group -->
        <div class="jobs-filter-group">
          <div class="jobs-filter-head">
            <h4>Job type</h4>
            ${selectedType ? `<a href="${makeRemoveUrl('job_type')}" class="jobs-filter-clear">Clear</a>` : ''}
          </div>
          <div class="jobs-filter-list">
            ${(data.taxonomies?.types || []).map(x => {
              const isSelected = selectedType === x.name;
              const countFormatted = Number(x.count || 0).toLocaleString();
              return `<a class="jobs-filter-row${isSelected ? ' active' : ''}" href="${makeFilterUrl('job_type', x.name)}">
                <span class="jobs-row-label">
                  <span class="jobs-custom-cb">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span class="jobs-filter-name">${escapeAttr(x.name)}</span>
                </span>
                <span class="jobs-filter-count">(${countFormatted})</span>
              </a>`;
            }).join('')}
          </div>
        </div>

        <!-- Location Filter Group -->
        <div class="jobs-filter-group" style="margin-top: 22px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
          <div class="jobs-filter-head">
            <h4>Location (UAE)</h4>
            ${selectedLoc && selectedLoc !== 'Country or City' ? `<a href="${makeRemoveUrl('location')}" class="jobs-filter-clear">Clear</a>` : ''}
          </div>
          <div class="jobs-filter-list">
            ${sortUaeLocations((data.taxonomies?.locations || []).filter(l => ['UAE', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'].some(k => k.toLowerCase() === (l.name || '').toLowerCase()))).map(x => {
              const isSelected = selectedLoc === x.name;
              const countFormatted = Number(x.count || 0).toLocaleString();
              return `<a class="jobs-filter-row${isSelected ? ' active' : ''}" href="${makeFilterUrl('location', x.name)}">
                <span class="jobs-row-label">
                  <span class="jobs-custom-cb">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span class="jobs-filter-name">${escapeAttr(x.name)}</span>
                </span>
                <span class="jobs-filter-count">(${countFormatted})</span>
              </a>`;
            }).join('')}
          </div>
        </div>
        </div>
      </aside>

      <!-- MAIN JOBS RESULTS CONTENT -->
      <section class="jobs-main-content nurse-results-main">
        <div class="listing-top-bar nurse-results-tools">
          <div class="nurse-tools-top">
            <span class="listing-top-sub nurse-tools-count">${total ? `Showing <b>${start} – ${end}</b> ${qTerm ? `jobs for “${escapeAttr(qTerm)}”` : 'database jobs'}` : 'No jobs found for these filters'}</span>
            <div class="listing-top-actions nurse-tools-actions">
              <select class="jobs-sort-select nurse-sort-select" aria-label="Sort jobs">
                <option value="default">Most Relevant</option>
                <option value="newest">Newest First</option>
              </select>
              <button type="button" class="nurse-alert-trigger">${iconBell} Alert Me</button>
            </div>
          </div>
        </div>

        ${hasAnyFilter ? `
          <div class="active-filter-chips nurse-active-chips-bar">
            ${qTerm ? `<span class="filter-chip">Keyword: <strong>"${escapeAttr(qTerm)}"</strong> <a href="${makeRemoveUrl('q')}" title="Remove keyword filter" aria-label="Remove keyword filter">✕</a></span>` : ''}
            ${selectedType ? `<span class="filter-chip">Type: <strong>${escapeAttr(selectedType)}</strong> <a href="${makeRemoveUrl('job_type')}" title="Remove type filter" aria-label="Remove type filter">✕</a></span>` : ''}
            ${selectedLoc && selectedLoc !== 'Country or City' ? `<span class="filter-chip">Location: <strong>${escapeAttr(selectedLoc)}</strong> <a href="${makeRemoveUrl('location')}" title="Remove location filter" aria-label="Remove location filter">✕</a></span>` : ''}
            ${selectedCat && selectedCat !== 'All Categories' ? `<span class="filter-chip">Category: <strong>${escapeAttr(selectedCat)}</strong> <a href="${makeRemoveUrl('category')}" title="Remove category filter" aria-label="Remove category filter">✕</a></span>` : ''}
            <a href="/jobs" class="filter-chip-clear-all">Reset All</a>
          </div>
        ` : ''}

        <div class="job-grid">${data.jobs.map(j => {
          const cleanTitle = decodeHtml(typeof j.title === 'string' ? j.title : j.title?.rendered || '').trim();
          const rawCompany = (j.company || j.employerName || '').trim();
          const cleanCompany = decodeHtml(rawCompany);
          const catText = j.category || (j.categories && j.categories[0]) || '';
          const cleanCat = decodeHtml(catText).split(',')[0].trim();
          const typeText = j.type || 'Full Time';
          const locText = j.location || 'United Arab Emirates';
          const dateText = j.date || 'Recently posted';
          const initial = (cleanCompany || cleanTitle || 'TJ').slice(0, 2).toUpperCase();
          const excerptText = cleanJobExcerpt(j.excerpt || '');

          const logoHtml = j.logo ? `
            <div class="nurse-card-logo">
              <img src="${escapeAttr(j.logo)}" alt="${escapeAttr(cleanCompany)}" loading="lazy">
            </div>
          ` : `
            <div class="nurse-card-logo-fallback">
              <span>${escapeAttr(initial)}</span>
            </div>
          `;

          return `
            <article class="nurse-job-card standard-job-card" data-slug="${escapeAttr(j.slug)}">
              <div class="nurse-card-top">
                ${logoHtml}
                <div class="nurse-card-info">
                  <div class="nurse-card-title-row">
                    <a href="/job/${escapeAttr(j.slug)}" class="nurse-job-title-link">
                      <h2>${escapeAttr(cleanTitle)}</h2>
                    </a>
                    <button type="button" class="nurse-card-save-btn" data-slug="${escapeAttr(j.slug)}" title="Save job" aria-label="Save job">${iconBookmark}</button>
                  </div>
                  <div class="nurse-company-row">
                    ${cleanCompany ? `<a class="comp-name company-profile-link" href="${escapeAttr(employerProfileHref(j))}">${escapeAttr(cleanCompany)}</a>` : ''}
                    ${cleanCompany && cleanCat ? `<span class="comp-sep">•</span>` : ''}
                    ${cleanCat ? `<span class="comp-cat">${escapeAttr(cleanCat)}</span>` : ''}
                  </div>
                  <div class="nurse-job-meta-row">
                    <span class="nurse-meta-badge nurse-badge-type">${iconBriefcase} ${escapeAttr(typeText)}</span>
                    <span class="nurse-meta-badge nurse-badge-loc">${iconPin} ${escapeAttr(locText)}</span>
                    <span class="nurse-meta-badge nurse-badge-date">${iconClock} ${escapeAttr(dateText)}</span>
                  </div>
                  ${excerptText ? `<p class="nurse-job-excerpt">${escapeAttr(excerptText)}</p>` : ''}
                </div>
              </div>
              <div class="nurse-card-footer">
                <div class="nurse-footer-tags">
                  ${cleanCat ? `<span class="nurse-tag-category">${escapeAttr(cleanCat)}</span>` : ''}
                </div>
                <a href="/job/${escapeAttr(j.slug)}" class="nurse-view-job-btn">View Job <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></a>
              </div>
            </article>
          `;
        }).join('')}</div>

        ${pager(jobsBase, total, jobsPageSize)}
      </section>

      <!-- RIGHT SIDEBAR (Search Mode) -->
      ${isSearchResults ? `
        <aside class="search-results-side nurse-side-column">
          <a href="/resume-builder" class="nurse-resume-builder-card">
            <span class="nurse-resume-builder-badge">FREE TOOL</span>
            <span class="nurse-resume-builder-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg></span>
            <span class="nurse-resume-builder-copy">
              <strong>Build your professional résumé</strong>
              <small>Create an ATS-friendly CV tailored for UAE roles.</small>
            </span>
            <span class="nurse-resume-builder-action">Build my résumé <span>→</span></span>
          </a>

          <section class="nurse-side-card nurse-articles-card">
            <div class="nurse-side-card-header">
              <h3>Latest Articles</h3>
              <a href="/blog" class="nurse-side-see-all">View all →</a>
            </div>
            <div class="nurse-side-article-list">
              ${latestArticles.length ? latestArticles.map(article => `
                <a href="${escapeAttr(getPostUrl(article))}" class="nurse-side-article-row">
                  <span class="nurse-side-article-image"><img src="${escapeAttr(article.featuredImage || '/assets/article-1.jpg')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='/assets/article-1.jpg'"></span>
                  <span class="nurse-side-article-copy">
                    <small>${escapeAttr(article.categoryName || 'Career Advice')}</small>
                    <strong>${escapeAttr(article.title)}</strong>
                    ${article.date ? `<time>${escapeAttr(article.date)}</time>` : ''}
                  </span>
                </a>`).join('') : `<p class="nurse-side-article-empty">Published articles will appear here.</p>`}
            </div>
          </section>

          <section class="nurse-side-card nurse-alert-card">
            <div class="nurse-alert-card-top">
              <div class="nurse-alert-badge-icon">${iconBell}</div>
              <div><h4>${qTerm ? `${escapeAttr(qTerm)} Job Alerts` : 'Job Alerts'}</h4><p>Get matching UAE vacancies delivered to your inbox.</p></div>
            </div>
            <form class="nurse-side-alert-form" action="/alerts-jobs" onsubmit="event.preventDefault(); alert('Subscribed to job alerts!');">
              <input type="email" placeholder="Enter your email address..." class="nurse-side-email-input" required>
              <button type="submit" class="nurse-side-alert-btn">Subscribe Free</button>
            </form>
          </section>
        </aside>
      ` : ''}
    </div>
  </main>`;
}
function nurseJobsPage(){
  const curatedNurseJobs=[
    {id:'nj-1',title:'Staff Nurse',company:'SEHA Salma Rehabilitation Hospital',category:'HealthCare, Nurse Jobs',location:'Abu Dhabi',type:'Full Time',date:'September 22, 2026',slug:'staff-nurse-seha-salma',logo:'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=60',excerpt:'Join a trusted healthcare team and provide high-quality, compassionate patient care while growing your nursing career in the UAE.'},
    {id:'nj-2',title:'Registered Nurse (OPD / Inpatient)',company:'Amana Healthcare',category:'HealthCare, Nurse Jobs',location:'Abu Dhabi',type:'Full Time',date:'September 22, 2026',slug:'registered-nurse-amana-healthcare',logo:'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=120&auto=format&fit=crop&q=60',excerpt:'Provide dedicated post-acute and specialized rehabilitation nursing care with Amana Healthcare in a supportive clinical environment.'},
    {id:'nj-3',title:'Clinical Care Nurse - ICU',company:'M42 Health',category:'HealthCare, Nurse Jobs',location:'Abu Dhabi',type:'Full Time',date:'September 21, 2026',slug:'clinical-care-nurse-icu-m42',logo:'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=120&auto=format&fit=crop&q=60',excerpt:'Deliver critical patient monitoring and specialized clinical care within M42 world-class healthcare facilities in Abu Dhabi.'},
    {id:'nj-4',title:'Pediatric Staff Nurse',company:'Danat Al Emarat Hospital',category:'HealthCare, Nurse Jobs',location:'Abu Dhabi',type:'Full Time',date:'September 20, 2026',slug:'pediatric-staff-nurse-danat-al-emarat',excerpt:'Deliver compassionate pediatric nursing care and patient family support within a premier women and children hospital setting.'},
    {id:'nj-5',title:'Emergency Room (ER) Nurse',company:'Mediclinic Middle East',category:'HealthCare, Nurse Jobs',location:'Dubai',type:'Full Time',date:'September 19, 2026',slug:'er-nurse-mediclinic',excerpt:'Fast-paced clinical emergency department nursing role supporting trauma, urgent care, and patient triage in Dubai.'}
  ];
  const pageLimit=10;
  const list=(data.jobs.length?data.jobs:curatedNurseJobs).slice(0,pageLimit);
  const total=data.counts?.nurse||data.counts?.job_listing||list.length;
  const start=total?(currentPage-1)*pageLimit+1:0;
  const end=Math.min(start+list.length-1,total);
  const qQuery=queryParams.get('q');
  const selectedLoc=queryParams.get('location')||'';
  const selectedType=queryParams.get('job_type')||'';

  const hasActiveFilters=!!(selectedLoc||selectedType||qQuery);
  const removeLocParams=new URLSearchParams(queryParams);
  removeLocParams.delete('location');
  removeLocParams.delete('page');
  const removeTypeParams=new URLSearchParams(queryParams);
  removeTypeParams.delete('job_type');
  removeTypeParams.delete('page');

  let pageTitle='Nurse Jobs in UAE';
  if(qQuery)pageTitle=`"${escapeAttr(qQuery)}" Jobs in UAE`;
  else if(selectedLoc)pageTitle=`Nurse Jobs in ${escapeAttr(selectedLoc)}`;

  const latestArticles=(data.posts||[])
    .filter(article=>article&&article.slug&&article.title)
    .slice(0,3);
  const iconBriefcase=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
  const iconPin=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const iconClock=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const iconBuilding=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/></svg>`;
  const iconBell=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
  const iconShareLinkedin=`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`;
  const iconShareFb=`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>`;
  const iconShareWa=`<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
  const iconShareX=`<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  const iconCheckTick=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  const iconBookmark=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;

  return `<main class="nurse-results-page">
    <section class="nurse-results-hero">
      <div class="wrap">
        <div class="nurse-hero-topline">
          <nav class="nurse-breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Trikonet</a>
            <span class="sep">&gt;</span>
            <a href="/jobs">Jobs</a>
            <span class="sep">&gt;</span>
            <span class="current">Nurse Jobs in UAE</span>
          </nav>
        </div>
        <div class="nurse-hero-head">
          <div class="nurse-hero-title-row">
            <h1>${pageTitle}</h1>
            <span class="nurse-hero-count-tag">${total.toLocaleString()} Vacancies</span>
          </div>
          <p class="nurse-hero-desc">Discover verified nursing, clinical care, and hospital positions across Dubai, Abu Dhabi, and Northern Emirates with direct employer application.</p>
        </div>
        <div class="nurse-search-wrapper">
          ${searchBar({ keyword: 'Nurse, Staff Nurse, Clinic...', category: 'HealthCare, Nurse Jobs', button: 'Search Jobs', action: '/nurse-jobs-in-uae' })}
        </div>
        <div class="nurse-popular-chips">
          <span class="chips-label">Popular searches:</span>
          <a href="/nurse-jobs-in-uae?q=Staff+Nurse">Staff Nurse</a>
          <a href="/nurse-jobs-in-uae?q=Registered+Nurse">Registered Nurse</a>
          <a href="/nurse-jobs-in-uae?q=Clinic+Nurse">Clinic Nurse</a>
          <a href="/nurse-jobs-in-uae?q=ICU+Nurse">ICU Nurse</a>
          <a href="/nurse-jobs-in-uae?q=nurse&location=Dubai">Dubai</a>
          <a href="/nurse-jobs-in-uae?q=nurse&location=Abu+Dhabi">Abu Dhabi</a>
        </div>
      </div>
    </section>

    <section class="wrap nurse-results-layout">
      <aside class="filters nurse-site-filters jobs-filter-card">
        <div class="nurse-filter-header">
          <div class="nurse-filter-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>Filter Jobs</span>
          </div>
          ${hasActiveFilters ? `<a href="/nurse-jobs-in-uae" class="nurse-filter-reset-link">Reset All</a>` : ''}
          <button type="button" class="jobs-filter-mobile-toggle" aria-expanded="false" aria-label="Show job filters"><span>Show filters</span><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
        </div>

        <div class="jobs-filter-collapsible">
        <div class="nurse-filter-group">
          <h3>Location</h3>
          ${sortUaeLocations((data.taxonomies?.locations || []).filter(l => ['UAE', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'].some(k => k.toLowerCase() === (l.name || '').toLowerCase()))).map(x => {
            const params = new URLSearchParams(queryParams);
            const isSelected = selectedLoc === x.name;
            if (isSelected) params.delete('location');
            else params.set('location', x.name);
            params.delete('page');
            const countText = x.count != null ? Number(x.count).toLocaleString() : '';
            return `<a class="nurse-filter-row${isSelected ? ' active' : ''}" href="/nurse-jobs-in-uae?${params}">
              <span class="nurse-row-label">
                <span class="nurse-custom-cb">${iconCheckTick}</span>
                <span class="nurse-filter-name">${escapeAttr(x.name)}</span>
              </span>
              ${countText ? `<span class="nurse-filter-count">${countText}</span>` : ''}
            </a>`;
          }).join('')}
        </div>

        <div class="nurse-filter-group">
          <h3>Job type</h3>
          ${(data.taxonomies?.types || []).map(x => {
            const params = new URLSearchParams(queryParams);
            const isSelected = selectedType === x.name;
            if (isSelected) params.delete('job_type');
            else params.set('job_type', x.name);
            params.delete('page');
            const countText = x.count != null ? Number(x.count).toLocaleString() : '';
            return `<a class="nurse-filter-row${isSelected ? ' active' : ''}" href="/nurse-jobs-in-uae?${params}">
              <span class="nurse-row-label">
                <span class="nurse-custom-cb">${iconCheckTick}</span>
                <span class="nurse-filter-name">${escapeAttr(x.name)}</span>
              </span>
              ${countText ? `<span class="nurse-filter-count">${countText}</span>` : ''}
            </a>`;
          }).join('')}
        </div>
        </div>
      </aside>

      <section class="nurse-results-main">
        <div class="nurse-results-tools">
          <div class="nurse-tools-top">
            <span class="nurse-tools-count">Showing <b>${start} – ${end}</b> Nurse Jobs</span>
            <div class="nurse-tools-actions">
              <select class="nurse-sort-select" aria-label="Sort listings">
                <option>Most Relevant</option>
                <option>Newest First</option>
              </select>
              <button type="button" class="nurse-alert-trigger">${iconBell} Alert Me</button>
            </div>
          </div>
          ${(selectedLoc || selectedType) ? `
            <div class="nurse-active-chips-bar">
              <span class="nurse-active-label">Active filters:</span>
              ${selectedLoc ? `<span class="nurse-active-chip">${escapeAttr(selectedLoc)} <a href="/nurse-jobs-in-uae?${removeLocParams}" title="Remove filter">×</a></span>` : ''}
              ${selectedType ? `<span class="nurse-active-chip">${escapeAttr(selectedType)} <a href="/nurse-jobs-in-uae?${removeTypeParams}" title="Remove filter">×</a></span>` : ''}
              <a href="/nurse-jobs-in-uae" class="nurse-clear-all-link">Clear all</a>
            </div>
          ` : ''}
        </div>

        <div class="nurse-job-list">
          ${list.map((job,index)=>`
            <article class="nurse-job-card">
              <div class="nurse-card-top">
                ${job.logo ? `
                  <div class="nurse-card-logo">
                    <img src="${escapeAttr(job.logo)}" alt="${escapeAttr(job.company)}">
                  </div>
                ` : `
                  <div class="nurse-card-logo-fallback">
                    <span>${escapeAttr(String(job.company||(typeof job.title==='string'?job.title:job.title?.rendered)||'NJ').slice(0,2).toUpperCase())}</span>
                  </div>
                `}
                <div class="nurse-card-info">
                  <div class="nurse-card-title-row">
                    <a href="/job/${escapeAttr(job.slug)}" class="nurse-job-title-link">
                      <h2>${escapeAttr(job.title)}</h2>
                    </a>
                    <button type="button" class="nurse-card-save-btn" title="Save job" aria-label="Save job">${iconBookmark}</button>
                  </div>
                  <div class="nurse-company-row">
                    <a class="comp-name company-profile-link" href="${escapeAttr(employerProfileHref(job))}">${escapeAttr(job.company||'Trikonet Healthcare')}</a>
                  </div>
                  <div class="nurse-job-meta-row">
                    <span class="nurse-meta-badge">${iconBriefcase} ${escapeAttr(job.type||'Full Time')}</span>
                    <span class="nurse-meta-badge">${iconPin} ${escapeAttr(job.location||'United Arab Emirates')}</span>
                    <span class="nurse-meta-badge">${iconClock} ${escapeAttr(job.date||'Recently posted')}</span>
                  </div>
                  <p class="nurse-job-excerpt">${escapeAttr(cleanJobExcerpt(job.excerpt)||'Join a trusted healthcare team and provide high-quality, compassionate patient care while growing your nursing career in the UAE.')}</p>
                </div>
              </div>
              <div class="nurse-card-footer">
                <div class="nurse-footer-tags">
                  ${(() => {
                    if (!job.category) return '';
                    const primaryCat = String(job.category).split(',')[0].trim();
                    return `<span class="nurse-tag-category">${escapeAttr(primaryCat)}</span>`;
                  })()}
                  <span class="nurse-tag-category">Hospital & Clinic</span>
                </div>
                <a href="/job/${escapeAttr(job.slug)}" class="nurse-view-job-btn">View Job <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></a>
              </div>
            </article>
            ${index===0?`
              <div class="nurse-login-prompt">
                <div class="nurse-prompt-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div class="nurse-prompt-text">
                  <strong>Looking for your ideal nursing role?</strong>
                  <span>Get personalised UAE healthcare vacancies sent straight to your inbox.</span>
                </div>
                <a href="/login-register" class="nurse-prompt-btn">Login / Register</a>
              </div>
            `:''}
          `).join('')}
        </div>
        ${pager('/nurse-jobs-in-uae',total,pageLimit)}
      </section>

      <aside class="nurse-side-column">
        <a href="/resume-builder" class="nurse-resume-builder-card" aria-label="Open Trikonet Resume Builder">
          <span class="nurse-resume-builder-badge">FREE TOOL</span>
          <span class="nurse-resume-builder-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>
          </span>
          <span class="nurse-resume-builder-copy">
            <strong>Build your professional résumé</strong>
            <small>Create an ATS-friendly CV for UAE healthcare roles.</small>
          </span>
          <span class="nurse-resume-builder-action">Build my résumé <span aria-hidden="true">→</span></span>
        </a>

        <section class="nurse-side-card nurse-articles-card">
          <div class="nurse-side-card-header">
            <h3>Latest Articles</h3>
            <a href="/blog" class="nurse-side-see-all">View all &rarr;</a>
          </div>
          <div class="nurse-side-article-list">
            ${latestArticles.length?latestArticles.map(article => `
              <a href="${escapeAttr(getPostUrl(article))}" class="nurse-side-article-row">
                <span class="nurse-side-article-image">
                  <img src="${escapeAttr(article.featuredImage||'/assets/article-1.jpg')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='/assets/article-1.jpg'">
                </span>
                <span class="nurse-side-article-copy">
                  <small>${escapeAttr(article.categoryName||'Career Advice')}</small>
                  <strong>${escapeAttr(article.title)}</strong>
                  ${article.date?`<time>${escapeAttr(article.date)}</time>`:''}
                </span>
              </a>
            `).join(''):`<p class="nurse-side-article-empty">Published articles will appear here.</p>`}
          </div>
        </section>

        <section class="nurse-side-card nurse-alert-card">
          <div class="nurse-alert-card-top">
            <div class="nurse-alert-badge-icon">${iconBell}</div>
            <div>
              <h4>Nurse Job Alerts</h4>
              <p>Get newly posted hospital & clinic vacancies delivered to your inbox.</p>
            </div>
          </div>
          <form class="nurse-side-alert-form" action="/alerts-jobs" onsubmit="event.preventDefault(); alert('Subscribed to nurse job alerts!');">
            <input type="email" placeholder="Enter your email address..." class="nurse-side-email-input" required>
            <button type="submit" class="nurse-side-alert-btn">Subscribe Free</button>
          </form>
        </section>

        <section class="nurse-side-card">
          <div class="nurse-side-card-header">
            <h3>Share Jobs</h3>
          </div>
          <p class="nurse-side-share-txt">Know someone looking for a nurse job in the UAE?</p>
          <div class="nurse-side-share-btns">
            <a href="https://www.linkedin.com/company/trikonet-team" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on LinkedIn">${iconShareLinkedin} LinkedIn</a>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent('Healthcare Nurse Jobs in UAE: https://www.trikonet.com/nurse-jobs-in-uae')}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on WhatsApp">${iconShareWa} WhatsApp</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.trikonet.com/nurse-jobs-in-uae')}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on Facebook">${iconShareFb} Facebook</a>
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent('https://www.trikonet.com/nurse-jobs-in-uae')}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on X">${iconShareX} X</a>
          </div>
        </section>
      </aside>
    </section>
  </main>`;
}

function categoryPage(destination = null, allJobs = false) {
  const catSlug = path.replace('/category/', '').split('/')[0].split('?')[0];
  const cat = destination ? {name:destination.page.category,slug:slugifyCategory(destination.page.category)} : allJobs ? data.taxonomies.categories.find(c=>c.name===queryParams.get('category')) : findCategoryBySlug(catSlug);
  const categoryName = cat ? cat.name : allJobs ? 'All' : (catSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  const categoryCleanSlug = slugifyCategory(cat || categoryName);

  if (typeof document !== 'undefined') {
    document.title = `${categoryName.replace(/\s+jobs$/i,'')} Jobs${allJobs?' in UAE':''} — Trikonet`;
  }

  const pageLimit = 10;
  const decode=value=>{const node=document.createElement('textarea');node.innerHTML=String(value || '');return node.value;};
  const list = destination ? destination.jobs.map(record=>{const job=mapJob(record);return {...job,title:decode(job.title),company:decode(job.company),excerpt:decode(job.excerpt)};}) : data.jobs.slice(0, pageLimit);
  const total = destination ? destination.total : allJobs ? (data.counts?.job_listing ?? list.length) : (data.counts?.category || cat?.count || list.length);
  const start = list.length ? (currentPage - 1) * pageLimit + 1 : 0;
  const end = list.length ? Math.min(start + list.length - 1, total) : 0;

  const qQuery = queryParams.get('q') || '';
  const selectedLoc = destination?.page.location || queryParams.get('location') || '';
  const selectedType = queryParams.get('job_type') || '';
  const hasActiveFilters = !!(selectedLoc || selectedType || qQuery);

  const removeLocParams = new URLSearchParams(queryParams);
  removeLocParams.delete('location');
  removeLocParams.delete('page');
  const removeTypeParams = new URLSearchParams(queryParams);
  removeTypeParams.delete('job_type');
  removeTypeParams.delete('page');

  let pageTitle = `${escapeAttr(categoryName.replace(/\s+jobs$/i,''))} Jobs${allJobs?' in UAE':''}`;
  if (qQuery) pageTitle = `"${escapeAttr(qQuery)}" in ${escapeAttr(categoryName)}`;
  else if (selectedLoc) pageTitle = `${escapeAttr(categoryName)} Jobs in ${escapeAttr(selectedLoc)}`;
  pageTitle=destination?escapeAttr(destination.page.h1 || destination.page.title):pageTitle.replace(/Jobs Jobs/g,'Jobs');
  if(allJobs && !cat && !qQuery && !selectedLoc)pageTitle='Jobs in UAE';

  const iconCheckTick = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const iconBookmark = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
  const iconBell = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
  const iconBriefcase = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
  const iconPin = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const iconClock = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const latestArticles = (data.posts || [])
    .filter(article => article && article.slug && article.title)
    .slice(0, 3);
  const iconShareLinkedin = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`;
  const iconShareFb = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>`;
  const iconShareWa = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
  const iconShareX = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

  // Other related categories
  const otherCats = (data.taxonomies?.categories?.length ? data.taxonomies.categories : defaultTopCategories)
    .filter(c => c.name.toLowerCase() !== categoryName.toLowerCase())
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 8);

  return `<main class="nurse-results-page category-results-page">
    <section class="nurse-results-hero category-page-hero">
      <div class="wrap">
        <div class="nurse-hero-topline">
          <nav class="nurse-breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span class="sep">&gt;</span>
            <a href="/jobs">${allJobs && !cat ? 'Jobs in UAE' : 'Categories'}</a>
            ${allJobs && !cat ? '' : `<span class="sep">&gt;</span>${destination ? `<a href="/category/${escapeAttr(categoryCleanSlug)}">${escapeAttr(categoryName)}</a><span class="sep">&gt;</span><span class="current" aria-current="page">${escapeAttr(destination.page.location || 'UAE')}</span>` : `<span class="current" aria-current="page">${escapeAttr(categoryName)}</span>`}`}
          </nav>
        </div>
        <div class="category-hero-head">
          <div class="nurse-hero-title-row">
            <h1>${pageTitle}</h1>
            <span class="nurse-hero-count-tag">${Number(total).toLocaleString()} Active Vacancies</span>
          </div>
          <p class="nurse-hero-desc">Explore verified ${escapeAttr(categoryName)} job vacancies across Dubai, Abu Dhabi, Sharjah, and all UAE emirates with direct employer hiring.</p>
        </div>
        <div class="nurse-search-wrapper">
          ${searchBar({ keyword: allJobs?'Job Title, Keywords':`${categoryName} job title, role...`, category: allJobs?(cat?.name || 'All Categories'):categoryName, location:selectedLoc || 'Country or City', button: allJobs?'Find Jobs':'Search Category', action: allJobs?'/jobs':`/category/${categoryCleanSlug}` })}
        </div>
        <div class="category-popular-chips">
          <span class="chips-label">
            <span class="chips-label-desktop">Popular in ${escapeAttr(categoryName)}:</span>
            <span class="chips-label-mobile">Popular:</span>
          </span>
          <a href="/category/${categoryCleanSlug}?location=Dubai">Dubai</a>
          <a href="/category/${categoryCleanSlug}?location=Abu+Dhabi">Abu Dhabi</a>
          <a href="/category/${categoryCleanSlug}?location=Sharjah">Sharjah</a>
        </div>
      </div>
    </section>

    <section class="wrap nurse-results-layout category-results-layout">
      <aside class="filters nurse-site-filters jobs-filter-card">
        <div class="nurse-filter-header">
          <div class="nurse-filter-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>Filter Jobs</span>
          </div>
          ${hasActiveFilters ? `<a href="/category/${categoryCleanSlug}" class="nurse-filter-reset-link">Reset All</a>` : ''}
          <button type="button" class="jobs-filter-mobile-toggle" aria-expanded="false" aria-label="Show job filters"><span>Show filters</span><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
        </div>

        <div class="jobs-filter-collapsible">
        <div class="nurse-filter-group">
          <h3>Location</h3>
          ${sortUaeLocations((data.taxonomies?.locations || []).filter(l => ['UAE', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'].some(k => k.toLowerCase() === (l.name || '').toLowerCase()))).map(x => {
            const params = new URLSearchParams(queryParams);
            const isSelected = selectedLoc === x.name;
            if (isSelected) params.delete('location');
            else params.set('location', x.name);
            params.delete('page');
            const countText = x.count != null ? Number(x.count).toLocaleString() : '';
            return `<a class="nurse-filter-row${isSelected ? ' active' : ''}" href="/category/${categoryCleanSlug}?${params}">
              <span class="nurse-row-label">
                <span class="nurse-custom-cb">${iconCheckTick}</span>
                <span class="nurse-filter-name">${escapeAttr(x.name)}</span>
              </span>
              ${countText ? `<span class="nurse-filter-count">${countText}</span>` : ''}
            </a>`;
          }).join('')}
        </div>

        <div class="nurse-filter-group">
          <h3>Job type</h3>
          ${(data.taxonomies?.types || []).map(x => {
            const params = new URLSearchParams(queryParams);
            const isSelected = selectedType === x.name;
            if (isSelected) params.delete('job_type');
            else params.set('job_type', x.name);
            params.delete('page');
            const countText = x.count != null ? Number(x.count).toLocaleString() : '';
            return `<a class="nurse-filter-row${isSelected ? ' active' : ''}" href="/category/${categoryCleanSlug}?${params}">
              <span class="nurse-row-label">
                <span class="nurse-custom-cb">${iconCheckTick}</span>
                <span class="nurse-filter-name">${escapeAttr(x.name)}</span>
              </span>
              ${countText ? `<span class="nurse-filter-count">${countText}</span>` : ''}
            </a>`;
          }).join('')}
        </div>

        <div class="nurse-filter-group other-categories-group">
          <h3>Other Top Categories</h3>
          <div class="other-categories-list">
            ${otherCats.map(c => `
              <a class="other-category-link" href="/category/${slugifyCategory(c)}">
                <span class="other-cat-name">${escapeAttr(c.name)}</span>
                <span class="other-cat-count">${Number(c.count || 0).toLocaleString()}</span>
              </a>
            `).join('')}
          </div>
        </div>
        </div>
      </aside>

      <section class="nurse-results-main">
        <div class="nurse-results-tools">
          <div class="nurse-tools-top">
            <span class="nurse-tools-count">Showing <b>${start} – ${end}</b> ${escapeAttr(categoryName)} Jobs</span>
            <div class="nurse-tools-actions">
              <select class="nurse-sort-select" aria-label="Sort listings">
                <option>Most Relevant</option>
                <option>Newest First</option>
              </select>
              <button type="button" class="nurse-alert-trigger">${iconBell} Alert Me</button>
            </div>
          </div>
          ${(selectedLoc || selectedType || qQuery) ? `
            <div class="nurse-active-chips-bar">
              <span class="nurse-active-label">Active filters:</span>
              ${qQuery ? `<span class="nurse-active-chip">Keyword: "${escapeAttr(qQuery)}" <a href="/category/${categoryCleanSlug}?${(() => { const p = new URLSearchParams(queryParams); p.delete('q'); p.delete('page'); return p.toString(); })()}" title="Remove keyword">×</a></span>` : ''}
              ${selectedLoc ? `<span class="nurse-active-chip">${escapeAttr(selectedLoc)} <a href="/category/${categoryCleanSlug}?${removeLocParams}" title="Remove filter">×</a></span>` : ''}
              ${selectedType ? `<span class="nurse-active-chip">${escapeAttr(selectedType)} <a href="/category/${categoryCleanSlug}?${removeTypeParams}" title="Remove filter">×</a></span>` : ''}
              <a href="/category/${categoryCleanSlug}" class="nurse-clear-all-link">Clear all</a>
            </div>
          ` : ''}
        </div>

        <div class="nurse-job-list">
          ${list.length ? list.map((job) => `
            <article class="nurse-job-card">
              <div class="nurse-card-top">
                ${job.logo ? `
                  <div class="nurse-card-logo">
                    <img src="${escapeAttr(job.logo)}" alt="${escapeAttr(job.company)}">
                  </div>
                ` : `
                  <div class="nurse-card-logo-fallback">
                    <span>${escapeAttr(String(job.company || (typeof job.title === 'string' ? job.title : job.title?.rendered) || 'TJ').slice(0, 2).toUpperCase())}</span>
                  </div>
                `}
                <div class="nurse-card-info">
                  <div class="nurse-card-title-row">
                    <a href="/job/${escapeAttr(job.slug)}" class="nurse-job-title-link">
                      <h2>${escapeAttr(job.title)}</h2>
                    </a>
                    <button type="button" class="nurse-card-save-btn" title="Save job" aria-label="Save job">${iconBookmark}</button>
                  </div>
                  <div class="nurse-company-row">
                    <a class="comp-name company-profile-link" href="${escapeAttr(employerProfileHref(job))}">${escapeAttr(job.company || 'Employer')}</a>
                  </div>
                  <div class="nurse-job-meta-row">
                    <span class="nurse-meta-badge">${iconBriefcase} ${escapeAttr(job.type || 'Full Time')}</span>
                    <span class="nurse-meta-badge">${iconPin} ${escapeAttr(job.location || 'United Arab Emirates')}</span>
                    <span class="nurse-meta-badge">${iconClock} ${escapeAttr(job.date || 'Recently posted')}</span>
                  </div>
                  ${job.excerpt ? `
                    <p class="nurse-job-excerpt">${escapeAttr(cleanJobExcerpt(job.excerpt))}</p>
                  ` : ''}
                </div>
              </div>
              <div class="nurse-card-footer">
                <div class="nurse-footer-tags">
                  ${(() => {
                    if (!job.category) return '';
                    const primaryCat = String(job.category).split(',')[0].trim();
                    const categoryPage=seoInternalLinks.find(page=>page.pageType==='main_category' && page.category===primaryCat);
                    const categoryTerm=data.taxonomies.categories.find(term=>term.name===primaryCat);
                    const href=categoryPage?.href || (categoryTerm?`/category/${slugifyCategory(categoryTerm)}`:'');
                    return href?`<a class="nurse-tag-category" href="${escapeAttr(href)}">${escapeAttr(primaryCat)}</a>`:`<span class="nurse-tag-category">${escapeAttr(primaryCat)}</span>`;
                  })()}
                </div>
                <a href="/job/${escapeAttr(job.slug)}" class="nurse-view-job-btn">View Job <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></a>
              </div>
            </article>
          `).join('') : `
            <div class="nurse-empty-state">
              <h3>${data.jobsLoadError ? 'Jobs could not load. Please retry.' : 'No jobs found matching your criteria'}</h3>
              <p>${data.jobsLoadError ? 'The connection was interrupted. This does not mean there are no vacancies.' : `Try resetting filters or searching for different keywords within ${escapeAttr(categoryName)}.`}</p>
              <a href="${data.jobsLoadError ? escapeAttr(location.pathname + location.search) : `/category/${categoryCleanSlug}`}" class="primary" style="display:inline-block;margin-top:12px;padding:10px 20px;border-radius:8px;">${data.jobsLoadError ? 'Retry loading jobs' : 'Reset Filters'}</a>
            </div>
          `}
        </div>
        ${pager(destination ? path : `/category/${categoryCleanSlug}`, total, pageLimit)}
      </section>

      <aside class="nurse-side-column">
        <a href="/resume-builder" class="nurse-resume-builder-card" aria-label="Open Trikonet Resume Builder">
          <span class="nurse-resume-builder-badge">FREE TOOL</span>
          <span class="nurse-resume-builder-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>
          </span>
          <span class="nurse-resume-builder-copy">
            <strong>Build your professional résumé</strong>
            <small>Create an ATS-friendly CV for UAE ${escapeAttr(categoryName)} roles.</small>
          </span>
          <span class="nurse-resume-builder-action">Build my résumé <span aria-hidden="true">→</span></span>
        </a>

        <section class="nurse-side-card nurse-articles-card">
          <div class="nurse-side-card-header">
            <h3>Latest Articles</h3>
            <a href="/blog" class="nurse-side-see-all">View all &rarr;</a>
          </div>
          <div class="nurse-side-article-list">
            ${latestArticles.length ? latestArticles.map(article => `
              <a href="${escapeAttr(getPostUrl(article))}" class="nurse-side-article-row">
                <span class="nurse-side-article-image">
                  <img src="${escapeAttr(article.featuredImage || '/assets/article-1.jpg')}" alt="" loading="lazy" onerror="this.onerror=null;this.src='/assets/article-1.jpg'">
                </span>
                <span class="nurse-side-article-copy">
                  <small>${escapeAttr(article.categoryName || 'Career Advice')}</small>
                  <strong>${escapeAttr(article.title)}</strong>
                  ${article.date ? `<time>${escapeAttr(article.date)}</time>` : ''}
                </span>
              </a>
            `).join('') : `<p class="nurse-side-article-empty">Published articles will appear here.</p>`}
          </div>
        </section>

        <section class="nurse-side-card nurse-alert-card">
          <div class="nurse-alert-card-top">
            <div class="nurse-alert-badge-icon">${iconBell}</div>
            <div>
              <h4>${escapeAttr(categoryName)} Job Alerts</h4>
              <p>Get newly posted ${escapeAttr(categoryName)} vacancies delivered to your inbox.</p>
            </div>
          </div>
          <form class="nurse-side-alert-form" action="/alerts-jobs" onsubmit="event.preventDefault(); alert('Subscribed to job alerts!');">
            <input type="email" placeholder="Enter your email address..." class="nurse-side-email-input" required>
            <button type="submit" class="nurse-side-alert-btn">Subscribe Free</button>
          </form>
        </section>

        <section class="nurse-side-card">
          <div class="nurse-side-card-header">
            <h3>Share Jobs</h3>
          </div>
          <p class="nurse-side-share-txt">Know someone looking for a ${escapeAttr(categoryName)} job in the UAE?</p>
          <div class="nurse-side-share-btns">
            <a href="https://www.linkedin.com/company/trikonet-team" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on LinkedIn">${iconShareLinkedin} LinkedIn</a>
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${categoryName} Jobs in UAE: https://www.trikonet.com/category/${categoryCleanSlug}`)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on WhatsApp">${iconShareWa} WhatsApp</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.trikonet.com/category/${categoryCleanSlug}`)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on Facebook">${iconShareFb} Facebook</a>
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.trikonet.com/category/${categoryCleanSlug}`)}" target="_blank" rel="noopener noreferrer nofollow" class="nurse-share-pill" aria-label="Share on X">${iconShareX} X</a>
          </div>
        </section>
      </aside>
    </section>
  </main>`;
}
function employers() { return renderEmployerDirectory({data,queryParams,currentPage,pageSize,pager}); }

function about(){return `<main><section class="subhero"><h1>About Us</h1></section><article class="content"><h1>Welcome to Trikonet!</h1><p>${data.pages.about.content}</p><p>Founded by two passionate friends, our journey started with Medbiomate, a successful venture focused on healthcare jobs in the GCC region. Inspired by our early success, we realized the vast potential and growing demand for diverse job opportunities across industries.</p><h2>Your Dream Jobs Are Waiting</h2><p>Our mission is to connect talent with the right opportunities, helping job seekers discover and achieve their career dreams.</p><h2>How We Work</h2><p>We source trusted opportunities, assess job quality and collaborate with companies before showcasing verified roles to job seekers.</p></article></main>`}
function blog() {
  const initialQ = queryParams.get('q') || '';
  const initialCat = queryParams.get('category') || 'All';
  const initialSort = queryParams.get('sort') || 'recent';

  const categories = [
    'All',
    'Interview Tips',
    'Interview Questions',
    'Resume & ATS',
    'Visa & Labour Laws',
    'Career Advice',
    'Health & Wellness'
  ];

  return `
  <main class="blog-directory-page">
    <div class="wrap">
      <!-- Blue Gradient Banner Matching User Screenshot -->
      <section class="blog-banner-strip" aria-label="Career Tips Banner">
        <div class="blog-banner-info">
          <h1>Career Tips</h1>
          <p>Read from these articles curated specially for your job journey</p>
        </div>
        <div class="blog-banner-search">
          <form class="blog-search-pill" id="blogSearchForm" action="/blog" onsubmit="event.preventDefault(); if(window.applyBlogFilters) window.applyBlogFilters();">
            <span class="blog-search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input type="search" id="blogSearchInput" name="q" value="${escapeAttr(initialQ)}" placeholder="Search for articles here..." aria-label="Search for articles">
            <button type="submit" class="blog-search-submit" id="blogSearchBtn">Search Articles</button>
          </form>
        </div>
      </section>

      <!-- Category Filter Tabs & Sort Controls -->
      <div class="blog-controls-bar">
        <div class="blog-cat-tabs" id="blogCatTabs" role="tablist" aria-label="Article categories">
          ${categories.map(cat => `
            <button type="button" class="blog-cat-tab ${cat === initialCat ? 'active' : ''}" data-cat="${escapeAttr(cat)}" role="tab" aria-selected="${cat === initialCat ? 'true' : 'false'}">
              ${cat === 'All' ? 'All Articles' : escapeAttr(cat)}
            </button>
          `).join('')}
        </div>
        <div class="blog-sort-wrap">
          <label for="blogSortSelect">Sort by:</label>
          <select id="blogSortSelect" aria-label="Sort articles">
            <option value="recent" ${initialSort === 'recent' ? 'selected' : ''}>Most Recent</option>
            <option value="oldest" ${initialSort === 'oldest' ? 'selected' : ''}>Oldest</option>
            <option value="az" ${initialSort === 'az' ? 'selected' : ''}>Title (A - Z)</option>
            <option value="za" ${initialSort === 'za' ? 'selected' : ''}>Title (Z - A)</option>
          </select>
        </div>
      </div>

      <!-- Results Meta Information -->
      <div class="blog-results-meta" id="blogResultsMeta" aria-live="polite">
        Showing all articles
      </div>

      <!-- Articles Grid -->
      <div class="blog-grid" id="blogArticlesGrid">
        <!-- Rendered dynamically by initBlogDirectory() -->
      </div>
    </div>
  </main>`;
}

function initBlogDirectory() {
  if (path !== '/blog') return;

  const searchInput = document.getElementById('blogSearchInput');
  const catTabs = document.querySelectorAll('.blog-cat-tab');
  const sortSelect = document.getElementById('blogSortSelect');
  const grid = document.getElementById('blogArticlesGrid');
  const meta = document.getElementById('blogResultsMeta');

  if (!grid) return;

  let currentCategory = queryParams.get('category') || 'All';
  let currentSearch = (searchInput ? searchInput.value : '') || queryParams.get('q') || '';
  let currentSort = (sortSelect ? sortSelect.value : '') || queryParams.get('sort') || 'recent';

  function renderArticles() {
    let posts = [...(data.posts || [])];

    // Filter by category
    if (currentCategory && currentCategory !== 'All') {
      posts = posts.filter(p => (p.categoryName || '').toLowerCase() === currentCategory.toLowerCase());
    }

    // Filter by search query
    const q = (currentSearch || '').trim().toLowerCase();
    if (q) {
      posts = posts.filter(p => {
        const title = (p.title || '').toLowerCase();
        const excerpt = (p.excerpt || '').toLowerCase();
        const cat = (p.categoryName || '').toLowerCase();
        return title.includes(q) || excerpt.includes(q) || cat.includes(q);
      });
    }

    // Sort articles
    if (currentSort === 'recent') {
      posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    } else if (currentSort === 'oldest') {
      posts.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    } else if (currentSort === 'az') {
      posts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (currentSort === 'za') {
      posts.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    // Update meta text
    if (meta) {
      const catLabel = currentCategory === 'All' ? 'articles' : `articles in "${escapeAttr(currentCategory)}"`;
      const queryLabel = q ? ` matching "${escapeAttr(q)}"` : '';
      meta.innerHTML = `Showing <strong>${posts.length}</strong> ${catLabel}${queryLabel}`;
    }

    // Empty state
    if (!posts.length) {
      grid.innerHTML = `
        <div class="blog-empty-state">
          <div class="bes-icon">🔍</div>
          <h3>No articles found</h3>
          <p>We couldn't find any articles matching your search criteria. Try a different keyword or category.</p>
        </div>
      `;
      return;
    }

    // Render cards
    grid.innerHTML = posts.map((p, idx) => {
      const cover = p.featuredImage || `/assets/article-${(idx % 3) + 1}.jpg`;
      const postUrl = getPostUrl(p);
      const catBadge = p.categoryName || 'Career Advice';
      return `
        <article class="blog-card" data-slug="${escapeAttr(p.slug)}">
          <a class="blog-card-media" href="${postUrl}" aria-label="${escapeAttr(p.title)}">
            <img src="${escapeAttr(cover)}" alt="${escapeAttr(p.title)}" loading="lazy" onerror="this.onerror=null;this.src='/assets/article-${(idx % 3) + 1}.jpg';">
            <span class="blog-card-cat-badge">${escapeAttr(catBadge)}</span>
          </a>
          <div class="article-body">
            <small class="blog-card-date">${escapeAttr(p.date || '')}</small>
            <h3><a href="${postUrl}">${p.title}</a></h3>
            <p>${escapeAttr(p.excerpt || '').slice(0, 140)}${p.excerpt && p.excerpt.length > 140 ? '...' : ''}</p>
            <a class="read" href="${postUrl}">Read Article <span aria-hidden="true">&rsaquo;</span></a>
          </div>
        </article>
      `;
    }).join('');
  }

  // Category tab clicking
  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentCategory = tab.dataset.cat || 'All';
      renderArticles();
    });
  });

  // Search input live typing & debounce
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = searchInput.value;
        renderArticles();
      }, 150);
    });
  }

  // Sort dropdown change
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderArticles();
    });
  }

  window.applyBlogFilters = function() {
    if (searchInput) currentSearch = searchInput.value;
    renderArticles();
  };

  // Initial render
  renderArticles();
}
function ensureTocTitles(html=''){
  return String(html).replace(/(<div\b[^>]*class=["'][^"']*wp-block-rank-math-toc-block[^"']*["'][^>]*>)(\s*)(<nav\b)/gi,(match,open,space,nav)=>`${open}${space}<h2 class="toc-title">Table of Contents</h2>${space}${nav}`);
}
function estimateReadingTime(text=''){const words=String(text).replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;return Math.max(1,Math.round(words/200))||3}
function post(p){
  const postTitle=decodeHtml(p.title||'');
  const content=ensureTocTitles(restoreArticleImages(p.content||`<p>${p.excerpt}</p>`));
  const featured=p.featuredImage?`<figure class="post-featured-image"><img src="${escapeAttr(p.featuredImage)}" alt="${escapeAttr(p.title)}"></figure>`:'';
  const prefix = p.urlPrefix || p.url_prefix || POST_SLUG_PREFIXES[p.slug] || 'blog';
  const categoryName=p.categoryName||CATEGORY_PREFIX_LABELS[prefix]||(p.category!=='blog'?p.category:'Career Advice');
  const catHref = `/${prefix}`;
  const readTime=estimateReadingTime(p.content||p.excerpt);
  const authorName=p.authorName||(p.author&&p.author!=='Trikonet'?p.author:'')||'';
  const authorImg=p.authorImage||'';
  const reviewerName=p.reviewer||'';
  const reviewerImg=p.reviewerImage||'';
  const showAuthor=Boolean(p.showAuthor);
  const showReviewer=Boolean(p.showReviewer);
  const authorAvatarHtml = authorImg
    ? `<img src="${escapeAttr(authorImg)}" alt="${escapeAttr(authorName)}" class="byline-avatar">`
    : `<div class="byline-avatar byline-avatar-placeholder" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`;
  const reviewerAvatarHtml = reviewerImg
    ? `<img src="${escapeAttr(reviewerImg)}" alt="${escapeAttr(reviewerName)}" class="byline-avatar">`
    : `<div class="byline-avatar byline-avatar-placeholder" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`;
  const authorByline=showAuthor?`<div class="post-byline-card">
    ${authorAvatarHtml}
    <div class="byline-info"><div class="byline-role"><svg class="byline-role-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b00008" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg><span>${escapeAttr(p.authorRole||'Written By')}</span></div><a href="${escapeAttr(p.authorLink||'#')}" class="byline-name">${escapeAttr(authorName)}</a></div>
  </div>`:'';
  const reviewerByline=showReviewer?`<div class="post-byline-card">
    ${reviewerAvatarHtml}
    <div class="byline-info"><div class="byline-role"><svg class="byline-role-icon" width="15" height="15" viewBox="0 0 24 24" fill="#b00008"><circle cx="12" cy="12" r="10" fill="#b00008"/><path d="m9 12 2 2 4-4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg><span>${escapeAttr(p.reviewerRole||'Reviewed by:')}</span></div><a href="${escapeAttr(p.reviewerLink||'#')}" class="byline-name">${escapeAttr(reviewerName)}</a></div>
  </div>`:'';
  return `<main class="blog-post-page">
    <section class="subhero post-subhero">
      <div class="wrap">
        <nav class="post-breadcrumbs" aria-label="Breadcrumbs">
          <a href="/">Trikonet</a>
          <span class="bc-sep">&gt;</span>
          <a href="/blog">Blogs</a>
          ${categoryName ? `<span class="bc-sep">&gt;</span><a href="${catHref}">${escapeAttr(categoryName)}</a>` : ''}
          <span class="bc-sep">&gt;</span>
          <span class="bc-current" aria-current="page">${escapeAttr(postTitle)}</span>
        </nav>
        <h1 class="post-headline">${escapeAttr(postTitle)}</h1>
      </div>
    </section>
    <article class="content post-article-content">
      <div class="post-header-meta">
        <div class="post-meta-badges">
          <a href="${catHref}" class="post-cat-badge" style="text-decoration:none;">${escapeAttr(categoryName)}</a>
          <span class="post-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${escapeAttr(p.date)}
          </span>
          <span class="post-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${readTime} min read
          </span>
        </div>
        ${(showAuthor||showReviewer)?`<div class="post-bylines-container">${authorByline}${showAuthor&&showReviewer?'<div class="byline-separator" aria-hidden="true"></div>':''}${reviewerByline}</div>`:''}
      </div>
      ${featured}
      ${content}
      ${renderContentFeedback(p)}
      ${renderRelatedArticles(p)}
    </article>
  </main>`;
}

function renderContentFeedback(p) {
  const postId = p.id || p.slug;
  return `
    <section class="content-feedback-section" aria-label="Content feedback">
      <div class="content-feedback-card" id="feedback-card-${escapeAttr(postId)}">
        <div class="feedback-confetti left" aria-hidden="true">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="15" cy="22" r="3" fill="#f59e0b"/>
            <rect x="36" y="14" width="3.5" height="9" rx="1.75" transform="rotate(28 36 14)" fill="#f59e0b"/>
            <circle cx="58" cy="24" r="2.5" fill="#cbd5e1"/>
            <rect x="78" y="18" width="3.5" height="8" rx="1.75" transform="rotate(-32 78 18)" fill="#f59e0b"/>
            <circle cx="18" cy="48" r="2.5" fill="#94a3b8"/>
            <rect x="42" y="44" width="3.5" height="9" rx="1.75" transform="rotate(42 42 44)" fill="#f59e0b"/>
            <circle cx="68" cy="54" r="3" fill="#cbd5e1"/>
            <rect x="14" y="74" width="3.5" height="8" rx="1.75" transform="rotate(-22 14 74)" fill="#f59e0b"/>
            <circle cx="45" cy="82" r="3" fill="#f59e0b"/>
            <circle cx="74" cy="86" r="2.5" fill="#94a3b8"/>
            <rect x="32" y="100" width="3.5" height="8" rx="1.75" transform="rotate(18 32 100)" fill="#cbd5e1"/>
          </svg>
        </div>
        <div class="feedback-inner">
          <h3 class="feedback-title">Did you find this content helpful?</h3>
          <div class="feedback-rating-group" role="group" aria-label="Rate this content from 1 to 5">
            <div class="feedback-btn-col">
              <button type="button" class="feedback-rate-btn" data-rate="1" data-post-id="${escapeAttr(postId)}" aria-label="1 - Dissatisfied">1</button>
              <span class="feedback-label">Dissatisfied</span>
            </div>
            <div class="feedback-btn-col">
              <button type="button" class="feedback-rate-btn" data-rate="2" data-post-id="${escapeAttr(postId)}" aria-label="2">2</button>
            </div>
            <div class="feedback-btn-col">
              <button type="button" class="feedback-rate-btn" data-rate="3" data-post-id="${escapeAttr(postId)}" aria-label="3">3</button>
            </div>
            <div class="feedback-btn-col">
              <button type="button" class="feedback-rate-btn" data-rate="4" data-post-id="${escapeAttr(postId)}" aria-label="4">4</button>
            </div>
            <div class="feedback-btn-col">
              <button type="button" class="feedback-rate-btn" data-rate="5" data-post-id="${escapeAttr(postId)}" aria-label="5 - Very satisfied">5</button>
              <span class="feedback-label">Very satisfied</span>
            </div>
          </div>
          <div class="feedback-divider"></div>
          <div class="feedback-stats">
            <strong>Rated 4.9/5</strong> by <span class="feedback-count">2023</span> Users
          </div>
          <div class="feedback-toast" style="display:none;" aria-live="polite">
            <span>🎉 Thank you for your feedback!</span>
          </div>
        </div>
        <div class="feedback-confetti right" aria-hidden="true">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="105" cy="22" r="3" fill="#f59e0b"/>
            <rect x="84" y="14" width="3.5" height="9" rx="1.75" transform="rotate(-28 84 14)" fill="#f59e0b"/>
            <circle cx="62" cy="24" r="2.5" fill="#cbd5e1"/>
            <rect x="42" y="18" width="3.5" height="8" rx="1.75" transform="rotate(32 42 18)" fill="#f59e0b"/>
            <circle cx="102" cy="48" r="2.5" fill="#94a3b8"/>
            <rect x="78" y="44" width="3.5" height="9" rx="1.75" transform="rotate(-42 78 44)" fill="#f59e0b"/>
            <circle cx="52" cy="54" r="3" fill="#cbd5e1"/>
            <rect x="106" y="74" width="3.5" height="8" rx="1.75" transform="rotate(22 106 74)" fill="#f59e0b"/>
            <circle cx="75" cy="82" r="3" fill="#f59e0b"/>
            <circle cx="46" cy="86" r="2.5" fill="#94a3b8"/>
            <rect x="88" y="100" width="3.5" height="8" rx="1.75" transform="rotate(-18 88 100)" fill="#cbd5e1"/>
          </svg>
        </div>
      </div>
    </section>
  `;
}

function renderRelatedArticles(currentPost) {
  const currentCat = currentPost.categoryName || currentPost.category || 'Career Advice';
  const allPosts = data.posts || [];
  
  // Find posts with the same category
  const sameCat = allPosts.filter(p => 
    p.slug !== currentPost.slug && 
    (p.categoryName === currentCat || p.category === currentCat)
  );

  // If fewer than 9, backfill with other posts for a balanced grid
  const otherPosts = allPosts.filter(p => 
    p.slug !== currentPost.slug && 
    !sameCat.some(sp => sp.slug === p.slug)
  );

  const related = [...sameCat, ...otherPosts].slice(0, 9);
  if (!related.length) return '';

  return `
    <section class="related-category-section" aria-label="Other articles in ${escapeAttr(currentCat)}">
      <div class="related-category-header">
        <span class="rc-line" aria-hidden="true"></span>
        <h2>Other Important Articles about ${escapeAttr(currentCat)}</h2>
        <span class="rc-line" aria-hidden="true"></span>
      </div>
      <div class="related-category-box">
        <div class="related-articles-grid">
          ${related.map(rp => `
            <a href="${getPostUrl(rp)}" class="related-article-card">
              <span>${escapeAttr(rp.title)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
function jobDetail(j){
  const w=j?.type==='job_listing'?j:null,m=w?.metas||{};
  const title=w?.title?.rendered||j?.title||'Job';
  const company=m._job_employer_name||j?.company||'';
  const categories=m._job_category?Object.values(m._job_category).join(', '):j?.category||'';
  const location=m._job_location?Object.values(m._job_location).join(', '):j?.location||'';
  const type=m._job_type?Object.values(m._job_type).join(', '):j?.type||'';
  const date=resolveJobDate(w||j),deadline=resolveJobDeadline(w||j),logo=m._job_logo||j?.logo||'';
  const content=w?.content?.rendered||j?.content||'<p>Job information will appear here.</p>';
  return `<main class="detail-page"><section class="detail-hero"><div class="wrap detail-hero-inner">${logo?`<img class="detail-logo" src="${escapeAttr(logo)}" alt="${escapeAttr(company)}">`:''}<div class="detail-title"><h1>${escapeAttr(title)}</h1><div class="detail-meta">${categories?`<span>▣ &nbsp;${escapeAttr(categories)}</span>`:''}${location?`<span>⌖ &nbsp;${escapeAttr(location)}</span>`:''}${date?`<span>◷ &nbsp;${escapeAttr(date)}</span>`:''}</div>${type?`<span class="tag">${escapeAttr(type)}</span>`:''}</div><div class="detail-actions"><a class="primary apply" href="${escapeAttr(m._job_apply_url||j?.applyUrl||'#')}" target="_blank" rel="noopener noreferrer nofollow">Apply Now</a></div></div></section><div class="wrap detail-grid"><article class="job-description"><h2>▣ Job Description</h2><div class="wordpress-content">${content}</div></article><aside><div class="overview"><h2>Job Overview</h2><dl>${date?`<dt>▣</dt><dd><b>Date Posted</b><span>${escapeAttr(date)}</span></dd>`:''}${location?`<dt>⌖</dt><dd><b>Location</b><span>${escapeAttr(location)}</span></dd>`:''}</dl></div></aside></div></main>`;
}
function employerDetail(e){
  const m=e?.metas||{},title=e?.title?.rendered||e?.title||'Employer',logo=m._employer_logo||e?.logo||'',category=m._employer_category?Object.values(m._employer_category).join(', '):e?.category||'Company',location=m._employer_location?Object.values(m._employer_location).join(', '):e?.location||'',content=e?.content?.rendered||e?.content||'<p>Company information will appear here.</p>';
  return `<main class="detail-page"><section class="detail-hero employer-hero"><div class="wrap detail-hero-inner">${logo?`<img class="detail-logo" src="${escapeAttr(logo)}" alt="${escapeAttr(title)}">`:''}<div class="detail-title"><h1>${escapeAttr(title)}</h1><div class="detail-meta"><span>▣ &nbsp;${escapeAttr(category)}</span>${location?`<span>⌖ &nbsp;${escapeAttr(location)}</span>`:''}</div><span class="tag">Open Jobs</span></div></div></section><div class="wrap detail-grid employer-detail-grid"><article class="job-description"><h2>About Company</h2><div class="wordpress-content">${content}</div></article></div></main>`;
}
function decodeHtml(value) {
  if (!value) return '';
  let str = String(value);
  for (let i = 0; i < 3; i++) {
    if (!str.includes('&')) break;
    const box = document.createElement('textarea');
    box.innerHTML = str;
    str = box.value;
  }
  return str;
}
function cleanJobExcerpt(value) {
  const raw = typeof value === 'object' && value ? (value.rendered || value.raw || '') : value;
  if (!raw) return '';
  const container = document.createElement('div');
  container.innerHTML = decodeHtml(raw);
  return decodeHtml(container.textContent || container.innerText || '')
    .replace(/[\u00a0\u2007\u202f]+/g, ' ')
    .replace(/\s*•\s*/g, ' • ')
    .replace(/(?:\s*•\s*){2,}/g, ' • ')
    .replace(/\s+/g, ' ')
    .trim();
}
function faq(){return `<main><section class="subhero"><h1>FAQ</h1></section><div class="content faq"><h2>History Of Trikonet</h2>${[['Who is Trikonet?','Trikonet is a job platform connecting job seekers with employment opportunities in the UAE and other Middle Eastern countries.'],['How The Trikonet Started?','Trikonet was founded after the success of Medbiomate highlighted the need for a broader job platform.'],['How are Trikonet and Medbiomate connected?','Both platforms share founders and a commitment to connecting qualified candidates with trusted opportunities.']].map(x=>`<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}</div></main>`}
function contact(){return `<main><section class="subhero"><h1>Contact Us</h1></section><div class="content contact-grid"><div><h2>Get in touch</h2><p>Questions about jobs, employers or your Trikonet account? Send us a message.</p><p><b>Email</b><br>info@trikonet.com</p></div><form class="form-card" id="contact"><label>Name<input required></label><label>Email<input type="email" required></label><label>Message<textarea required></textarea></label><button class="primary">Send Message</button></form></div></main>`}
function employerSignupComingSoon(){return `<main class="employer-coming-soon"><section class="employer-coming-card"><div class="employer-coming-icon" aria-hidden="true">🏢</div><span class="employer-coming-eyebrow">FOR EMPLOYERS</span><h1>Employer job posting is coming soon</h1><p>Employer registration and job posting are not open yet. We are preparing the employer portal and will launch it shortly.</p><div class="employer-coming-actions"><a class="employer-coming-primary" href="/jobs">Browse Jobs</a><a class="employer-coming-secondary" href="/contact">Contact Us</a></div><small>Thank you for your interest in hiring through Trikonet.</small></section></main>`}
function calculateCandidateCompletion(p) {
  if (!p || typeof p !== 'object') return 0;
  const values = [p.name, p.email, p.phone, p.currentLocation, p.role || p.currentDesignation, p.experience, p.qualification || p.degree, p.category, p.skills, p.locations];
  const filled = value => Array.isArray(value) ? value.some(item => String(item).trim()) : Boolean(String(value || '').trim());
  return Math.round(values.filter(filled).length / values.length * 100);
}

let candidateProfileWorkspace, initCandidateProfile = () => {};

function memberCollectionKey(kind){
  const userKey=currentUser?.id||currentUser?.email||'member';
  return `trikonet_${kind}_${userKey}`;
}
function readMemberCollection(kind){
  try{const value=JSON.parse(localStorage.getItem(memberCollectionKey(kind))||'[]');return Array.isArray(value)?value:[]}catch{return []}
}
function memberWorkspacePage(kind){
  if(!currentUser)return `<main class="member-workspace member-workspace-locked"><section><h1>Sign in to continue</h1><p>Your personal career lists are available after signing in.</p><a href="/login?redirect=${encodeURIComponent(path)}">Sign in</a></section></main>`;
  const config={
    'saved_jobs':{title:'Saved jobs',eyebrow:'YOUR SHORTLIST',description:'Jobs you saved to review and apply for later.',emptyTitle:'No saved jobs yet',emptyText:'Save a role from any job page and it will appear here.',action:'/jobs',actionText:'Browse jobs'},
    'applied_jobs':{title:'Applied jobs',eyebrow:'APPLICATION TRACKER',description:'Keep track of the opportunities you have opened to apply.',emptyTitle:'No applications tracked yet',emptyText:'When you select Apply Now on a job, it will be added here.',action:'/jobs',actionText:'Find jobs'},
    'followed_companies':{title:'Followed companies',eyebrow:'YOUR EMPLOYERS',description:'Companies you follow for quick access to their profiles and openings.',emptyTitle:'No followed companies yet',emptyText:'Follow a company from its employer page and it will appear here.',action:'/employers',actionText:'Explore employers'}
  }[kind];
  const items=readMemberCollection(kind);
  const isCompanies=kind==='followed_companies';
  const cards=items.map(item=>{
    const href=isCompanies?`/employer/${escapeAttr(item.slug||'')}`:`/job/${escapeAttr(item.slug||'')}`;
    const title=escapeAttr(item.title||item.name||'Untitled');
    const subtitle=escapeAttr(isCompanies?(item.category||item.location||'Employer'):[item.company,item.location,item.type].filter(Boolean).join(' · ')||'Job opportunity');
    const initial=escapeAttr(String(item.title||item.name||'T').charAt(0).toUpperCase());
    return `<article class="member-list-card"><a class="member-list-logo" href="${href}">${item.logo?`<img src="${escapeAttr(item.logo)}" alt="">`:`<span>${initial}</span>`}</a><div><a href="${href}" class="member-list-title">${title}</a><p>${subtitle}</p>${item.savedAt||item.appliedAt||item.followedAt?`<small>${kind==='applied_jobs'?'Opened to apply':'Saved'} ${new Date(item.appliedAt||item.savedAt||item.followedAt).toLocaleDateString()}</small>`:''}</div><a class="member-list-open" href="${href}">View <span>→</span></a></article>`;
  }).join('');
  return `<main class="member-workspace"><div class="member-workspace-wrap"><header><span>${config.eyebrow}</span><h1>${config.title}</h1><p>${config.description}</p></header>${items.length?`<section class="member-list-grid">${cards}</section>`:`<section class="member-list-empty"><div>${isCompanies?'⌂':'☆'}</div><h2>${config.emptyTitle}</h2><p>${config.emptyText}</p><a href="${config.action}">${config.actionText}</a></section>`}</div></main>`;
}

function accountPage(forcedMode) {
  if (currentUser) {
    return candidateProfileWorkspace(currentUser.profile || {});
  }

  const isRegister = forcedMode === 'register' || path === '/register' || path === '/signup' || path === '/sign-up' || queryParams.get('tab') === 'register' || queryParams.get('mode') === 'signup';

  return `<main class="auth-page auth-entry-page">
    <div class="auth-ambient-glow"></div>

    <section class="auth-brand-panel" aria-label="Trikonet member benefits">
      <div class="auth-brand-orbit"></div>
      <a href="/" class="auth-brand-logo"><img src="/assets/logo-black.png" alt="Trikonet"></a>
      <div class="auth-brand-content">
        <span class="auth-brand-kicker">Your career workspace</span>
        <h2>Move your career<br>forward.</h2>
        <p>Discover verified opportunities, connect with leading UAE employers, and keep every application organised.</p>
        <div class="auth-brand-benefits">
          <div><span>✓</span> Save and revisit jobs that match your goals</div>
          <div><span>✓</span> Apply faster with one secure profile</div>
          <div><span>✓</span> Stay updated on new opportunities</div>
        </div>
      </div>
      <div class="auth-brand-foot">Trusted opportunities across the UAE & GCC</div>
    </section>

    <div class="auth-card-shell">
      <div class="auth-card-header">
        <a href="/" class="auth-card-logo">
          <img src="${escapeAttr(resolveLogo(null,'/assets/logo-black.png'))}" alt="Trikonet logo">
        </a>
      </div>

      <!-- Segmented Tab Switcher -->
      <nav class="auth-tabs" role="tablist" aria-label="Account Options">
        <a href="/login" class="auth-tab ${!isRegister ? 'active' : ''}" data-target="login" role="tab" aria-selected="${!isRegister}">
          <span>Sign In</span>
        </a>
        <a href="/register" class="auth-tab ${isRegister ? 'active' : ''}" data-target="register" role="tab" aria-selected="${isRegister}">
          <span>Create Account</span>
        </a>
      </nav>

      <!-- SIGN IN VIEW -->
      <div class="auth-view-login ${!isRegister ? 'active-view' : 'hidden-view'}" id="authViewLogin">
        <div class="auth-title-box">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to manage your saved jobs, email campaigns, and employer applications.</p>
        </div>

        <form id="loginForm" class="auth-form" novalidate autocomplete="off">
          <div class="form-group">
            <label for="loginEmail">Email Address</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" id="loginEmail" name="email" value="" placeholder="name@domain.com" autocomplete="off" data-lpignore="true" autocapitalize="off" spellcheck="false" required>
            </div>
          </div>

          <div class="form-group">
            <label for="loginPassword">Password</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" id="loginPassword" name="password" value="" placeholder="••••••••" autocomplete="new-password" data-lpignore="true" required>
              <button type="button" class="toggle-password" data-target="loginPassword" aria-label="Toggle password visibility">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div class="auth-row-remember">
            <label class="custom-check">
              <input type="checkbox" name="remember">
              <span>Remember me on this browser</span>
            </label>
          </div>

          <button type="submit" class="auth-submit-btn">
            <span>Sign In</span>
            <svg class="arrow-svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>

          <div class="form-message" aria-live="polite"></div>
        </form>

        <div class="auth-divider"><span>or continue with</span></div>

        <div class="auth-social-row auth-google-row">
          <div class="auth-google-button" data-google-signin></div>
          <p class="form-message" data-google-message aria-live="polite">Loading Google sign-in…</p>
        </div>

        <footer class="auth-footer-prompt">
          <a href="#password-reset" class="forgot-link" data-password-reset>Forgot password?</a>
        </footer>
      </div>

      <!-- CREATE ACCOUNT / SIGN UP VIEW -->
      <div class="auth-view-register ${isRegister ? 'active-view' : 'hidden-view'}" id="authViewRegister">
        <div class="auth-title-box">
          <h1 class="auth-title">Create Your Account</h1>
          <p class="auth-subtitle">Join Trikonet to connect with employers, apply to vacancies, and manage career alerts.</p>
        </div>

        <form id="registerForm" class="auth-form" novalidate autocomplete="off">
          <div class="form-row-2col">
            <div class="form-group">
              <label for="regName">Full Name</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="regName" name="name" placeholder="e.g. Sarah Mansoor" autocomplete="name" required>
              </div>
            </div>

            <div class="form-group">
              <label for="regEmail">Email Address</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input type="email" id="regEmail" name="email" value="" placeholder="name@domain.com" autocomplete="off" data-lpignore="true" autocapitalize="off" spellcheck="false" required>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="regPassword">Password</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" id="regPassword" name="password" minlength="8" placeholder="At least 8 characters" autocomplete="new-password" data-lpignore="true" required>
              <button type="button" class="toggle-password" data-target="regPassword" aria-label="Toggle password visibility">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <span class="input-hint">Must be at least 8 characters long.</span>
          </div>

          <div class="auth-row-remember">
            <label class="custom-check">
              <input type="checkbox" name="terms" required checked>
              <span>I agree to Trikonet's <a href="/faq" target="_blank">Terms of Service</a> & <a href="/faq" target="_blank">Privacy Policy</a></span>
            </label>
          </div>

          <button type="submit" class="auth-submit-btn">
            <span>Create Free Account</span>
            <svg class="arrow-svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>

          <div class="form-message" aria-live="polite"></div>
        </form>

        <div class="auth-divider"><span>or continue with</span></div>

        <div class="auth-social-row auth-google-row">
          <div class="auth-google-button" data-google-signin></div>
          <p class="form-message" data-google-message aria-live="polite">Loading Google sign-in…</p>
        </div>

        <footer class="auth-footer-prompt">
          <a href="#password-reset" class="forgot-link" data-password-reset>Forgot password?</a>
        </footer>
      </div>
    </div>
  </main>`;
}
const emailTemplates=[['Job alert','New opportunities selected for you','<h2>New jobs for you</h2><p>We found new opportunities that match your profile.</p>'],['Application update','Your application status','<h2>Application update</h2><p>There is an update about your recent application.</p>'],['Welcome','Welcome to Trikonet','<h2>Welcome to Trikonet</h2><p>Your account is ready. Start exploring new opportunities.</p>']];
function campaignsPage(){if(!currentUser)return `<main class="member-page"><section class="member-card locked"><span class="lock-icon">🔒</span><h1>Sign in to use email campaigns</h1><p>Create and edit templates, save drafts, resume later, and keep your sending history private to your account.</p><a class="primary" href="/login">Sign up or log in</a></section></main>`;return `<main class="campaign-page"><header class="campaign-heading"><div><span class="eyebrow">MEMBER FEATURE</span><h1>Email campaigns</h1><p>Compose from a template, save your work, and resume it anytime.</p></div><button class="primary" id="newCampaign">New email</button></header><div class="campaign-layout"><aside class="template-panel"><h2>Templates</h2>${emailTemplates.map((t,i)=>`<button class="template-choice" data-template="${i}"><b>${t[0]}</b><span>${t[1]}</span></button>`).join('')}</aside><section class="composer member-card"><form id="campaignForm"><input type="hidden" name="id"><label>Campaign name<input name="name" required placeholder="e.g. Dubai nurse jobs — September"></label><label>Recipients<textarea name="recipients" rows="2" placeholder="email@example.com, another@example.com"></textarea></label><label>Subject<input name="subject" required></label><label>Email content<div class="email-toolbar"><button type="button" data-command="bold"><b>B</b></button><button type="button" data-command="italic"><i>I</i></button><button type="button" data-command="insertUnorderedList">• List</button></div><div class="email-editor" contenteditable="true" role="textbox" aria-label="Email content"></div></label><div class="campaign-actions"><button class="primary" type="submit">Save draft</button><button class="outline" type="button" id="sendCampaign">Send email</button></div><p class="form-message" aria-live="polite"></p></form></section><aside class="draft-panel"><h2>Saved & history</h2>${emailCampaigns.length?emailCampaigns.map(c=>`<button class="draft-choice" data-id="${escapeAttr(c.id)}"><b>${escapeAttr(c.name||c.subject)}</b><span>${escapeAttr(c.status)} · ${new Date(c.updatedAt).toLocaleDateString()}</span></button>`).join(''):'<p>No saved drafts yet.</p>'}</aside></div></main>`}
function resumeMakerPage() {
  return `<main class="service-page">
    <section class="service-hero">
      <div class="wrap service-hero-inner">
        <span class="service-badge">AI-Powered Resume Solution</span>
        <h1>Professional UAE Resume Maker</h1>
        <p>Create an executive, interview-ready CV structured specifically to meet UAE and Gulf recruiter expectations in minutes.</p>
        <div class="service-hero-actions">
          <a class="primary" href="#builder-start">Create My Resume Now</a>
          <a class="outline" href="#features">Explore Features</a>
        </div>
      </div>
    </section>
    <section class="wrap service-content-section" id="features">
      <div class="service-grid-3">
        <div class="service-feature-card">
          <div class="sfc-icon">📋</div>
          <h3>Gulf-Standard Formats</h3>
          <p>Clean single and double-column structures with verified UAE visa, residency, and professional licensing sections.</p>
        </div>
        <div class="service-feature-card">
          <div class="sfc-icon">⚡</div>
          <h3>Pre-Built Industry Bullets</h3>
          <p>Over 1,200+ battle-tested achievement bullet points for healthcare, nursing, finance, education, and tech roles.</p>
        </div>
        <div class="service-feature-card">
          <div class="sfc-icon">📥</div>
          <h3>Instant PDF & Word Export</h3>
          <p>Download print-ready high-resolution PDFs or fully editable DOCX files formatted for immediate recruiter sharing.</p>
        </div>
      </div>

      <div class="service-interactive-box" id="builder-start">
        <div class="sib-header">
          <h2>Start Building Your UAE Resume</h2>
          <p>Fill in your basic information below to generate your initial template preview.</p>
        </div>
        <form class="service-form" onsubmit="event.preventDefault(); alert('Your resume workspace has been created! Our template wizard is launching.');">
          <div class="sform-grid">
            <label>Full Name
              <input type="text" required placeholder="e.g. Athira Susan James">
            </label>
            <label>Target Job Title
              <input type="text" required placeholder="e.g. Registered Staff Nurse / Financial Analyst">
            </label>
            <label>Years of Experience
              <select>
                <option>Entry Level (0 - 2 years)</option>
                <option>Mid-Level (3 - 6 years)</option>
                <option>Senior / Executive (7+ years)</option>
              </select>
            </label>
            <label>Current Location
              <select>
                <option>Dubai, UAE</option>
                <option>Abu Dhabi, UAE</option>
                <option>Sharjah, UAE</option>
                <option>Other UAE Emirate</option>
                <option>Outside UAE (Planning Relocation)</option>
              </select>
            </label>
            <label>Email Address
              <input type="email" required placeholder="name@example.com">
            </label>
            <label>Mobile Number (WhatsApp)
              <input type="tel" required placeholder="+971 50 123 4567">
            </label>
          </div>
          <button type="submit" class="primary service-submit-btn">Build & Preview My Resume →</button>
        </form>
      </div>
    </section>
  </main>`;
}

function atsResumeBuilderPage() {
  return `<main class="service-page">
    <section class="service-hero ats-hero">
      <div class="wrap service-hero-inner">
        <span class="service-badge highlight">ATS Optimization Engine</span>
        <h1>ATS Resume Builder for UAE Jobs</h1>
        <p>Beat the automated candidate screening systems (Taleo, Oracle HCM, Workday, iCIMS) used by UAE hospitals and top enterprises with 95%+ parse rates.</p>
        <div class="service-hero-actions">
          <a class="primary" href="#ats-check">Scan & Optimize My Resume</a>
          <a class="outline" href="#ats-guide">How ATS Works</a>
        </div>
      </div>
    </section>
    <section class="wrap service-content-section" id="ats-guide">
      <div class="service-grid-3">
        <div class="service-feature-card">
          <div class="sfc-icon">🤖</div>
          <h3>Parser-Safe Architecture</h3>
          <p>No tables, unreadable graphics, or multi-nested text frames that cause Gulf ATS software to reject your application.</p>
        </div>
        <div class="service-feature-card">
          <div class="sfc-icon">🎯</div>
          <h3>Target Keyword Injector</h3>
          <p>Automatically match job descriptions from NMC, Aldar, Burjeel, and government job postings to trigger high match scores.</p>
        </div>
        <div class="service-feature-card">
          <div class="sfc-icon">📊</div>
          <h3>Real-Time Score Audit</h3>
          <p>Get a comprehensive diagnostic report highlighting missing industry certifications, formatting flaws, and readability rating.</p>
        </div>
      </div>

      <div class="service-interactive-box" id="ats-check">
        <div class="sib-header">
          <h2>Upload Your Resume for Free ATS Diagnostic</h2>
          <p>Upload your current CV to check its ATS readability score against UAE recruitment criteria.</p>
        </div>
        <div class="ats-upload-dropzone" onclick="document.getElementById('ats-file-input').click()">
          <input type="file" id="ats-file-input" style="display:none" onchange="alert('CV received! Your ATS compatibility score is 92/100. Recommendations generated.')">
          <div class="aud-icon">📄</div>
          <h3>Click or Drag & Drop your Resume (PDF or DOCX)</h3>
          <p>Supports files up to 10MB. 100% confidential and safe.</p>
          <button type="button" class="primary" style="margin-top:12px;">Select Resume File</button>
        </div>
      </div>
    </section>
  </main>`;
}

function medicalCoderClassPage() {
  return `<main class="service-page">
    <section class="service-hero medical-hero">
      <div class="wrap service-hero-inner">
        <span class="service-badge">Healthcare Career Academy</span>
        <h1>Medical Coder Training & Certification Class</h1>
        <p>Master AAPC Certified Professional Coder (CPC) preparation, ICD-10-CM, CPT, and UAE insurance reimbursement guidelines with certified mentors.</p>
        <div class="service-hero-actions">
          <a class="primary" href="#enroll">Enroll in Next Batch</a>
          <a class="outline" href="#curriculum">View Course Syllabus</a>
        </div>
      </div>
    </section>
    <section class="wrap service-content-section" id="curriculum">
      <div class="service-grid-3">
        <div class="service-feature-card">
          <div class="sfc-icon">🩺</div>
          <h3>ICD-10-CM & CPT Mastery</h3>
          <p>In-depth clinical code assignment, HCPCS Level II modifiers, and diagnostic validation tailored to DOH, DHA, and MOHAP standards.</p>
        </div>
        <div class="service-feature-card">
          <div class="sfc-icon">🏆</div>
          <h3>AAPC CPC Exam Preparation</h3>
          <p>100+ hours of rigorous live sessions, 6 mock exams, and test-taking strategies with a 94% first-attempt pass rate.</p>
        </div>
        <div class="service-feature-card">
          <div class="sfc-icon">💼</div>
          <h3>UAE Hospital Placement</h3>
          <p>Direct placement coordination with leading UAE hospital groups, clinics, and medical coding billing centers.</p>
        </div>
      </div>

      <div class="service-interactive-box" id="enroll">
        <div class="sib-header">
          <h2>Enroll in the Upcoming Batch (Weekend & Evening Available)</h2>
          <p>Reserve your seat or speak with a senior medical coding advisor.</p>
        </div>
        <form class="service-form" onsubmit="event.preventDefault(); alert('Thank you for registering! An admissions advisor will contact you with syllabus details and batch schedule.');">
          <div class="sform-grid">
            <label>Student Full Name
              <input type="text" required placeholder="Your full name">
            </label>
            <label>Educational Background
              <select>
                <option>Life Sciences / Nursing / Pharmacy</option>
                <option>Medical Graduate (MBBS / BDS / BAMS / BHMS)</option>
                <option>Science / Non-Medical Graduate</option>
                <option>Other / High School</option>
              </select>
            </label>
            <label>Preferred Batch
              <select>
                <option>Weekend Batch (Sat & Sun)</option>
                <option>Weekday Evening Batch (Mon - Thu)</option>
                <option>Self-Paced Recorded + Live Mentorship</option>
              </select>
            </label>
            <label>City / Country
              <input type="text" required placeholder="e.g. Dubai, UAE / India / Philippines">
            </label>
            <label>Email Address
              <input type="email" required placeholder="name@example.com">
            </label>
            <label>WhatsApp Contact
              <input type="tel" required placeholder="+971 50 123 4567">
            </label>
          </div>
          <button type="submit" class="primary service-submit-btn">Request Syllabus & Reserve Seat →</button>
        </form>
      </div>
    </section>
  </main>`;
}

function getAdminAuth() {
  return getVerifiedAdmin();
}

function notFound404Page() {
  return `<main class="page-404-wrap" style="min-height:70vh; display:flex; align-items:center; justify-content:center; text-align:center; padding:60px 20px;">
    <div style="max-width:540px; margin:0 auto;">
      <div style="font-size:88px; font-weight:900; line-height:1; color:#b00008; margin-bottom:16px; font-family:Inter, sans-serif; letter-spacing:-2px;">404</div>
      <h1 style="font-size:26px; font-weight:700; color:#0f172a; margin-bottom:12px;">Page Not Found</h1>
      <p style="font-size:15px; color:#64748b; line-height:1.6; margin-bottom:28px;">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <a href="/" style="display:inline-flex; align-items:center; gap:8px; background:#b00008; color:#fff; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none; box-shadow:0 4px 12px rgba(176,0,8,0.2);">Return to Home</a>
        <a href="/jobs" style="display:inline-flex; align-items:center; gap:8px; background:#f1f5f9; color:#1e293b; padding:12px 20px; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none;">Search Jobs</a>
      </div>
    </div>
  </main>`;
}

function adminLoginPage() {
  return `<style>
    .admin-auth-page{min-height:100vh;display:grid;grid-template-columns:minmax(320px,.9fr) minmax(520px,1.1fr);background:#f7f8fb;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111827}
    .admin-auth-brand{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:46px 52px;background:linear-gradient(145deg,#740006 0%,#a60008 48%,#d21d27 100%);color:#fff}
    .admin-auth-brand:before,.admin-auth-brand:after{content:"";position:absolute;border-radius:50%;pointer-events:none}
    .admin-auth-brand:before{width:430px;height:430px;right:-210px;top:-190px;border:1px solid rgba(255,255,255,.16);box-shadow:0 0 0 70px rgba(255,255,255,.035),0 0 0 140px rgba(255,255,255,.025)}
    .admin-auth-brand:after{width:280px;height:280px;left:-150px;bottom:-145px;background:rgba(42,0,2,.18)}
    .admin-auth-logo,.admin-auth-copy,.admin-auth-brand-foot{position:relative;z-index:1}
    .admin-auth-logo{display:flex;align-items:center;width:max-content;padding:10px 14px;border-radius:12px;background:#fff;box-shadow:0 8px 22px rgba(55,0,3,.16)}
    .admin-auth-logo img{width:154px;height:auto;display:block}
    .admin-auth-copy{max-width:470px;margin:auto 0}
    .admin-auth-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:22px;padding:7px 11px;border:1px solid rgba(255,255,255,.24);border-radius:999px;background:rgba(255,255,255,.1);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
    .admin-auth-kicker:before{content:"";width:7px;height:7px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.14)}
    .admin-auth-copy h2{margin:0 0 18px;font-size:clamp(34px,4vw,54px);line-height:1.05;letter-spacing:-.045em;color:#fff}
    .admin-auth-copy p{max-width:410px;margin:0;color:rgba(255,255,255,.78);font-size:16px;line-height:1.7}
    .admin-auth-points{display:grid;gap:12px;margin-top:34px}
    .admin-auth-point{display:flex;align-items:center;gap:11px;color:rgba(255,255,255,.88);font-size:13px;font-weight:600}
    .admin-auth-point svg{width:18px;height:18px;flex:0 0 auto}
    .admin-auth-brand-foot{font-size:12px;color:rgba(255,255,255,.62)}
    .admin-auth-form-side{display:flex;align-items:center;justify-content:center;padding:48px}
    .admin-auth-card{width:100%;max-width:465px}
    .admin-auth-mobile-logo{display:none;margin-bottom:32px}.admin-auth-mobile-logo img{width:160px;height:auto}
    .admin-auth-icon{width:48px;height:48px;display:grid;place-items:center;margin-bottom:28px;border-radius:14px;background:#fff1f2;color:#b00008;box-shadow:inset 0 0 0 1px #ffe0e3}
    .admin-auth-card h1{margin:0 0 10px;font-size:32px;line-height:1.2;letter-spacing:-.035em;color:#111827}
    .admin-auth-intro{margin:0 0 34px;color:#687386;font-size:14px;line-height:1.65}
    .admin-auth-field{display:block;margin-bottom:20px}
    .admin-auth-field>span{display:block;margin-bottom:8px;color:#263244;font-size:13px;font-weight:700}
    .admin-auth-input-wrap{position:relative}
    .admin-auth-input{width:100%;height:54px;box-sizing:border-box;border:1px solid #d8dee8;border-radius:12px;background:#fff;padding:0 16px;color:#111827;font-size:14px;outline:none;box-shadow:0 1px 2px rgba(15,23,42,.03);transition:border-color .18s,box-shadow .18s}
    .admin-auth-input::placeholder{color:#9aa4b2}.admin-auth-input:focus{border-color:#b00008;box-shadow:0 0 0 4px rgba(176,0,8,.09)}
    .admin-auth-input.has-action{padding-right:50px}
    .admin-pass-toggle{position:absolute;right:7px;top:7px;width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:9px;background:transparent;color:#7c8798;cursor:pointer}
    .admin-pass-toggle:hover{background:#f2f4f7;color:#263244}.admin-pass-toggle svg{width:19px;height:19px}
    #adminLoginError{display:none;margin-bottom:20px;padding:12px 14px;border:1px solid #fecaca;border-radius:10px;background:#fff1f2;color:#991b1b;font-size:13px;line-height:1.5}
    .admin-auth-submit{width:100%;height:54px;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:10px;border:0;border-radius:12px;background:linear-gradient(135deg,#a90008,#cf1822);color:#fff;font-size:14px;font-weight:750;cursor:pointer;box-shadow:0 10px 24px rgba(176,0,8,.22);transition:transform .18s,box-shadow .18s,filter .18s}
    .admin-auth-submit:hover{transform:translateY(-1px);box-shadow:0 14px 28px rgba(176,0,8,.28);filter:saturate(1.08)}.admin-auth-submit:disabled{opacity:.7;cursor:wait;transform:none}
    .admin-auth-meta{display:flex;align-items:flex-start;gap:10px;margin-top:28px;padding-top:23px;border-top:1px solid #e5e9f0;color:#7b8797;font-size:12px;line-height:1.55}
    .admin-auth-meta svg{width:17px;height:17px;flex:0 0 auto;margin-top:1px;color:#8c96a5}
    .admin-auth-home{display:inline-flex;align-items:center;gap:7px;margin-top:22px;color:#596579;font-size:12px;font-weight:650;text-decoration:none}.admin-auth-home:hover{color:#b00008}
    @media(max-width:860px){.admin-auth-page{display:block;background:#fff}.admin-auth-brand{display:none}.admin-auth-form-side{min-height:100vh;padding:42px 24px}.admin-auth-mobile-logo{display:block}.admin-auth-card{max-width:500px}.admin-auth-card h1{font-size:29px}}
    @media(max-width:480px){.admin-auth-form-side{align-items:flex-start;padding:28px 20px}.admin-auth-mobile-logo{margin-bottom:42px}.admin-auth-icon{margin-bottom:22px}.admin-auth-card h1{font-size:26px}.admin-auth-intro{margin-bottom:28px}}
  </style>
  <main class="admin-auth-page">
    <section class="admin-auth-brand" aria-label="Trikonet administration portal">
      <a class="admin-auth-logo" href="/"><img src="/assets/logo-black.png" alt="Trikonet"></a>
      <div class="admin-auth-copy">
        <span class="admin-auth-kicker">Private workspace</span>
        <h2>Run Trikonet<br>with confidence.</h2>
        <p>Manage jobs, employers, content and platform operations from one secure workspace.</p>
        <div class="admin-auth-points">
          <div class="admin-auth-point"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>Protected administrator access</div>
          <div class="admin-auth-point"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>Centralised publishing controls</div>
        </div>
      </div>
      <div class="admin-auth-brand-foot">Trikonet Administration · Internal use only</div>
    </section>
    <section class="admin-auth-form-side">
      <div class="admin-auth-card">
        <a class="admin-auth-mobile-logo" href="/"><img src="/assets/logo-black.png" alt="Trikonet"></a>
        <div class="admin-auth-icon"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>
        <h1>Welcome back</h1>
        <p class="admin-auth-intro">Sign in with your administrator credentials to continue to the Trikonet console.</p>
        <div id="adminLoginError" role="alert"></div>
        <form id="adminLoginForm">
          <label class="admin-auth-field"><span>Username or email</span><div class="admin-auth-input-wrap"><input class="admin-auth-input" type="text" id="adminLoginUser" required autocomplete="off" data-lpignore="true" data-form-type="other" readonly placeholder="Enter username or email"></div></label>
          <label class="admin-auth-field"><span>Password</span><div class="admin-auth-input-wrap"><input class="admin-auth-input has-action" type="password" id="adminLoginPass" required autocomplete="new-password" data-lpignore="true" data-form-type="other" readonly placeholder="Enter your password"><button class="admin-pass-toggle" id="adminPassToggle" type="button" aria-label="Show password" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></div></label>
          <button type="submit" id="adminLoginBtn" class="admin-auth-submit">Sign in securely <span aria-hidden="true">→</span></button>
        </form>
        <div class="admin-auth-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg><span>This is a restricted system. Administrative activity may be recorded for security and auditing.</span></div>
        <a class="admin-auth-home" href="/">← Return to the Trikonet website</a>
      </div>
    </section>
  </main>`;
}

async function hashAdminPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function initAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;
  const usernameInput = document.getElementById('adminLoginUser');
  const passwordInput = document.getElementById('adminLoginPass');
  const passwordToggle = document.getElementById('adminPassToggle');
  const clearAdminFields = () => {
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.type = 'password';
    }
  };
  [usernameInput, passwordInput].forEach(input => {
    input?.addEventListener('pointerdown', () => input.removeAttribute('readonly'), { once: true });
    input?.addEventListener('focus', () => input.removeAttribute('readonly'), { once: true });
  });
  clearAdminFields();
  requestAnimationFrame(clearAdminFields);
  setTimeout(clearAdminFields, 150);
  window.addEventListener('pageshow', clearAdminFields, { once: true });
  passwordToggle?.addEventListener('click', () => {
    const showing = passwordInput?.getAttribute('type') === 'text';
    passwordInput?.setAttribute('type', showing ? 'password' : 'text');
    passwordToggle.setAttribute('aria-pressed', String(!showing));
    passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = (document.getElementById('adminLoginUser')?.value || '').trim();
    const passInput = (document.getElementById('adminLoginPass')?.value || '').trim();
    const errBox = document.getElementById('adminLoginError');
    const btn = document.getElementById('adminLoginBtn');

    if (!userInput || !passInput) {
      if (errBox) { errBox.textContent = 'Please enter both administrator username and password.'; errBox.style.display = 'block'; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Verifying credentials…'; }
    let response;
    try {
      response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: userInput, password: passInput })
      });
    } catch {
      if (errBox) { errBox.textContent = 'The administration service is unavailable. Please try again.'; errBox.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.innerHTML = 'Sign in securely <span aria-hidden="true">→</span>'; }
      return;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.admin) {
      if (errBox) { errBox.textContent = payload.error || 'Invalid administrator username or password.'; errBox.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.innerHTML = 'Sign in securely <span aria-hidden="true">→</span>'; }
      return;
    }

    const session = { ...payload.admin, loginAt: new Date().toISOString() };

    localStorage.removeItem('trikonet_admin_session');
    sessionStorage.setItem('trikonet_admin_session', JSON.stringify(session));
    signalAdminSessionChange();

    window.location.href = '/admin';
  });
}

function isResumeBuilderPath(p) {
  return p === '/resume-library' ||
         p === '/services/resume-maker' ||
         p === '/resume-maker' ||
         p === '/services/resume-builder' ||
         p === '/resume-builder' ||
         p === '/services/ats-resume-builder' ||
         p === '/ats-resume-builder' ||
         p === '/cv-builder' ||
         p === '/services/cv-builder';
}

function fitEmployerLogos() {
  document.querySelectorAll('.emp-profile-logo-img, .nurse-card-logo img, .featured-company-logo-wrap img').forEach(sourceImage => {
    // Keep offscreen lazy logos lazy; fit their whitespace only after loading.
    if (!sourceImage.complete) {
      sourceImage.addEventListener('load', fitEmployerLogos, { once: true });
      return;
    }
    if (!sourceImage.naturalWidth) return;
    const ratio = sourceImage.naturalWidth / sourceImage.naturalHeight;
    if (ratio >= .95 && ratio <= 1.05) return;
    if (sourceImage.dataset.trimAttempted === 'true') return;
    sourceImage.dataset.trimAttempted = 'true';
    const probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = () => {
      try {
        // Already-square uploads keep their original artwork and framing.
        const sourceRatio = probe.naturalWidth / probe.naturalHeight;
        if (sourceRatio >= .95 && sourceRatio <= 1.05) return;
        const maxSample = 320;
        const scale = Math.min(1, maxSample / Math.max(probe.naturalWidth, probe.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(probe.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(probe.naturalHeight * scale));
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(probe, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        // Infer the solid background from all four corners, including dark
        // brand colours. White foreground artwork is not blank space.
        const cornerOffsets = [0, (canvas.width - 1) * 4,
          (canvas.height - 1) * canvas.width * 4,
          (canvas.width * canvas.height - 1) * 4];
        const background = [0, 1, 2, 3].map(channel =>
          Math.round(cornerOffsets.reduce((sum, offset) => sum + pixels[offset + channel], 0) / 4));
        if (cornerOffsets.some(offset => [0, 1, 2, 3].some(channel =>
          Math.abs(pixels[offset + channel] - background[channel]) > 24))) return;
        let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const offset = (y * canvas.width + x) * 4;
            const visible = pixels[offset + 3] > 18 &&
              (background[3] <= 18 || [0, 1, 2].some(channel =>
                Math.abs(pixels[offset + channel] - background[channel]) > 28));
            if (!visible) continue;
            left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
          }
        }
        if (right < left || bottom < top) return;
        const contentWidth = right - left + 1;
        const contentHeight = bottom - top + 1;
        const occupiedArea = (contentWidth * contentHeight) / (canvas.width * canvas.height);
        if (occupiedArea > .68) return;
        const padding = Math.max(2, Math.round(Math.max(contentWidth, contentHeight) * .08));
        // Fit the original image with CSS so opening/copying it keeps its media URL.
        const side = Math.max(contentWidth, contentHeight) + padding * 2;
        const frame = sourceImage.parentElement;
        frame.style.position = 'relative';
        frame.style.overflow = 'hidden';
        Object.assign(sourceImage.style, {
          position: 'absolute', objectFit: 'fill', maxWidth: 'none', maxHeight: 'none',
          width: `${canvas.width / side * 100}%`, height: `${canvas.height / side * 100}%`,
          left: `${((side - contentWidth) / 2 - left) / side * 100}%`,
          top: `${((side - contentHeight) / 2 - top) / side * 100}%`
        });
        sourceImage.classList.add('is-trimmed-logo');
      } catch {
        sourceImage.classList.add('is-logo-fallback-enlarged');
      }
    };
    probe.onerror = () => sourceImage.classList.add('is-logo-fallback-enlarged');
    const originalSource = sourceImage.currentSrc || sourceImage.src;
    const logoUrl = new URL(originalSource, location.href);
    probe.src = logoUrl.hostname === 'media.trikonet.com'
      ? `/logo-source?src=${encodeURIComponent(logoUrl.href)}` : originalSource;
  });
}

function render() {
  if (seoPagePayload) {
    const content=value=>value?`<section class="wrap" style="padding:24px 0;white-space:pre-wrap">${escapeAttr(value)}</section>`:'';
    let body=categoryPage(seoPagePayload);
    body=body.replace('</section>','</section>'+content(seoPagePayload.page.introContent));
    const related=(seoPagePayload.links || seoInternalLinks).filter(p=>p.category===seoPagePayload.page.category && p.slug!==seoPagePayload.page.slug && (!seoPagePayload.page.location || p.location!==seoPagePayload.page.location));
    body=body.replace('</main>',content(seoPagePayload.page.bottomContent)+renderCategoryLinks(related,{category:seoPagePayload.page.category,slug:seoPagePayload.page.slug})+'</main>');
    return header()+body+footer();
  }
  if (seoPageDraft) return header()+notFound404Page()+footer();
  if (path === '/admin-login' || path === '/admin-portal' || path === '/trikonet-admin-access') {
    return adminLoginPage();
  }
  if (path.startsWith('/admin')) {
    if (!getAdminAuth()) {
      return header() + notFound404Page() + footer();
    }
    return renderAdmin(data);
  }
  if (path === '/404') {
    return header() + notFound404Page() + footer();
  }
  if (isResumeBuilderPath(path)) {
    return '<div id="cv-builder-root"></div>';
  }
  let body;
  if (path === '/') body = home();
  else if (path === '/login' || path === '/signin' || path === '/sign-in' || path === '/login-register' || path === '/register' || path === '/signup' || path === '/sign-up' || path === '/profile') body = accountPage();
  else if (path === '/saved-jobs') body = memberWorkspacePage('saved_jobs');
  else if (path === '/applied-jobs') body = memberWorkspacePage('applied_jobs');
  else if (path === '/followed-companies') body = memberWorkspacePage('followed_companies');
  else if (path === '/email-campaigns') body = campaignsPage();
  else if (path === '/job-categories') body = renderAllCategories(seoInternalLinks);
  else if (path === '/nurse-jobs-in-uae') body = nurseJobsPage();
  else if (path.startsWith('/category/')) body = categoryPage();
  else if (path === '/jobs' || path === '/job-list' || path === '/job-openings' || path.startsWith('/job-location/')) {
    body=categoryPage(null,true);
    const categorySlug=slugifyCategory(data.taxonomies.categories.find(c=>c.name===queryParams.get('category')) || 'All');
    body=body.replaceAll(`/category/${categorySlug}`,'/jobs');
    if(!queryParams.get('category'))body=body.replace('Popular in All:','Popular locations:').replace('UAE All roles','UAE roles').replace('Explore verified All job vacancies','Explore current job vacancies');
  }
  else if (path === '/employers') body = employers();
  else if (path === '/services/medical-coder-class' || path === '/medical-coder-class') body = medicalCoderClassPage();
  else if (path.startsWith('/employer/')) {
    const local = data.employers?.find(e => e.local && path === `/employer/${e.slug}`);
    body = renderEmployerDetail(local || wpRecord, path, profileJobs);
  }
  else if (path === '/about') body = about();
  else if (path === '/blog') body = blog();
  else if (path.startsWith('/blog/')) {
    const postSlug = path.slice('/blog/'.length).replace(/\/$/, '');
    const p = data.posts?.find(item => item.slug === postSlug);
    if (p) {
      const canonicalUrl = getPostUrl(p);
      if (typeof window !== 'undefined' && window.history && window.history.replaceState && canonicalUrl !== path) {
        window.history.replaceState(null, '', canonicalUrl + window.location.search);
      }
      body = post(p);
    } else {
      body = notFound404Page();
    }
  }
  else if (BLOG_CATEGORY_PREFIXES.includes(path.slice(1).replace(/\/$/, ''))) {
    const catSlug = path.slice(1).replace(/\/$/, '');
    const catName = CATEGORY_PREFIX_LABELS[catSlug] || catSlug;
    queryParams.set('category', catName);
    body = blog();
  }
  else if (BLOG_CATEGORY_PREFIXES.some(prefix => path.startsWith(`/${prefix}/`))) {
    const pathParts = path.split('/').filter(Boolean);
    const postSlug = pathParts[1] ? pathParts[1].replace(/\/$/, '') : '';
    const p = data.posts?.find(item => item.slug === postSlug);
    if (p) {
      body = post(p);
    } else {
      body = notFound404Page();
    }
  }
  else if (legalPageForPath(path)) {
    const page = legalPageForPath(path);
    document.title = `${page.title} | Trikonet`;
    body = `<style>${legalStyles}</style>${renderLegalContent(page)}`;
  }
  else if (path === '/faq') body = faq();
  else if (path === '/contact') body = contact();
  else if (path === '/submit-job') body = employerSignupComingSoon();
  else if (path.startsWith('/job/')) {
    const local = data.jobs.find(j => j.local && path === `/job/${j.slug}`);
    const currentJob = local || wpRecord || data.jobs.find(j => path.endsWith(j.slug));
    const employer = wpEmployer || (local ? data.employers?.find(e => e.slug === local.employerSlug || e.title === local.company) : null) || (data.employers?.find(e => wpRecord?.metas?._job_employer_name && e.title?.toLowerCase() === wpRecord.metas._job_employer_name.toLowerCase())) || null;
    const relatedValue = (job, field, metaField) => {
      const direct = job?.[field];
      const meta = job?.metas?.[metaField];
      const value = Array.isArray(direct) ? direct.join(' ') : (direct || (meta && typeof meta === 'object' ? Object.values(meta).join(' ') : meta) || '');
      return String(value).toLowerCase();
    };
    const currentCategory = relatedValue(currentJob, 'categories', '_job_category') || relatedValue(currentJob, 'category', '_job_category');
    const currentLocation = relatedValue(currentJob, 'locations', '_job_location') || relatedValue(currentJob, 'location', '_job_location');
    const currentCompany = (currentJob?.metas?._job_employer_name || currentJob?.company || employer?.title?.rendered || employer?.title || '').trim().toLowerCase();
    const currentEmployerId = currentJob?.metas?._job_employer_posted_by || employer?.id;

    const isSameCompany = (job) => {
      const comp = (job?.metas?._job_employer_name || job?.company || '').trim().toLowerCase();
      if (currentCompany && comp && (comp === currentCompany || comp.includes(currentCompany) || currentCompany.includes(comp))) {
        return true;
      }
      if (currentEmployerId && job?.metas?._job_employer_posted_by && String(job.metas._job_employer_posted_by) === String(currentEmployerId)) {
        return true;
      }
      return false;
    };

    // Related jobs pool MUST come from the same category and EXCLUDE the same company!
    const relatedPool = [...categoryJobs];
    const seenRelated = new Set();
    const catTokens = currentCategory.split(/[\s,]+/).filter(w => w.length > 2);
    const relatedMatches = relatedPool
      .filter(job => job && job.slug && job.slug !== currentJob?.slug && !isSameCompany(job) && !seenRelated.has(job.slug) && seenRelated.add(job.slug))
      .map((job, index) => {
        const jobCategory = relatedValue(job, 'categories', '_job_category') || relatedValue(job, 'category', '_job_category');
        const jobLocation = relatedValue(job, 'locations', '_job_location') || relatedValue(job, 'location', '_job_location');
        const matchCount = catTokens.filter(t => jobCategory.includes(t)).length;
        const hasMatch = matchCount > 0 || (currentCategory && jobCategory && (jobCategory.includes(currentCategory) || currentCategory.includes(jobCategory)));
        const score = (hasMatch ? (matchCount * 4 || 4) : 0)
          + (currentLocation && jobLocation && (jobLocation.includes(currentLocation) || currentLocation.includes(jobLocation)) ? 2 : 0);
        return { job, score, index, hasMatch };
      })
      .filter(item => item.hasMatch)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 4)
      .map(item => item.job);
    body = renderJobDetail(currentJob, employer, path, orgJobs, relatedMatches);
  }
  else {
    const pathParts = path.split('/').filter(Boolean);
    const postBySlug = (pathParts.length === 2)
      ? data.posts?.find(p => p.slug === pathParts[1])
      : data.posts?.find(p => path.endsWith(`/${p.slug}`));
    if (postBySlug) {
      body = post(postBySlug);
    } else {
      body = notFound404Page();
      document.title = '404 — Page Not Found | Trikonet';
      let robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.append(robots);
      }
      robots.content = 'noindex,follow';
    }
  }
  const memberAuthPaths = ['/login','/signin','/sign-in','/login-register','/register','/signup','/sign-up'];
  if (memberAuthPaths.includes(path)) return body + footer();
  return header() + body + footer();
}
// Counts refresh their own badges; don't delay the main content for them.
if (!MEMBER_PATHS.includes(path)) loadCounts().catch(()=>{});
const isCvAppRoute = /^\/(?:resume-library|resume-maker|resume-builder|ats-resume-builder|cv-builder|services\/resume-maker)\/?$/.test(path);
let homeContentReady;
const accountReady=loadAccount();
const initialLoads=isCvAppRoute || path.startsWith('/admin') ? [] : path==='/'?[]:[accountReady,loadSeoPages()];
if(path==='/')void accountReady.catch(()=>{});
if (['/login','/signin','/sign-in','/login-register','/register','/signup','/sign-up','/profile'].includes(path)) {
  initialLoads.push(import('./website-profile.js?v=20261018-focused-profile-31').then(({ createCandidateProfile }) => {
    ({ candidateProfileWorkspace, initCandidateProfile } = createCandidateProfile({
      getCurrentUser: () => currentUser, escapeAttr, calculateCandidateCompletion
    }));
  }));
}
// Detail renderers are only needed on job and employer pages. Fetch them
// alongside page data instead of blocking every page's module startup.
if (path.startsWith('/job/') || path.startsWith('/employer/')) {
  initialLoads.push(import('./detail-pages.js?v=20261028-user-save-progress-1').then(module => {
    renderJobDetail = module.renderJobDetail;
    renderEmployerDetail = module.renderEmployerDetail;
  }));
}
if(isCvAppRoute || path.startsWith('/admin') || MEMBER_PATHS.includes(path)) { /* These screens load their own data. */ }
else if(path==='/')homeContentReady=Promise.allSettled([loadTopEmployers(),loadConnectedContent()]);
else if(path==='/jobs'||path==='/job-list'||path==='/job-openings'||path==='/nurse-jobs-in-uae'||path.startsWith('/category/')||path.startsWith('/job-location/'))initialLoads.push(loadLocalJobs(),loadDirectoryTaxonomies());
else if(path==='/employers')initialLoads.push(loadLocalEmployers(),loadDirectoryTaxonomies());
else if(path.startsWith('/job/'))initialLoads.push(loadWordPressRecord().then(() => {
  if (wpRecord && (wpRecord.autosaved || String(wpRecord.slug || '').startsWith('autosave-') || !['publish','published','active',''].includes(String(wpRecord.status || '').toLowerCase()))) wpRecord = null;
}));
else if(path.startsWith('/employer/'))initialLoads.push(loadWordPressRecord().then(loadEmployerJobPage));
else if(path==='/blog'||path.startsWith('/blog/')||POST_SLUG_PREFIXES[path.split('/').filter(Boolean).at(-1)])initialLoads.push(loadConnectedContent());
else if (!['/about','/contact','/faq','/services/medical-coder-class','/medical-coder-class'].includes(path)) initialLoads.push(loadConnectedContent());
const adminSessionReady = refreshAdminSession();
if (path.startsWith('/admin')) {
  initialLoads.push(adminSessionReady, import('./admin.js?v=20261031-all-entry-2').then(module => {
    renderAdmin = module.renderAdmin;
    initAdmin = module.initAdmin;
  }));
}
await Promise.all(initialLoads);
// Published article data comes from the backend. The admin screen also keeps
// local draft/mock records, but those must never replace database content on
// the public site.
document.querySelector('#app').innerHTML=render();
document.querySelector('#app').removeAttribute('data-server-rendered');
protectJobNavigation();
if (path.startsWith('/job/') && document.querySelector('#jobDescriptionCopy') && !queryParams.has('preview') && !queryParams.has('draft')) {
  fetch('/api/job-view', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:path.split('/').filter(Boolean).pop()})}).catch(error => console.warn('Job view tracking unavailable:',error));
}
// Reserve ad positions before revealing links, so a late import cannot move a card under a click.
try { initDisplayAds(); } catch (error) { console.warn('Display ad setup failed:', error); }
const adminEditType = path.startsWith('/job/') ? 'job' : path.startsWith('/employer/') ? 'employer' : document.querySelector('.blog-post-page') ? 'post' : null;
adminSessionReady.then(() => initPublicAdminBar(adminEditType && !document.title.startsWith('404') ? { type: adminEditType, slug: path.split('/').filter(Boolean).pop() } : null));
import('./page-stamp.js?v=2').then(({addPageStamp}) => addPageStamp({
  record: wpRecord,
  post: document.querySelector('.blog-post-page') ? data.posts?.find(p => path.endsWith('/' + p.slug)) : null,
  seoPage: seoPagePayload?.page
}));
function restoreEmployerTab() {
  if (!location.pathname.startsWith('/employer/')) return;
  const params = new URLSearchParams(location.search);
  const requested = params.get('tab') || (params.has('jobsPage') ? 'jobs' : 'overview');
  const target = ['overview', 'jobs', 'reviews'].includes(requested) ? requested : 'overview';
  document.querySelectorAll('.emp-profile-tab-item').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === target);
    tab.setAttribute('aria-selected', String(tab.dataset.tab === target));
  });
  document.querySelectorAll('.emp-tab-panel').forEach(panel => {
    const active = panel.dataset.panel === target;
    panel.classList.toggle('active', active);
    panel.style.display = active ? 'block' : 'none';
  });
}
restoreEmployerTab();
window.addEventListener('popstate', restoreEmployerTab);
document.querySelector('#app').removeAttribute('data-seo-pending');
document.getElementById('seo-loading')?.remove();
if(!seoPagePayload && (path.startsWith('/category/') || path==='/jobs')){
  const category=path.startsWith('/category/')?findCategoryBySlug(path.slice('/category/'.length))?.name:queryParams.get('category');
  const links=seoInternalLinks.filter(p=>!category || p.category===category);
  if(links.length){
    const module=document.createElement('section');module.className='container';module.style.padding='24px 0';
    module.innerHTML=renderCategoryLinks(links,{category:category || '',slug:path.slice(1),categoriesOnly:path==='/jobs' && !category,limit:path==='/jobs' && !category?28:Infinity});
    document.querySelector('#app main')?.append(module);
  }
}
fitEmployerLogos();
// Do not wait for the browser's long DNS timeout before using the durable
// backup. A ready CDN image always wins; only pending images are retried.
document.querySelectorAll('.featured-company-logo-wrap img[data-backup]').forEach(image=>{
  if(!image.dataset.backup || image.dataset.backup===image.src)return;
  const startBackupTimer=()=>{
    const timer=setTimeout(()=>{
      if(image.complete&&image.naturalWidth>0)return;
      if(image.dataset.retried)return;
      image.dataset.retried='1';
      image.src=image.dataset.backup;
    },1200);
    image.addEventListener('load',()=>clearTimeout(timer),{once:true});
  };
  if(image.loading==='lazy' && 'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();startBackupTimer();}
    },{rootMargin:'300px'});
    observer.observe(image);
  }else startBackupTimer();
});
initCandidateProfile();
document.querySelectorAll('.emp-follow-btn').forEach(button => {
  if (!currentUser || !button.dataset.slug) return;
  const userKey = currentUser.id || currentUser.email || 'member';
  try {
    const isFollowing = localStorage.getItem(`trikonet_follow_employer_${userKey}_${button.dataset.slug}`) === 'true';
    button.classList.toggle('following', isFollowing);
    button.textContent = isFollowing ? '✓ Following' : '+ Follow';
  } catch {}
});
{
  const filterToggle = document.getElementById('empMobileFilterToggle');
  const expandableFilters = document.getElementById('empExpandableFilters');
  if (filterToggle && expandableFilters) {
    filterToggle.addEventListener('click', () => {
      const expanded = expandableFilters.classList.toggle('is-open');
      filterToggle.setAttribute('aria-expanded', String(expanded));
      const label = filterToggle.querySelector('span');
      if (label) label.textContent = expanded ? 'Hide filters' : 'Show filters';
    });
  }
}
{
  const descriptionCopy = document.getElementById('jobDescriptionCopy');
  const descriptionToggle = document.getElementById('jobDescriptionToggle');
  if (descriptionCopy && descriptionToggle) {
    const setDescriptionCollapsePoint = () => {
      const paragraphs = descriptionCopy.querySelectorAll('.wordpress-content p');
      if (paragraphs.length <= 2) {
        descriptionCopy.classList.add('is-expanded');
        descriptionToggle.hidden = true;
        return;
      }
      const copyTop = descriptionCopy.getBoundingClientRect().top;
      let targetP = paragraphs[Math.min(1, paragraphs.length - 1)];
      for (let i = 1; i < paragraphs.length && i < 8; i++) {
        const h = paragraphs[i].getBoundingClientRect().bottom - copyTop;
        if (h >= 180) {
          targetP = paragraphs[i];
          break;
        }
      }
      const secondBottom = Math.max(targetP.getBoundingClientRect().bottom - copyTop, 180);
      descriptionCopy.style.setProperty('--job-description-collapsed-height', `${Math.ceil(secondBottom)}px`);
      descriptionToggle.hidden = false;
    };
    requestAnimationFrame(setDescriptionCollapsePoint);
    window.addEventListener('resize', setDescriptionCollapsePoint, { passive: true });
    descriptionToggle.addEventListener('click', () => {
      const expanded = descriptionCopy.classList.toggle('is-expanded');
      descriptionToggle.setAttribute('aria-expanded', String(expanded));
      const label = descriptionToggle.querySelector('span');
      if (label) label.textContent = expanded ? 'Show less' : 'Read more';
      if (!expanded) descriptionCopy.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
{
  const reportModal = document.getElementById('jobReportModal');
  const reportOpen = document.getElementById('openJobReportBtn');
  const reportClose = document.getElementById('closeJobReportBtn');
  const reportForm = document.getElementById('jobReportForm');
  const closeReportModal = () => {
    if (!reportModal) return;
    reportModal.hidden = true;
    reportModal.setAttribute('aria-hidden', 'true');
    document.body.style.removeProperty('overflow');
  };
  reportOpen?.addEventListener('click', () => {
    reportModal.hidden = false;
    reportModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    reportModal.querySelector('input[name="reason"]')?.focus();
  });
  reportClose?.addEventListener('click', closeReportModal);
  reportModal?.addEventListener('click', event => { if (event.target === reportModal) closeReportModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && reportModal && !reportModal.hidden) closeReportModal(); });
  reportForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = reportForm.querySelector('.job-report-submit');
    const message = reportForm.querySelector('.job-report-message');
    const formData = new FormData(reportForm);
    const payload = Object.fromEntries(formData.entries());
    payload.jobPath = `${location.pathname}${location.search}`;
    submit.disabled = true;
    message.textContent = 'Submitting your report…';
    try {
      const response = await fetch('/api/job-reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit report.');
      message.textContent = 'Thank you. This job has been reported for review.';
      reportForm.reset();
      window.setTimeout(closeReportModal, 1400);
    } catch (error) {
      message.textContent = error.message || 'Unable to submit report.';
    } finally {
      submit.disabled = false;
    }
  });
}
if (isResumeBuilderPath(path)) {
  const { initCVBuilder } = await import('./cvBuilder.js?v=20260930-bottom-icons-v44');
  initCVBuilder('#cv-builder-root');
}
initSearchCategoryPickers();
initCategoryAutocomplete();
initBlogDirectory();
initRecentArticlesAutoSlider();
if (path === '/admin-login' || path === '/admin-portal' || path === '/trikonet-admin-access') {
  initAdminLogin();
}
if(path.startsWith('/employer/')){
  const empSlug = path.replace('/employer/', '').split('/')[0].split('?')[0];
  if(empSlug && window.renderEmployerUserReviews) window.renderEmployerUserReviews(empSlug);
}

function initCategoryAutocomplete() {
  const input = document.getElementById('category-search-input');
  const box = document.getElementById('category-suggestions');
  const clearBtn = document.getElementById('category-clear-btn');
  if (!input || !box) return;

  const list = box.querySelector('.category-suggestions-list');
  let selectedIndex = -1;

  function getCategories() {
    return Array.isArray(data.taxonomies?.categories) ? data.taxonomies.categories : [];
  }

  function renderSuggestions(query) {
    const q = (query || '').trim().toLowerCase();
    const all = getCategories();
    let matches = [];

    if (!q) {
      matches = [...all].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 5);
    } else {
      const starts = all.filter(c => c.name.toLowerCase().startsWith(q));
      const includes = all.filter(c => !c.name.toLowerCase().startsWith(q) && c.name.toLowerCase().includes(q));
      matches = [...starts, ...includes].slice(0, 5);
    }

    selectedIndex = -1;

    if (!matches.length) {
      list.innerHTML = `<li class="category-no-suggestions">No categories found matching "${escapeAttr(query)}"</li>`;
      box.style.display = 'block';
      return;
    }

    list.innerHTML = matches.map((item, index) => {
      let highlightedName = escapeAttr(item.name);
      if (q) {
        const reg = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlightedName = escapeAttr(item.name).replace(reg, '<strong>$1</strong>');
      }
      return `<li class="category-suggestion-item" data-value="${escapeAttr(item.name)}" data-index="${index}" role="option">
        <span class="suggestion-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        </span>
        <span class="suggestion-text">${highlightedName}</span>
        ${item.count ? `<span class="suggestion-count">${Number(item.count).toLocaleString()} jobs</span>` : ''}
      </li>`;
    }).join('');

    box.style.display = 'block';
  }

  input.addEventListener('input', () => {
    const val = input.value;
    if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
    renderSuggestions(val);
  });

  input.addEventListener('focus', () => {
    renderSuggestions(input.value);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      input.value = '';
      clearBtn.style.display = 'none';
      renderSuggestions('');
      input.focus();
    });
  }

  box.addEventListener('click', (e) => {
    const item = e.target.closest('.category-suggestion-item');
    if (!item) return;
    input.value = item.dataset.value || '';
    if (clearBtn) clearBtn.style.display = input.value ? 'flex' : 'none';
    box.style.display = 'none';
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('.category-suggestion-item');
    if (!items.length || box.style.display === 'none') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && items[selectedIndex]) {
        e.preventDefault();
        input.value = items[selectedIndex].dataset.value || '';
        if (clearBtn) clearBtn.style.display = input.value ? 'flex' : 'none';
        box.style.display = 'none';
      }
    } else if (e.key === 'Escape') {
      box.style.display = 'none';
    }
  });

  function updateActiveItem(items) {
    items.forEach((it, idx) => {
      it.classList.toggle('active', idx === selectedIndex);
      if (idx === selectedIndex) it.scrollIntoView({ block: 'nearest' });
    });
  }

  document.addEventListener('click', (e) => {
    if (!document.getElementById('category-autocomplete')?.contains(e.target)) {
      box.style.display = 'none';
    }
  });
}
function applySavedSeoMeta(){
  if(path.startsWith('/admin'))return;
  if(path==='/jobs' || path==='/job-list' || path==='/job-openings'){
    document.title=JOBS_SEO_TITLE;
    let description=document.querySelector('meta[name="description"]');
    if(!description){description=document.createElement('meta');description.name='description';document.head.append(description);}
    description.content=JOBS_SEO_DESCRIPTION;
    let canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}
    canonical.href=`${SITE_ORIGIN}/jobs${Number(queryParams.get('page'))>1?`?page=${Math.floor(Number(queryParams.get('page')))}`:''}`;
    return;
  }
  if(seoPagePayload){
    const page=seoPagePayload.page;
    document.title=page.seoTitle || `${page.title} | Trikonet`;
    for(const [name,value] of [['description',page.metaDescription || ''],['robots',page.indexingStatus==='Noindex'?'noindex,follow':'index,follow']]){
      let meta=document.querySelector(`meta[name="${name}"]`);if(!meta){meta=document.createElement('meta');meta.name=name;document.head.append(meta);}meta.content=value;
    }
    let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=`${SITE_ORIGIN}/${page.slug}${Number(queryParams.get('page'))>1?`?page=${Math.floor(Number(queryParams.get('page')))}`:''}`;
    return;
  }
  try{
    const pageSlug=path==='/'?'home':path.split('/').filter(Boolean).pop();
    const pages=JSON.parse(localStorage.getItem('trikonet_pages_cms')||'[]');
    const savedPosts=JSON.parse(localStorage.getItem('trikonet_posts_cms')||'[]');
    const record=pages.find(item=>item.slug===pageSlug)||savedPosts.find(item=>item.slug===pageSlug)||data.posts.find(item=>item.slug===pageSlug);
    if(!record)return;
    document.title=record.metaTitle||record.title||document.title;
    let description=document.querySelector('meta[name="description"]');
    if(!description){description=document.createElement('meta');description.name='description';document.head.append(description)}
    description.content=record.metaDescription||record.excerpt||'';
    let canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical)}
    if(record && data.posts && data.posts.some(p => p.slug === record.slug)){
      canonical.href=`${SITE_ORIGIN}${getPostUrl(record)}`;
    } else {
      canonical.href=`${SITE_ORIGIN}${path==='/'?'/':`/${record.slug}`}`;
    }
  }catch{}
}
applySavedSeoMeta();
function cleanSchemaText(value=''){const box=document.createElement('div');box.innerHTML=String(value);return (box.textContent||'').replace(/\s+/g,' ').trim()}
function isoSchemaDate(value){const date=new Date(value||'');return Number.isNaN(date.getTime())?'':date.toISOString()}
function addStructuredData(){
  if(path.startsWith('/admin'))return;
  const origin=SITE_ORIGIN,currentUrl=`${origin}${resolvedJobUrl?.publicPath || location.pathname}`;
  const orgId=`${origin}/#organization`,siteId=`${origin}/#website`,pageId=`${origin}${location.pathname}#webpage`;
  const graph=[
    {'@type':'Organization','@id':orgId,name:'Trikonet',url:`${origin}/`,logo:{'@type':'ImageObject',url:`${origin}/assets/logo-black.png?${LOGO_VERSION}`},email:'info@trikonet.com'},
    {'@type':'WebSite','@id':siteId,url:`${origin}/`,name:'Trikonet',publisher:{'@id':orgId},potentialAction:{'@type':'SearchAction',target:{'@type':'EntryPoint',urlTemplate:`${origin}/jobs?q={search_term_string}`},'query-input':'required name=search_term_string'}}
  ];
  let pageType='WebPage',pageName=document.querySelector('main h1')?.textContent?.trim()||'Trikonet';
  if(path==='/about')pageType='AboutPage';
  else if(path==='/contact')pageType='ContactPage';
  else if((path==='/jobs'||path==='/job-list'||path==='/job-openings')&&queryParams.toString())pageType='SearchResultsPage';
  else if(path==='/jobs'||path==='/job-list'||path==='/job-openings'||path==='/employers'||path==='/blog'||/^\/(category|location|designation)\//.test(path))pageType='CollectionPage';
  else if(path.startsWith('/employer/')||path.startsWith('/author/'))pageType='ProfilePage';
  graph.push({'@type':pageType,'@id':pageId,url:currentUrl,name:pageName,isPartOf:{'@id':siteId},about:{'@id':orgId},...(pageType==='ProfilePage'?{mainEntity:{'@id':`${currentUrl}${path.startsWith('/employer/')?'#profile':'#person'}`}}:{})});
  const parts=location.pathname.split('/').filter(Boolean);
  if(parts.length){
    const items=[{'@type':'ListItem',position:1,name:'Trikonet',item:`${origin}/`}];
    parts.forEach((part,index)=>items.push({'@type':'ListItem',position:index+2,name:decodeURIComponent(part).replace(/-/g,' ').replace(/\b\w/g,char=>char.toUpperCase()),item:`${origin}/${parts.slice(0,index+1).join('/')}`}));
    graph.push({'@type':'BreadcrumbList','@id':`${currentUrl}#breadcrumb`,itemListElement:items});
  }
  if(path.startsWith('/job/')&&!isClosedJob(wpRecord||data.jobs.find(job=>path.endsWith(`/${job.slug}`))||{})){
    const source=wpRecord||data.jobs.find(job=>path.endsWith(`/${job.slug}`))||{};
    const m=source.metas||{},job=mapJob(source),description=cleanSchemaText(source.content?.rendered||source.content||document.querySelector('.wordpress-content')?.innerHTML||'');
    const address={ '@type':'PostalAddress',streetAddress:source.streetAddress||m._job_street_address||source.address||undefined,addressLocality:source.addressLocality||m._job_address_locality||job.location||undefined,addressRegion:source.addressRegion||m._job_address_region||undefined,addressCountry:'AE' };
    Object.keys(address).forEach(key=>address[key]===undefined&&delete address[key]);
    const typeMap={'Full Time':'FULL_TIME','Part Time':'PART_TIME','Freelance':'CONTRACTOR','Contract':'CONTRACTOR','Internship':'INTERN','Temporary':'TEMPORARY'};
    const posting={'@type':'JobPosting','@id':`${currentUrl}#job`,title:job.title||pageName,description:source.description||description||job.title,identifier:{'@type':'PropertyValue',name:job.company||'Trikonet',value:String(source.urlJobId||source.id||source.slug||job.slug||'')},datePosted:isoSchemaDate(source.datePosted||source.postedDate||source.date||source.createdAt||job.date),validThrough:isoSchemaDate(source.deadline||source.expiryDate||m._job_application_deadline_date||m._job_expiry_date||job.deadline),employmentType:source.employmentType||m._job_employment_type||typeMap[job.type]||job.type||undefined,hiringOrganization:{'@type':'Organization',name:job.company||'Trikonet',sameAs:m._job_employer_url||job.employerUrl||undefined,logo:job.logo?new URL(job.logo,origin).href:undefined},jobLocation:{'@type':'Place',address},url:currentUrl};
    Object.keys(posting).forEach(key=>posting[key]===undefined&&delete posting[key]);graph.push(posting);
  }
  if(path==='/jobs'||path==='/job-list'||path==='/job-openings')graph.push({'@type':'ItemList','@id':`${currentUrl}#jobs`,name:'Job listings',numberOfItems:data.jobs.length,itemListElement:data.jobs.map((job,index)=>({'@type':'ListItem',position:index+1,url:`${origin}${publicJobPath(job)}`,name:job.title}))});
  if(path==='/employers')graph.push({'@type':'ItemList','@id':`${currentUrl}#employers`,name:'Employer listings',numberOfItems:(data.employers||[]).length,itemListElement:(data.employers||[]).map((employer,index)=>({'@type':'ListItem',position:index+1,url:`${origin}/employer/${employer.slug}`,name:employer.title}))});
  const currentPost=data.posts.find(post=>path.endsWith(`/${post.slug}`));
  if(currentPost)graph.push({'@type':['Article','BlogPosting'],'@id':`${currentUrl}#article`,headline:currentPost.title,description:currentPost.excerpt||cleanSchemaText(currentPost.content),datePublished:isoSchemaDate(currentPost.rawDate||currentPost.date)||undefined,image:currentPost.featuredImage?new URL(currentPost.featuredImage,origin).href:undefined,author:{'@type':'Person',name:currentPost.author||'Trikonet'},publisher:{'@id':orgId},mainEntityOfPage:{'@id':pageId}});
  if(path.startsWith('/employer/')){const source=wpRecord||data.employers.find(item=>path.endsWith(`/${item.slug}`))||{};graph.push({'@type':'Organization','@id':`${currentUrl}#profile`,name:source.title?.rendered||source.title||pageName,url:currentUrl,description:cleanSchemaText(source.content?.rendered||source.content||'')});}
  if(path.startsWith('/author/'))graph.push({'@type':'Person','@id':`${currentUrl}#person`,name:pageName,url:currentUrl});
  const faqItems=[...document.querySelectorAll('.rank-math-faq-item, .faq details')].map(item=>({question:item.querySelector('.rank-math-question, summary')?.textContent?.trim(),answer:cleanSchemaText(item.querySelector('.rank-math-answer, p')?.innerHTML||'')})).filter(item=>item.question&&item.answer);
  if(faqItems.length)graph.push({'@type':'FAQPage','@id':`${currentUrl}#faq`,mainEntity:faqItems.map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))});
  const script=document.createElement('script');script.type='application/ld+json';script.id='trikonet-structured-data';script.textContent=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c');document.head.append(script);
}
addStructuredData();
if(path.startsWith('/admin') && getAdminAuth()) initAdmin(getVerifiedAdmin());
document.querySelectorAll('.wp-block-rank-math-faq-block .rank-math-faq-item').forEach((item,index)=>{
  const question=item.querySelector('.rank-math-question');
  const answer=item.querySelector('.rank-math-answer');
  if(!question||!answer)return;
  const answerId=`faq-answer-${index}`;
  question.setAttribute('role','button');
  question.setAttribute('tabindex','0');
  question.setAttribute('aria-expanded','false');
  question.setAttribute('aria-controls',answerId);
  answer.id=answerId;
  answer.hidden=true;
  const toggle=()=>{const open=question.getAttribute('aria-expanded')==='true';question.setAttribute('aria-expanded',String(!open));answer.hidden=open;item.classList.toggle('is-open',!open)};
  question.addEventListener('click',toggle);
  question.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}});
});
const detailIcons={
  category:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2"/>',
  location:'<path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  date:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l-3 2"/>',
  phone:'<path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z"/>',
  email:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 7 9 7 9-7"/>',
  bookmark:'<path d="M6 3.5h12a1 1 0 0 1 1 1v16l-7-5-7 5v-16a1 1 0 0 1 1-1Z"/>'
};
const detailSvg=(name)=>`<svg class="detail-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${detailIcons[name]}</svg>`;
document.querySelectorAll('.detail-exact .detail-hero .detail-meta').forEach((row,rowIndex)=>{
  row.querySelectorAll('span').forEach((item,index)=>{
    const icon=rowIndex===0?['category','location',document.querySelector('.employer-hero')?'phone':'date'][index]:'email';
    if(!icon||!item.firstChild||item.firstChild.nodeType!==Node.TEXT_NODE)return;
    item.firstChild.textContent=item.firstChild.textContent.replace(/^\s*[^\w\s]\s*/, '');
    item.insertAdjacentHTML('afterbegin',detailSvg(icon));
  });
});
const employerSave=document.querySelector('.employer-hero .save');
if(employerSave)employerSave.innerHTML=detailSvg('bookmark');
const upsertMemberCollection=(kind,item,remove=false)=>{
  if(!currentUser)return;
  const key=memberCollectionKey(kind);
  let items=readMemberCollection(kind);
  const identity=String(item.slug||item.id||'');
  items=items.filter(entry=>String(entry.slug||entry.id||'')!==identity);
  if(!remove)items.unshift(item);
  try{localStorage.setItem(key,JSON.stringify(items.slice(0,200)))}catch{}
  fetch('/api/candidate/activity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({[kind]:items.slice(0,200)})}).catch(error=>console.warn('Account activity sync failed:',error.message));
};
if(currentUser){const activity=Object.fromEntries(['saved_jobs','applied_jobs','followed_companies'].map(kind=>[kind,readMemberCollection(kind)]).filter(([,items])=>items.length));if(Object.values(activity).some(items=>items.length))fetch('/api/candidate/activity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(activity)}).catch(()=>{});}
const currentDetailJob=path.startsWith('/job/')?(wpRecord||data.jobs.find(job=>path.endsWith(`/${job.slug}`))):null;
const currentJobView=currentDetailJob?mapJob(currentDetailJob):null;
const jobSaveButton=document.querySelector('.detail-actions .save');
if(jobSaveButton&&currentJobView){
  const saved=readMemberCollection('saved_jobs').some(item=>String(item.slug)===String(currentJobView.slug));
  jobSaveButton.classList.toggle('is-saved',saved);
  jobSaveButton.setAttribute('aria-label',saved?'Remove saved job':'Save job');
  jobSaveButton.addEventListener('click',()=>{
    if(!currentUser){location.href=`/login?redirect=${encodeURIComponent(path)}`;return}
    const willSave=!jobSaveButton.classList.contains('is-saved');
    jobSaveButton.classList.toggle('is-saved',willSave);
    jobSaveButton.setAttribute('aria-label',willSave?'Remove saved job':'Save job');
    upsertMemberCollection('saved_jobs',{...currentJobView,savedAt:new Date().toISOString()},!willSave);
  });
}
const applyButton=document.querySelector('.detail-actions .apply');
if(applyButton&&currentJobView)applyButton.addEventListener('click',()=>{
  if(currentUser)upsertMemberCollection('applied_jobs',{...currentJobView,appliedAt:new Date().toISOString()});
});
const hambBtn=document.querySelector('.hamb');
hambBtn?.addEventListener('click',function(){
  const links=document.querySelector('.links');
  const isOpen=links?.classList.toggle('open');
  this.classList.toggle('open',!!isOpen);
  this.setAttribute('aria-expanded',isOpen?'true':'false');
  document.body.classList.toggle('mobile-nav-open',!!isOpen);
});
const closeMobileNavigation=()=>{
  document.querySelector('.links')?.classList.remove('open');
  document.querySelector('.hamb')?.classList.remove('open');
  document.querySelector('.hamb')?.setAttribute('aria-expanded','false');
  document.body.classList.remove('mobile-nav-open');
};
const accountMenu = document.querySelector('.nav-account-menu');
const accountToggle = document.querySelector('#navAccountToggle');
const accountDropdown = document.querySelector('#navAccountDropdown');
const closeAccountMenu = () => {
  accountMenu?.classList.remove('is-open');
  accountToggle?.setAttribute('aria-expanded', 'false');
  accountDropdown?.setAttribute('aria-hidden', 'true');
};
accountToggle?.addEventListener('click', event => {
  event.stopPropagation();
  const willOpen = !accountMenu?.classList.contains('is-open');
  accountMenu?.classList.toggle('is-open', willOpen);
  accountToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  accountDropdown?.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
});
accountDropdown?.addEventListener('click', event => event.stopPropagation());
document.addEventListener('click', closeAccountMenu);
document.querySelectorAll('.nav-profile-photo img, .nav-account-summary-avatar img, .mobile-account-avatar img').forEach(image => {
  image.addEventListener('error', () => image.remove(), { once: true });
});
document.querySelectorAll('.mobile-nav-actions a').forEach(link=>link.addEventListener('click',closeMobileNavigation));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMobileNavigation();closeAccountMenu()}});
document.querySelectorAll('.nav-has-mega > .nav-link, .nav-has-dropdown > .nav-link').forEach(link => {
  link.addEventListener('click', e => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      const parent = link.closest('.nav-item');
      if (parent) {
        const isCurrentOpen = parent.classList.contains('mobile-expanded');
        document.querySelectorAll('.nav-item.mobile-expanded').forEach(item => item.classList.remove('mobile-expanded'));
        if (!isCurrentOpen) parent.classList.add('mobile-expanded');
      }
    }
  });
});
window.addEventListener('resize', () => {
  if (window.innerWidth <= 1100) return;
  const links = document.querySelector('.links');
  const button = document.querySelector('.hamb');
  links?.classList.remove('open');
  button?.classList.remove('open');
  button?.setAttribute('aria-expanded', 'false');
  document.querySelectorAll('.nav-item.mobile-expanded').forEach(item => item.classList.remove('mobile-expanded'));
  document.body.classList.remove('mobile-nav-open');
});
document.querySelector('#logoutBtn')?.addEventListener('click',async()=>{await fetch('/api/auth/logout',{method:'POST'});location.href='/'});
document.querySelector('#mobileLogoutBtn')?.addEventListener('click',async()=>{await fetch('/api/auth/logout',{method:'POST'});location.href='/'});
document.querySelector('#dashboardLogoutBtn')?.addEventListener('click',async()=>{await fetch('/api/auth/logout',{method:'POST'});location.href='/'});
document.querySelector('#navAccountLogout')?.addEventListener('click',async()=>{await fetch('/api/auth/logout',{method:'POST'});location.href='/'});

async function submitAuth(form,endpoint){
  const message=form.querySelector('.form-message');
  const submitBtn=form.querySelector('button[type="submit"]');
  const origContent=submitBtn?submitBtn.innerHTML:'';
  if(submitBtn){
    submitBtn.disabled=true;
    submitBtn.innerHTML=`<span>Please wait…</span>`;
  }
  if(message){
    message.className='form-message';
    message.textContent='Processing…';
  }
  try{
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result=await response.json();
    if(!response.ok){
      if(message){
        message.className='form-message error';
        message.textContent=result.error||'Unable to continue.';
      }
      if(submitBtn){
        submitBtn.disabled=false;
        submitBtn.innerHTML=origContent;
      }
      return;
    }
    if(message){
      message.className='form-message success';
      message.textContent=endpoint.includes('register')?'Account created successfully! Redirecting…':'Welcome back! Redirecting…';
    }
    const requestedRedirect=new URLSearchParams(location.search).get('redirect');
    const safeRedirect='/profile';
    setTimeout(()=>{location.href=safeRedirect},500);
  }catch(err){
    if(message){
      message.className='form-message error';
      message.textContent='Connection error. Please try again.';
    }
    if(submitBtn){
      submitBtn.disabled=false;
      submitBtn.innerHTML=origContent;
    }
  }
}

initGoogleSignIn();

document.querySelector('#loginForm')?.addEventListener('submit',event=>{event.preventDefault();submitAuth(event.currentTarget,'/api/auth/login')});
document.querySelector('#registerForm')?.addEventListener('submit',event=>{event.preventDefault();submitAuth(event.currentTarget,'/api/auth/register')});

function switchAuthView(mode){
  const loginView=document.querySelector('#authViewLogin');
  const registerView=document.querySelector('#authViewRegister');
  const tabs=document.querySelectorAll('.auth-tab');
  if(!loginView||!registerView)return;
  if(mode==='register'){
    loginView.classList.remove('active-view');
    loginView.classList.add('hidden-view');
    registerView.classList.remove('hidden-view');
    registerView.classList.add('active-view');
    tabs.forEach(t=>{
      const isTarget=t.dataset.target==='register';
      t.classList.toggle('active',isTarget);
      t.setAttribute('aria-selected',String(isTarget));
    });
    history.pushState(null,'','/register');
    document.title='Create Account — Trikonet';
  }else{
    registerView.classList.remove('active-view');
    registerView.classList.add('hidden-view');
    loginView.classList.remove('hidden-view');
    loginView.classList.add('active-view');
    tabs.forEach(t=>{
      const isTarget=t.dataset.target==='login';
      t.classList.toggle('active',isTarget);
      t.setAttribute('aria-selected',String(isTarget));
    });
    history.pushState(null,'','/login');
    document.title='Sign In — Trikonet';
  }
}

document.querySelectorAll('.auth-tab').forEach(tab=>{
  tab.addEventListener('click',e=>{
    e.preventDefault();
    switchAuthView(tab.dataset.target);
  });
});

document.querySelectorAll('.auth-switch-link').forEach(link=>{
  link.addEventListener('click',e=>{
    e.preventDefault();
    switchAuthView(link.dataset.switch);
  });
});

document.querySelectorAll('.toggle-password').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const targetId=btn.dataset.target;
    const input=document.getElementById(targetId);
    if(!input)return;
    const isPass=input.type==='password';
    input.type=isPass?'text':'password';
    btn.innerHTML=isPass
      ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`
      : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });
});

// Clear any browser pre-filled or autofilled credentials on login/register view
function clearAuthInputs() {
  const emailInput = document.querySelector('#loginEmail');
  const passInput = document.querySelector('#loginPassword');
  if (emailInput) {
    emailInput.value = '';
    emailInput.setAttribute('value', '');
  }
  if (passInput) {
    passInput.value = '';
    passInput.setAttribute('value', '');
  }
}
clearAuthInputs();
setTimeout(clearAuthInputs, 50);
setTimeout(clearAuthInputs, 200);
setTimeout(clearAuthInputs, 600);

window.addEventListener('popstate',()=>{
  const newPath=location.pathname;
  if(newPath==='/register'||newPath==='/signup'||newPath==='/sign-up'){
    switchAuthView('register');
  }else if(newPath==='/login'||newPath==='/signin'||newPath==='/sign-in'||newPath==='/login-register'){
    switchAuthView('login');
  }
});
const campaignForm=document.querySelector('#campaignForm'),campaignEditor=document.querySelector('.email-editor');
function fillCampaign(c={}){if(!campaignForm)return;campaignForm.elements.id.value=c.id||'';campaignForm.elements.name.value=c.name||'';campaignForm.elements.recipients.value=Array.isArray(c.recipients)?c.recipients.join(', '):(c.recipients||'');campaignForm.elements.subject.value=c.subject||'';campaignEditor.innerHTML=c.html||'';campaignForm.querySelector('.form-message').textContent=''}
document.querySelectorAll('.template-choice').forEach(button=>button.addEventListener('click',()=>{const template=emailTemplates[Number(button.dataset.template)];fillCampaign({name:template[0],subject:template[1],html:template[2]})}));
document.querySelectorAll('.draft-choice').forEach(button=>button.addEventListener('click',()=>fillCampaign(emailCampaigns.find(item=>item.id===button.dataset.id))));
document.querySelector('#newCampaign')?.addEventListener('click',()=>fillCampaign());
document.querySelectorAll('.email-toolbar button').forEach(button=>button.addEventListener('click',()=>{campaignEditor.focus();document.execCommand(button.dataset.command)}));
campaignForm?.addEventListener('submit',async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(campaignForm)),payload={...values,recipients:values.recipients.split(',').map(v=>v.trim()).filter(Boolean),html:campaignEditor.innerHTML,status:'draft'},response=await fetch('/api/email-campaigns',{method:values.id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),result=await response.json();campaignForm.querySelector('.form-message').textContent=response.ok?'Draft saved. You can safely resume it later.':result.error;if(response.ok)setTimeout(()=>location.reload(),700)});
document.querySelector('#sendCampaign')?.addEventListener('click',()=>{campaignForm.querySelector('.form-message').textContent='Your draft is ready. Connect an approved email provider before live delivery can be enabled.'});
const connectToggle=document.querySelector('.nav-dropdown-toggle');
connectToggle?.addEventListener('click',()=>{const open=connectToggle.getAttribute('aria-expanded')==='true';connectToggle.setAttribute('aria-expanded',String(!open));connectToggle.parentElement.classList.toggle('open',!open)});
document.addEventListener('click',event=>{if(connectToggle&&!connectToggle.parentElement.contains(event.target)){connectToggle.setAttribute('aria-expanded','false');connectToggle.parentElement.classList.remove('open')}});
function initRecentArticlesAutoSlider() {
  const slider = document.querySelector('#recent-articles');
  if (!slider || slider.dataset.initialized === 'true') return;
  slider.dataset.initialized = 'true';
  
  const dots = document.querySelectorAll('#recentArticlesDots .recent-dot');
  let autoTimer = null;
  
  const getStep = () => {
    const item = slider.querySelector('.article');
    if (!item) return 360;
    const gap = parseFloat(getComputedStyle(slider).gap) || 20;
    return item.getBoundingClientRect().width + gap;
  };

  const updateDots = () => {
    if (!dots.length) return;
    const step = getStep();
    if (!step) return;
    const idx = Math.min(dots.length - 1, Math.max(0, Math.round(slider.scrollLeft / step)));
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  };

  const slideNext = () => {
    const step = getStep();
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    if (slider.scrollLeft >= maxScroll - 15) {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const slidePrev = () => {
    const step = getStep();
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    if (slider.scrollLeft <= 15) {
      slider.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: -step, behavior: 'smooth' });
    }
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(slideNext, 4500);
  };

  const stopAuto = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  slider.stopAuto = stopAuto;
  startAuto();

  slider.addEventListener('scroll', () => {
    requestAnimationFrame(updateDots);
  }, { passive: true });

  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('touchstart', stopAuto, { passive: true });
  slider.addEventListener('touchend', startAuto, { passive: true });

  const sec = slider.closest('.recent-section') || slider.closest('.articles-carousel-wrap');
  if (sec) {
    sec.addEventListener('mouseenter', stopAuto);
    sec.addEventListener('mouseleave', startAuto);
    sec.querySelectorAll('.article-arrow-prev').forEach(btn => {
      btn.addEventListener('click', () => {
        stopAuto();
        slidePrev();
        startAuto();
      });
    });
    sec.querySelectorAll('.article-arrow-next').forEach(btn => {
      btn.addEventListener('click', () => {
        stopAuto();
        slideNext();
        startAuto();
      });
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAuto();
      const idx = parseInt(dot.dataset.index, 10);
      const step = getStep();
      slider.scrollTo({ left: idx * step, behavior: 'smooth' });
      startAuto();
    });
  });

  slider.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      stopAuto();
      if (event.key === 'ArrowRight') slideNext();
      else slidePrev();
      startAuto();
    }
  });
}
initRecentArticlesAutoSlider();
document.querySelectorAll('.show-phone').forEach(button=>button.addEventListener('click',()=>{button.previousSibling.textContent=`${button.dataset.phone} `;button.remove()}));
document.querySelector('#contact')?.addEventListener('submit',e=>{e.preventDefault();toast('Thanks — your message is saved in this local demo.')});
document.querySelector('#jobForm')?.addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));if(data.jobs.some(j=>j.slug===f.slug)&&!confirm('Changing this URL may affect SEO and existing links. Continue?'))return;data.jobs.unshift({...f,id:Date.now(),type:'Full Time',date:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})});store.set(data);toast('Job published locally.');e.target.reset()});
document.querySelector('#postForm')?.addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));data.posts.unshift({...f,date:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})});store.set(data);toast('Blog post published locally.');e.target.reset()});
document.querySelector('#reset')?.addEventListener('click',()=>store.reset());
function toast(msg){const n=document.createElement('div');n.className='toast';n.textContent=msg;document.body.append(n);setTimeout(()=>n.remove(),2500)}

// Blog Post Feedback Rating Interaction
document.addEventListener('click', e => {
  const btn = e.target.closest('.feedback-rate-btn');
  if (!btn) return;
  const card = btn.closest('.content-feedback-card');
  if (!card) return;
  const rating = btn.dataset.rate;
  const postId = btn.dataset.postId;
  
  card.querySelectorAll('.feedback-rate-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  try {
    const ratings = JSON.parse(localStorage.getItem('trikonet_post_ratings') || '{}');
    if (!ratings[postId]) {
      const countEl = card.querySelector('.feedback-count');
      if (countEl) {
        const currentCount = parseInt(countEl.textContent.replace(/,/g, ''), 10) || 2023;
        countEl.textContent = (currentCount + 1).toLocaleString();
      }
    }
    ratings[postId] = rating;
    localStorage.setItem('trikonet_post_ratings', JSON.stringify(ratings));
  } catch {}
  
  const toastEl = card.querySelector('.feedback-toast');
  if (toastEl) {
    toastEl.style.display = 'block';
  }
});

function restoreSavedFeedbackRatings() {
  try {
    const ratings = JSON.parse(localStorage.getItem('trikonet_post_ratings') || '{}');
    document.querySelectorAll('.content-feedback-card').forEach(card => {
      const btn = card.querySelector('.feedback-rate-btn');
      if (!btn) return;
      const postId = btn.dataset.postId;
      const savedRate = ratings[postId];
      if (savedRate) {
        const targetBtn = card.querySelector(`.feedback-rate-btn[data-rate="${savedRate}"]`);
        if (targetBtn) targetBtn.classList.add('active');
      }
    });
  } catch {}
}
restoreSavedFeedbackRatings();

// Custom Select Dropdowns interaction
document.addEventListener('click', e => {
  const trigger = e.target.closest('.custom-select-trigger');
  const option = e.target.closest('.custom-select-option');
  
  if (trigger) {
    const wrapper = trigger.closest('.custom-select-wrapper');
    const wasOpen = wrapper?.classList.contains('open');
    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
      w.classList.remove('open');
      w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen && wrapper) {
      wrapper.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    return;
  }
  
  if (option) {
    const wrapper = option.closest('.custom-select-wrapper');
    if (!wrapper) return;
    const value = option.dataset.value || '';
    const label = option.querySelector('span')?.textContent || '';
    const input = wrapper.querySelector('input[type="hidden"]');
    const labelEl = wrapper.querySelector('.custom-select-label');
    
    if (input) input.value = value;
    if (labelEl) labelEl.textContent = label;
    
    wrapper.querySelectorAll('.custom-select-option').forEach(opt => {
      const isSelected = opt === option;
      opt.classList.toggle('selected', isSelected);
      opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      const existingCheck = opt.querySelector('.custom-select-check');
      if (isSelected && !existingCheck) {
        opt.insertAdjacentHTML('beforeend', '<svg class="custom-select-check" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>');
      } else if (!isSelected && existingCheck) {
        existingCheck.remove();
      }
    });
    
    wrapper.classList.remove('open');
    wrapper.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
    return;
  }
  
  document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
    w.classList.remove('open');
    w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
      w.classList.remove('open');
      w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }
});

// Footer Categories Accordion Interaction
document.addEventListener('click', e => {
  const header = e.target.closest('.footer-acc-header');
  if (!header) return;
  const row = header.closest('.footer-acc-row');
  if (!row) return;
  const wasOpen = row.classList.contains('open');
  row.classList.toggle('open', !wasOpen);
  header.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
});

// Compact mobile job filters: closed by default, expanded on demand.
document.addEventListener('click', e => {
  const toggle = e.target.closest('.jobs-filter-mobile-toggle');
  if (!toggle) return;
  const card = toggle.closest('.jobs-filter-card');
  if (!card) return;
  const isOpen = card.classList.toggle('filters-open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Hide job filters' : 'Show job filters');
  const label = toggle.querySelector('span');
  if (label) label.textContent = isOpen ? 'Hide filters' : 'Show filters';
});

// Featured Companies Carousel Arrow Navigation
document.addEventListener('click', e => {
  const nextBtn = e.target.closest('.carousel-arrow-next');
  if (nextBtn) {
    const wrap = nextBtn.closest('.featured-companies-carousel-wrap');
    const track = wrap?.querySelector('.featured-companies-track');
    if (track) {
      const card = track.querySelector('.featured-company-card');
      const cardWidth = card ? card.getBoundingClientRect().width : 240;
      const gap = parseFloat(getComputedStyle(track).gap) || 16;
      const scrollStep = cardWidth + gap;
      const visibleCount = Math.max(1, Math.round(track.clientWidth / scrollStep));
      track.scrollBy({ left: scrollStep * visibleCount, behavior: 'smooth' });
    }
    return;
  }
  const prevBtn = e.target.closest('.carousel-arrow-prev');
  if (prevBtn) {
    const wrap = prevBtn.closest('.featured-companies-carousel-wrap');
    const track = wrap?.querySelector('.featured-companies-track');
    if (track) {
      const card = track.querySelector('.featured-company-card');
      const cardWidth = card ? card.getBoundingClientRect().width : 240;
      const gap = parseFloat(getComputedStyle(track).gap) || 16;
      const scrollStep = cardWidth + gap;
      const visibleCount = Math.max(1, Math.round(track.clientWidth / scrollStep));
      track.scrollBy({ left: -scrollStep * visibleCount, behavior: 'smooth' });
    }
    return;
  }
});

// Employer Directory Top Categories Strip Navigation & How It Works Slider
document.addEventListener('click', e => {
  const prevBtn = e.target.closest('#empTopPrevBtn');
  if (prevBtn) {
    const track = document.getElementById('empTopHiringTrack');
    if (track) {
      const scrollAmount = Math.max(240, Math.floor(track.clientWidth * 0.75));
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
    return;
  }
  const nextBtn = e.target.closest('#empTopNextBtn');
  if (nextBtn) {
    const track = document.getElementById('empTopHiringTrack');
    if (track) {
      const scrollAmount = Math.max(240, Math.floor(track.clientWidth * 0.75));
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    return;
  }

  // How It Works Mobile Slider Interactive Dots
  const howDot = e.target.closest('.how-dot');
  if (howDot) {
    const index = parseInt(howDot.getAttribute('data-index'), 10);
    const track = document.getElementById('howStepsTrack');
    if (track) {
      const cards = track.querySelectorAll('.how-step-item');
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    return;
  }
});

// Update active dot on scroll for How It Works mobile slider
document.addEventListener('scroll', e => {
  if (e.target && e.target.id === 'howStepsTrack') {
    const track = e.target;
    const dots = document.querySelectorAll('.how-dot');
    if (!dots.length) return;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    const cards = track.querySelectorAll('.how-step-item');
    let closestIdx = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const diff = Math.abs(trackCenter - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === closestIdx);
    });
  }
}, true);

// Employer Detail Page Interactions
window.handleClaimFileSelect = function(input) {
  const label = document.getElementById('empUploadLabelText');
  if (!label) return;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const kb = Math.round(file.size / 1024);
    label.textContent = `Selected: ${file.name} (${kb} KB)`;
    label.style.color = '#15803d';
    label.style.fontWeight = '600';
  } else {
    label.textContent = 'Click or drag & drop trade license / document here';
    label.style.color = '';
    label.style.fontWeight = '';
  }
};

window.handleEmployerClaimSubmit = async function(form) {
  const btn = form.querySelector('#empClaimSubmitBtn');
  const origText = btn ? btn.innerHTML : 'Submit Claim Request';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Submitting verification…';
  }

  try {
    const formData = new FormData(form);
    const fileInput = form.querySelector('#empDocFileInput');
    let fileData = null;
    let fileName = '';
    let fileSize = 0;
    let fileType = '';

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type;
      if (file.size <= 10 * 1024 * 1024) {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    }

    const payload = {
      employerSlug: formData.get('employerSlug'),
      employerName: formData.get('employerName'),
      applicantName: formData.get('applicantName'),
      designation: formData.get('designation'),
      workEmail: formData.get('workEmail'),
      phone: formData.get('phone'),
      documentType: formData.get('documentType'),
      notes: formData.get('notes'),
      fileName,
      fileSize,
      fileType,
      documentData: fileData
    };

    const res = await fetch('/api/local/employer-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit claim request.');
    }

    const codeEl = document.getElementById('empClaimRefCode');
    if (codeEl && data.claim) {
      codeEl.textContent = data.claim.id;
    }
    const formWrap = document.getElementById('empClaimFormWrap');
    const succWrap = document.getElementById('empClaimSuccessWrap');
    if (formWrap) formWrap.style.display = 'none';
    if (succWrap) succWrap.style.display = 'block';

  } catch (err) {
    alert(err.message || 'Error submitting claim request. Please check the information and try again.');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  }
};

window.handleEmployerRateSubmit = async function(form) {
  const ratingFields = ['salary', 'workLife', 'satisfaction', 'skills', 'culture', 'security'];
  const selectedRatings = ratingFields.map(section => Number(form.querySelector(`[name="rating_${section}"]`)?.value || 0));
  if (selectedRatings.some(rating => rating < 1 || rating > 5)) {
    alert('Please select a rating for every workplace category.');
    return;
  }
  const btn = form.querySelector('#empRateSubmitBtn');
  const origText = btn ? btn.innerHTML : 'Submit Rating';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Submitting rating…';
  }

  try {
    const formData = new FormData(form);
    const employerSlug = formData.get('employerSlug') || 'employer';
    const newReview = {
      id: 'rev_' + Date.now(),
      employerSlug,
      employerName: formData.get('employerName') || '',
      ratingScore: Number(formData.get('ratingScore')),
      rating_salary: Number(formData.get('rating_salary')),
      rating_workLife: Number(formData.get('rating_workLife')),
      rating_satisfaction: Number(formData.get('rating_satisfaction')),
      rating_skills: Number(formData.get('rating_skills')),
      rating_culture: Number(formData.get('rating_culture')),
      rating_security: Number(formData.get('rating_security')),
      jobTitle: formData.get('jobTitle') || 'Professional',
      employmentStatus: formData.get('employmentStatus') || 'Current Employee',
      location: formData.get('location') || '',
      yearsExp: formData.get('yearsExp') || '',
      reviewTitle: formData.get('reviewTitle') || '',
      feedback: formData.get('feedback') || '',
      createdAt: new Date().toISOString()
    };

    // Store in localStorage
    const storageKey = 'trikonet_emp_reviews_' + employerSlug;
    let existing = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) existing = JSON.parse(raw);
    } catch(e) {}
    existing.unshift(newReview);
    localStorage.setItem(storageKey, JSON.stringify(existing));

    // Render newly updated reviews list
    if (window.renderEmployerUserReviews) {
      window.renderEmployerUserReviews(employerSlug);
    }

    // Toggle modal state to success
    const formWrap = document.getElementById('empRateFormWrap');
    const succWrap = document.getElementById('empRateSuccessWrap');
    if (formWrap) formWrap.style.display = 'none';
    if (succWrap) succWrap.style.display = 'block';

  } catch(err) {
    alert(err.message || 'Error submitting rating. Please try again.');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  }
};

window.renderEmployerUserReviews = function(slug) {
  try {
    const storageKey = 'trikonet_emp_reviews_' + slug;
    const raw = localStorage.getItem(storageKey);
    const reviews = raw ? JSON.parse(raw) : [];

    const badge = document.getElementById('empTabReviewsBadge');
    if (badge) {
      badge.textContent = reviews.length;
    }

    const headerRatingRow = document.getElementById('empHeaderRatingRow');
    const headerRatingVal = document.getElementById('empHeaderRatingVal');
    const headerReviewCnt = document.getElementById('empHeaderReviewCnt');

    const reviewsHeaderPill = document.getElementById('empReviewsHeaderRatingPill');
    const scoreBanner = document.getElementById('empRatingScoreBanner');
    const speaksWrapper = document.getElementById('empSpeaksListWrapper');
    const container = document.getElementById('empUserReviewsList');
    const emptyState = document.getElementById('empNoReviewsEmptyState');

    if (reviews && reviews.length > 0) {
      // Calculate real averages
      const avgOverall = (reviews.reduce((acc, r) => acc + Number(r.ratingScore || 5), 0) / reviews.length).toFixed(1);
      const avgSalary = (reviews.reduce((acc, r) => acc + Number(r.rating_salary || r.ratingScore || 5), 0) / reviews.length).toFixed(1);
      const avgWorkLife = (reviews.reduce((acc, r) => acc + Number(r.rating_workLife || r.ratingScore || 5), 0) / reviews.length).toFixed(1);
      const avgSatisfaction = (reviews.reduce((acc, r) => acc + Number(r.rating_satisfaction || r.ratingScore || 5), 0) / reviews.length).toFixed(1);
      const avgSkills = (reviews.reduce((acc, r) => acc + Number(r.rating_skills || r.ratingScore || 5), 0) / reviews.length).toFixed(1);
      const avgCulture = (reviews.reduce((acc, r) => acc + Number(r.rating_culture || r.ratingScore || 5), 0) / reviews.length).toFixed(1);
      const avgSecurity = (reviews.reduce((acc, r) => acc + Number(r.rating_security || r.ratingScore || 5), 0) / reviews.length).toFixed(1);

      // Header rating
      if (headerRatingRow) headerRatingRow.style.display = 'inline-flex';
      if (headerRatingVal) headerRatingVal.textContent = avgOverall;
      if (headerReviewCnt) headerReviewCnt.textContent = `(${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})`;

      // Reviews tab header pill
      if (reviewsHeaderPill) {
        reviewsHeaderPill.style.display = 'inline-flex';
        reviewsHeaderPill.textContent = `★ ${avgOverall} Overall Rating`;
      }

      // Rating score banner
      if (scoreBanner) {
        scoreBanner.style.display = 'flex';
        const bigNum = document.getElementById('empBigOverallScore');
        if (bigNum) bigNum.textContent = avgOverall;
        const bigStars = document.getElementById('empBigOverallStars');
        if (bigStars) {
          const filled = Math.min(5, Math.max(1, Math.round(Number(avgOverall))));
          bigStars.textContent = '★'.repeat(filled) + '☆'.repeat(5 - filled);
        }
        const lbl = document.getElementById('empReviewsCountLabel');
        if (lbl) lbl.textContent = `Based on ${reviews.length} employee ${reviews.length === 1 ? 'review' : 'reviews'}`;
        const secVal = document.getElementById('empSecurityVal');
        if (secVal) secVal.textContent = avgSecurity;
      }

      // Breakdown bars
      if (speaksWrapper) {
        speaksWrapper.style.display = 'block';
        const updateBar = (idFill, idScore, val) => {
          const f = document.getElementById(idFill);
          const s = document.getElementById(idScore);
          const pct = Math.min(100, Math.max(0, Math.round((Number(val) / 5) * 100)));
          if (f) f.style.width = pct + '%';
          if (s) s.textContent = '★ ' + val;
        };
        updateBar('fill_salary', 'score_salary', avgSalary);
        updateBar('fill_workLife', 'score_workLife', avgWorkLife);
        updateBar('fill_satisfaction', 'score_satisfaction', avgSatisfaction);
        updateBar('fill_skills', 'score_skills', avgSkills);
        updateBar('fill_culture', 'score_culture', avgCulture);
        updateBar('fill_security', 'score_security', avgSecurity);
      }

      // Hide empty state
      if (emptyState) emptyState.style.display = 'none';

      // Render reviews
      if (container) {
        const escHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        container.innerHTML = reviews.map(r => `
          <div class="emp-sample-review-card emp-user-submitted-review" style="border-left: 4px solid #16a34a; background: #ffffff;">
            <div class="emp-review-card-head">
              <div class="emp-reviewer-info">
                <span class="emp-reviewer-badge" style="background:#16a34a; color:#ffffff;">★ ${Number(r.ratingScore || 5).toFixed(1)}</span>
                <div>
                  <strong>${escHtml(formatJobTitle(r.jobTitle || 'Employee'))}</strong>
                  <span class="emp-review-meta">${escHtml(r.employmentStatus || 'Employee')}${r.location ? ' • ' + escHtml(r.location) : ''} • Local draft · not published</span>
                </div>
              </div>
              <span class="emp-review-date" style="color:#16a34a; font-weight:600;">Recent</span>
            </div>
            <h4 class="emp-review-headline">"${escHtml(r.reviewTitle)}"</h4>
            <p class="emp-review-text">${escHtml(r.feedback)}</p>
            <div class="emp-review-section-pills">
              <span class="emp-sec-pill">💰 Salary: <strong>★${Number(r.rating_salary || r.ratingScore || 5).toFixed(1)}</strong></span>
              <span class="emp-sec-pill">⚖️ Work Life: <strong>★${Number(r.rating_workLife || r.ratingScore || 5).toFixed(1)}</strong></span>
              <span class="emp-sec-pill">🎯 Satisfaction: <strong>★${Number(r.rating_satisfaction || r.ratingScore || 5).toFixed(1)}</strong></span>
              <span class="emp-sec-pill">🚀 Skills: <strong>★${Number(r.rating_skills || r.ratingScore || 5).toFixed(1)}</strong></span>
              <span class="emp-sec-pill">🤝 Culture: <strong>★${Number(r.rating_culture || r.ratingScore || 5).toFixed(1)}</strong></span>
              <span class="emp-sec-pill">🛡️ Security: <strong>★${Number(r.rating_security || r.ratingScore || 5).toFixed(1)}</strong></span>
            </div>
          </div>
        `).join('');
      }

      // Update callout buttons
      const rateBtns = document.querySelectorAll('#openRateCompanyBtn, #openRateCompanyCalloutBtn, #openRateCompanyBtnSidebar, #openRateCompanyEmptyBtn');
      rateBtns.forEach(btn => {
        btn.innerHTML = `★ Rate Company`;
      });

    } else {
      // Zero reviews: Clean Empty State!
      if (headerRatingRow) headerRatingRow.style.display = 'none';
      if (reviewsHeaderPill) reviewsHeaderPill.style.display = 'none';
      if (scoreBanner) scoreBanner.style.display = 'none';
      if (speaksWrapper) speaksWrapper.style.display = 'none';
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
    }

  } catch(e) {
    console.error('Error rendering employer reviews:', e);
  }
};

document.addEventListener('click', e => {
  // Rate company modal open
  if (e.target.closest('#openRateCompanyBtn') || e.target.closest('#openRateCompanyCalloutBtn') || e.target.closest('#openRateCompanyBtnSidebar') || e.target.closest('#openRateCompanyBtnHeader') || e.target.closest('.emp-open-rate-modal') || e.target.closest('#openRateCompanyEmptyBtn')) {
    e.preventDefault();
    const modal = document.getElementById('empRateModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      const rateForm = document.getElementById('empRateSubmitForm');
      if (rateForm) {
        rateForm.querySelectorAll('.emp-sec-star-btn').forEach(star => star.classList.remove('active'));
        rateForm.querySelectorAll('input[id^="input_rating_"]').forEach(input => { input.value = ''; });
        rateForm.querySelectorAll('.emp-sec-score-badge').forEach(badge => { badge.textContent = '—'; });
        const overallInput = document.getElementById('empSelectedRatingScore');
        const overallValue = document.getElementById('empCalcOverallVal');
        const statusTag = document.getElementById('empStarStatusTag');
        if (overallInput) overallInput.value = '';
        if (overallValue) overallValue.textContent = '—';
        if (statusTag) statusTag.textContent = 'Select all categories';
      }
      const formWrap = document.getElementById('empRateFormWrap');
      const succWrap = document.getElementById('empRateSuccessWrap');
      if (formWrap) formWrap.style.display = 'block';
      if (succWrap) succWrap.style.display = 'none';
    }
    return;
  }

  // Rate company modal close
  if (e.target.closest('#empCloseRateBtn') || (e.target.classList && e.target.id === 'empRateModal')) {
    const modal = document.getElementById('empRateModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
    return;
  }

  // Interactive Section Star Rating selection in modal
  const secStarBtn = e.target.closest('.emp-sec-star-btn');
  if (secStarBtn) {
    e.preventDefault();
    const section = secStarBtn.dataset.section;
    const rating = parseInt(secStarBtn.dataset.rating, 10) || 0;

    // Update section input & badge
    const input = document.getElementById(`input_rating_${section}`);
    if (input) input.value = rating;
    const badge = document.getElementById(`scoreBadge_${section}`);
    if (badge) badge.textContent = rating.toFixed(1);

    // Toggle active on stars for this section
    const group = secStarBtn.closest('.emp-sec-stars-group');
    if (group) {
      group.querySelectorAll('.emp-sec-star-btn').forEach(btn => {
        const r = parseInt(btn.dataset.rating, 10) || 0;
        btn.classList.toggle('active', r <= rating);
      });
    }

    // Recalculate Overall Rating
    const sections = ['salary', 'workLife', 'satisfaction', 'skills', 'culture', 'security'];
    const selected = sections.map(s => {
      const inp = document.getElementById(`input_rating_${s}`);
      return Number(inp?.value || 0);
    }).filter(value => value > 0);
    const overallInput = document.getElementById('empSelectedRatingScore');
    const overallVal = document.getElementById('empCalcOverallVal');
    const statusTag = document.getElementById('empStarStatusTag');
    if (selected.length === sections.length) {
      const avg = (selected.reduce((sum, value) => sum + value, 0) / sections.length).toFixed(1);
      if (overallInput) overallInput.value = avg;
      if (overallVal) overallVal.textContent = avg;
      const num = Number(avg);
      if (statusTag) statusTag.textContent = num >= 4.5 ? `${avg} - Excellent` : num >= 3.5 ? `${avg} - Very Good` : num >= 2.5 ? `${avg} - Good` : `${avg} - Fair`;
    } else {
      if (overallInput) overallInput.value = '';
      if (overallVal) overallVal.textContent = '—';
      if (statusTag) statusTag.textContent = `${selected.length} of ${sections.length} categories rated`;
    }
    return;
  }

  // Claim modal open
  if (e.target.closest('#empOpenClaimBtn')) {
    e.preventDefault();
    const modal = document.getElementById('empClaimModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      const formWrap = document.getElementById('empClaimFormWrap');
      const succWrap = document.getElementById('empClaimSuccessWrap');
      if (formWrap) formWrap.style.display = 'block';
      if (succWrap) succWrap.style.display = 'none';
    }
    return;
  }

  // Claim modal close button or backdrop click
  if (e.target.closest('#empCloseClaimBtn') || (e.target.classList && e.target.id === 'empClaimModal')) {
    const modal = document.getElementById('empClaimModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
    return;
  }

  // Employer profile sub-tabs switching
  const tab = e.target.closest('.emp-profile-tab-item');
  if (tab) {
    e.preventDefault();
    tab.blur();
    const target = tab.dataset.tab;
    if (!target) return;
    const tabUrl = new URL(location.href);
    if (target === 'overview' && !tabUrl.searchParams.has('jobsPage')) tabUrl.searchParams.delete('tab');
    else tabUrl.searchParams.set('tab', target);
    // Retain the jobs page so returning to Jobs restores its position.
    tabUrl.hash = '';
    if (tabUrl.href !== location.href) history.pushState(null, '', tabUrl.pathname + tabUrl.search);
    document.querySelectorAll('.emp-profile-tab-item').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.emp-profile-tab-item').forEach(t => t.setAttribute('aria-selected', String(t === tab)));
    document.querySelectorAll('.emp-tab-panel').forEach(p => {
      const isMatch = (p.dataset.panel === target) || (p.id === `panel-${target}`);
      p.classList.toggle('active', isMatch);
      p.style.display = isMatch ? 'block' : 'none';
    });

    if (target === 'reviews') {
      const slugInput = document.querySelector('#empRateSubmitForm input[name="employerSlug"]');
      if (slugInput && window.renderEmployerUserReviews) {
        window.renderEmployerUserReviews(slugInput.value);
      }
    }
    return;
  }

  // Employer About Read More toggle
  const readMoreBtn = e.target.closest('#empAboutReadMoreBtn');
  if (readMoreBtn) {
    const body = document.getElementById('empAboutBody');
    if (body) {
      const isExpanded = body.classList.toggle('is-expanded');
      readMoreBtn.textContent = isExpanded ? 'Show less ↑' : 'Read more ↓';
    }
    return;
  }

  // Employer follow button toggle
  const followBtn = e.target.closest('.emp-follow-btn');
  if (followBtn) {
    if (!currentUser) {
      const returnPath = `${location.pathname}${location.search}${location.hash}`;
      location.href = `/login?redirect=${encodeURIComponent(returnPath)}`;
      return;
    }
    const isFollowing = followBtn.classList.toggle('following');
    followBtn.textContent = isFollowing ? '✓ Following' : '+ Follow';
    const employerSlug = followBtn.dataset.slug;
    if (employerSlug) {
      const userKey = currentUser.id || currentUser.email || 'member';
      try { localStorage.setItem(`trikonet_follow_employer_${userKey}_${employerSlug}`, String(isFollowing)); } catch {}
      const employerTitle=document.querySelector('.emp-profile-title, .employer-hero h1, .detail-hero h1')?.textContent?.trim()||employerSlug.replace(/-/g,' ');
      const employerLogo=document.querySelector('.emp-profile-logo-img, .employer-hero img')?.getAttribute('src')||'';
      const employerCategory=document.querySelector('.emp-cat-pill')?.textContent?.trim()||'';
      const employerLocation=document.querySelector('.emp-location-pill')?.textContent?.trim()||'';
      upsertMemberCollection('followed_companies',{slug:employerSlug,title:employerTitle,logo:employerLogo,category:employerCategory,location:employerLocation,followedAt:new Date().toISOString()},!isFollowing);
    }
    return;
  }
});

function updatePermanentJobLinks() {
  const jobs = [...data.jobs, ...(resolvedJobUrl?.job ? [resolvedJobUrl.job] : [])];
  const paths = new Map(jobs.map(job => [job.slug, publicJobPath(job)]));
  document.querySelectorAll('a[href^="/job/"]').forEach(link => {
    const slug = decodeURIComponent(new URL(link.href).pathname.split('/')[2] || '');
    if (paths.has(slug)) link.setAttribute('href', paths.get(slug));
  });
}
updatePermanentJobLinks();
let permanentLinksScheduled=false;
new MutationObserver(()=>{if(permanentLinksScheduled)return;permanentLinksScheduled=true;requestAnimationFrame(()=>{permanentLinksScheduled=false;updatePermanentJobLinks()})}).observe(document.getElementById('app') || document.body, {childList:true,subtree:true});

// Website recovery shares the same backend and account records as the mobile app.
document.querySelectorAll('[data-password-reset]').forEach(link => link.addEventListener('click', event => {
 event.preventDefault();
 const form = link.closest('form') || document.querySelector('#loginForm');
 if (!form) return;
 form.innerHTML = `<h2>Reset your password</h2><label for="recoveryEmail">Email</label><input id="recoveryEmail" name="email" type="email" autocomplete="email" required><div class="recovery-fields"></div><button class="auth-submit-btn" type="submit">Send reset code</button><p class="form-message" role="status" aria-live="polite"></p><a href="${location.pathname}" class="forgot-link">Back to sign in</a>`;
 const replacement = form.cloneNode(true); replacement.removeAttribute('novalidate'); replacement.setAttribute('autocomplete','on'); form.replaceWith(replacement);
 const styleRecoveryFields = () => replacement.querySelectorAll('input').forEach(input => { if (input.parentElement.classList.contains('input-wrap')) return; const wrap = document.createElement('div'); wrap.className = 'input-wrap'; input.before(wrap); wrap.append(input); });
 styleRecoveryFields();
 let challenge = '';
 replacement.addEventListener('submit', async event => {
  event.preventDefault(); const button = replacement.querySelector('button'); if (button.disabled) return;
  const message = replacement.querySelector('.form-message'); const values = Object.fromEntries(new FormData(replacement));
  button.disabled = true; message.textContent = '';
  try {
   const response = await fetch(challenge ? '/api/auth/reset-password' : '/api/auth/forgot-password', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,challenge})});
   const result = await response.json(); if (!response.ok) throw new Error(result.message || result.error || 'Please try again.');
   if (challenge) { replacement.querySelector('.recovery-fields').replaceChildren(); button.remove(); message.textContent = 'Your password has been reset. You can now sign in.'; }
   else {
    challenge = result.challenge;
    replacement.querySelector('[name="email"]').readOnly = true;
    replacement.querySelector('.recovery-fields').innerHTML = `<label for="recoveryCode">Reset code</label><input id="recoveryCode" name="otp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><label for="recoveryPassword">New password</label><input id="recoveryPassword" name="new_password" type="password" autocomplete="new-password" minlength="8" maxlength="256" required>`;
    styleRecoveryFields(); button.textContent = 'Reset password'; message.textContent = 'If an account exists, a reset code has been sent. It expires in 10 minutes.'; replacement.querySelector('[name="otp"]').focus();
   }
  } catch (error) { message.textContent = error.message || 'Unable to connect. Please try again.'; }
  finally { button.disabled = false; }
 });
 replacement.querySelector('[name="email"]').focus();
}));

// Refresh account identity from the database on return and while signed in.
function clearRevokedCandidateCache(){
  const owner=String(currentUser?.id||currentUser?.email||'');
  for(const key of Object.keys(localStorage)){
    if((owner&&key.endsWith(`_${owner}`)&&/^trikonet_(saved_jobs|applied_jobs|followed_companies|follow_employer)_/.test(key))||['cvBuilderPluginState','cvBuilderPluginState-template-styles-v1','trikonet-candidate-profile-v1','trikonet-saved','trikonet-applications-v1'].includes(key))localStorage.removeItem(key);
  }
  currentUser=null;
  location.replace('/login');
}
async function refreshAccountIdentity(){if(!currentUser||document.visibilityState!=='visible')return;try{const response=await fetch('/api/auth/me', {signal:AbortSignal.timeout(path === '/' ? 1500 : 3000)});if(response.status===401){clearRevokedCandidateCache();return;}if(!response.ok)return;const {user}=await response.json();if(!user)return;const changed=currentUser.name!==user.name||currentUser.email!==user.email;Object.assign(currentUser,user);if(changed){const response=await fetch('/api/candidate/profile', {signal:AbortSignal.timeout(path === '/' ? 1500 : 3000)});if(response.ok)currentUser.profile=(await response.json()).profile;document.querySelectorAll('.nav-account-summary strong,.mobile-account-summary strong').forEach(el=>el.textContent=user.name);document.querySelectorAll('.nav-profile-initial').forEach(el=>el.textContent=user.name?.charAt(0)||'U');document.querySelectorAll('.candidate-profile-hero h1').forEach(el=>{if(el.firstChild?.nodeType===3)el.firstChild.textContent=user.name+' '});}}catch{}}
window.addEventListener('focus',refreshAccountIdentity);setInterval(refreshAccountIdentity,120000);
// The email belongs to the same account; updating it requires verification.
document.addEventListener('click',async event=>{
 const trigger=event.target.closest('[data-change-account-email]');if(!trigger)return;
 let email=prompt('Enter your new account email:');if(!email)return;
 try{const request=await fetch('/api/candidate/email/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const pending=await request.json();if(!request.ok)throw Error(pending.error);const code=prompt(pending.message);if(!code)return;const response=await fetch('/api/candidate/email/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge:pending.challenge,code})});const result=await response.json();if(!response.ok)throw Error(result.error);Object.assign(currentUser,result.user);currentUser.profile=result.profile;const field=document.querySelector('#candEmail');if(field)field.value=result.user.email;alert('Email updated. Your account and saved data are unchanged.');}catch(error){alert(error.message||'Unable to update email.');}
});

// Reveal only after synchronous page setup and visible assets have settled.
await revealPage();

// Refresh only the data sections. Preserve the hero, search input, navigation
// and their listeners while optional homepage requests finish in the background.
if (homeContentReady) {
  homeContentReady.then(() => {
    const replacements = {
      categories: ['.home-categories-section', homeCategories],
      'top-companies': ['.featured-companies-section', homeTopCompanies],
      articles: ['.recent-section', articleSection]
    };
    const updated = new Map();
    for (const {type, settings} of homeWidgets()) {
      const replacement = replacements[type];
      if (!replacement) continue;
      const [selector, renderer] = replacement;
      const sections = updated.get(selector) || [...document.querySelectorAll(`main ${selector}`)];
      updated.set(selector, sections);
      const section = sections.shift();
      if (section) {
        section.querySelector('#recent-articles')?.stopAuto?.();
        section.outerHTML = renderer(settings);
      }
    }
    initRecentArticlesAutoSlider();
  }).catch(error => console.warn('Homepage refresh unavailable:', error));
}

// Supplemental sections must not hold the description or Apply controls behind
// the full-page loader. Replace only these sections after their data arrives.
if (jobExtrasReady) jobExtrasReady.then(() => {
  if (!wpRecord) return;
  const updated = new DOMParser().parseFromString(render(), 'text/html');
  for (const selector of ['.detail-about-company-card', '.detail-org-jobs-box', '.related-list', '.detail-logo-card']) {
    const oldSection = document.querySelector(selector);
    const nextSection = updated.querySelector(selector);
    if (oldSection && nextSection) oldSection.replaceWith(nextSection);
    else if (nextSection && selector === '.related-list') document.querySelector('.job-description')?.append(nextSection);
  }
  protectJobNavigation();
}).catch(error => console.warn('Related job refresh unavailable:', error));
