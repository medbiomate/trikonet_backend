import {auditCompanyProfiles,repairCompanyProfiles,normalizedCompanyDraft,resolvePublishedCompany,publishedCompanyDependents} from './company-profile-audit.mjs';
const companyRepairTokens = new Map();
import {employerIdentity} from './employer-identity.mjs';
import {findJobByPath} from './job-url-lookup.mjs';
import {employerOptions} from './employer-options.mjs';
import {trashJobRecord} from './job-trash.mjs';
import {createAdminEmployerIndex} from './admin-employer-index.mjs';
import {createAdminJobIndex} from './admin-job-index.mjs';
function jobCreators(jobs=[]){return [...new Map(jobs.filter(j=>j.createdBy?.id).map(j=>[String(j.createdBy.id),{id:String(j.createdBy.id),name:j.createdBy.name||'Team member'}])).values()].sort((a,b)=>a.name.localeCompare(b.name));}
import {selectedDay} from './admin-job-filters.mjs';
import {createAlertUserReader} from './alert-users.mjs';
import {createEditorState} from './editor-state.mjs';
import {prepareStateMedia} from './state-media.mjs';
import {teamActivity} from './team-activity.mjs';
import {createGoogleIndexing} from './google-indexing.mjs';
import {findEmployerAddress,rememberEmployerAddress} from './employer-job-address.mjs';
import {importJobLink,importPastedJob} from './job-link-import.mjs';
import {publicDirectory} from './public-directory.mjs';
import {createCoordinatedTask} from './coordinated-task.mjs';
import {createEmsStateReader} from './ems-state-reader.mjs';
import {createCatalogueReader} from './catalogue-reader.mjs';
import {candidateProfileRequest} from './candidate-profile-store.mjs';
import {findPasswordAccount,savePasswordSignIn} from './password-account-store.mjs';
import {adminCandidateProfile,candidateEditProfile,candidateProfileData} from './candidate-admin-profile.mjs';
import {createJobReports} from './job-reports.mjs';
import {mergeStateChanges} from './state-changes.mjs';
import {createAccountDeletion,removeAccountData} from './account-deletion.mjs';
import {createRegistrationVerification} from './registration-verification.mjs';
import { gzip as gzipCallback } from 'node:zlib';
import { promisify } from 'node:util';
const gzipJson = promisify(gzipCallback);
import { recordSignInPlatform } from './sign-in-platform.mjs';
import { repairEmployerSnapshots, employerNameKey, isEmployerSnapshot } from './employer-repair.mjs';
import {createJobEmailAlerts} from './job-email-alerts.mjs';
import {createPersistentSessions} from './persistent-sessions.mjs';
import { summarizePost } from './post-summary.mjs';
import { summarizeJob } from './job-summary.mjs';
import {createAdmobRewards} from './admob-rewards.mjs';
import {createGeminiRecommendations} from './gemini-recommendations.mjs';
import {candidateFile} from './candidate-file.mjs';
import {accountView,applyAccountProfile,createEmailChange} from './account-identity.mjs';
import {updateCandidateProfile,calculateCandidateCompletion,grantProfileCompletionReward} from './candidate-profile.mjs';
import { createCompanyReviews } from './company-reviews.mjs';
import {createCategorySpelling} from './category-spelling.mjs';
import {createPointsStore} from './points-store.mjs';
import {googleIdentity,googleAccount} from './google-sign-in.mjs';
import {findGoogleAccount,saveGoogleAccount} from './google-account-store.mjs';
import {createPasswordReset,sendPasswordResetEmail,sendEmailChangeCode} from './password-reset.mjs';
import { listAdminMedia } from './admin-media-library.mjs';
import { applyJobUrl, publicJobPath, uniqueJobSlug, shortenGeneratedJobUrls } from './job-urls.mjs';
import {jobCreator,withoutTeamAttribution} from './job-attribution.mjs';
import { createEmsSync, emsJobOperator } from './ems-sync.mjs';
import { findJobIndex, saveJobRecord, refreshPublicationDate } from './job-identity.mjs';
import { adminJobConditions, localJobMatches, pagePlan, importedJobPage, adminJobsFirst } from './admin-job-pagination.mjs';
import http from 'node:http';
import { createJobViews } from './job-views.mjs';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { retryDisconnectedReads } from './database-read-retry.mjs';
import { createMediaStore } from './media-store.mjs';
import crypto from 'node:crypto';
import { newestFirst } from './record-order.mjs';
import { createSeoRepository, isActiveJob } from './seo-job-pages.mjs';
import { handleSeoRequest } from './seo-api.mjs';
import { createAdminSessionStore } from './admin-session-store.mjs';
import { isCandidateAccount } from './candidate-account.mjs';
import { isPublicRecord } from './public-record.mjs';
import { employerJobPage } from './employer-jobs.mjs';

// Load local secrets without overriding hosting-provided environment variables.
if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(fileURLToPath(new URL('.env', import.meta.url))); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const baseDir = fileURLToPath(new URL('.', import.meta.url));
const root = join(baseDir, 'public');
const dataRoot = join(baseDir, 'data');
const localDbPath = join(dataRoot, 'local-db.json');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '0.0.0.0';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

// Database connection pool with TCP host and UNIX socket fallback
const dbConfig = process.env.TRIKONET_DB_HOST
  ? {
      host: process.env.TRIKONET_DB_HOST,
      port: Number(process.env.TRIKONET_DB_PORT || 3306),
      user: process.env.TRIKONET_DB_USER || 'root',
      password: process.env.TRIKONET_DB_PASSWORD || '',
      database: process.env.TRIKONET_DB_NAME || 'trikonet_html_test',
      connectionLimit: 5,
      dateStrings: true
    }
  : {
      socketPath: process.env.TRIKONET_DB_SOCKET || '/tmp/mysql.sock',
      user: process.env.TRIKONET_DB_USER || process.env.USER,
      password: process.env.TRIKONET_DB_PASSWORD || '',
      database: process.env.TRIKONET_DB_NAME || 'trikonet_html_test',
      connectionLimit: 5,
      dateStrings: true
    };

const wpDb = retryDisconnectedReads(mysql.createPool({
  ...dbConfig,
  maxIdle: 2,
  idleTimeout: 30_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}));
const emsSync = createEmsSync(wpDb);
const googleIndexing=createGoogleIndexing({pool:wpDb});
async function numericJobId(job) {
  if (job?.urlJobId) return job.urlJobId;
  if (/^[1-9]\d*$/.test(String(job?.id || ''))) return String(job.id);
  await wpDb.query(`CREATE TABLE IF NOT EXISTS trikonet_job_url_ids (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, record_id VARCHAR(100) NOT NULL UNIQUE) ENGINE=InnoDB AUTO_INCREMENT=1000000000`);
  await wpDb.query('INSERT IGNORE INTO trikonet_job_url_ids (record_id) VALUES (?)', [String(job.id)]);
  const [rows] = await wpDb.query('SELECT id FROM trikonet_job_url_ids WHERE record_id=?', [String(job.id)]);
  return String(rows[0].id);
}
const mediaStore = createMediaStore(wpDb);
const jobViews = createJobViews(wpDb);

// In-memory dataset cache for complete database resilience
const memoryStore = {
  jobs: null,
  employers: null,
  posts: null,
  taxonomies: null
};

let memoryStoreReady;
function loadMemoryStore() {
  return memoryStoreReady ||= populateMemoryStore();
}
async function populateMemoryStore() {
  // Migration datasets live in MySQL so redeployments cannot revert imported data.
  // The packaged snapshots remain a fallback when the database is unavailable.
  try {
    const [rows] = await wpDb.query('SELECT dataset_key, payload FROM trikonet_imported_data WHERE dataset_key IN (\'jobs\',\'employers\',\'posts\',\'taxonomies\')');
    for (const row of rows) {
      if (Object.hasOwn(memoryStore, row.dataset_key)) memoryStore[row.dataset_key] = JSON.parse(row.payload);
    }
  } catch (error) {
    if (error.code !== 'ER_NO_SUCH_TABLE') console.error('Imported dataset read failed:', error.code || error.name);
  }
  try {
    if (!memoryStore.taxonomies) {
      memoryStore.taxonomies = JSON.parse(await readFile(join(dataRoot, 'taxonomies.json'), 'utf8'));
    }
  } catch {}
  try {
    if (!memoryStore.employers) {
      memoryStore.employers = JSON.parse(await readFile(join(dataRoot, 'employers.json'), 'utf8'));
    }
  } catch {}
  try {
    if (!memoryStore.posts) {
      memoryStore.posts = JSON.parse(await readFile(join(dataRoot, 'posts.json'), 'utf8'));
    }
  } catch {}
  try {
    if (!memoryStore.jobs) {
      memoryStore.jobs = JSON.parse(await readFile(join(dataRoot, 'jobs.json'), 'utf8'));
    }
  } catch {}
  // A reassigned/imported job may not carry its employer's current logo.
  const employersById = new Map((memoryStore.employers || []).map(item => [Number(item.id),item]));
  for(const job of memoryStore.jobs || []) {
    const employer=employersById.get(Number(job.metas?._job_employer_posted_by));
    const logo=employer?.metas?._employer_logo || employer?.logo;
    if(logo) {job.logo=logo;job.metas ||= {};job.metas._job_logo=logo;}
  }
}
// Load imported datasets after listen() so large JSON parsing cannot delay binding.

function fallbackRecords(type, params) {
  const limit = Math.min(Math.max(Number(params.get('per_page')) || 10, 1), 5000);
  const page = Math.max(Number(params.get('page')) || 1, 1);
  const slug = params.get('slug');
  const query = (params.get('q') || '').trim().toLowerCase();
  const location = (params.get('location') || '').trim();
  const category = (params.get('category') || '').trim();
  const jobType = (params.get('job_type') || '').trim();
  const employerId = Number(params.get('employer_id'));
  const employerSlug = (params.get('employer_slug') || '').trim();

  let list = [];
  if (type === 'job_listing') list = memoryStore.jobs || [];
  else if (type === 'employer') list = memoryStore.employers || [];
  else if (type === 'posts') list = memoryStore.posts || [];
  else return [];

  const excluded=new Set((params.get('exclude_slugs')||'').split(',').filter(Boolean));
  let filtered = list.filter(item=>isPublicRecord(item)&&!excluded.has(item.slug));
  if(params.get('id'))filtered=filtered.filter(item=>Number(item.id)===Number(params.get('id')));

  if (slug) {
    return filtered.filter(item => item.slug === slug);
  }

  if (query) {
    filtered = filtered.filter(item => (item.title?.rendered || '').toLowerCase().includes(query));
  }

  if (type === 'job_listing') {
    if (location && location !== 'Country or City') {
      filtered = filtered.filter(item => {
        const locs = Object.values(item.metas?._job_location || {});
        return locs.some(l => l.toLowerCase() === location.toLowerCase());
      });
    }
    if (category && category !== 'All Categories') {
      filtered = filtered.filter(item => {
        const cats = Object.values(item.metas?._job_category || {});
        return cats.some(c => c.toLowerCase() === category.toLowerCase());
      });
    }
    if (jobType) {
      filtered = filtered.filter(item => {
        const types = Object.values(item.metas?._job_type || {});
        return types.some(t => t.toLowerCase() === jobType.toLowerCase());
      });
    }
    if (employerId) {
      filtered = filtered.filter(item => Number(item.metas?._job_employer_posted_by) === employerId);
    }
    if (employerSlug) {
      const employer=(memoryStore.employers || []).find(item=>item.slug===employerSlug);
      filtered=filtered.filter(item=>Number(item.metas?._job_employer_posted_by)===Number(employer?.id) || String(item.metas?._job_employer_url || '').replace(/\/$/,'').endsWith(`/employer/${employerSlug}`));
    }
  }

  if (type === 'employer') {
    if (location && location !== 'City or postcode') {
      filtered = filtered.filter(item => {
        const locs = Object.values(item.metas?._employer_location || {});
        return locs.some(l => l.toLowerCase() === location.toLowerCase());
      });
    }
    if (category && category !== 'All Categories') {
      filtered = filtered.filter(item => {
        const cats = Object.values(item.metas?._employer_category || {});
        return cats.some(c => c.toLowerCase() === category.toLowerCase());
      });
    }
  }

  const offset = (page - 1) * limit;
  return newestFirst(filtered).slice(offset, offset + limit);
}

function fallbackCount(type, params) {
  const query = (params.get('q') || '').trim().toLowerCase();
  const location = (params.get('location') || '').trim();
  const category = (params.get('category') || '').trim();
  const jobType = (params.get('job_type') || '').trim();

  let list = type === 'employer' ? (memoryStore.employers || []) : (memoryStore.jobs || []);
  if (!query && (!location || location === 'Country or City' || location === 'City or postcode') && (!category || category === 'All Categories') && !jobType) {
    return list.length;
  }
  return fallbackRecords(type === 'employer' ? 'employer' : 'job_listing', params).length;
}

// Taxonomy mappings for WordPress meta
const taxonomyMeta = {
  job_listing_category: '_job_category',
  job_listing_location: '_job_location',
  job_listing_type: '_job_type',
  job_listing_tag: '_job_tag',
  employer_category: '_employer_category',
  employer_location: '_employer_location',
  category: '_post_category',
  post_tag: '_post_tag'
};

async function employerLogoMap(ids) {
  if (!ids.length) return new Map();
  const marks = ids.map(() => '?').join(',');
  const [rows] = await wpDb.query(
    `SELECT e.ID employer_id, a.ID attachment_id, COALESCE(f.meta_value, a.guid) source_file
     FROM wp_posts e
     JOIN wp_postmeta t ON t.post_id = e.ID AND t.meta_key = '_thumbnail_id'
     JOIN wp_posts a ON a.ID = CAST(t.meta_value AS UNSIGNED)
     LEFT JOIN wp_postmeta f ON f.post_id = a.ID AND f.meta_key = '_wp_attached_file'
     WHERE e.ID IN (${marks})`,
    ids
  );
  return new Map(
    rows.map(row => {
      const suffix = extname(String(row.source_file || '').split('?')[0]) || '.jpg';
      return [Number(row.employer_id), `/uploads/employers/${row.attachment_id}${suffix.toLowerCase()}`];
    })
  );
}

