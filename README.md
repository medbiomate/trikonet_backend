# Trikonet Backend API & Admin Console

Backend API service and admin console for [Trikonet](https://trikonet.com), deployed to `https://api.trikonet.com`.

## Repository
- **Git Repository**: [medbiomate/trikonet_backend](https://github.com/medbiomate/trikonet_backend)
- **Domain**: `https://api.trikonet.com`

## Features

## EMS automatic job uploads

Set `EMS_TRIKONET_SYNC_SECRET` in the backend environment to the Trikonet
integration secret configured in EMS. Keep this server-only; do not place it in
the frontend or commit its value. The existing EMS ingestion URL is
`https://api.secondtales.com/api/wordpress/trikonet/uploads`; this is an HTTP
endpoint and does not require WordPress.

Jobs first published on or after October 2, 2026 (Asia/Kolkata) sync to their
creator's EMS sheet using the creator's account email. Existing local jobs from
that date onward are scanned automatically. Jobs without a known creator/email
are skipped rather than attributed to an editor. Drafts and older published jobs
are excluded. Each job's original publication date is retained for EMS on edits.

The MySQL `trikonet_ems_outbox` table persists pending deliveries; failed sends
retry with backoff. Publishing remains available during an EMS outage. Inspect
`last_error`, `attempts`, and delivery revisions in that table to diagnose sync.
Manual EMS sheets remain available. Automatic entries appear alongside manual
rows; source URL assignments are not automatically matched to live URLs.

Run `node --test ems-sync.test.mjs` to verify cutoff, payload and retry behavior.

- **CORS Enabled**: Configured for `https://trikonet.com`, `https://www.trikonet.com`, and local development environments.
- **REST API Endpoints**:
  - `GET /api/health` — Service health check.
  - `GET /api/wp/counts` — Total published count for jobs, employers, posts, and media.
  - `GET /api/wp/count?type=...` — Filtered counts with location, category, keyword.
  - `GET /api/wp/taxonomies` — Taxonomies (categories, locations, types, tags).
  - `GET /api/wp/job_listing` — Jobs query with filters, pagination, search.
  - `GET /api/wp/employer` — Employer directory query with open job counts.
  - `GET /api/wp/posts` — Published blog articles.
  - `GET /api/wp/pages` — CMS pages.
  - `GET /api/local/jobs` & `POST/PUT/DELETE /api/local/jobs` — CMS local jobs management.
  - `GET /api/local/employers` & `POST/PUT/DELETE /api/local/employers` — CMS employer management.
  - `POST /api/auth/register`, `/login`, `/me`, `/logout` — User authentication.
  - `GET/POST/PUT /api/email-campaigns` — Email campaign builder.
- **Admin Console**: Hosted at `/admin` (or root `/` when accessed via browser).

## SEO Job Pages

Administrators manage location landing pages under Pages → SEO Job Pages. Main
category pages are registered manually (no minimum job count). UAE location
variations are created at 10 published, active, unexpired jobs and are retained
when counts later fall. Manual status, indexing and SEO overrides survive refresh.

The configured MySQL database stores these records in `seo_job_pages`, separately
from jobs and application state. The table is created automatically; database
access must include CREATE/SELECT/INSERT/UPDATE. Back up this table with the
existing application database. There is no automatic deletion or JSON fallback
for SEO edits. Jobs are queried dynamically, not copied into this table.

- `/api/admin/seo-job-pages` and its main-categories/bulk/edit routes require an Administrator session.
- `/api/seo-job-pages` lists only Published + Index links.
- `/api/seo-job-pages/:slug` serves published content; drafts return 404.
- `/sitemap-seo-job-pages.xml` excludes Draft and Noindex records.
- Eligibility refreshes after job edits, on admin refresh and every five minutes.

Run `npm run test:seo` for rule tests. The optional
`node --test seo-integration.test.mjs` uses local MySQL and an isolated temporary
fixture table; it does not mutate real jobs or the production SEO table.

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

   The backend will be running at `http://127.0.0.1:4173`.

## Environment Variables

Copy `.env.example` to `.env` and customize:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Listening port | `4173` |
| `HOST` | Binding interface | `0.0.0.0` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `https://trikonet.com,https://www.trikonet.com` |
| `TRIKONET_DB_HOST` | MySQL database host | `localhost` |
| `TRIKONET_DB_PORT` | MySQL database port | `3306` |
| `TRIKONET_DB_USER` | MySQL database username | `root` |
| `TRIKONET_DB_PASSWORD`| MySQL database password | `""` |
| `TRIKONET_DB_NAME` | MySQL database name | `trikonet_html_test` |
