import http from 'node:http';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

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

// In-memory dataset cache for complete database resilience
const memoryStore = {
  jobs: null,
  employers: null,
  posts: null,
  taxonomies: null
};

async function loadMemoryStore() {
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

  let list = [];
  if (type === 'job_listing') list = memoryStore.jobs || [];
  else if (type === 'employer') list = memoryStore.employers || [];
  else if (type === 'posts') list = memoryStore.posts || [];
  else return [];

  let filtered = list;

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
  return filtered.slice(offset, offset + limit);
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

async function wordpressRecords(type, params) {
  const postType = {
    job_listing: 'job_listing',
    employer: 'employer',
    posts: 'post',
    pages: 'page',
    media: 'attachment',
    candidate: 'candidate'
  }[type];

  if (!postType) throw new Error('Unsupported content type');

  const limit = Math.min(Math.max(Number(params.get('per_page')) || 10, 1), postType === 'attachment' || postType === 'employer' ? 5000 : 100);
  const page = Math.max(Number(params.get('page')) || 1, 1);
  const offset = (page - 1) * limit;
  const slug = params.get('slug');

  const where = ['post_type = ?'];
  const values = [postType];

  if (type === 'media') where.push("post_mime_type LIKE 'image/%'");
  if (slug) {
    where.push('post_name = ?');
    values.push(slug);
  }

  const query = (params.get('q') || '').trim();
  const location = (params.get('location') || '').trim();
  const category = (params.get('category') || '').trim();

  if (query) {
    where.push('post_title LIKE ?');
    values.push(`%${query}%`);
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
  if (type !== 'media') {
    where.push("post_status = 'publish'");
  }

  const [posts] = await wpDb.query(
    `SELECT ID, post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, post_name, post_modified, post_modified_gmt, guid, post_mime_type
     FROM wp_posts WHERE ${where.join(' AND ')} ORDER BY post_date DESC LIMIT ? OFFSET ?`,
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

async function wordpressCount(type, params) {
  const postType = type === 'employer' ? 'employer' : 'job_listing';
  const where = ['post_type = ?', "post_status = 'publish'"];
  const values = [postType];

  const query = (params.get('q') || '').trim();
  const location = (params.get('location') || '').trim();
  const category = (params.get('category') || '').trim();

  if (query) {
    where.push('post_title LIKE ?');
    values.push(`%${query}%`);
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
  resumes: [],
  taxonomies: { types: [], categories: [], locations: [], tags: [] }
};

async function readLocalDb() {
  try {
    return { ...emptyDb, ...JSON.parse(await readFile(localDbPath, 'utf8')) };
  } catch {
    return structuredClone(emptyDb);
  }
}

async function writeLocalDb(db) {
  await mkdir(dataRoot, { recursive: true });
  await writeFile(localDbPath, JSON.stringify(db, null, 2));
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 2_000_000) throw new Error('Request too large');
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

function sendJson(req, res, status, value) {
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
const passwordMatches = (password, user) =>
  crypto.timingSafeEqual(
    Buffer.from(passwordHash(password, user.passwordSalt).hash, 'hex'),
    Buffer.from(user.passwordHash, 'hex')
  );

function getSessionCookieHeader(req, token, maxAge = 604800) {
  const isHttps = req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket?.encrypted);
  const sameSite = isHttps ? 'None' : 'Lax';
  const secure = isHttps ? '; Secure' : '';
  return `trikonet_session=${token}; HttpOnly; SameSite=${sameSite}${secure}; Path=/; Max-Age=${maxAge}`;
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = decodeURIComponent(requestUrl.pathname);

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
    return sendJson(req, res, 200, {
      status: 'ok',
      service: 'trikonet-backend',
      domain: 'https://api.trikonet.com',
      time: new Date().toISOString()
    });
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

  // API: Local Jobs
  if (path === '/api/local/jobs' && req.method === 'GET') {
    const db = await readLocalDb();
    return sendJson(req, res, 200, db.jobs);
  }

  if (path.startsWith('/api/local/jobs/') && req.method === 'GET') {
    const slug = decodeURIComponent(path.slice('/api/local/jobs/'.length));
    const db = await readLocalDb();
    const job = db.jobs.find(item => item.slug === slug);
    return sendJson(req, res, job ? 200 : 404, job || { error: 'Job not found' });
  }

  if (path === '/api/local/jobs' && (req.method === 'POST' || req.method === 'PUT')) {
    try {
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
      const index = db.jobs.findIndex(item => item.slug === job.originalSlug || item.slug === job.slug);
      delete job.originalSlug;

      if (index >= 0) {
        job.updatedDate = formattedDate;
        job.date = formattedDate;
        db.jobs[index] = job;
      } else {
        job.publishedDate = formattedDate;
        job.date = formattedDate;
        db.jobs.unshift(job);
      }
      await writeLocalDb(db);
      return sendJson(req, res, 200, job);
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
    return sendJson(req, res, before === db.jobs.length ? 404 : 200, { deleted: before !== db.jobs.length });
  }

  // API: Local Employers
  if (path === '/api/local/employers' && req.method === 'GET') {
    const db = await readLocalDb();
    return sendJson(req, res, 200, db.employers);
  }

  if (path.startsWith('/api/local/employers/') && req.method === 'GET') {
    const slug = decodeURIComponent(path.slice('/api/local/employers/'.length));
    const db = await readLocalDb();
    const employer = db.employers.find(item => item.slug === slug);
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

server.listen(port, host, () => {
  console.log(`Trikonet Backend API running at: http://${host}:${port}`);
  console.log(`Configured for API domain: https://api.trikonet.com`);
});
