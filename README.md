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

### Scheduled job digests

Opted-in candidates receive at most one grouped email per UAE slot: 08:00 morning, 12:00 noon and 16:00 afternoon (Asia/Dubai). Retries occur only during the corresponding hour; missed windows are not replayed. Persistent mailbox-and-slot keys prevent duplicates across restarts and accounts sharing an email. Pending legacy single-job messages are retired.

Role matching requires all meaningful selected-role words in the job title, falling back to current designation when needed. Category or educational specialization alone never qualifies a role match. When no new matched jobs exist, send explicitly labeled general opportunities with a profile-completion link. Include only active jobs published within seven days and not previously included in that user's digests. Skip when none remain. Reading alert settings never opts someone in.

Email includes Trikonet branding, employer logos where available, company/location/type details, company profile links and available descriptions, job links, a friendly greeting and profile/unsubscribe links. Uses existing Resend settings. Test with `node --test job-digest.test.mjs job-email-alerts.test.mjs`; provider calls are stubbed, so tests send no real mail.

## Account deletion and 30-day recovery

The iOS account menu opens an in-app confirmation rather than linking to support.
`GET /api/auth/account-deletion` returns the authenticated account's status.
`POST` with `{ "action": "request", "confirmation": "DELETE" }` schedules deletion
for 30 × 24 hours later and revokes all existing sessions. The current device gets
a replacement cookie so it can display the deadline and offer recovery. New
password/Google sign-ins return the deletion status; signing in does not cancel
it. `POST` with `{ "action": "recover" }` explicitly cancels deletion before the
deadline. All actions use the session identity, never a client-supplied user ID.

Pending accounts cannot use candidate, résumé, review, or campaign APIs. Job
emails and public reviews are suppressed during recovery. At the deadline,
authentication/data reads exclude the account even before the background worker
runs. The worker runs on startup and every minute, transactionally removing the
account, associated records, wallet, email queue/subscription, sessions and
unshared private media. An opaque ID tombstone prevents stale catalogue writes
from restoring erased accounts. Existing backups and copies already sent to
employers are governed by their respective retention policies.

Deploy the backend before distributing the updated iOS build. The database user
needs CREATE/SELECT/INSERT/UPDATE/DELETE privileges for the existing tables and
new `trikonet_account_deletions` table (created automatically). Keep the backend
process running for scheduled cleanup. This change does not modify or deploy
production data by itself. Account-storage failures fail closed rather than
using a stale deployment JSON copy for authentication.

Validate with `node --test account-deletion.test.mjs company-reviews.test.mjs
persistent-sessions.test.mjs points-store.test.mjs mobile-api.test.mjs`. Before
App Review, test on a physical device using a disposable account: request deletion,
confirm normal access is blocked, sign out/in and restore; verify profile and CV
return. Do not delete the reviewer demo account while a review is in progress.

## Hosting memory and periodic work

Imported-data loading selects only public catalogue datasets. Startup checks URL
migrations with a jobs projection before loading account state. Account reads
reuse the original serialized merge baseline instead of making a second full
JSON string. EMS reads jobs, employers and creator ID/email pairs, excluding
private CVs, resumes and application records from those scans.

EMS and periodic SEO refreshes use connection-scoped MySQL advisory locks and
`trikonet_worker_runs` cooldowns so multiple hosting instances do not repeat the
same scheduled scan. A crashed connection releases its lock; another instance
can retry after the cooldown. This table contains scheduling metadata only.
Requires MariaDB 10.6+ or MySQL 8+ (`JSON_TABLE`) and existing
CREATE/SELECT/INSERT/UPDATE privileges. No account-data migration is performed.

Run `MEMORY_TEST_SOCKET=/path/to/test.sock node --test memory-workers.test.mjs`
against a local test server as root. This opt-in test creates and drops its own
fixture database, verifies large private fields are excluded, and checks locks,
staggered workers, cooldown expiry and retry after failure. Check runtime
`resource_usage` logs to verify memory under live traffic after deployment.
