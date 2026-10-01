import {jobCreator,withoutTeamAttribution} from './job-attribution.mjs';
import { findJobIndex, saveJobRecord, refreshPublicationDate } from './job-identity.mjs';
import { adminJobConditions, localJobMatches, pagePlan, importedJobPage } from './admin-job-pagination.mjs';
import http from 'node:http';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { createMediaStore } from './media-store.mjs';
import crypto from 'node:crypto';
import { newestFirst } from './record-order.mjs';
import { createSeoRepository, isActiveJob } from './seo-job-pages.mjs';
import { handleSeoRequest } from './seo-api.mjs';
import { createAdminSessionStore } from './admin-session-store.mjs';
import { isCandidateAccount } from './candidate-account.mjs';
import { isPublicRecord } from './public-record.mjs';
import { employerJobPage } from './employer-jobs.mjs';

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

const wpDb = mysql.createPool(dbConfig);
const mediaStore = createMediaStore(wpDb);

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
    const [rows] = await wpDb.query('SELECT dataset_key, payload FROM trikonet_imported_data');
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
// Load memory store asynchronously in background
loadMemoryStore().catch(console.error);

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

  return [...byId.values()];
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

async function readLocalDb() {
  try {
    await ensurePersistentState();
    const [rows] = await wpDb.query("SELECT payload FROM trikonet_app_state WHERE state_key='main' LIMIT 1");
    if (rows[0]?.payload) return { ...emptyDb, ...JSON.parse(rows[0].payload) };
  } catch (error) {
    console.error('Persistent state read failed; using deployment JSON fallback:', error.message);
  }
  try { return { ...emptyDb, ...JSON.parse(await readFile(localDbPath, 'utf8')) }; }
  catch { return structuredClone(emptyDb); }
}

async function writeLocalDb(db) {
  db = await mediaStore.normalize(db);
  db.jobs = await mediaStore.publish(db.jobs || [], 'job');
  db.employers = await mediaStore.publish(db.employers || [], 'employer');
  const payload = JSON.stringify({ ...emptyDb, ...db });
  try {
    await ensurePersistentState();
    await wpDb.query(
      "INSERT INTO trikonet_app_state (state_key, payload) VALUES ('main', ?) ON DUPLICATE KEY UPDATE payload=VALUES(payload), updated_at=CURRENT_TIMESTAMP",
      [payload]
    );
    return;
  } catch (error) {
    console.error('Persistent state write failed; using deployment JSON fallback:', error.message);
  }
  await mkdir(dataRoot, { recursive: true });
  await writeFile(localDbPath, JSON.stringify(db, null, 2));
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
    const local=await readLocalDb();
    for (const field of ['categories','locations']) for (const term of local.taxonomies?.[field] || []) if (!taxonomies[field].some(item=>item.name.toLowerCase()===term.name.toLowerCase())) taxonomies[field].push(term);
    return {jobs:[...jobs.values()],taxonomies};
  } catch (error) {
    if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
    const local=await readLocalDb();
    const taxonomies={categories:[...(memoryStore.taxonomies?.categories || [])],locations:[...(memoryStore.taxonomies?.locations || [])]};
    for (const field of ['categories','locations']) for (const term of local.taxonomies?.[field] || []) if (!taxonomies[field].some(item=>item.name.toLowerCase()===term.name.toLowerCase())) taxonomies[field].push(term);
    return {jobs:memoryStore.jobs || [],taxonomies};
  }
}
const seoRepository = createSeoRepository(wpDb,readLocalDb,loadSeoRecords);
// Preserve the existing main category URL explicitly requested by the admin.
// This migration is insert-only: never overwrite saved manual settings.
const registerAccountingDestination = () => seoRepository.createMain({category:'Accounting or Finance',slug:'accounting-finance-in-uae',title:'Accounting & Finance Jobs in UAE',seoTitle:'Accounting & Finance Jobs in UAE - Latest Vacancies | Trikonet',metaDescription:'Explore current accounting and finance jobs across the UAE and apply for relevant opportunities on Trikonet.',onlyIfMissing:true});
registerAccountingDestination().catch(error=>console.error('Accounting destination registration failed:',error.message));
seoRepository.createMain({category:'Education and Training',slug:'education-and-training-in-uae',title:'Education and Training Jobs in UAE',onlyIfMissing:true}).catch(error=>console.error('Education destination registration failed:',error.message));

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
    /^https:\/\/([a-z0-9-]+\.)?trikonet\.com$/.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    Boolean(process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').map(s => s.trim()).includes(origin));

  return isAllowed ? origin : null;
}