async function wordpressRecords(type, params, adminOptions = null) {
  const postType = {
    job_listing: 'job_listing',
    employer: 'employer',
    posts: 'post',
    pages: 'page',
    media: 'attachment',
    candidate: 'candidate'
  }[type];

  if (!postType) throw new Error('Unsupported content type');

  const limit = Math.min(Math.max(Number(params.get('per_page')) || 10, 1), postType === 'attachment' || postType === 'employer' ? 5000 : postType === 'job_listing' ? 1000 : 100);
  const page = Math.max(Number(params.get('page')) || 1, 1);
  const offset = adminOptions?.offset ?? (page - 1) * limit;
  const slug = params.get('slug');

  const where = ['post_type = ?'];
  const values = [postType];

  const excludedPublicSlugs=(params.get('exclude_slugs')||'').split(',').filter(Boolean).slice(0,1000);
  if(excludedPublicSlugs.length){where.push(`post_name NOT IN (${excludedPublicSlugs.map(()=>'?').join(',')})`);values.push(...excludedPublicSlugs);}
  if (type === 'media') where.push("post_mime_type LIKE 'image/%'");
  if (slug) {
    where.push('post_name = ?');
    values.push(slug);
  }

  const query = (params.get('q') || '').trim();
  const location = (params.get('location') || '').trim();
  const category = (params.get('category') || '').trim();

  if (query) {
    if (adminOptions) {
      where.push("(post_title LIKE ? OR EXISTS (SELECT 1 FROM wp_postmeta qm WHERE qm.post_id=wp_posts.ID AND qm.meta_key='_job_employer_name' AND qm.meta_value LIKE ?) OR EXISTS (SELECT 1 FROM wp_term_relationships qr JOIN wp_term_taxonomy qt ON qt.term_taxonomy_id=qr.term_taxonomy_id JOIN wp_terms qn ON qn.term_id=qt.term_id WHERE qr.object_id=wp_posts.ID AND qt.taxonomy='job_listing_category' AND qn.name LIKE ?))");
      values.push(`%${query}%`, `%${query}%`, `%${query}%`);
    } else { where.push('post_title LIKE ?'); values.push(`%${query}%`); }
  }
  if (postType === 'job_listing' && location && location !== 'Country or City') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='job_listing_location' AND fn.name=?)");
    values.push(location);
  }
  if (postType === 'job_listing' && category && category !== 'All Categories') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='job_listing_category' AND fn.name=?)");
    values.push(category);
  }
  const jobType = (params.get('job_type') || '').trim();
  if (postType === 'job_listing' && jobType) {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='job_listing_type' AND fn.name=?)");
    values.push(jobType);
  }
  const employerId = Number(params.get('employer_id'));
  if (postType === 'job_listing' && employerId) {
    where.push("EXISTS (SELECT 1 FROM wp_postmeta epm WHERE epm.post_id=wp_posts.ID AND epm.meta_key='_job_employer_posted_by' AND CAST(epm.meta_value AS UNSIGNED)=?)");
    values.push(employerId);
  }
  if (postType === 'employer' && location && location !== 'City or postcode') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='employer_location' AND fn.name=?)");
    values.push(location);
  }
  if (postType === 'employer' && category && category !== 'All Categories') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='employer_category' AND fn.name=?)");
    values.push(category);
  }
  if (adminOptions) adminJobConditions(where, values, params, adminOptions.excludedSlugs);
  else if (type !== 'media') {
    where.push("post_status = 'publish'");
  }

  const [posts] = await wpDb.query(
    `SELECT ID, post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, post_name, post_modified, post_modified_gmt, guid, post_mime_type
     FROM wp_posts WHERE ${where.join(' AND ')} ORDER BY post_date DESC, ID DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  if (!posts.length) return [];

  const ids = posts.map(p => p.ID);
  const marks = ids.map(() => '?').join(',');
  const byId = new Map(
    posts.map(p => [
      p.ID,
      {
        id: p.ID,
        date: p.post_date,
        date_gmt: p.post_date_gmt,
        modified: p.post_modified,
        modified_gmt: p.post_modified_gmt,
        slug: p.post_name,
        status: p.post_status,
        type: postType,
        link: `https://trikonet.com/${postType === 'job_listing' ? 'job' : postType}/${p.post_name}`,
        title: { rendered: p.post_title },
        content: { rendered: p.post_content, protected: false },
        excerpt: { rendered: p.post_excerpt, protected: false },
        author: p.post_author,
        featured_media: 0,
        metas: {}
      }
    ])
  );

  const metaFilter =
    postType === 'job_listing'
      ? "(meta_key LIKE '_job_%' OR meta_key LIKE 'custom-text-%')"
      : postType === 'employer'
      ? "meta_key LIKE '_employer_%'"
      : postType === 'attachment'
      ? "meta_key IN ('_wp_attached_file','_wp_attachment_metadata')"
      : "meta_key IN ('_thumbnail_id')";

  const [meta] = await wpDb.query(`SELECT post_id, meta_key, meta_value FROM wp_postmeta WHERE post_id IN (${marks}) AND ${metaFilter}`, ids);
  for (const row of meta) {
    const record = byId.get(row.post_id);
    if (record && !Object.hasOwn(record.metas, row.meta_key)) record.metas[row.meta_key] = row.meta_value;
  }

  if (postType === 'post' || postType === 'page') {
    const thumbnailIds = [...new Set([...byId.values()].map(record => Number(record.metas._thumbnail_id)).filter(Boolean))];
    if (thumbnailIds.length) {
      const thumbnailMarks = thumbnailIds.map(() => '?').join(',');
      const [attachments] = await wpDb.query(
        `SELECT a.ID, a.guid, f.meta_value source_file FROM wp_posts a LEFT JOIN wp_postmeta f ON f.post_id = a.ID AND f.meta_key = '_wp_attached_file' WHERE a.ID IN (${thumbnailMarks})`,
        thumbnailIds
      );
      const attachmentMap = new Map(
        attachments.map(item => {
          const source = item.source_file || item.guid || '';
          const suffix = extname(String(source).split('?')[0]) || '.jpg';
          return [Number(item.ID), `/uploads/media/${item.ID}${suffix.toLowerCase()}`];
        })
      );
      for (const record of byId.values()) {
        const thumbnailId = Number(record.metas._thumbnail_id) || 0;
        record.featured_media = thumbnailId;
        record.featured_image = attachmentMap.get(thumbnailId) || '';
      }
    }
  }

  if (postType === 'attachment') {
    for (const record of byId.values()) {
      const source = record.metas._wp_attached_file || posts.find(item => item.ID === record.id)?.guid || '';
      const suffix = extname(String(source).split('?')[0]) || '.jpg';
      record.source_url = `/uploads/media/${record.id}${suffix.toLowerCase()}`;
      record.guid = { rendered: record.source_url };
      record.media_type = String(posts.find(item => item.ID === record.id)?.post_mime_type || '').startsWith('image/') ? 'image' : 'file';
    }
  }

  const [terms] = await wpDb.query(
    `SELECT tr.object_id, tt.taxonomy, t.term_id, t.name FROM wp_term_relationships tr JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id=tr.term_taxonomy_id JOIN wp_terms t ON t.term_id=tt.term_id WHERE tr.object_id IN (${marks})`,
    ids
  );
  for (const term of terms) {
    const key = taxonomyMeta[term.taxonomy];
    const record = byId.get(term.object_id);
    if (!key || !record) continue;
    if (!record.metas[key] || typeof record.metas[key] !== 'object') record.metas[key] = {};
    record.metas[key][term.term_id] = term.name;
  }

  if (postType === 'post' || postType === 'page') {
    const authorIds = [...new Set(posts.map(p => Number(p.post_author)).filter(Boolean))];
    if (authorIds.length) {
      const authorMarks = authorIds.map(() => '?').join(',');
      const [authors] = await wpDb.query(`SELECT ID, display_name, user_nicename FROM wp_users WHERE ID IN (${authorMarks})`, authorIds);
      const authorMap = new Map(authors.map(a => [Number(a.ID), a]));
      for (const record of byId.values()) {
        const author = authorMap.get(Number(record.author));
        record.author_name = author?.display_name || 'Trikonet';
        record.author_slug = author?.user_nicename || '';
        record.author_url = record.author_slug ? `/author/${record.author_slug}` : '';
        record.local_url = postType === 'post' ? `/blog/${record.slug}` : `/${record.slug}`;
      }
    }
  }

  if (postType === 'job_listing') {
    const employerIds = [...new Set([...byId.values()].map(r => Number(r.metas._job_employer_posted_by)).filter(Boolean))];
    if (employerIds.length) {
      const employerMarks = employerIds.map(() => '?').join(',');
      const [employers] = await wpDb.query(`SELECT ID, post_name, post_title FROM wp_posts WHERE ID IN (${employerMarks})`, employerIds);
      const [emeta] = await wpDb.query(
        `SELECT post_id, meta_key, meta_value FROM wp_postmeta WHERE post_id IN (${employerMarks}) AND meta_key IN ('_employer_featured_image','_employer_featured_image_img','_employer_email','_employer_phone','_employer_website')`,
        employerIds
      );
      const logos = await employerLogoMap(employerIds);
      const emap = new Map(employers.map(e => [e.ID, { ...e, meta: {} }]));
      for (const row of emeta) {
        if (emap.has(row.post_id)) emap.get(row.post_id).meta[row.meta_key] = row.meta_value;
      }
      for (const record of byId.values()) {
        const employer = emap.get(Number(record.metas._job_employer_posted_by));
        if (!employer) continue;
        record.metas._job_employer_name = employer.post_title;
        record.metas._job_employer_url = `https://trikonet.com/employer/${employer.post_name}`;
        record.metas._job_logo = logos.get(Number(employer.ID)) || employer.meta._employer_featured_image_img || employer.meta._employer_featured_image || '';
        record.logo = record.metas._job_logo;
      }
    }
  }

  if (postType === 'employer') {
    const [counts] = await wpDb.query(
      `SELECT CAST(pm.meta_value AS UNSIGNED) employer_id, COUNT(*) total FROM wp_postmeta pm JOIN wp_posts p ON p.ID=pm.post_id AND p.post_type='job_listing' AND p.post_status='publish' WHERE pm.meta_key='_job_employer_posted_by' AND CAST(pm.meta_value AS UNSIGNED) IN (${marks}) GROUP BY employer_id`,
      ids
    );
    const countMap = new Map(counts.map(row => [Number(row.employer_id), Number(row.total)]));
    const logos = await employerLogoMap(ids);
    for (const record of byId.values()) {
      record.metas._employer_open_jobs = countMap.get(record.id) || 0;
      record.metas._employer_logo = logos.get(record.id) || '';
      record.logo = record.metas._employer_logo;
    }
  }

  const records = [...byId.values()];
  return postType === 'post' && params.get('summary') === '1' && !slug && !adminOptions
    ? records.map(summarizePost) : records;
}

async function wordpressCount(type, params, adminOptions = null) {
  const postType = type === 'employer' ? 'employer' : 'job_listing';
  const where = ['post_type = ?'];
  if (!adminOptions) where.push("post_status = 'publish'");
  const values = [postType];

  const query = (params.get('q') || '').trim();
  const location = (params.get('location') || '').trim();
  const category = (params.get('category') || '').trim();

  if (query) {
    if (adminOptions) {
      where.push("(post_title LIKE ? OR EXISTS (SELECT 1 FROM wp_postmeta qm WHERE qm.post_id=wp_posts.ID AND qm.meta_key='_job_employer_name' AND qm.meta_value LIKE ?) OR EXISTS (SELECT 1 FROM wp_term_relationships qr JOIN wp_term_taxonomy qt ON qt.term_taxonomy_id=qr.term_taxonomy_id JOIN wp_terms qn ON qn.term_id=qt.term_id WHERE qr.object_id=wp_posts.ID AND qt.taxonomy='job_listing_category' AND qn.name LIKE ?))");
      values.push(`%${query}%`, `%${query}%`, `%${query}%`);
    } else { where.push('post_title LIKE ?'); values.push(`%${query}%`); }
  }
  if (postType === 'job_listing' && location && location !== 'Country or City') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='job_listing_location' AND fn.name=?)");
    values.push(location);
  }
  if (postType === 'job_listing' && category && category !== 'All Categories') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='job_listing_category' AND fn.name=?)");
    values.push(category);
  }
  const jobType = (params.get('job_type') || '').trim();
  if (postType === 'job_listing' && jobType) {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='job_listing_type' AND fn.name=?)");
    values.push(jobType);
  }
  if (postType === 'employer' && location && location !== 'City or postcode') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='employer_location' AND fn.name=?)");
    values.push(location);
  }
  if (postType === 'employer' && category && category !== 'All Categories') {
    where.push("EXISTS (SELECT 1 FROM wp_term_relationships fr JOIN wp_term_taxonomy ft ON ft.term_taxonomy_id=fr.term_taxonomy_id JOIN wp_terms fn ON fn.term_id=ft.term_id WHERE fr.object_id=wp_posts.ID AND ft.taxonomy='employer_category' AND fn.name=?)");
    values.push(category);
  }

  if (adminOptions) adminJobConditions(where, values, params, adminOptions.excludedSlugs);
  const [rows] = await wpDb.query(`SELECT COUNT(*) total FROM wp_posts WHERE ${where.join(' AND ')}`, values);
  return Number(rows[0]?.total || 0);
}

// Local JSON Database for CMS and User Session management
const emptyDb = {
  version: 1,
  jobs: [],
  employers: [],
  applications: [],
  users: [],
  emailCampaigns: [],
  savedJobs: [],
  employerClaims: [],
  resumes: [],
  jobReports: [],
  taxonomies: { types: [], categories: [], locations: [], tags: [] }
};

