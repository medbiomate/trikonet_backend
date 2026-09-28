# Trikonet Backend API & Admin Console

Backend API service and admin console for [Trikonet](https://trikonet.com), deployed to `https://api.trikonet.com`.

## Repository
- **Git Repository**: [medbiomate/trikonet_backend](https://github.com/medbiomate/trikonet_backend)
- **Domain**: `https://api.trikonet.com`

## Features

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