async function sendJson(req, res, status, value) {
  // Persist embedded images before returning stable public URLs. Originals remain intact.
  try {
    const publicContent = /^\/api\/(?:local\/(?:jobs|employers)(?:[/?]|$)|wp\/(?:job_listing|employer|posts|top-employers)(?:\?|$)|employers\/|employer-jobs\/)/.test(req.url);
    value=await (publicContent ? mediaStore.publish(value) : mediaStore.normalize(value));
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

  res.writeHead(status, headers);
  res.end(JSON.stringify(value));
}

const sessions = new Map();
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

const server = http.createServer(async (req, res) => {
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

  if (path.startsWith('/api/employer-jobs/') && req.method === 'GET') {
    try {
      await loadMemoryStore();
      const db = await readLocalDb();
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

  if (path === '/api/admin/jobs' && req.method === 'GET') {
    const admin = await currentAdminSession(req);
    if (!admin || admin.expiresAt <= Date.now()) return sendJson(req, res, 401, { error: 'Administrator authentication required' });
    try {
      const params = requestUrl.searchParams;
      const status = params.get('status') || 'all';
      if (!['all', 'mine', 'publish', 'draft', 'pending', 'expired'].includes(status)) return sendJson(req, res, 400, { error: 'Invalid job status' });
      const db = await readLocalDb();
      const local = (db.jobs || []).filter(job => localJobMatches(job, params)).map(job => ({ ...job, local: true }));
      const options = { excludedSlugs: (db.jobs || []).map(job => job.slug).filter(Boolean) };
      const remoteTotal = status === 'mine' ? 0 : await wordpressCount('job_listing', params, options);
      const size = Math.min(100, Math.max(1, Math.floor(Number(params.get('per_page')) || 20)));
      const plan = pagePlan(local, remoteTotal, Math.floor(Number(params.get('page')) || 1), size);
      const remote = plan.remoteLimit && remoteTotal ? await wordpressRecords('job_listing', new URLSearchParams({ ...Object.fromEntries(params), per_page: String(plan.remoteLimit) }), { ...options, offset: plan.remoteOffset }) : [];
      return sendJson(req, res, 200, { jobs: [...plan.local, ...remote], total: plan.total, page: plan.page, perPage: size });
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        try {
          await loadMemoryStore();
          const db = await readLocalDb();
          if (!Array.isArray(memoryStore.jobs)) throw new Error('Imported jobs unavailable');
          return sendJson(req, res, 200, importedJobPage(memoryStore.jobs, db.jobs || [], requestUrl.searchParams));
        } catch (fallbackError) {
          console.error(JSON.stringify({ event: 'admin_jobs_import_failed', code: fallbackError.code || fallbackError.name }));
        }
      }
      console.error(JSON.stringify({ event: 'admin_jobs_load_failed', code: error.code || error.name, message: String(error.message || '').slice(0, 300) }));
      return sendJson(req, res, 503, { error: 'Unable to load jobs. Please retry.' });
    }
  }

  // Uploads must be confirmed in durable storage before the editor calls them saved.
  if(path === '/api/admin/media' && ['GET','POST'].includes(req.method)) {
    const admin=await currentAdminSession(req);
    if(!admin || admin.expiresAt <= Date.now())return sendJson(req,res,401,{error:'Sign in to manage media.'});
    try {
      await wpDb.query(`CREATE TABLE IF NOT EXISTS trikonet_media_library (id CHAR(64) PRIMARY KEY, payload LONGTEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);
      if(req.method==='GET') {
        const [rows]=await wpDb.query('SELECT payload FROM trikonet_media_library ORDER BY created_at DESC');
        const records=[];
        for(const row of rows){const item=JSON.parse(row.payload);item.url=await mediaStore.publish(item.url,item.title);records.push(item);}
        return sendJson(req,res,200,records);
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

  // API: Auth Register
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
      await writeLocalDb(db);

      const token = crypto.randomUUID();
      sessions.set(token, { userId: user.id, email: user.email, name: user.name });
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
      const db = await readLocalDb();
      const user = db.users.find(item => item.email === email);

      if (!user || !passwordMatches(String(body.password || ''), user)) {
        return sendJson(req, res, 401, { error: 'Invalid email or password' });
      }

      const token = crypto.randomUUID();
      sessions.set(token, { userId: user.id, email: user.email, name: user.name });
      res.setHeader('Set-Cookie', getSessionCookieHeader(req, token));
      return sendJson(req, res, 200, { user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  // API: Auth Me
  if (path === '/api/auth/me' && req.method === 'GET') {
    const session = currentSession(req);
    return sendJson(req, res, session ? 200 : 401, session ? { user: session } : { error: 'Authentication required' });
  }

  // API: Auth Logout
  if (path === '/api/auth/logout' && req.method === 'POST') {
    sessions.delete(cookieValue(req, 'trikonet_session'));
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
      await writeLocalDb(db);
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
    await writeLocalDb(db);
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
      await writeLocalDb(db);
      return sendJson(req, res, 200, campaign);
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
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
        const safe={id:record.id,name:record.name,slug:record.slug,email:record.email,phone:record.phone,jobTitle:record.jobTitle,category:record.category,location:record.location,experience:record.experience,qualification:record.qualification,bio:record.bio,status:record.status,featured:!!record.featured,createdAt:record.createdAt};
        const index=db.candidates.findIndex(c=>String(c.id)===String(record.id));
        if(index>=0)db.candidates[index]={...db.candidates[index],...safe};else db.candidates.push(safe);
      }
      await writeLocalDb(db);return sendJson(req,res,200,{saved:true});
    }catch(error){return sendJson(req,res,400,{error:error.message});}
  }
  if(path.startsWith('/api/admin/candidate-profile/') && req.method==='GET') {
    const admin=await currentAdminSession(req);
    if(!admin || !['Administrator','Editor'].includes(admin.role))return sendJson(req,res,403,{error:'Administrator access required'});
    const id=decodeURIComponent(path.slice('/api/admin/candidate-profile/'.length));const db=await readLocalDb();
    const user=(db.users || []).find(u=>String(u.id)===id && isCandidateAccount(u));
    const candidate=(db.candidates || []).find(c=>String(c.id)===id);
    if(!user && !candidate)return sendJson(req,res,404,{error:'Candidate not found'});
    return sendJson(req,res,200,{profile:{...user?.profile,...candidate,id,name:candidate?.name||user?.name,email:candidate?.email||user?.email,createdAt:user?.createdAt||candidate?.createdAt},resumes:(db.resumes || []).filter(r=>String(r.userId)===id)});
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
      const records = [...imported, ...users.map(user => ({ ...user.profile, id: user.id, name: user.name || user.username, email: user.email, createdAt: user.createdAt })), ...(db.candidates || [])];
      const merged = new Map();
      for (const record of records) {
        const m = record.metas || {};
        const candidate = {
          id: record.id, slug: record.slug || '', name: record.name || record.title?.rendered || record.title || '',
          email: record.email || m._candidate_email || '', jobTitle: record.jobTitle || record.professionalTitle || m._candidate_title || '',
          category: record.category || Object.values(m._candidate_category || {}).join(', '),
          location: record.location || Object.values(m._candidate_location || {}).join(', '),
          experience: record.experience || m._candidate_experience || '', qualification: record.qualification || '',
          bio: record.bio || record.content?.rendered || '', photo: record.photo || m._candidate_photo || '',
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
  if (path === '/api/admin/autosave' && req.method === 'POST') {
    const admin = await currentAdminSession(req);
    if (!admin) return sendJson(req, res, 401, { error: 'Sign in to save drafts.' });
    try {
      const body = await readJsonBody(req);
      if (!['job','employer'].includes(body.type) || !/^[a-f0-9-]{36}$/.test(body.draftId || '')) return sendJson(req,res,400,{error:'Invalid draft.'});
      const record = body.record || {};
      if (body.type === 'job' && !String(record.title || '').trim() && !String(record.description || '').trim()) return sendJson(req,res,200,{skipped:true});
      if (!String(record.title || '').trim() && body.type !== 'job') return sendJson(req,res,400,{error:'Enter a title to save a draft.'});
      if (body.type === 'job' && !String(record.title || '').trim()) record.title = 'Untitled job';
      const db = await readLocalDb();
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
      const saved = { ...record, slug, originalSlug: '', status: 'draft', local: true, autosaved: true,
        autosaveOwner: admin.userId, sourceSlug: String(body.sourceSlug || ''), updatedAt: now,
        createdAt: index >= 0 ? list[index].createdAt : now, date: now, publishedDate: now };
      if (index >= 0 && String(list[index].autosaveOwner) !== String(admin.userId)) return sendJson(req,res,403,{error:'Draft access denied.'});
      if (index >= 0) list[index] = saved; else list.unshift(saved);
      await writeLocalDb(db);
      return sendJson(req,res,200,{slug,status:'draft'});
    } catch { return sendJson(req,res,503,{error:'Draft save failed.'}); }
  }

  // API: Local Jobs
  if (path === '/api/local/jobs' && req.method === 'GET') {
    const db = await readLocalDb();
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage jobs.'});
    return sendJson(req, res, 200, adminView ? db.jobs : db.jobs.filter(isPublicRecord));
  }

  if (path.startsWith('/api/local/jobs/') && req.method === 'GET') {
    const slug = decodeURIComponent(path.slice('/api/local/jobs/'.length));
    const db = await readLocalDb();
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage jobs.'});
    const job = db.jobs.find(item => item.slug === slug && (adminView || isPublicRecord(item)));
    return sendJson(req, res, job ? 200 : 404, job || { error: 'Job not found' });
  }

  if (path === '/api/local/jobs' && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const admin=await currentAdminSession(req);
      if(!admin)return sendJson(req,res,401,{error:'Sign in to save jobs.'});
      const job = await readJsonBody(req);
      if (!job.title?.trim() || !job.slug?.trim()) {
        return sendJson(req, res, 400, { error: 'Title and slug are required' });
      }
      job.slug = job.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const nowIso = new Date().toISOString();
      job.createdAt = job.createdAt || nowIso;
      job.updatedAt = nowIso;
      job.local = true;

      if (!job.deadline && !job.expiryDate) {
        const d = new Date(job.createdAt || Date.now());
        d.setDate(d.getDate() + 365);
        job.deadline = d.toISOString().slice(0, 10);
        job.expiryDate = job.deadline;
      } else {
        job.deadline = job.deadline || job.expiryDate;
        job.expiryDate = job.expiryDate || job.deadline;
      }

      const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const db = await readLocalDb();
      const existingIndex = findJobIndex(db.jobs, job);
      job.date = formattedDate;
      if (existingIndex >= 0) job.updatedDate = formattedDate;
      else job.publishedDate = formattedDate;
      job.createdBy=jobCreator(existingIndex>=0?db.jobs[existingIndex]:null,admin);
      job.updatedBy={id:String(admin.userId),name:String(admin.name || 'Administrator'),at:nowIso};
      const savedJob = saveJobRecord(db.jobs, refreshPublicationDate(job,nowIso), () => crypto.randomUUID(), nowIso);
      if (db.jobRecoveryById) delete db.jobRecoveryById[String(savedJob.id)];
      await writeLocalDb(db);
      seoRepository.list(true).catch(error=>console.error('SEO refresh after job save failed:',error.message));
      return sendJson(req, res, 200, savedJob);
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  if (path.startsWith('/api/local/jobs/') && req.method === 'DELETE') {
    const slug = decodeURIComponent(path.slice('/api/local/jobs/'.length));
    const db = await readLocalDb();
    const before = db.jobs.length;
    db.jobs = db.jobs.filter(item => item.slug !== slug);
    await writeLocalDb(db);
    seoRepository.list(true).catch(error=>console.error('SEO refresh after job removal failed:',error.message));
    return sendJson(req, res, before === db.jobs.length ? 404 : 200, { deleted: before !== db.jobs.length });
  }

  // API: Local Employers
  if (path === '/api/local/employers' && req.method === 'GET') {
    const db = await readLocalDb();
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage employers.'});
    return sendJson(req, res, 200, adminView ? db.employers : db.employers.filter(isPublicRecord));
  }

  if (path.startsWith('/api/local/employers/') && req.method === 'GET') {
    const slug = decodeURIComponent(path.slice('/api/local/employers/'.length));
    const db = await readLocalDb();
    const adminView = requestUrl.searchParams.get('admin') === '1';
    if (adminView && !await currentAdminSession(req)) return sendJson(req,res,401,{error:'Sign in to manage employers.'});
    const employer = db.employers.find(item => item.slug === slug && (adminView || isPublicRecord(item)));
    return sendJson(req, res, employer ? 200 : 404, employer || { error: 'Employer not found' });
  }

  if (path === '/api/local/employers' && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const employer = await readJsonBody(req);
      if (!employer.title?.trim() || !employer.slug?.trim()) {
        return sendJson(req, res, 400, { error: 'Employer name and slug are required' });
      }
      employer.slug = employer.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      employer.updatedAt = new Date().toISOString();
      employer.createdAt = employer.createdAt || employer.updatedAt;
      employer.local = true;

      const db = await readLocalDb();
      const index = db.employers.findIndex(item => item.slug === employer.originalSlug || item.slug === employer.slug);
      delete employer.originalSlug;

      if (index >= 0) db.employers[index] = employer;
      else db.employers.unshift(employer);

      await writeLocalDb(db);
      return sendJson(req, res, 200, employer);
    } catch (error) {
      return sendJson(req, res, 400, { error: error.message });
    }
  }

  if (path.startsWith('/api/local/employers/') && req.method === 'DELETE') {
    const slug = decodeURIComponent(path.slice('/api/local/employers/'.length));
    const db = await readLocalDb();
    const before = db.employers.length;
    db.employers = db.employers.filter(item => item.slug !== slug);
    await writeLocalDb(db);
    return sendJson(req, res, before === db.employers.length ? 404 : 200, { deleted: before !== db.employers.length });
  }

  // API: Taxonomies
  if (path === '/api/local/taxonomies' && req.method === 'GET') {
    const db = await readLocalDb();
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
    const local=await readLocalDb();
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
});

await loadMemoryStore();
server.listen(port, host, () => {
  console.log(`Trikonet Backend API running at: http://${host}:${port}`);
  console.log(`Configured for API domain: https://api.trikonet.com`);
  mediaStore.migrate().then(result=>console.log('Media migration:',JSON.stringify(result))).catch(error=>console.error('Media migration failed:',error.message));
});
// Recheck eligibility and expiry even when no administrator has the Pages view open.
const seoRefreshTimer = setInterval(() => {
  registerAccountingDestination().catch(error=>console.error('Accounting destination registration failed:',error.message));
  seoRepository.list(true).catch(error => console.error('SEO page refresh failed:', error.message));
}, 5 * 60 * 1000);
seoRefreshTimer.unref();