let persistentStateReady;
async function ensurePersistentState() {
  if (!persistentStateReady) {
    persistentStateReady = (async () => {
      await wpDb.query(`CREATE TABLE IF NOT EXISTS trikonet_app_state (
        state_key VARCHAR(64) NOT NULL PRIMARY KEY,
        payload LONGTEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      const [rows] = await wpDb.query("SELECT state_key FROM trikonet_app_state WHERE state_key='main' LIMIT 1");
      if (!rows.length) {
        let initial = structuredClone(emptyDb);
        try { initial = { ...initial, ...JSON.parse(await readFile(localDbPath, 'utf8')) }; } catch {}
        await wpDb.query(
          "INSERT IGNORE INTO trikonet_app_state (state_key, payload) VALUES ('main', ?)",
          [JSON.stringify(initial)]
        );
      }
    })().catch(error => {
      persistentStateReady = null;
      throw error;
    });
  }
  return persistentStateReady;
}

const readCatalogueDb = createCatalogueReader(wpDb, ensurePersistentState);

const adminJobIndex=createAdminJobIndex(wpDb,async()=>{await loadMemoryStore();return memoryStore.jobs||[];},ensurePersistentState);
const adminEmployerIndex=createAdminEmployerIndex(wpDb,async()=>{await loadMemoryStore();return memoryStore.employers||[];},ensurePersistentState);
const editorIndexes={ensure:async()=>{await adminJobIndex.ensure();await adminEmployerIndex.ensure();},sync:(...args)=>adminJobIndex.sync(...args),syncEmployers:(...args)=>adminEmployerIndex.sync(...args)};
const editorState=createEditorState(wpDb,ensurePersistentState,mediaStore,editorIndexes);
const stateSnapshots=new WeakMap();
async function readLocalDb() {
  try {
    await ensurePersistentState();
    const [rows] = await wpDb.query("SELECT payload FROM trikonet_app_state WHERE state_key='main' LIMIT 1");
    if (rows[0]?.payload) {
      const db={...emptyDb,...JSON.parse(rows[0].payload)};
      await accountDeletion.ensure();
      const [deletions]=await wpDb.query('SELECT * FROM trikonet_account_deletions');
      removeAccountData(db,deletions.filter(row=>row.status==='deleted'||Number(row.delete_after)<=Date.now()).map(row=>row.user_id));
      for(const user of db.users){const row=deletions.find(row=>String(row.user_id)===String(user.id));if(row)user.accountDeletionPending=true;else delete user.accountDeletionPending;}
      // Keep the merge baseline serialized; read-only requests need no second object graph.
      stateSnapshots.set(db,rows[0].payload);
      return db;
    }
  } catch (error) {
    throw new Error('Account storage is temporarily unavailable.',{cause:error});
  }
  try { return { ...emptyDb, ...JSON.parse(await readFile(localDbPath, 'utf8')) }; }
  catch { return structuredClone(emptyDb); }
}

async function writeLocalDb(db, {skipMedia=false}={}) {
  if(await editorState.write(db)) return;
  await editorIndexes.ensure();
  const snapshot=stateSnapshots.get(db);
  const before=snapshot ? JSON.parse(snapshot) : undefined;
  repairEmployerSnapshots(db);
  if(!skipMedia) db = await prepareStateMedia(db, before, mediaStore);
  await ensurePersistentState();
  await accountDeletion.ensure();
  const connection=await wpDb.getConnection();
  try {
    await connection.beginTransaction();
    const [current]=await connection.query("SELECT payload FROM trikonet_app_state WHERE state_key='main' FOR UPDATE");
    const previousState=current[0]?JSON.parse(current[0].payload):{};
    if(before&&current[0])db=mergeStateChanges(previousState,before,db);
    const [deletions]=await connection.query('SELECT * FROM trikonet_account_deletions');
    removeAccountData(db,deletions.filter(row=>row.status==='deleted'||Number(row.delete_after)<=Date.now()).map(row=>row.user_id));
    await connection.query("UPDATE trikonet_app_state SET payload=?,updated_at=CURRENT_TIMESTAMP WHERE state_key='main'",[JSON.stringify({...emptyDb,...db})]);
    await adminJobIndex.sync(connection,previousState.jobs||[],db.jobs||[]);
    await adminEmployerIndex.sync(connection,previousState.employers||[],db.employers||[]);
    await connection.commit();
  } catch(error){await connection.rollback();throw error;}finally{connection.release();}
}

async function loadSeoRecords() {
  await loadMemoryStore();
  try {
    const [posts] = await wpDb.query("SELECT ID id, post_name slug, post_title title, post_status status, post_date date, post_content description FROM wp_posts WHERE post_type='job_listing'");
    const [terms] = await wpDb.query("SELECT p.ID job_id, tt.taxonomy, t.term_id id, t.name, t.slug FROM wp_posts p JOIN wp_term_relationships r ON r.object_id=p.ID JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id=r.term_taxonomy_id JOIN wp_terms t ON t.term_id=tt.term_id WHERE p.post_type='job_listing' AND tt.taxonomy IN ('job_listing_category','job_listing_location','job_listing_type')");
    const [metas] = await wpDb.query("SELECT m.post_id, m.meta_key, m.meta_value FROM wp_postmeta m JOIN wp_posts p ON p.ID=m.post_id WHERE p.post_type='job_listing' AND m.meta_key IN ('_job_expiry_date','_job_application_deadline_date','_filled','_job_employer_name','_job_logo')");
    const jobs = new Map(posts.map(p => [Number(p.id),{ ...p,metas:{} }]));
    const taxonomies = { categories:[],locations:[] };
    terms.forEach(t => {
      const job = jobs.get(Number(t.job_id));
      const field = {job_listing_category:'categories',job_listing_location:'locations',job_listing_type:'types'}[t.taxonomy];
      if (job) { job[field] ||= []; if (!job[field].includes(t.name)) job[field].push(t.name); }
      if (taxonomies[field] && !taxonomies[field].some(item => item.id === t.id)) taxonomies[field].push({id:t.id,name:t.name,slug:t.slug});
    });
    metas.forEach(m => { const job=jobs.get(Number(m.post_id)); if (job) job.metas[m.meta_key]=m.meta_value; });
    const local=await readCatalogueDb();
    for (const field of ['categories','locations']) for (const term of local.taxonomies?.[field] || []) if (!taxonomies[field].some(item=>item.name.toLowerCase()===term.name.toLowerCase())) taxonomies[field].push(term);
    return {jobs:[...jobs.values()],taxonomies};
  } catch (error) {
    if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
    const local=await readCatalogueDb();
    const taxonomies={categories:[...(memoryStore.taxonomies?.categories || [])],locations:[...(memoryStore.taxonomies?.locations || [])]};
    for (const field of ['categories','locations']) for (const term of local.taxonomies?.[field] || []) if (!taxonomies[field].some(item=>item.name.toLowerCase()===term.name.toLowerCase())) taxonomies[field].push(term);
    return {jobs:memoryStore.jobs || [],taxonomies};
  }
}
const seoRepository = createSeoRepository(wpDb,readCatalogueDb,loadSeoRecords);
// Preserve the existing main category URL explicitly requested by the admin.
// This migration is insert-only: never overwrite saved manual settings.
const registerAccountingDestination = () => seoRepository.createMain({category:'Accounting or Finance',slug:'accounting-finance-in-uae',title:'Accounting & Finance Jobs in UAE',seoTitle:'Accounting & Finance Jobs in UAE - Latest Vacancies | Trikonet',metaDescription:'Explore current accounting and finance jobs across the UAE and apply for relevant opportunities on Trikonet.',onlyIfMissing:true});

async function readJsonBody(req, maxBytes = 2_000_000) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBytes) throw new Error('Request too large');
  }
  return body ? JSON.parse(body) : {};
}

// CORS and origin handling
function getCorsOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return '*';

  // Allowed origins: trikonet domains, localhost, or env configured
  const isAllowed =
    origin === 'https://trikonet.com' ||
    origin === 'https://www.trikonet.com' ||
    origin === 'https://api.trikonet.com' ||
    origin === 'capacitor://localhost' || origin === 'https://localhost' ||
    /^https:\/\/([a-z0-9-]+\.)?trikonet\.com$/.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    Boolean(process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').map(s => s.trim()).includes(origin));

  return isAllowed ? origin : null;
}

function adminJobListing(job) {
  const {content,description,recoveryDraft,logoBackup,profilePhotos,photoUrl,banner,logo,...row} = job;
  const m = job.metas || {};
  row.metas = Object.fromEntries(['_job_employer_name','_job_category','_job_location','_job_type','_job_expiry_date','_job_application_deadline_date','_job_date_posted'].filter(key=>m[key] !== undefined).map(key=>[key,m[key]]));
  return row;
}

async function sendJson(req, res, status, value) {
  // Resolve media mappings without uploading the catalogue during API responses.
  try {
    value=await mediaStore.normalize(value);
  } catch(error) { console.error('Media persistence unavailable:',error.message); }
  const attributionRequest=new URL(req.url,'https://api.trikonet.com');
  if(!attributionRequest.pathname.startsWith('/api/admin/') && !(attributionRequest.searchParams.get('admin')==='1' && await currentAdminSession(req)))value=withoutTeamAttribution(value);
  const origin = getCorsOrigin(req);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };

  if (origin && origin !== '*') {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Vary'] = 'Origin';
  } else if (origin === '*') {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  let body = Buffer.from(JSON.stringify(value));
  if (body.length > 1024 && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = await gzipJson(body);
    headers['Content-Encoding'] = 'gzip';
  }
  headers['Vary'] = [headers['Vary'], 'Accept-Encoding'].filter(Boolean).join(', ');
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(body);
}

const sessions = await createPersistentSessions(wpDb);
const accountDeletion=createAccountDeletion({pool:wpDb,sessions});
function registerSeoDefaults() {
registerAccountingDestination().catch(error=>console.error('Accounting destination registration failed:',error.message));
seoRepository.createMain({category:'Education and Training',slug:'education-and-training-in-uae',title:'Education and Training Jobs in UAE',onlyIfMissing:true}).catch(error=>console.error('Education destination registration failed:',error.message));
}
const MAX_RESUMES_PER_USER = 3;
const MAX_PROFILE_PHOTO_BYTES = 100 * 1024;
const cookieValue = (req, name) =>
  String(req.headers.cookie || '')
    .split(';')
    .map(v => v.trim().split('='))
    .find(([key]) => key === name)?.[1] || '';

const currentSession = req => sessions.get(cookieValue(req, 'trikonet_session')) || null;
const dataUrlBytes = value => {
  const match = String(value || '').match(/^data:[^;,]+;base64,(.+)$/);
  if (!match) return 0;
  return Math.max(0, Math.floor(match[1].length * 3 / 4) - (match[1].endsWith('==') ? 2 : match[1].endsWith('=') ? 1 : 0));
};
const passwordHash = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.scryptSync(password, salt, 64).toString('hex')
});
const passwordMatches = (password, user) => {
  if (!user || !password) return false;
  const salt = user.passwordSalt || user.salt;
  const hash = user.passwordHash || user.hash;
  if (!salt || !hash) return false;
  try {
    const scryptHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const expected = Buffer.from(hash, 'hex');
    const actual = Buffer.from(scryptHash, 'hex');
    if (expected.length === actual.length && crypto.timingSafeEqual(actual, expected)) return true;
  } catch {}
  try {
    const pbkdf2Hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const expected = Buffer.from(hash, 'hex');
    const actual = Buffer.from(pbkdf2Hash, 'hex');
    if (expected.length === actual.length && crypto.timingSafeEqual(actual, expected)) return true;
  } catch {}
  return hash === password;
};

const adminSessions = createAdminSessionStore(wpDb);
const currentAdminSession = async req => {
  try { return await adminSessions.get(cookieValue(req, 'trikonet_admin_session')); }
  catch { return null; } // Never grant access if session storage is unavailable.
};

function getSessionCookieHeader(req, token, maxAge = 604800) {
  const isHttps = req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket?.encrypted);
  const sameSite = isHttps ? 'None' : 'Lax';
  const secure = isHttps ? '; Secure' : '';
  return `trikonet_session=${token}; HttpOnly; SameSite=${sameSite}${secure}; Path=/; Max-Age=${maxAge}`;
}

const jobEmailAlerts=createJobEmailAlerts({pool:wpDb,readUsers:createAlertUserReader(wpDb,()=>accountDeletion.ensure()),loadJobs:async()=>{
  const {jobs}=await loadSeoRecords();
  const local=await readCatalogueDb(['jobs','employers']);
  const merged=new Map((memoryStore.jobs || []).map(job=>[String(job.id||job.slug),job]));
  for(const job of jobs)merged.set(String(job.id||job.slug),job);
  for(const job of local.jobs || [])merged.set(String(job.id||job.slug),job);
  const name=value=>String(value?.rendered??value??'').toLowerCase().trim();
  const employers=[...(memoryStore.employers||[]),...(local.employers||[])];
  const bySlug=new Map(employers.map(employer=>[employer.slug,employer]));
  const byName=new Map(employers.map(employer=>[name(employer.title),employer]));
  return [...merged.values()].map(job=>{
    const m=job.metas||{};
    const slug=job.employerSlug||String(job.employerUrl||m._job_employer_url||'').split('/').filter(Boolean).pop();
    const employer=bySlug.get(slug)||byName.get(name(job.company||m._job_employer_name));
    const em=employer?.metas||{};
    return {...job,employerSlug:employer?.slug||slug,logo:job.logo||m._job_logo||employer?.logo||em._employer_logo||em._employer_featured_image_img||'',companyDetails:employer?.description||employer?.content?.rendered||''};
  });
}});
const jobReports=createJobReports({readLocalDb,writeLocalDb});
const companyReviews=createCompanyReviews({readLocalDb,writeLocalDb});
const refineRecommendations=createGeminiRecommendations({readLocalDb,writeLocalDb});
const categorySpelling=createCategorySpelling();
const pointsStore=createPointsStore(wpDb,{readLocalDb});
const admobRewards=createAdmobRewards(pointsStore);
const registrationVerification=createRegistrationVerification({sendEmail:(email,code)=>sendEmailChangeCode(email,code,'signup')});
const emailChange=createEmailChange({readLocalDb,writeLocalDb,sendEmail:sendEmailChangeCode});
const passwordReset=createPasswordReset({readLocalDb,writeLocalDb,passwordHash,sessions,sendEmail:sendPasswordResetEmail});

let startupReady;
const server = http.createServer(async (req, res) => {
  try {
  await startupReady;
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = decodeURIComponent(requestUrl.pathname);
  const legacyImage=path.match(/^\/uploads\/(?:employers|media)\/(\d+)\.[a-z]+$/i);
  if(legacyImage && ['GET','HEAD'].includes(req.method)){
    try{const location=await mediaStore.attachment(Number(legacyImage[1]));res.writeHead(302,{Location:location});return res.end();}
    catch{res.writeHead(404);return res.end('Image source unavailable');}
  }
  const mediaMatch=path.match(/^\/media\/images\/([a-f0-9]{64})\/[^/]+$/);
  if(mediaMatch && ['GET','HEAD'].includes(req.method)){
    try{
      const media=await mediaStore.get(mediaMatch[1]);
      if(!media){res.writeHead(404);return res.end('Image not found');}
      res.writeHead(200,{'Content-Type':media.mime,'Content-Length':media.bytes.length,'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'});
      return res.end(req.method==='HEAD'?undefined:media.bytes);
    }catch{res.writeHead(503);return res.end('Image temporarily unavailable');}
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = getCorsOrigin(req);
    const headers = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With, Accept',
      'Access-Control-Max-Age': '86400'
    };
    if (origin && origin !== '*') {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Vary'] = 'Origin';
    } else {
      headers['Access-Control-Allow-Origin'] = '*';
    }
    res.writeHead(204, headers);
    return res.end();
  }

  // Health check endpoint
  if (path === '/api/health' && req.method === 'GET') {
    let storage = 'json-fallback';
    try {
      await ensurePersistentState();
      const [stateRows] = await wpDb.query("SELECT updated_at FROM trikonet_app_state WHERE state_key='main' LIMIT 1");
      if (stateRows.length) storage = 'mysql';
    } catch {}
    return sendJson(req, res, 200, {
      status: 'ok',
      service: 'trikonet-backend',
      domain: 'https://api.trikonet.com',
      storage,
      time: new Date().toISOString()
    });
  }

  if (path === '/api/admin/employer-job-counts' && req.method === 'GET') {
    if (!await currentAdminSession(req)) return sendJson(req,res,401,{error:'Administrator authentication required.'});
    try {
      await loadMemoryStore();
      const db = await readLocalDb();
      const slugs = [...new Set((requestUrl.searchParams.get('slugs') || '').split(',').filter(Boolean))].slice(0,100);
      const employers = new Map((memoryStore.employers || []).map(item => [item.slug,item]));
      for (const employer of db.employers || []) employers.set(employer.slug,employer);
      const counts = {};
      for (const slug of slugs) {
        const employer = employers.get(slug);
        if (employer) counts[slug] = employerJobPage(memoryStore.jobs || [], db.jobs || [], employer).total;
      }
      return sendJson(req,res,200,counts);
    } catch { return sendJson(req,res,503,{error:'Unable to load employer job counts.'}); }
  }

  const bearer=String(req.headers.authorization||'').replace(/^Bearer /,'');
  const accountSession=currentSession(req)||(bearer?sessions.get(bearer):null);
  if(path==='/api/auth/account-deletion'){
    if(req.method==='POST'&&((req.headers.origin&&!getCorsOrigin(req))||!String(req.headers['content-type']||'').includes('application/json')))return sendJson(req,res,403,{error:'Invalid account request origin or format.'});
    if(!accountSession)return sendJson(req,res,401,{error:'Sign in to manage your account.'});
    try{
      if(req.method==='GET')return sendJson(req,res,200,{deletion:await accountDeletion.status(accountSession.userId)});
      if(req.method==='POST'){
        const body=await readJsonBody(req,2000);
        if(body.action==='recover'){
          const [status,payload]=await accountDeletion.recover(accountSession.userId);
          return sendJson(req,res,status,payload);
        }
        if(body.action!=='request')return sendJson(req,res,400,{error:'Choose a valid account action.'});
        const [status,payload]=await accountDeletion.request(accountSession.userId,body.confirmation);
        if(status===200){
          const token=crypto.randomUUID();sessions.set(token,{...accountSession});await sessions.flush();
          res.setHeader('Set-Cookie',getSessionCookieHeader(req,token));
        }
        return sendJson(req,res,status,payload);
      }
      return sendJson(req,res,405,{error:'Method not allowed.'});
    }catch{return sendJson(req,res,503,{error:'Unable to update your account. Please try again.'});}
  }
  if(accountSession && /^\/api\/(candidate|resumes|company-reviews|email-campaigns|mobile)(\/|$)/.test(path)){
    try{
      const deletion=await accountDeletion.status(accountSession.userId);
      if(deletion.status!=='active')return sendJson(req,res,403,{error:'Your account is scheduled for deletion.',code:'account_deletion_pending',deletion});
    }catch{return sendJson(req,res,503,{error:'Account storage is temporarily unavailable.'});}
  }

  if (path.startsWith('/api/employer-jobs/') && req.method === 'GET') {
    try {
      await loadMemoryStore();
      const db = await readCatalogueDb();
      const slug = decodeURIComponent(path.slice('/api/employer-jobs/'.length));
      const employer = (db.employers || []).find(item => item.slug === slug && isPublicRecord(item)) || (memoryStore.employers || []).find(item => item.slug === slug && isPublicRecord(item));
      if (!employer) return sendJson(req,res,404,{error:'Employer not found'});
      return sendJson(req,res,200,employerJobPage(memoryStore.jobs || [],db.jobs || [],employer,requestUrl.searchParams.get('page')));
    } catch { return sendJson(req,res,503,{error:'Unable to load employer jobs.'}); }
  }

  if (path === '/api/admin/job-presence' && ['GET','POST'].includes(req.method)) {
    const admin = await currentAdminSession(req);
    if (!admin) return sendJson(req,res,401,{error:'Sign in to manage jobs.'});
    try {
      await wpDb.query('CREATE TABLE IF NOT EXISTS trikonet_job_presence (slug VARCHAR(191) NOT NULL, user_id VARCHAR(191) NOT NULL, name VARCHAR(191) NOT NULL, expires_at BIGINT NOT NULL, PRIMARY KEY(slug,user_id)) ENGINE=InnoDB');
      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const slug = String(body.slug || '');
        if (!slug || slug.length > 191) return sendJson(req,res,400,{error:'Invalid job.'});
        if (body.release) await wpDb.query('DELETE FROM trikonet_job_presence WHERE slug=? AND user_id=?',[slug,String(admin.userId)]);
        else await wpDb.query('INSERT INTO trikonet_job_presence (slug,user_id,name,expires_at) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),expires_at=VALUES(expires_at)',[slug,String(admin.userId),String(admin.name || 'Administrator').slice(0,191),Date.now()+60000]);
        return sendJson(req,res,200,{ok:true});
      }
      const [rows] = await wpDb.query('SELECT slug,name FROM trikonet_job_presence WHERE expires_at>?',[Date.now()]);
      return sendJson(req,res,200,rows);
    } catch { return sendJson(req,res,503,{error:'Editing status unavailable.'}); }
  }

  if (path.startsWith('/api/') || path.startsWith('/admin')) res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (path === '/api/job-view' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const slug = String(body.slug || '');
      if (!/^[a-z0-9][a-z0-9-]{0,190}$/.test(slug)) return sendJson(req,res,400,{error:'Invalid job slug.'});
      if (/bot|crawler|spider|headless/i.test(req.headers['user-agent'] || '') || await currentAdminSession(req)) return sendJson(req,res,200,{ok:true});
      const db = await readCatalogueDb();
      let job = (db.jobs || []).find(item => item.slug === slug);
      if (!job) {
        try { job = (await wordpressRecords('job_listing',new URLSearchParams({slug,per_page:'1'})))[0]; }
        catch (error) { if (error.code !== 'ER_NO_SUCH_TABLE') throw error; await loadMemoryStore(); job = (memoryStore.jobs || []).find(item => item.slug === slug); }
      }
      if (!job || !isPublicRecord(job)) return sendJson(req,res,404,{error:'Published job not found.'});
      await jobViews.record(slug);
      return sendJson(req,res,200,{ok:true});
    } catch { return sendJson(req,res,503,{error:'View tracking temporarily unavailable.'}); }
  }
  if (path === '/api/admin/job-views' && req.method === 'GET') {
    if (!await currentAdminSession(req)) return sendJson(req,res,401,{error:'Administrator authentication required.'});
    const slugs = (requestUrl.searchParams.get('slugs') || '').split(',').filter(slug => /^[a-z0-9][a-z0-9-]{0,190}$/.test(slug)).slice(0,100);
    try { return sendJson(req,res,200,await jobViews.counts(slugs)); }
    catch { return sendJson(req,res,503,{error:'View counts temporarily unavailable.'}); }
  }
  if (path === '/api/admin/team-activity' && req.method === 'GET') {
    const admin = await currentAdminSession(req);
    if (!admin) return sendJson(req,res,401,{error:'Administrator authentication required.'});
    if (admin.role !== 'Administrator') return sendJson(req,res,403,{error:'Administrator access required.'});
    const date = requestUrl.searchParams.get('date') || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date+'T00:00:00Z')) || new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date) return sendJson(req,res,400,{error:'Select a valid date.'});
    try { return sendJson(req,res,200,teamActivity(await readCatalogueDb(['jobs','employers']),date)); }
    catch { return sendJson(req,res,503,{error:'Team activity is temporarily unavailable.'}); }
  }
  if(path==='/api/admin/employer-options' && req.method==='GET'){
    if(!await currentAdminSession(req))return sendJson(req,res,401,{error:'Sign in to load companies.'});
    await loadMemoryStore();
    const db=await readCatalogueDb(['employers']);
    return sendJson(req,res,200,employerOptions(memoryStore.employers||[],db.employers||[]));
  }
  if(path.startsWith('/api/admin/employer-record/')&&req.method==='GET'){
    if(!await currentAdminSession(req))return sendJson(req,res,401,{error:'Sign in to load companies.'});
    const slug=decodeURIComponent(path.slice('/api/admin/employer-record/'.length));
    const db=await readCatalogueDb(['employers']);await loadMemoryStore();
    const record=db.employers.find(e=>e.slug===slug)||memoryStore.employers.find(e=>e.slug===slug);
    return sendJson(req,res,record?200:404,record?normalizedCompanyDraft(record):{error:'Company not found'});
  }
  if(path==='/admin/company-profile-repair' && ['GET','POST'].includes(req.method)){
    const admin=await currentAdminSession(req);
    if(!admin||admin.role!=='Administrator'){res.writeHead(401,{'Content-Type':'text/html'});return res.end('<h1>Sign in to the Trikonet admin console first.</h1>');}
    const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    await loadMemoryStore();
    const db=await editorState.read(['jobs','employers','employerRepairArchive']);
    let result=null;
    if(req.method==='POST'){
      let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)throw Error('Invalid repair request');}
      const token=new URLSearchParams(body).get('token');const stored=companyRepairTokens.get(token);
      if(!stored||stored.user!==String(admin.userId)||stored.expires<Date.now()){res.writeHead(403,{'Content-Type':'text/html'});return res.end('<h1>Repair session expired. Reload this page and retry.</h1>');}
      companyRepairTokens.delete(token);
      result=repairCompanyProfiles(db,memoryStore.employers||[],admin,new Date().toISOString(),()=>crypto.randomUUID());
      await writeLocalDb(db);
    }
    const audit=auditCompanyProfiles(db,memoryStore.employers||[]);
    const safe=audit.filter(row=>row.action!=='review').length;
    const token=crypto.randomUUID();companyRepairTokens.set(token,{user:String(admin.userId),expires:Date.now()+600000});
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'});
    return res.end(`<!doctype html><html><head><title>Company profile audit | Trikonet</title></head><body style="font:16px system-ui;max-width:1100px;margin:40px auto;padding:24px"><h1>Company profile audit</h1>${result?`<p role="status">Recovered ${result.recovered} profiles; corrected ${result.relinked} job links.</p>`:''}<p>${audit.length} company links need attention. ${safe} can be repaired from existing saved data.</p><p>Only complete recovery profiles linked to published jobs are restored. Originals are archived. Incomplete or ambiguous records stay unchanged.</p>${safe?`<form method="post"><input type="hidden" name="token" value="${token}"><button type="submit">Repair complete company profiles and links</button></form>`:''}<table border="1" cellpadding="10"><thead><tr><th>Company</th><th>URL</th><th>Published jobs</th><th>Action</th></tr></thead><tbody>${audit.map(row=>`<tr><td>${escape(row.name)}</td><td>${escape(row.slug)}</td><td>${row.jobs.length}</td><td>${escape(row.reason||row.action)}</td></tr>`).join('')}</tbody></table></body></html>`);
  }
  if(path==='/api/admin/employers'&&req.method==='GET'){
    const admin=await currentAdminSession(req);if(!admin)return sendJson(req,res,401,{error:'Sign in to load employers.'});
    try{const payload=await adminEmployerIndex.page(requestUrl.searchParams,admin);return sendJson(req,res,200,{...payload,employers:payload.jobs,jobs:undefined});}
    catch(error){console.error('Employer index failed:',error.message);return sendJson(req,res,503,{error:'Unable to load employers.'});}
  }
  if (path === '/api/admin/jobs' && req.method === 'GET') {
    const admin=await currentAdminSession(req);
    if(!admin||admin.expiresAt<=Date.now())return sendJson(req,res,401,{error:'Administrator authentication required'});
    const params=new URLSearchParams(requestUrl.searchParams);
    if(!['all','publish','draft','pending','expired','mine'].includes(params.get('status')||'all'))return sendJson(req,res,400,{error:'Invalid job status'});
    try{
      const started=performance.now();
      const payload=await adminJobIndex.page(params,admin);
      const durationMs=Math.round(performance.now()-started);
      res.setHeader('Server-Timing',`jobs;dur=${durationMs}`);
      console.log(JSON.stringify({event:'admin_jobs_indexed_page',durationMs,rows:payload.jobs.length,total:payload.total}));
      return sendJson(req,res,200,payload);
    }
    catch(error){console.error(JSON.stringify({event:'admin_jobs_index_failed',message:String(error.message||'').slice(0,200)}));return sendJson(req,res,503,{error:'Unable to load jobs. Please retry.'});}
  }

  // Uploads must be confirmed in durable storage before the editor calls them saved.
  if(path === '/api/admin/media' && ['GET','POST'].includes(req.method)) {
    const admin=await currentAdminSession(req);
    if(!admin || admin.expiresAt <= Date.now())return sendJson(req,res,401,{error:'Sign in to manage media.'});
    try {
      await wpDb.query(`CREATE TABLE IF NOT EXISTS trikonet_media_library (id CHAR(64) PRIMARY KEY, payload LONGTEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);
      if(req.method==='GET') {
        return sendJson(req,res,200,await listAdminMedia(wpDb));
      }
      const body=await readJsonBody(req,14_000_000);
      if(!/^data:image\/(png|jpeg|webp|gif|avif);base64,/.test(String(body.url || '')))return sendJson(req,res,400,{error:'A PNG, JPEG, WebP, GIF or AVIF image is required.'});
      const originUrl=await mediaStore.normalize(body.url,body.title || 'image');
      const url=await mediaStore.publish(originUrl,body.title || 'image');
      const match=originUrl.match(/^https:\/\/api\.trikonet\.com\/media\/images\/([a-f0-9]{64})\//);
      if(!match)throw Error('Image could not be stored. Maximum size is 10 MB.');
      const saved={id:match[1],title:String(body.title || 'image').slice(0,191),url,dimensions:String(body.dimensions || ''),size:String(body.size || ''),type:'image',date:new Date().toISOString()};
      await wpDb.query('INSERT INTO trikonet_media_library (id,payload) VALUES (?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)',[saved.id,JSON.stringify(saved)]);
      return sendJson(req,res,201,saved);
    } catch(error) {return sendJson(req,res,400,{error:error.message || 'Image save failed.'});}
  }

  // API: WordPress counts
  if (path === '/api/wp/counts' && req.method === 'GET') {
    try {
      const [rows] = await wpDb.query(
        "SELECT post_type, COUNT(*) total FROM wp_posts WHERE post_status='publish' AND post_type IN ('job_listing','employer','post') GROUP BY post_type"
      );
      const [mediaRows] = await wpDb.query(
        "SELECT COUNT(*) total FROM wp_posts WHERE post_type='attachment' AND post_mime_type LIKE 'image/%'"
      );
      const counts = Object.fromEntries(rows.map(row => [row.post_type, Number(row.total)]));
      counts.media = Number(mediaRows[0]?.total || 0);
      return sendJson(req, res, 200, counts);
    } catch {
      return sendJson(req, res, 200, {
        job_listing: memoryStore.jobs?.length || 13621,
        employer: memoryStore.employers?.length || 2731,
        post: memoryStore.posts?.length || 88,
        media: 4417
      });
    }
  }

  // API: WordPress count
  if (path === '/api/wp/count' && req.method === 'GET') {
    try {
      return sendJson(req, res, 200, {
        total: await wordpressCount(requestUrl.searchParams.get('type'), requestUrl.searchParams)
      });
    } catch {
      return sendJson(req, res, 200, {
        total: fallbackCount(requestUrl.searchParams.get('type'), requestUrl.searchParams)
      });
    }
  }

  // API: WordPress taxonomies
  if (path === '/api/wp/taxonomies' && req.method === 'GET') {
    try {
      const [rows] = await wpDb.query(
        `SELECT tt.taxonomy, t.term_id id, t.name, t.slug, COALESCE(parent.name,'') parent, tt.description, tt.count
         FROM wp_term_taxonomy tt
         JOIN wp_terms t ON t.term_id=tt.term_id
         LEFT JOIN wp_terms parent ON parent.term_id=tt.parent
         WHERE tt.taxonomy IN ('job_listing_type','job_listing_category','job_listing_location','job_listing_tag','employer_category','employer_location')
         ORDER BY tt.taxonomy, t.name`
      );
      const groups = {
        types: [],
        categories: [],
        locations: [],
        tags: [],
        employerCategories: [],
        employerLocations: []
      };
      const keys = {
        job_listing_type: 'types',
        job_listing_category: 'categories',
        job_listing_location: 'locations',
        job_listing_tag: 'tags',
        employer_category: 'employerCategories',
        employer_location: 'employerLocations'
      };
      for (const row of rows) {
        if (keys[row.taxonomy]) {
          groups[keys[row.taxonomy]].push({
            id: Number(row.id),
            name: row.name,
            slug: row.slug,
            parent: row.parent,
            description: row.description || '',
            count: Number(row.count) || 0
          });
        }
      }
      const UAE_LOC_ORDER = ['UAE', 'United Arab Emirates', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'];
      const sortLocs = arr => (arr || []).sort((a, b) => {
        let ia = UAE_LOC_ORDER.indexOf(a.name);
        let ib = UAE_LOC_ORDER.indexOf(b.name);
        if (ia === -1) ia = 999;
        if (ib === -1) ib = 999;
        if (ia !== ib) return ia - ib;
        return a.name.localeCompare(b.name);
      });
      groups.locations = sortLocs(groups.locations);
      groups.employerLocations = sortLocs(groups.employerLocations);
      return sendJson(req, res, 200, groups);
    } catch {
      return sendJson(req, res, 200, memoryStore.taxonomies || { types: [], categories: [], locations: [], tags: [], employerCategories: [], employerLocations: [] });
    }
  }

  if(path==='/api/candidate/job-reports'){
    try{const body=req.method==='POST'?await readJsonBody(req,12000):{};const [status,result]=await jobReports(req.method,currentSession(req),body);return sendJson(req,res,status,result)}
    catch{return sendJson(req,res,503,{error:'Unable to save your report. Please try again.'})}
  }

  if(path.startsWith('/api/company-reviews/')){
    try{const companyId=path.slice('/api/company-reviews/'.length);const body=req.method==='POST'?await readJsonBody(req,10000):{};const [status,result]=await companyReviews(req.method,companyId,currentSession(req),body);return sendJson(req,res,status,result)}
    catch{return sendJson(req,res,503,{error:'Reviews are temporarily unavailable. Please try again.'})}
  }

  if (['/api/auth/forgot-password','/api/auth/verify-reset-code','/api/auth/reset-password'].includes(path) && req.method === 'POST') {
    try { const body=await readJsonBody(req);const [status,payload]=await passwordReset(path,body,req.socket.remoteAddress||'unknown');return sendJson(req,res,status,payload); }
    catch { return sendJson(req,res,503,{error:'Password reset email is temporarily unavailable. Please try again later.'}); }
  }

  if(path==='/api/candidate/job-alerts' && ['GET','POST'].includes(req.method)) {
    const session=currentSession(req);
    if(!session)return sendJson(req,res,401,{error:'Sign in to manage email alerts.'});
    try {
      const user=(await readLocalDb()).users.find(user=>String(user.id)===String(session.userId));
      if(!user||!isCandidateAccount(user))return sendJson(req,res,403,{error:'Email alerts are available to job seekers.'});
      const body=req.method==='POST'?await readJsonBody(req,1000):{};
      if(req.method==='POST'&&typeof body.enabled!=='boolean')return sendJson(req,res,400,{error:'Enabled must be true or false.'});
      return sendJson(req,res,200,await jobEmailAlerts.preferences(user.id,body.enabled));
    }catch(error){console.error('Email alert preferences failed:',error.message);return sendJson(req,res,503,{error:'Email alert settings are temporarily unavailable.'});}
  }
  if(path==='/api/job-alerts/unsubscribe' && ['GET','POST'].includes(req.method)) {
    const token=requestUrl.searchParams.get('token');
    if(!/^[a-f0-9]{64}$/.test(token||''))return sendJson(req,res,400,{error:'Invalid unsubscribe link.'});
    if(req.method==='GET') {
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; form-action 'self'; base-uri 'none'"});
      return res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Trikonet email alerts</title><h1>Unsubscribe from job emails</h1><p>Stop receiving new-job email alerts from Trikonet.</p><form method="post"><button type="submit">Unsubscribe</button></form></html>`);
    }
    try {
      const removed=await jobEmailAlerts.unsubscribe(token);
      res.writeHead(removed?200:404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      return res.end(removed?'<!doctype html><html lang="en"><title>Unsubscribed</title><h1>You have unsubscribed</h1><p>You can enable job emails again in your Trikonet profile.</p></html>':'Invalid unsubscribe link.');
    }catch{return sendJson(req,res,503,{error:'Please try again shortly.'});}
  }
  if(path==='/api/auth/google-config'&&req.method==='GET')return sendJson(req,res,200,{clientId:process.env.GOOGLE_CLIENT_ID||null});
  if(path==='/api/auth/google'&&req.method==='POST'){
    try {
      const body=await readJsonBody(req);
      const identity=await googleIdentity(body.credential,process.env.GOOGLE_CLIENT_ID);
      let accountSaved=Promise.resolve();
      const user=await googleAccount(identity,{readLocalDb,writeLocalDb:db=>{accountSaved=writeLocalDb(db,{skipMedia:true});return Promise.resolve()},onSignIn:user=>recordSignInPlatform(user,req,body),findExisting:subject=>findGoogleAccount(wpDb,subject),saveExisting:entry=>{accountSaved=saveGoogleAccount(wpDb,entry);return Promise.resolve()}});
      await accountSaved;
      if((await accountDeletion.status(user.id)).status==='deleted')return sendJson(req,res,401,{error:'This account is no longer available.'});
      const token=crypto.randomUUID();sessions.set(token,{userId:user.id,email:user.email,name:user.name});
      await Promise.all([accountSaved,sessions.flush()]);
      res.setHeader('Set-Cookie',getSessionCookieHeader(req,token));
      return sendJson(req,res,200,{user:{id:user.id,name:user.name,email:user.email},profile:{...user.profile,name:user.name,email:user.email,accountId:user.id},deletion:await accountDeletion.status(user.id)});
    }catch{return sendJson(req,res,401,{error:'Google sign-in could not be completed. Please try your email and password.'});}
  }

  // API: Auth Register
  if(['/api/auth/request-email-otp','/api/auth/confirm-email-otp'].includes(path)&&req.method==='POST'){
    try{const [status,data]=await registrationVerification.handle(path.includes('request-')?'request':'confirm',await readJsonBody(req),req.socket.remoteAddress);return sendJson(req,res,status,data)}catch{return sendJson(req,res,503,{error:'Unable to send verification email. Please try again.'})}
  }
  if (path === '/api/auth/register' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim();
      const password = String(body.password || '');

      if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
        return sendJson(req, res, 400, { error: 'Name, valid email, and a password of at least 8 characters are required' });
      }

      const db = await readLocalDb();
      if (db.users.some(user => user.email === email)) {
        return sendJson(req, res, 409, { error: 'An account with this email already exists' });
      }

      if(body.clientPlatform==='app'&&!registrationVerification.consume(email,String(body.verification_token||'')))return sendJson(req,res,400,{error:'Verify your email before creating an account.'});
      const credentials = passwordHash(password);
      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        role: 'Candidate',
        passwordSalt: credentials.salt,
        passwordHash: credentials.hash,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);

      recordSignInPlatform(user,req,body);
      const accountSaved=writeLocalDb(db,{skipMedia:true});
      const token = crypto.randomUUID();
      sessions.set(token, { userId: user.id, email: user.email, name: user.name });
      await Promise.all([accountSaved,sessions.flush()]);
      res.setHeader('Set-Cookie', getSessionCookieHeader(req, token));
      return sendJson(req, res, 201, { user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  // API: Auth Login
  if (path === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      await ensurePersistentState();
      const entry=await findPasswordAccount(wpDb,email);
      const user=entry?.user;

      if (!user || !passwordMatches(String(body.password || ''), user)) {
        return sendJson(req, res, 401, { error: 'Invalid email or password' });
      }

      const deletion=await accountDeletion.status(user.id);
      if(deletion.status==='deleted')return sendJson(req,res,401,{error:'Invalid email or password'});
      recordSignInPlatform(user,req,body);
      const accountSaved=savePasswordSignIn(wpDb,entry);
      const token = crypto.randomUUID();
      sessions.set(token, { userId: user.id, email: user.email, name: user.name });
      await Promise.all([accountSaved,sessions.flush()]);
      res.setHeader('Set-Cookie', getSessionCookieHeader(req, token));
      return sendJson(req, res, 200, { user: { id: user.id, name: user.name, email: user.email },profile:{...user.profile,name:user.name,email:user.email,accountId:user.id},deletion });
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  // API: Auth Me
  if (path === '/api/auth/me' && req.method === 'GET') {
    const session = currentSession(req);
    let user=null;
    if(session){
      await ensurePersistentState();
      const [rows]=await wpDb.query("SELECT CAST(JSON_EXTRACT(s.payload,CONCAT('$.users[',u.position-1,']')) AS CHAR) account FROM trikonet_app_state s, JSON_TABLE(s.payload,'$.users[*]' COLUMNS (position FOR ORDINALITY,id VARCHAR(191) PATH '$.id')) u WHERE s.state_key='main' AND u.id=? LIMIT 1",[String(session.userId)]);
      if(rows[0]?.account)user=JSON.parse(rows[0].account);
    }
    const deletion=user?await accountDeletion.status(user.id):null;
    if(deletion?.status==='deleted')user=null;
    return sendJson(req,res,user?200:401,user?{user:accountView(user),deletion}:{error:'Authentication required'});
  }

  // API: Auth Logout
  if (path === '/api/auth/logout' && req.method === 'POST') {
    sessions.delete(cookieValue(req, 'trikonet_session'));
    await sessions.flush();
    res.setHeader('Set-Cookie', getSessionCookieHeader(req, '', 0));
    return sendJson(req, res, 200, { ok: true });
  }

  // API: Admin Login
  if (path === '/api/admin/login' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const identity = String(body.identity || '').trim().toLowerCase();
      const db = await readLocalDb();
      const user = (db.users || []).find(item => String(item.email || '').toLowerCase() === identity || String(item.username || '').toLowerCase() === identity);
      const role = String(user?.role || '').toLowerCase();

      if (!user || user.status === 'inactive' || !['administrator', 'editor', 'content editor'].includes(role) || !passwordMatches(String(body.password || ''), user)) {
        return sendJson(req, res, 401, { error: 'Invalid administrator username or password.' });
      }

      const token = crypto.randomUUID();
      const roleLabel = role === 'administrator' ? 'Administrator' : role === 'content editor' ? 'Content Editor' : 'Editor';
      const admin = {
        userId: user.id,
        username: user.username || user.email,
        email: user.email,
        name: user.name || user.username || 'Administrator',
        role: roleLabel,
        expiresAt: Date.now() + (8 * 60 * 60 * 1000)
      };
      await adminSessions.set(token, admin);
      res.setHeader('Set-Cookie', `trikonet_admin_session=${token}; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=28800`);
      return sendJson(req, res, 200, { admin });
    } catch (error) {
      return sendJson(req, res, 400, { error: 'Unable to sign in. Please try again.' });
    }
  }

  // API: Admin Me
  if (path === '/api/admin/me' && req.method === 'GET') {
    const admin = await currentAdminSession(req);
    if (!admin || admin.expiresAt <= Date.now()) return sendJson(req, res, 401, { error: 'Administrator authentication required' });
    return sendJson(req, res, 200, { admin });
  }

  // API: Admin Logout
  if (path === '/api/admin/logout' && req.method === 'POST') {
    await adminSessions.delete(cookieValue(req, 'trikonet_admin_session'));
    res.setHeader('Set-Cookie', 'trikonet_admin_session=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0');
    return sendJson(req, res, 200, { ok: true });
  }

  // API: Admin Users List
  if (path === '/api/admin/users' && req.method === 'GET') {
    const admin = await currentAdminSession(req);
    if (!admin || admin.expiresAt <= Date.now() || admin.role !== 'Administrator') {
      return sendJson(req, res, 403, { error: 'Administrator access required' });
    }
    const db = await readLocalDb();
    const allowed = new Set(['administrator', 'editor', 'content editor']);
    const users = (db.users || []).filter(user => allowed.has(String(user.role || '').toLowerCase())).map(user => ({
      id: user.id,
      username: user.username || user.email,
      name: user.name || user.username || '',
      email: user.email || '',
      role: String(user.role || 'Editor').replace(/\b\w/g, c => c.toUpperCase()),
      status: user.status || 'active',
      website: user.website || '',
      bio: user.bio || '',
      posts: Number(user.posts) || 0,
      createdAt: user.createdAt || '',
      hasPassword: !!user.passwordHash
    }));
    return sendJson(req, res, 200, users);
  }

  if ((path === '/api/admin/user-save' || path === '/api/admin/users') && req.method === 'POST') {
    const admin = await currentAdminSession(req);
    if (!admin || admin.expiresAt <= Date.now() || admin.role !== 'Administrator') {
      return sendJson(req, res, 403, { error: 'Administrator access required' });
    }
    try {
      const body = await readJsonBody(req);
      const db = await readLocalDb();
      const username = String(body.username || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || username).trim();
      const roleInput = String(body.role || 'Editor').trim().toLowerCase();
      const role = roleInput === 'administrator' ? 'Administrator' : roleInput === 'content editor' ? 'Content Editor' : 'Editor';
      const password = String(body.password || '');
      if (!username || !/^\S+@\S+\.\S+$/.test(email)) {
        return sendJson(req, res, 400, { error: 'Username and a valid email are required.' });
      }
      db.users = db.users || [];
      let user = db.users.find(item =>
        String(item.id) === String(body.id || '') ||
        String(item.email || '').toLowerCase() === email ||
        String(item.username || '').toLowerCase() === username.toLowerCase()
      );
      if (!user && password.length < 8) {
        return sendJson(req, res, 400, { error: 'Set a password of at least 8 characters for this login.' });
      }
      if (db.users.some(item => item !== user && String(item.email || '').toLowerCase() === email)) {
        return sendJson(req, res, 409, { error: 'Email address is already assigned to another user.' });
      }
      if (db.users.some(item => item !== user && String(item.username || '').toLowerCase() === username.toLowerCase())) {
        return sendJson(req, res, 409, { error: 'Username is already taken.' });
      }
      if (!user) {
        user = { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        db.users.push(user);
      }
      Object.assign(user, {
        username,
        email,
        name,
        role,
        status: body.status === 'inactive' ? 'inactive' : 'active',
        website: String(body.website || ''),
        bio: String(body.bio || ''),
        posts: Number(body.posts) || Number(user.posts) || 0,
        updatedAt: new Date().toISOString()
      });
      if (password) {
        const credentials = passwordHash(password);
        user.passwordSalt = credentials.salt;
        user.passwordHash = credentials.hash;
        delete user.salt;
        delete user.hash;
      }
      await writeLocalDb(db);
      return sendJson(req, res, 200, {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        website: user.website,
        bio: user.bio,
        posts: user.posts,
        createdAt: user.createdAt,
        hasPassword: Boolean(user.passwordHash)
      });
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message || 'Unable to save user.' });
    }
  }

  if (path.startsWith('/api/admin/users/') && req.method === 'DELETE') {
    const admin = await currentAdminSession(req);
    if (!admin || admin.expiresAt <= Date.now() || admin.role !== 'Administrator') {
      return sendJson(req, res, 403, { error: 'Administrator access required' });
    }
    const id = path.slice('/api/admin/users/'.length);
    const db = await readLocalDb();
    const target = (db.users || []).find(user => String(user.id) === id);
    if (!target) return sendJson(req, res, 404, { error: 'User not found' });
    if (String(target.id) === String(admin.userId)) {
      return sendJson(req, res, 400, { error: 'You cannot delete the account you are currently using.' });
    }
    const administrators = (db.users || []).filter(user => String(user.role || '').toLowerCase() === 'administrator');
    if (String(target.role || '').toLowerCase() === 'administrator' && administrators.length <= 1) {
      return sendJson(req, res, 400, { error: 'You cannot delete the last administrator account.' });
    }
    db.users = db.users.filter(user => String(user.id) !== id);
    await writeLocalDb(db);
    return sendJson(req, res, 200, { ok: true });
  }

  if(path==='/api/admob/reward'&&req.method==='GET'){
    try{const [status,result]=await admobRewards.callback(req.url);return sendJson(req,res,status,result)}catch{return sendJson(req,res,503,{error:'Reward verification unavailable.'})}
  }
  if(path==='/api/candidate/resume-points'&&['GET','POST'].includes(req.method)){
    try{const [status,result]=await admobRewards.account(currentSession(req),req.method,req.method==='POST'?await readJsonBody(req,7500000):{});return sendJson(req,res,status,result)}catch(error){console.error('Resume points request failed:',error.message);return sendJson(req,res,error.message==='Request too large'?413:503,{error:error.message==='Request too large'?'Resume upload is too large. Choose a PDF or DOCX up to 5 MB.':'Resume service is temporarily unavailable. No analysis charge was made.'})}
  }
  if(path==='/api/candidate/category-spelling'&&req.method==='POST'){const [status,data]=await categorySpelling(currentSession(req),await readJsonBody(req,2000));return sendJson(req,res,status,data)}
  if(path==='/api/candidate/recommendations/refine'&&req.method==='POST'){
    try{const [status,result]=await refineRecommendations(currentSession(req),await readJsonBody(req,100000));return sendJson(req,res,status,result)}catch{return sendJson(req,res,503,{error:'Recommendations are temporarily unavailable.'})}
  }
  if(path==='/api/candidate/resume'){
    const session=currentSession(req);if(!session)return sendJson(req,res,401,{error:'Sign in to manage your resume.'});const db=await readLocalDb();const user=db.users.find(item=>String(item.id)===String(session.userId));if(!user)return sendJson(req,res,401,{error:'Account not found.'});
    if(req.method==='GET')return sendJson(req,res,200,{success:true,resume:user.uploadedResume||null});
    if(req.method==='POST'){try{user.uploadedResume=candidateFile(await readJsonBody(req,14_000_000));await writeLocalDb(db,{skipMedia:true});return sendJson(req,res,200,{success:true,resume:user.uploadedResume})}catch(error){return sendJson(req,res,400,{error:error.message})}}
    if(req.method==='DELETE'){delete user.uploadedResume;await writeLocalDb(db,{skipMedia:true});return sendJson(req,res,200,{success:true})}
  }
  if(['/api/candidate/email/request','/api/candidate/email/verify'].includes(path)&&req.method==='POST'){
    try{const [status,data]=await emailChange(path.endsWith('/request')?'request':'verify',currentSession(req),await readJsonBody(req));return sendJson(req,res,status,data)}catch{return sendJson(req,res,503,{error:'Email verification is temporarily unavailable.'})}
  }
  if(path==='/api/candidate/profile'){
    const session=currentSession(req);if(!session)return sendJson(req,res,401,{error:'Sign in to manage your profile.'});
    try{
      const deletion=await accountDeletion.status(session.userId);
      if(deletion.status!=='active')return sendJson(req,res,403,{error:'Restore your account before editing your profile.',code:'account_deletion_pending',deletion});
      const body=['POST','PUT'].includes(req.method)?await readJsonBody(req):{};
      await ensurePersistentState();const [status,result]=await candidateProfileRequest(wpDb,req.method,session.userId,body);
      return sendJson(req,res,status,result);
    }catch(error){return sendJson(req,res,503,{error:'Could not save your profile. Please try again.'});}
  }
  if(['/api/candidate/profile','/api/candidate/activity'].includes(path)) {
    const session=currentSession(req);if(!session)return sendJson(req,res,401,{error:'Sign in to manage your profile.'});
    const db=await readLocalDb();const user=(db.users || []).find(u=>String(u.id)===String(session.userId));
    if(!user)return sendJson(req,res,404,{error:'Account not found'});
    if(req.method==='GET')return sendJson(req,res,200,path.endsWith('/profile')?{profile:{...user.profile,name:user.name,email:user.email,accountId:user.id},completionPercentage:calculateCandidateCompletion({...user.profile,name:user.name,email:user.email})}:user.memberActivity || {});
    if(['POST','PUT'].includes(req.method)) {
      try {
        const body=await readJsonBody(req);
        if(path.endsWith('/activity')){
          user.memberActivity ||= {};
          for(const kind of ['saved_jobs','applied_jobs','followed_companies','templates','recentSearches'])if(Array.isArray(body[kind]))user.memberActivity[kind]=body[kind].slice(0,200);
          if(body.behaviour&&typeof body.behaviour==='object')user.memberActivity.behaviour=body.behaviour;
        } else {
          applyAccountProfile(user,body,updateCandidateProfile);
        }
        grantProfileCompletionReward(user);await writeLocalDb(db,{skipMedia:true});return sendJson(req,res,200,{profile:user.profile,completionPercentage:calculateCandidateCompletion({...user.profile,name:user.name,email:user.email}),activity:user.memberActivity,saved:true});
      }catch(error){return sendJson(req,res,400,{error:error.message});}
    }
  }
  if (path === '/api/resumes' && req.method === 'GET') {
    const session = currentSession(req);
    if (!session) return sendJson(req, res, 401, { error: 'Sign in to access your résumé library.' });
    const db = await readLocalDb();
    const resumes = db.resumes.filter(item => item.userId === session.userId).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    return sendJson(req, res, 200, { resumes, limit: MAX_RESUMES_PER_USER });
  }

  if (path === '/api/resumes' && (req.method === 'POST' || req.method === 'PUT')) {
    const session = currentSession(req);
    if (!session) return sendJson(req, res, 401, { error: 'Sign in to save a résumé.' });
    try {
      const body = await readJsonBody(req);
      const id = String(body.id || '').trim();
      const state = body.state && typeof body.state === 'object' ? body.state : null;
      if (!id || !state) return sendJson(req, res, 400, { error: 'A valid résumé is required.' });
      if (dataUrlBytes(state.photo) > MAX_PROFILE_PHOTO_BYTES) return sendJson(req, res, 413, { error: 'Profile photo must be smaller than 100 KB.' });
      const db = await readLocalDb();
      const existingIndex = db.resumes.findIndex(item => item.id === id && item.userId === session.userId);
      if (existingIndex < 0 && db.resumes.filter(item => item.userId === session.userId).length >= MAX_RESUMES_PER_USER) {
        return sendJson(req, res, 409, { error: `You can save up to ${MAX_RESUMES_PER_USER} résumés. Delete one before creating another.` });
      }
      const now = Date.now();
      const existing = existingIndex >= 0 ? db.resumes[existingIndex] : null;
      const resume = { id, userId: session.userId, name: String(body.name || 'My professional résumé').slice(0, 120), template: String(body.template || 'classic').slice(0, 40), state, previewImage: dataUrlBytes(body.previewImage) <= MAX_PROFILE_PHOTO_BYTES ? String(body.previewImage || '') : '', createdAt: existing?.createdAt || now, updatedAt: now };
      if (existingIndex >= 0) db.resumes[existingIndex] = resume; else db.resumes.push(resume);
      await writeLocalDb(db,{skipMedia:true});
      return sendJson(req, res, existingIndex >= 0 ? 200 : 201, { resume, limit: MAX_RESUMES_PER_USER });
    } catch (error) {
      return sendJson(req, res, error.message === 'Request too large' ? 413 : 400, { error: error.message || 'Unable to save résumé.' });
    }
  }

  if (path.startsWith('/api/resumes/') && req.method === 'DELETE') {
    const session = currentSession(req);
    if (!session) return sendJson(req, res, 401, { error: 'Sign in to delete a résumé.' });
    const id = path.slice('/api/resumes/'.length);
    const db = await readLocalDb();
    const before = db.resumes.length;
    db.resumes = db.resumes.filter(item => !(item.id === id && item.userId === session.userId));
    if (db.resumes.length === before) return sendJson(req, res, 404, { error: 'Résumé not found.' });
    await writeLocalDb(db,{skipMedia:true});
    return sendJson(req, res, 200, { ok: true });
  }

  // API: Email Campaigns
  if (path === '/api/email-campaigns' && req.method === 'GET') {
    const session = currentSession(req);
    if (!session) return sendJson(req, res, 401, { error: 'Authentication required' });
    const db = await readLocalDb();
    return sendJson(req, res, 200, db.emailCampaigns.filter(item => item.userId === session.userId));
  }

  if (path === '/api/email-campaigns' && (req.method === 'POST' || req.method === 'PUT')) {
    const session = currentSession(req);
    if (!session) return sendJson(req, res, 401, { error: 'Authentication required' });
    try {
      const body = await readJsonBody(req);
      if (!body.subject?.trim() || !body.html?.trim()) {
        return sendJson(req, res, 400, { error: 'Subject and email content are required' });
      }
      const db = await readLocalDb();
      const now = new Date().toISOString();
      const existing = db.emailCampaigns.find(item => item.id === body.id && item.userId === session.userId);
      const campaign = {
        ...(existing || {}),
        ...body,
        id: existing?.id || crypto.randomUUID(),
        userId: session.userId,
        status: body.status === 'sent' ? 'sent' : 'draft',
        updatedAt: now,
        createdAt: existing?.createdAt || now
      };
      if (existing) db.emailCampaigns[db.emailCampaigns.indexOf(existing)] = campaign;
      else db.emailCampaigns.unshift(campaign);
      await writeLocalDb(db,{skipMedia:true});
      return sendJson(req, res, 200, campaign);
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  if(path==='/api/admin/candidate-delete' && req.method==='POST') {
    const admin=await currentAdminSession(req);
    if(!admin || admin.role!=='Administrator')return sendJson(req,res,403,{error:'Administrator access required'});
    if((req.headers.origin&&!getCorsOrigin(req))||!String(req.headers['content-type']||'').includes('application/json'))return sendJson(req,res,403,{error:'Invalid request origin or format.'});
    try {
      const body=await readJsonBody(req,16000);
      const [status,result]=await accountDeletion.permanent(body.ids,body.confirmation);
      return sendJson(req,res,status,result);
    } catch(error){console.error('Candidate deletion failed:',error.message);return sendJson(req,res,503,{error:'Deletion could not complete. Please retry; the candidate has not been hidden.'});}
  }
  if(path==='/api/admin/candidate-save' && req.method==='POST') {
    const admin=await currentAdminSession(req);
    if(!admin || !['Administrator','Editor'].includes(admin.role))return sendJson(req,res,403,{error:'Administrator access required'});
    try {
      const body=await readJsonBody(req);const db=await readLocalDb();
      db.candidates ||= [];db.candidateTrash ||= [];
      for(const id of body.removed || [])if(!db.candidateTrash.includes(String(id)))db.candidateTrash.push(String(id));
      for(const record of body.records || []) {
        if(!record.id || !record.name)continue;
        const safe={...candidateProfileData(record),id:record.id,name:record.name,slug:record.slug,email:record.email,phone:record.phone,jobTitle:record.jobTitle,category:record.category,location:record.location,experience:record.experience,qualification:record.qualification,bio:record.bio,status:record.status,featured:!!record.featured,createdAt:record.createdAt};
        const index=db.candidates.findIndex(c=>String(c.id)===String(record.id));
        if(index>=0)db.candidates[index]={...db.candidates[index],...safe};else db.candidates.push(safe);
        const account=db.users.find(item=>String(item.id)===String(record.id));if(account)applyAccountProfile(account,candidateEditProfile(record),updateCandidateProfile);
      }
      await writeLocalDb(db,{skipMedia:true});return sendJson(req,res,200,{saved:true});
    }catch(error){return sendJson(req,res,400,{error:error.message});}
  }
  if(path.startsWith('/api/admin/candidate-profile/') && req.method==='GET') {
    const admin=await currentAdminSession(req);
    if(!admin || !['Administrator','Editor'].includes(admin.role))return sendJson(req,res,403,{error:'Administrator access required'});
    const id=decodeURIComponent(path.slice('/api/admin/candidate-profile/'.length));const db=await readLocalDb();
    const user=(db.users || []).find(u=>String(u.id)===id && isCandidateAccount(u));
    const candidate=(db.candidates || []).find(c=>String(c.id)===id);
    if(!user && !candidate)return sendJson(req,res,404,{error:'Candidate not found'});
    return sendJson(req,res,200,{profile:{...user?.profile,...candidate,id,name:user?.name||candidate?.name,email:user?.email||candidate?.email,createdAt:user?.createdAt||candidate?.createdAt},account:{...(admin.role==='Administrator'?{id:user?.id}:{}),username:user?.username || user?.name,email:user?.email,createdAt:user?.createdAt},submittedProfile:user?.profile || {},activity:user?.memberActivity || {},applications:(db.applications || []).filter(a=>String(a.userId)===id || (user?.email && a.email===user.email)),resumes:(db.resumes || []).filter(r=>String(r.userId)===id)});
  }
  if (['/api/admin/candidates', '/api/local/candidates'].includes(path) && req.method === 'GET') {
    const admin = await currentAdminSession(req);
    if (!admin || !['Administrator', 'Editor'].includes(admin.role)) return sendJson(req, res, 403, { error: 'Administrator access required' });
    try {
      const db = await readLocalDb();
      let imported = [];
      try {
        const [rows] = await wpDb.query("SELECT payload FROM trikonet_imported_data WHERE dataset_key IN ('candidates','candidate')");
        imported = rows.flatMap(row => { const records = JSON.parse(row.payload); return Array.isArray(records) ? records : []; });
      } catch (error) { if (error.code !== 'ER_NO_SUCH_TABLE') throw error; }
      try {
        imported.push(...await wordpressRecords('candidate', new URLSearchParams({ per_page: '100' }), { excludedSlugs: [] }));
      } catch (error) { if (error.code !== 'ER_NO_SUCH_TABLE') throw error; }
      const users = (db.users || []).filter(isCandidateAccount);
      const records = [...imported, ...users.map(user => ({ ...user.profile, photo: user.profile?.photo || user.avatar || '', id: user.id, name: user.name || user.username, email: user.email, createdAt: user.createdAt, signInPlatforms:user.signInPlatforms || [] })), ...(db.candidates || [])];
      const resumeCounts = new Map();
      for (const resume of db.resumes || []) {
        if (resume.userId == null) continue;
        const userId = String(resume.userId);
        resumeCounts.set(userId, (resumeCounts.get(userId) || 0) + 1);
      }
      const merged = new Map();
      for (const original of records) {
        const record=adminCandidateProfile(original,users.find(user=>String(user.id)===String(original.sourceAccountId||original.id)));
        const m = record.metas || {};
        const candidate = {
          ...candidateProfileData(record),
          signInPlatforms: users.find(u=>String(u.id)===String(record.id))?.signInPlatforms || record.signInPlatforms || [],
          resumeCount: resumeCounts.get(String(record.sourceAccountId || record.id)) || 0,
          id: record.id, userId:record.userId||null, appProfile:record.appProfile||null, slug: record.slug || '', name: record.name || record.title?.rendered || record.title || '',
          email: record.email || m._candidate_email || '', jobTitle: record.jobTitle || record.professionalTitle || m._candidate_title || '',
          category: record.category || Object.values(m._candidate_category || {}).join(', '),
          location: record.location || Object.values(m._candidate_location || {}).join(', '),
          experience: record.experience || m._candidate_experience || '', qualification: record.qualification || '',
          bio: record.bio || record.content?.rendered || '', photo: record.photo || record.avatar || record.profile?.photo || m._candidate_photo || '',
          status: record.status === 'pending' ? 'Pending' : record.status === 'inactive' || record.status === 'draft' ? 'Inactive' : 'Active',
          featured: !!record.featured, phone:record.phone || m._candidate_phone || '', createdAt: users.find(u=>String(u.id)===String(record.id))?.createdAt || record.createdAt || record.date || ''
        };
        merged.set(String(candidate.id || candidate.email || candidate.slug), candidate);
      }
      return sendJson(req, res, 200, [...merged.values()].filter(c=>!(db.candidateTrash || []).includes(String(c.id))));
    } catch (error) {
      console.error(JSON.stringify({ event: 'admin_candidates_load_failed', code: error.code || error.name }));
      return sendJson(req, res, 503, { error: 'Unable to load candidate profiles.' });
    }
  }

  if (path.startsWith('/api/admin/seo-job-pages') || path.startsWith('/api/seo-job-pages') || path === '/api/job-category-links' || path === '/sitemap-seo-job-pages.xml') {
    await handleSeoRequest(req,res,path,requestUrl,{seoRepository,currentAdminSession,sendJson,readJsonBody});
    return;
  }

  // Autosaved unfinished records are always drafts, never published overrides.
  if(path==='/api/admin/employer-job-address' && req.method==='GET'){
    const admin=await currentAdminSession(req);if(!admin)return sendJson(req,res,401,{error:'Sign in to load employer addresses.'});
    try{const params=new URL(req.url,'http://localhost').searchParams;const db=await editorState.read();return sendJson(req,res,200,findEmployerAddress(db,params.get('company'),params.get('slug')));}
    catch(error){return sendJson(req,res,503,{error:'Unable to load the saved company address.'});}
  }
  if(path==='/api/admin/import-job-link' && req.method==='POST'){
    const admin=await currentAdminSession(req);
    if(!admin)return sendJson(req,res,401,{error:'Sign in to import jobs.'});
    try{const body=await readJsonBody(req);const result=body.text?importPastedJob(String(body.text).slice(0,100000),String(body.url||'')):await importJobLink(String(body.url||''));return sendJson(req,res,200,result);}
    catch(error){return sendJson(req,res,400,{error:error.message||'Unable to import job.'});}
  }
  if (path === '/api/admin/autosave' && req.method === 'POST') {
    const admin = await currentAdminSession(req);
    if (!admin) return sendJson(req, res, 401, { error: 'Sign in to save drafts.' });
    try {
      const body = await readJsonBody(req);
      if (!['job','employer'].includes(body.type) || !/^[a-f0-9-]{36}$/.test(body.draftId || '')) return sendJson(req,res,400,{error:'Invalid draft.'});
      const record = body.record || {};
      delete record.publicPath; delete record.urlJobId; delete record.urlAliases;
      if (body.type === 'job' && !String(record.title || '').trim() && !String(record.description || '').trim()) return sendJson(req,res,200,{skipped:true});
      if (!String(record.title || '').trim() && body.type !== 'job') return sendJson(req,res,400,{error:'Enter a title to save a draft.'});
      if (body.type === 'job' && !String(record.title || '').trim()) record.title = 'Untitled job';
      const db = await editorState.read();
      const list = body.type === 'job' ? db.jobs : db.employers;
      if (body.type === 'job') {
        const now = new Date().toISOString();
        const sourceSlug = String(body.sourceSlug || record.originalSlug || '');
        const index = findJobIndex(list, { ...record, sourceSlug, originalSlug: sourceSlug });
        let existing = index >= 0 ? list[index] : null;
        if (!existing && sourceSlug && !sourceSlug.startsWith('autosave-')) {
          let records;
          const params = new URLSearchParams({slug:sourceSlug,per_page:'1'});
          try { records = await wordpressRecords('job_listing', params, {excludedSlugs:[]}); }
          catch (error) { if (error.code !== 'ER_NO_SUCH_TABLE') throw error; await loadMemoryStore(); records = fallbackRecords('job_listing', params); }
          const wp = records[0];
          if (wp) {
            const id = wp.id || record.id || body.draftId;
            db.jobRecoveryById ||= {};
            db.jobRecoveryById[String(id)] = { ...record, id, sourceSlug, updatedAt:now, owner:admin.userId };
            await writeLocalDb(db);
            return sendJson(req,res,200,{id,slug:sourceSlug,status:wp.status});
          }
        }
        const id = existing?.id || record.id || body.draftId;
        const slug = existing?.slug || record.slug || `autosave-job-${id}`;
        const draft = { ...record, createdBy:jobCreator(existing,admin), id, slug, status: 'draft', local: true, updatedAt: now };
        // Published jobs retain their public content until an explicit Save/Publish.
        const saved = existing && ['publish','published','active'].includes(existing.status)
          ? { ...existing, id, local:true, recoveryDraft:draft, updatedAt:now }
          : { ...existing, ...draft, createdAt:existing?.createdAt || now, autosaved:true, autosaveOwner:admin.userId };
        if (index >= 0) list[index] = saved; else list.unshift(saved);
        await writeLocalDb(db);
        return sendJson(req,res,200,{id,slug,status:saved.status});
      }
      const slug = `autosave-${body.type}-${body.draftId}`;
      const index = list.findIndex(item => item.slug === slug);
      const now = new Date().toISOString();
      const saved = { ...record, id: body.draftId, requestedSlug: record.slug || '', createdBy: jobCreator(index >= 0 ? list[index] : null, admin), slug, originalSlug: '', status: 'draft', local: true, autosaved: true,
        autosaveOwner: admin.userId, sourceSlug: String(body.sourceSlug || ''), updatedAt: now,
        createdAt: index >= 0 ? list[index].createdAt : now, date: now, publishedDate: now };
      if (index >= 0 && String(list[index].autosaveOwner) !== String(admin.userId)) return sendJson(req,res,403,{error:'Draft access denied.'});
      if (index >= 0) list[index] = saved; else list.unshift(saved);
      await writeLocalDb(db);
      return sendJson(req,res,200,{slug,status:'draft'});
    } catch(error) {console.error(JSON.stringify({event:'admin_autosave_failed',code:error.code||error.name,message:String(error.message||'').slice(0,220)}));return sendJson(req,res,503,{error:'Server draft sync failed. Your device recovery copy is retained.'}); }
  }

  if(path==='/api/admin/google-indexing-status'&&req.method==='GET'){
    const admin=await currentAdminSession(req);
    if(!admin||admin.role!=='Administrator')return sendJson(req,res,403,{error:'Administrator access required'});
    try{return sendJson(req,res,200,await googleIndexing.status());}
    catch{return sendJson(req,res,503,{error:'Indexing status temporarily unavailable'});}
  }
  // API: Local Jobs
  if (path === '/api/job-url' && req.method === 'GET') {
    const requested = requestUrl.searchParams.get('path') || '';
    const match = requested.match(/^\/(job|jobs)\/([a-z0-9_-]+)\/?$/i);
    if (!match) return sendJson(req,res,404,{error:'Job not found'});
    const db = await readCatalogueDb(['jobs']);
    const suffix = match[2].match(/-(\d+)$/)?.[1];
    let job = findJobByPath(db.jobs, requested);
    if (!job && match[1] === 'jobs' && suffix) job = db.jobs.find(item => String(item.urlJobId) === suffix);
    if (!job) {
      let records;
      try { records = await wordpressRecords('job_listing',new URLSearchParams({slug:match[2],per_page:'1'}),{excludedSlugs:[]}); }
      catch(error) { if(error.code !== 'ER_NO_SUCH_TABLE') throw error; await loadMemoryStore(); records = fallbackRecords('job_listing',new URLSearchParams({slug:match[2]})); }
      job = records[0];
    }
    if (!job || !isPublicRecord(job)) return sendJson(req,res,404,{error:'Job not found'});
    return sendJson(req,res,200,{slug:job.slug,publicPath:publicJobPath(job),job});
  }
  if (path === '/api/public/jobs' && req.method === 'GET') {
    const db=await readCatalogueDb(['jobs']);
    const jobs=await publicDirectory(db.jobs,requestUrl.searchParams,async(page,size,excluded)=>{
      const params=new URLSearchParams(requestUrl.searchParams);
      params.set('page',String(page));params.set('per_page',String(size));params.set('exclude_slugs',excluded.join(','));
      try { return await wordpressRecords('job_listing',params); }
      catch(error) {
        if(error.code!=='ER_NO_SUCH_TABLE')throw error;
        await loadMemoryStore();
        return fallbackRecords('job_listing',params);
      }
    });
    return sendJson(req,res,200,jobs);
  }
  if (path === '/api/local/jobs' && req.method === 'GET') {
    const db = await readCatalogueDb(['jobs']);
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage jobs.'});
    const jobs = (adminView ? db.jobs : db.jobs.filter(isPublicRecord)).map(job => {
      const { recoveryDraft, logoBackup, ...listing } = job;
      return listing;
    });
    const summary = !adminView && requestUrl.searchParams.get('summary') === '1';
    return sendJson(req, res, 200, summary ? jobs.map(job => summarizeJob(job, { searchable: !!requestUrl.searchParams.get('q') })) : jobs);
  }

  if (path.startsWith('/api/local/jobs/') && req.method === 'GET') {
    const slug = decodeURIComponent(path.slice('/api/local/jobs/'.length));
    const db = await readCatalogueDb(['jobs']);
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage jobs.'});
    const match = findJobByPath(db.jobs, `/job/${slug}`);
    const job = match && (adminView || isPublicRecord(match)) ? match : null;
    return sendJson(req, res, job ? 200 : 404, job || { error: 'Job not found' });
  }

  if (path === '/api/local/jobs' && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const admin=await currentAdminSession(req);
      if(!admin)return sendJson(req,res,401,{error:'Sign in to save jobs.'});
      let job = await readJsonBody(req);
      if (!job.title?.trim()) {
        return sendJson(req, res, 400, { error: 'Job title is required' });
      }
      if (['publish','published','active'].includes(job.status) && (!Array.isArray(job.categories) || !job.categories.some(value => typeof value === 'string' && value.trim()))) {
        return sendJson(req,res,400,{error:'Select at least one job category before publishing.',fields:['categories']});
      }
      job.slug = String(job.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const nowIso = new Date().toISOString();
      job.createdAt = job.createdAt || nowIso;
      job.updatedAt = nowIso;
      job.local = true;

      if(job.deadline||job.expiryDate){job.deadline=job.deadline||job.expiryDate;job.expiryDate=job.expiryDate||job.deadline;}

      const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const db = await editorState.read();
      if (['publish','published','active'].includes(job.status) && (job.employerSlug || job.employerUrl || job.company || job.metas?._job_employer_name)) {
        await loadMemoryStore();
        const company=resolvePublishedCompany(job,db.employers,memoryStore.employers||[]);
        if(!company)return sendJson(req,res,409,{error:'Save and publish the employer profile before publishing this job. Its company profile is not publicly available.',fields:['employerSlug']});
        job.employerSlug=company.slug;job.employerUrl=`/employer/${company.slug}`;
      }
      let existingIndex = findJobIndex(db.jobs, job);
      if (existingIndex < 0 && (job.originalSlug || job.id)) {
        let records;
        const params = new URLSearchParams(job.originalSlug ? {slug:job.originalSlug,per_page:'1'} : {id:String(job.id),per_page:'1'});
        try { records = await wordpressRecords('job_listing',params,{excludedSlugs:[]}); }
        catch(error) { if(error.code !== 'ER_NO_SUCH_TABLE') throw error; await loadMemoryStore(); records = fallbackRecords('job_listing',params); }
        if (records[0]) { db.jobs.push(records[0]); existingIndex = db.jobs.length - 1; }
      }
      job.date = formattedDate;
      if (existingIndex >= 0) job.updatedDate = formattedDate;
      else job.publishedDate = formattedDate;
      job.createdBy=jobCreator(existingIndex>=0?db.jobs[existingIndex]:null,admin);
      const existingJob = existingIndex >= 0 ? db.jobs[existingIndex] : null;
      const identity = existingJob || { ...job, id:/^[a-f0-9-]{36}$/i.test(String(job.id || '')) ? job.id : crypto.randomUUID() };
      job.id = identity.id;
      job = applyJobUrl(job, existingJob, await numericJobId(identity), admin.role === 'Administrator');
      if (job.publicPath.startsWith('/jobs/') && (!existingJob || job.slug !== existingJob.slug)) {
        job.slug = uniqueJobSlug(job.slug,[...db.jobs,...(memoryStore.jobs || [])],job.id);
        job.publicPath = `/jobs/${job.slug}`;
      }
      if (job.createdBy && String(job.createdBy.id) === String(admin.userId)) job.createdBy.email = admin.email;
      // Keep the first publication date stable when published jobs are edited.
      job.emsFirstPublishedAt = existingJob?.emsFirstPublishedAt ||
        (existingJob && ['publish','published','active'].includes(existingJob.status)
          ? existingJob.createdAt : nowIso);
      job.updatedBy={id:String(admin.userId),name:String(admin.name || 'Administrator'),email:admin.email,at:nowIso};
      const savedJob = saveJobRecord(db.jobs, refreshPublicationDate(job,nowIso), () => crypto.randomUUID(), nowIso);
      rememberEmployerAddress(db,savedJob);
      if (db.jobRecoveryById) delete db.jobRecoveryById[String(savedJob.id)];
      await writeLocalDb(db);
      googleIndexing.enqueue(existingJob,savedJob).catch(()=>console.error('Google Indexing queue temporarily unavailable'));
      seoRepository.list(true).catch(error=>console.error('SEO refresh after job save failed:',error.message));
      emsSync.queue(savedJob, emsJobOperator(savedJob, db.users || [])).then(() => emsSync.flush())
        .catch(error => console.error('EMS sync queue failed:', error.message));
      return sendJson(req, res, 200, savedJob);
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  if (path.startsWith('/api/local/jobs/') && req.method === 'DELETE') {
    const admin = await currentAdminSession(req);
    if (!admin) return sendJson(req,res,401,{error:'Sign in to delete jobs.'});
    try {
      const slug = decodeURIComponent(path.slice('/api/local/jobs/'.length));
      const removedJob = await trashJobRecord(wpDb,adminJobIndex,slug,async () => {
        const params = new URLSearchParams({slug,per_page:'1'});
        let records;
        try { records = await wordpressRecords('job_listing',params,{excludedSlugs:[]}); }
        catch(error) { if(error.code !== 'ER_NO_SUCH_TABLE') throw error; await loadMemoryStore(); records = fallbackRecords('job_listing',params); }
        return records[0];
      });
      if (!removedJob) return sendJson(req,res,404,{error:'Job not found.'});
      googleIndexing.enqueue(removedJob,null).catch(()=>console.error('Google Indexing queue temporarily unavailable'));
      seoRepository.list(true).catch(error=>console.error('SEO refresh after job removal failed:',error.message));
      return sendJson(req,res,200,{deleted:true});
    } catch(error) { return sendJson(req,res,500,{error:'Unable to move job to Trash.'}); }
  }

  // API: Local Employers
  if (path === '/api/local/employers' && req.method === 'GET') {
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage employers.'});
    const db = adminView ? await editorState.read(['employers']) : await readCatalogueDb(['employers']);
    return sendJson(req, res, 200, adminView ? db.employers : db.employers.filter(isPublicRecord));
  }

  if (path.startsWith('/api/local/employers/') && req.method === 'GET') {
    const slug = decodeURIComponent(path.slice('/api/local/employers/'.length));
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage employers.'});
    const db = adminView ? await editorState.read(['employers']) : await readCatalogueDb(['employers']);
    const employer = db.employers.find(item => (item.slug === slug || (item.urlAliases || []).includes(`/employer/${slug}`)) && (adminView || isPublicRecord(item)));
    return sendJson(req, res, employer ? 200 : 404, employer || { error: 'Employer not found' });
  }

  if (path === '/api/local/employers' && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const admin = await currentAdminSession(req);
      if (!admin) return sendJson(req, res, 401, { error: 'Sign in to save employers.' });
      const employer = await readJsonBody(req);
      if (!employer.title?.trim() || !employer.slug?.trim()) {
        return sendJson(req, res, 400, { error: 'Employer name and slug are required' });
      }
      const missing = [];
      for (const field of ['categories','locations']) {
        if (!Array.isArray(employer[field]) || !employer[field].some(value => typeof value === 'string' && value.trim())) missing.push(field === 'categories' ? 'category' : 'location');
      }
      if (!String(employer.description || '').replace(/<[^>]*>/g,'').replace(/&nbsp;|&#160;/gi,' ').trim()) missing.push('description');
      if (typeof employer.logo !== 'string' || !employer.logo.trim()) missing.push('logo');
      if (missing.length) return sendJson(req,res,400,{error:`Company ${missing.join(', ')} required before saving.`, fields:missing});
      employer.slug = employer.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      employer.updatedAt = new Date().toISOString();
      employer.createdAt = employer.createdAt || employer.updatedAt;
      employer.local = true;

      const db = await editorState.read();
      await loadMemoryStore();
      const {index, existing, slug: requestedSlug, snapshot} = employerIdentity(employer, db.employers, memoryStore.employers || []);
      const previousCompany = existing || (memoryStore.employers || []).find(item=>item.slug===employer.originalSlug);
      if (previousCompany && isPublicRecord(previousCompany) && !isPublicRecord(employer) && publishedCompanyDependents(previousCompany,db.jobs).length) return sendJson(req,res,409,{error:'This company has published jobs. Unpublish or reassign those jobs before unpublishing the company.'});
      employer.slug = requestedSlug;
      if (snapshot) { delete employer.autosaved; delete employer.autosaveOwner; delete employer.sourceSlug; delete employer.requestedSlug; }
      const duplicate = db.employers.find(item => !isEmployerSnapshot(item) && item !== existing && employerNameKey(item.title) === employerNameKey(employer.title));
      if (duplicate) return sendJson(req,res,409,{error:'A company with this name already exists. Select or edit the existing company.',existingSlug:duplicate.slug});
      const nowIso = employer.updatedAt;
      employer.id = existing?.id || crypto.randomUUID();
      if (existing?.urlAliases) employer.urlAliases = [...new Set([...(existing.urlAliases || []),...(employer.urlAliases || [])])];
      if (existing && !snapshot && existing.slug !== employer.slug) employer.urlAliases = [...new Set([...(employer.urlAliases || []), `/employer/${existing.slug}`])];
      employer.createdAt = existing ? existing.createdAt : nowIso;
      employer.createdBy = jobCreator(existing, admin);
      if (employer.createdBy && String(employer.createdBy.id) === String(admin.userId)) employer.createdBy.email = admin.email;
      employer.emsFirstPublishedAt = existing?.emsFirstPublishedAt ||
        (existing && isPublicRecord(existing) ? existing.createdAt : nowIso);
      employer.updatedBy = { id: String(admin.userId), name: String(admin.name || 'Administrator'), at: nowIso };
      delete employer.originalSlug;

      if (index >= 0) db.employers[index] = employer;
      else db.employers.unshift(employer);

      await writeLocalDb(db);
      emsSync.queue(employer, employer.createdBy, 'company').then(() => emsSync.flush())
        .catch(error => console.error('EMS employer sync queue failed:', error.message));
      return sendJson(req, res, 200, employer);
    } catch (error) {
      return sendJson(req, res, error.status || 400, { error: error.message });
    }
  }

  if (path.startsWith('/api/local/employers/') && req.method === 'DELETE') {
    if (!await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage employers.'});
    const slug = decodeURIComponent(path.slice('/api/local/employers/'.length));
    const db = await editorState.read();
    const company = db.employers.find(item=>item.slug===slug);
    if(company && publishedCompanyDependents(company,db.jobs).length) return sendJson(req,res,409,{error:'This company has published jobs. Unpublish or reassign those jobs before deleting the company.'});
    const before = db.employers.length;
    db.employers = db.employers.filter(item => item.slug !== slug);
    await writeLocalDb(db);
    return sendJson(req, res, before === db.employers.length ? 404 : 200, { deleted: before !== db.employers.length });
  }

  // API: Taxonomies
  if (path === '/api/local/taxonomies' && req.method === 'GET') {
    const db = await readCatalogueDb(['taxonomies']);
    if (!db.taxonomies || !db.taxonomies.categories || db.taxonomies.categories.length < 50) {
      if (memoryStore.taxonomies) {
        db.taxonomies = {
          ...memoryStore.taxonomies,
          ...(db.taxonomies || {}),
          categories: (memoryStore.taxonomies.categories && memoryStore.taxonomies.categories.length > 50) ? memoryStore.taxonomies.categories : db.taxonomies?.categories
        };
      }
    }
    return sendJson(req, res, 200, db.taxonomies);
  }

  if (path === '/api/local/taxonomies' && req.method === 'PUT') {
    try {
      const taxonomies = await readJsonBody(req);
      const db = await readLocalDb();
      db.taxonomies = { ...db.taxonomies, ...taxonomies };
      await writeLocalDb(db);
      return sendJson(req, res, 200, db.taxonomies);
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  // API: Applications
  if (path === '/api/local/applications' && req.method === 'POST') {
    try {
      const application = await readJsonBody(req);
      const db = await readLocalDb();
      application.id = crypto.randomUUID();
      application.createdAt = new Date().toISOString();
      db.applications.unshift(application);
      await writeLocalDb(db);
      return sendJson(req, res, 201, application);
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  if(path==='/api/wp/top-employers' && req.method==='GET'){
    await loadMemoryStore();
    const local=await readCatalogueDb();
    const jobs=new Map((memoryStore.jobs||[]).map(job=>[job.slug,job]));
    for(const job of local.jobs||[])jobs.set(job.slug,job);
    const counts=new Map();
    for(const job of jobs.values()){
      if(!isActiveJob(job))continue;
      const id=Number(job.metas?._job_employer_posted_by);
      const companyKey=id?`id:${id}`:`slug:${job.employerSlug||''}`;
      counts.set(companyKey,(counts.get(companyKey)||0)+1);
    }
    const employers=new Map((memoryStore.employers||[]).map(employer=>[employer.slug,employer]));
    for(const employer of local.employers||[])employers.set(employer.slug,employer);
    const min=Math.max(20,Number(requestUrl.searchParams.get('min_jobs'))||20);
    const limit=Math.min(50,Math.max(1,Number(requestUrl.searchParams.get('limit'))||20));
    const records=[...employers.values()].filter(e=>['publish','published'].includes(e.status||'publish')).map(e=>{
      const metas={...e.metas};
      metas._employer_logo ||= e.logo||'';
      metas._employer_open_jobs=(counts.get(`id:${Number(e.id)}`)||0)+(counts.get(`slug:${e.slug}`)||0);
      return {...e,title:typeof e.title==='string'?{rendered:e.title}:e.title,metas};
    }).filter(e=>e.metas._employer_open_jobs>=min).sort((a,b)=>b.metas._employer_open_jobs-a.metas._employer_open_jobs||a.slug.localeCompare(b.slug)).slice(0,limit);
    await Promise.all(records.map(async record=>{record.logoBackup=await mediaStore.origin(record.metas._employer_logo).catch(()=>'');}));
    return sendJson(req,res,200,records);
  }

  // API: WordPress records proxy
  if (path.startsWith('/api/wp/')) {
    const type = path.slice('/api/wp/'.length);
    const allowed = new Set(['job_listing', 'employer', 'posts', 'pages', 'media', 'candidate']);
    if (!allowed.has(type)) {
      res.writeHead(404);
      return res.end('Not found');
    }
    try {
      return sendJson(req, res, 200, await wordpressRecords(type, requestUrl.searchParams));
    } catch {
      const records = fallbackRecords(type, requestUrl.searchParams);
      return sendJson(req, res, 200, records);
    }
  }

  // API Root / Documentation
  if (path === '/' && (req.headers.accept?.includes('application/json') || !req.headers.accept?.includes('text/html'))) {
    return sendJson(req, res, 200, {
      name: 'Trikonet API',
      status: 'healthy',
      version: '1.0.0',
      domain: 'https://api.trikonet.com',
      health: '/api/health',
      admin: '/admin'
    });
  }

  // Static Admin Panel Console files
  let target = normalize(join(root, path === '/' || path === '/admin' ? 'index.html' : path.startsWith('/admin/') ? path.slice('/admin/'.length) : path.slice(1)));
  if (!target.startsWith(root)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    if ((await stat(target)).isDirectory()) target = join(target, 'index.html');
  } catch {
    target = join(root, 'index.html');
  }

  try {
    const body = await readFile(target);
    const origin = getCorsOrigin(req);
    const headers = {
      'Content-Type': types[extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    };
    if (origin && origin !== '*') {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    res.writeHead(200, headers);
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
  } catch(error) {
    console.error('API request failed:',error.message);
    if(!res.headersSent)return sendJson(req,res,503,{error:'Trikonet is temporarily unavailable. Please try again.'});
    res.end();
  }
});

// Bind first; requests wait for initialization rather than reading partial data.
startupReady = new Promise(resolve => setImmediate(resolve)).then(async () => {
  await loadMemoryStore();
  await editorIndexes.ensure();
  const catalogue = await readCatalogueDb(['jobs']);
  if (shortenGeneratedJobUrls(catalogue.jobs || [],memoryStore.jobs || [])) {
    const db = await editorState.read(['jobs']);
    if (shortenGeneratedJobUrls(db.jobs || [],memoryStore.jobs || [])) await writeLocalDb(db);
  }
});
startupReady.then(registerSeoDefaults).catch(error=>console.error('Startup initialization failed:',error.message));
server.listen(port, host, () => {
  console.log(`Trikonet Backend API running at: http://${host}:${port}`);
  console.log(`Configured for API domain: https://api.trikonet.com`);
  startupReady.then(()=>mediaStore.migrate()).then(result=>console.log('Media migration:',JSON.stringify(result))).catch(error=>console.error('Media migration failed:',error.message));
});
// Recheck eligibility and expiry even when no administrator has the Pages view open.
const refreshSeo = createCoordinatedTask(wpDb, 'seo', 5 * 60 * 1000, async () => {
  await registerAccountingDestination();
  await seoRepository.list(true);
});
const seoRefreshTimer = setInterval(() => refreshSeo().catch(error => console.error('SEO page refresh failed:', error.message)), 5 * 60 * 1000);
seoRefreshTimer.unref();
const readEmsState = createEmsStateReader(wpDb, readCatalogueDb, () => accountDeletion.ensure());
let emsScanRunning = false;
async function refreshEmsUploads() {
  if (emsScanRunning || !process.env.EMS_TRIKONET_SYNC_SECRET) return;
  emsScanRunning = true;
  try {
    const state = await readEmsState();
    for (const job of state.jobs || []) {
      const operator = emsJobOperator(job, state.users || []);
      if (!operator?.email) continue;
      await emsSync.queue(job, operator);
    }
    for (const employer of state.employers || []) {
      if (!employer.createdBy?.id) continue;
      const user = (state.users || []).find(user => String(user.id) === String(employer.createdBy.id));
      await emsSync.queue(employer, { ...employer.createdBy, email: employer.createdBy.email || user?.email }, 'company');
    }
    await emsSync.flush();
  } catch (error) { console.error('EMS upload sync failed:', error.message); }
  finally { emsScanRunning = false; }
}
const coordinatedEms = createCoordinatedTask(wpDb, 'ems', 30000, refreshEmsUploads);
const emsSyncTimer = setInterval(() => coordinatedEms().catch(error => console.error('EMS scheduler failed:', error.message)), 30000);
emsSyncTimer.unref();
startupReady.then(coordinatedEms).catch(error=>console.error('EMS startup failed:',error.message));

const jobEmailTimer=setInterval(()=>jobEmailAlerts.tick().catch(error=>console.error('Job email worker failed:',error.message)),60000);
jobEmailTimer.unref();
// Expiry runs independently of login or the app being open; overdue accounts
// cannot authenticate even if the worker is temporarily unavailable.
const deletionTimer=setInterval(()=>accountDeletion.sweep().catch(error=>console.error('Account deletion worker failed:',error.message)),60000);
deletionTimer.unref();
void accountDeletion.sweep().catch(error=>console.error('Account deletion worker failed:',error.message));

// Log process-level memory without account data or request contents.
function logResourceUsage() {
  const {rss,heapUsed,heapTotal,external}=process.memoryUsage();
  const mib=bytes=>Math.round(bytes/1048576);
  console.log(JSON.stringify({event:'resource_usage',pid:process.pid,uptimeSeconds:Math.round(process.uptime()),rssMiB:mib(rss),heapUsedMiB:mib(heapUsed),heapTotalMiB:mib(heapTotal),externalMiB:mib(external)}));
}
logResourceUsage();
setInterval(logResourceUsage,60000).unref();

const googleIndexingTask=createCoordinatedTask(wpDb,'google-indexing',60000,()=>googleIndexing.tick());
setInterval(()=>{if(googleIndexing.configured())googleIndexingTask().catch(()=>console.error('Google Indexing worker temporarily unavailable'));},60000).unref();
