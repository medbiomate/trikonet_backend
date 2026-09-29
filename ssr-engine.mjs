import { extname } from 'node:path';

const SITE_ORIGIN = 'https://www.trikonet.com';

const POST_SLUG_PREFIXES = {
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

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const stripHtml = (html) => String(html ?? '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

const truncate = (text, maxLen = 160) => {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 1).trim() + '…';
};

const notFoundPageData = (cleanPath) => ({
  statusCode: 404,
  title: 'Page not found | Trikonet',
  description: 'The requested Trikonet page could not be found.',
  canonical: `${SITE_ORIGIN}${cleanPath}`,
  schema: null,
  ssrHtml: '',
  ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
  ogType: 'website'
});

const formatIsoDate = (d) => {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

function resolveRankMathVariables(template, post, extra = {}) {
  if (!template) return '';
  return template
    .replace(/%title%/gi, post?.post_title || extra.title || '')
    .replace(/%post_title%/gi, post?.post_title || extra.title || '')
    .replace(/%sep%/gi, '-')
    .replace(/%sitename%/gi, 'Trikonet')
    .replace(/%org%/gi, extra.employerName || '')
    .replace(/%location%/gi, extra.location || 'UAE')
    .replace(/%category%/gi, extra.category || 'Jobs')
    .replace(/%primary_taxonomy_terms%/gi, extra.category || 'Jobs')
    .replace(/%excerpt%/gi, extra.excerpt || '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getPageMetadata(pathname, wpDb, localDb = { jobs: [], employers: [] }) {
  const cleanPath = pathname.replace(/\/$/, '') || '/';

  // 1. Job details: /job/:slug
  if (cleanPath.startsWith('/job/')) {
    const slug = cleanPath.slice('/job/'.length);
    try {
      const [jobs] = await wpDb.query(`
        SELECT ID, post_title, post_name, post_date, post_modified, post_content, post_excerpt
        FROM wp_posts 
        WHERE post_name = ? AND post_type = 'job_listing' AND post_status = 'publish'
        LIMIT 1
      `, [slug]);

      let job = jobs[0];
      let meta = {};
      let employer = null;
      let terms = { location: [], category: [], type: [] };

      if (job) {
        const [metaRows] = await wpDb.query(`
          SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?
        `, [job.ID]);
        meta = Object.fromEntries(metaRows.map(r => [r.meta_key, r.meta_value]));

        // Employer
        const employerId = Number(meta._job_employer_posted_by);
        if (employerId) {
          const [emps] = await wpDb.query(`
            SELECT ID, post_title, post_name FROM wp_posts WHERE ID = ?
          `, [employerId]);
          if (emps[0]) {
            employer = emps[0];
            const [logoRows] = await wpDb.query(`
              SELECT a.ID attachment_id, COALESCE(f.meta_value, a.guid) source_file
              FROM wp_postmeta t 
              JOIN wp_posts a ON a.ID = CAST(t.meta_value AS UNSIGNED)
              LEFT JOIN wp_postmeta f ON f.post_id = a.ID AND f.meta_key = '_wp_attached_file'
              WHERE t.post_id = ? AND t.meta_key = '_thumbnail_id'
            `, [employerId]);
            if (logoRows[0]) {
              const suffix = extname(String(logoRows[0].source_file || '').split('?')[0]) || '.jpg';
              employer.logo = `/uploads/employers/${logoRows[0].attachment_id}${suffix.toLowerCase()}`;
            }
          }
        }

        // Terms
        const [termRows] = await wpDb.query(`
          SELECT tt.taxonomy, t.name
          FROM wp_term_relationships tr
          JOIN wp_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
          JOIN wp_terms t ON t.term_id = tt.term_id
          WHERE tr.object_id = ?
        `, [job.ID]);
        for (const t of termRows) {
          if (t.taxonomy === 'job_listing_location') terms.location.push(t.name);
          if (t.taxonomy === 'job_listing_category') terms.category.push(t.name);
          if (t.taxonomy === 'job_listing_type') terms.type.push(t.name);
        }
      } else {
        // Check localDb
        const localJob = (localDb.jobs || []).find(j => j.slug === slug);
        if (localJob) {
          job = {
            ID: localJob.id,
            post_title: localJob.title,
            post_name: localJob.slug,
            post_date: localJob.createdAt || localJob.date,
            post_modified: localJob.updatedAt || localJob.createdAt,
            post_content: localJob.description || '',
            post_excerpt: ''
          };
          employer = {
            post_title: localJob.company || 'Direct Employer',
            post_name: localJob.employerSlug || '',
            logo: localJob.logo || ''
          };
          terms.location = Array.isArray(localJob.locations) ? localJob.locations : [localJob.location || 'UAE'];
          terms.category = Array.isArray(localJob.categories) ? localJob.categories : [localJob.category || 'Jobs'];
          terms.type = [localJob.type || 'Full Time'];
          meta._job_application_deadline_date = localJob.deadline || localJob.expiryDate;
        }
      }

      if (job) {
        const empName = employer?.post_title || 'Top Employer';
        const loc = terms.location[0] || 'UAE';
        const jobType = terms.type[0] || 'Full Time';
        const cat = terms.category[0] || 'Jobs';

        const rawTitle = meta.rank_math_title || meta._yoast_wpseo_title || `${job.post_title} in ${loc} - ${empName} | Trikonet`;
        const title = resolveRankMathVariables(rawTitle, job, { employerName: empName, location: loc, category: cat });
        const rawDesc = meta.rank_math_description || meta._yoast_wpseo_metadesc || truncate(job.post_content || `Apply for ${job.post_title} at ${empName} in ${loc}, UAE. Verified career opening on Trikonet.`);
        const description = resolveRankMathVariables(rawDesc, job, { employerName: empName, location: loc, category: cat, excerpt: truncate(job.post_content) });
        const canonical = `${SITE_ORIGIN}/job/${slug}`;

        // Expiry & validThrough
        let validThrough = meta._job_application_deadline_date ? formatIsoDate(`${meta._job_application_deadline_date}T23:59:59Z`) : null;
        if (!validThrough) {
          const posted = new Date(job.post_date || Date.now());
          posted.setDate(posted.getDate() + 90);
          validThrough = posted.toISOString();
        }

        const datePosted = formatIsoDate(job.post_date) || new Date().toISOString();

        // Schema.org JobPosting
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          'title': job.post_title,
          'description': job.post_content || description,
          'identifier': {
            '@type': 'PropertyValue',
            'name': 'Trikonet',
            'value': String(job.ID)
          },
          'datePosted': datePosted,
          'validThrough': validThrough,
          'employmentType': jobType.toUpperCase().replace(/\s+/g, '_') || 'FULL_TIME',
          'hiringOrganization': {
            '@type': 'Organization',
            'name': empName,
            ...(employer?.logo ? { 'logo': `${SITE_ORIGIN}${employer.logo}` } : {}),
            ...(employer?.post_name ? { 'sameAs': `${SITE_ORIGIN}/employer/${employer.post_name}` } : {})
          },
          'jobLocation': {
            '@type': 'Place',
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': loc,
              'addressRegion': loc,
              'addressCountry': 'AE'
            }
          },
          'applicantLocationRequirements': {
            '@type': 'Country',
            'name': 'United Arab Emirates'
          },
          'directApply': true
        };

        if (meta._job_salary && Number(meta._job_salary) > 0) {
          schema.baseSalary = {
            '@type': 'MonetaryAmount',
            'currency': 'AED',
            'value': {
              '@type': 'QuantitativeValue',
              'value': Number(meta._job_salary),
              ...(meta._job_max_salary && Number(meta._job_max_salary) > 0 ? { 'maxValue': Number(meta._job_max_salary) } : {}),
              'unitText': 'MONTH'
            }
          };
        }

        // Semantic SSR Body for Bot Crawling
        const ssrHtml = `
          <main class="job-detail-page">
            <div class="wrap">
              <nav class="job-detail-breadcrumbs" aria-label="Breadcrumb">
                <a href="/">Home</a> &gt; <a href="/jobs">Jobs</a> &gt; <a href="/category/${encodeURIComponent(cat.toLowerCase().replace(/[^a-z0-9]/g, '-'))}">${esc(cat)}</a> &gt; <span>${esc(job.post_title)}</span>
              </nav>
              <article class="job-detail-main">
                <header class="job-detail-header">
                  <h1 class="job-detail-title">${esc(job.post_title)}</h1>
                  <div class="job-detail-meta-row">
                    <span class="company-name"><a href="/employer/${employer?.post_name || ''}">${esc(empName)}</a></span>
                    <span class="meta-sep">•</span>
                    <span class="job-loc">${esc(loc)}, UAE</span>
                    <span class="meta-sep">•</span>
                    <span class="job-type">${esc(jobType)}</span>
                  </div>
                </header>
                <div class="job-detail-content-wrap">
                  <div class="job-description-body">
                    ${job.post_content}
                  </div>
                </div>
              </article>
            </div>
          </main>
        `;

        return {
          title,
          description,
          canonical,
          schema,
          ssrHtml,
          ogImage: employer?.logo ? `${SITE_ORIGIN}${employer.logo}` : `${SITE_ORIGIN}/assets/hero.webp`,
          ogType: 'article'
        };
      }
      return notFoundPageData(cleanPath);
    } catch (err) {
      console.error('Error fetching SSR job:', err);
    }
  }

  // 2. Employer profile: /employer/:slug
  if (cleanPath.startsWith('/employer/')) {
    const slug = cleanPath.slice('/employer/'.length);
    try {
      const [emps] = await wpDb.query(`
        SELECT ID, post_title, post_name, post_content 
        FROM wp_posts 
        WHERE post_name = ? AND post_type = 'employer' AND post_status = 'publish'
        LIMIT 1
      `, [slug]);

      let emp = emps[0];
      if (emp) {
        const [metaRows] = await wpDb.query(`
          SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?
        `, [emp.ID]);
        const meta = Object.fromEntries(metaRows.map(r => [r.meta_key, r.meta_value]));

        // Logo
        let logo = '';
        const [logoRows] = await wpDb.query(`
          SELECT a.ID attachment_id, COALESCE(f.meta_value, a.guid) source_file
          FROM wp_postmeta t 
          JOIN wp_posts a ON a.ID = CAST(t.meta_value AS UNSIGNED)
          LEFT JOIN wp_postmeta f ON f.post_id = a.ID AND f.meta_key = '_wp_attached_file'
          WHERE t.post_id = ? AND t.meta_key = '_thumbnail_id'
        `, [emp.ID]);
        if (logoRows[0]) {
          const suffix = extname(String(logoRows[0].source_file || '').split('?')[0]) || '.jpg';
          logo = `/uploads/employers/${logoRows[0].attachment_id}${suffix.toLowerCase()}`;
        }

        const rawTitle = meta.rank_math_title || meta._yoast_wpseo_title || `${emp.post_title} Careers & Job Vacancies in UAE | Trikonet`;
        const title = resolveRankMathVariables(rawTitle, emp, { employerName: emp.post_title, location: 'UAE' });
        const rawDesc = meta.rank_math_description || meta._yoast_wpseo_metadesc || truncate(emp.post_content || `Explore verified jobs and career opportunities at ${emp.post_title} in the UAE. Apply directly through Trikonet.`);
        const description = resolveRankMathVariables(rawDesc, emp, { employerName: emp.post_title, location: 'UAE', excerpt: truncate(emp.post_content) });
        const canonical = `${SITE_ORIGIN}/employer/${slug}`;

        const schema = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': emp.post_title,
          'url': canonical,
          ...(logo ? { 'logo': `${SITE_ORIGIN}${logo}` } : {}),
          'description': description
        };

        const ssrHtml = `
          <main class="emp-profile-page">
            <div class="wrap">
              <header class="emp-profile-head">
                <h1>${esc(emp.post_title)}</h1>
                <p>${esc(description)}</p>
              </header>
              <div class="emp-profile-body">
                ${emp.post_content || ''}
              </div>
            </div>
          </main>
        `;

        return {
          title,
          description,
          canonical,
          schema,
          ssrHtml,
          ogImage: logo ? `${SITE_ORIGIN}${logo}` : `${SITE_ORIGIN}/assets/hero.webp`,
          ogType: 'website'
        };
      }
      return notFoundPageData(cleanPath);
    } catch (err) {
      console.error('Error fetching SSR employer:', err);
    }
  }

  // 3. Blog posts: check POST_SLUG_PREFIXES or /blog/:slug
  let blogSlug = '';
  let blogPrefix = 'blog';
  if (cleanPath.startsWith('/blog/')) {
    blogSlug = cleanPath.slice('/blog/'.length);
    blogPrefix = POST_SLUG_PREFIXES[blogSlug] || 'blog';
  } else {
    const parts = cleanPath.split('/').filter(Boolean);
    if (parts.length === 2 && POST_SLUG_PREFIXES[parts[1]]) {
      blogPrefix = parts[0];
      blogSlug = parts[1];
    }
  }

  if (blogSlug) {
    try {
      const [posts] = await wpDb.query(`
        SELECT ID, post_title, post_name, post_date, post_modified, post_content, post_excerpt, post_author
        FROM wp_posts 
        WHERE post_name = ? AND post_type = 'post' AND post_status = 'publish'
        LIMIT 1
      `, [blogSlug]);

      if (posts[0]) {
        const post = posts[0];
        const [metaRows] = await wpDb.query(`
          SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?
        `, [post.ID]);
        const meta = Object.fromEntries(metaRows.map(r => [r.meta_key, r.meta_value]));

        // Featured image
        let featuredImage = '';
        if (meta._thumbnail_id) {
          const [imgRows] = await wpDb.query(`
            SELECT a.ID, COALESCE(f.meta_value, a.guid) source_file
            FROM wp_posts a
            LEFT JOIN wp_postmeta f ON f.post_id = a.ID AND f.meta_key = '_wp_attached_file'
            WHERE a.ID = ?
          `, [meta._thumbnail_id]);
          if (imgRows[0]) {
            const suffix = extname(String(imgRows[0].source_file || '').split('?')[0]) || '.jpg';
            featuredImage = `/uploads/media/${imgRows[0].ID}${suffix.toLowerCase()}`;
          }
        }

        const rawTitle = meta.rank_math_title || meta._yoast_wpseo_title || `${post.post_title} | Trikonet Career Guide`;
        const title = resolveRankMathVariables(rawTitle, post, { location: 'UAE' });
        const rawDesc = meta.rank_math_description || meta._yoast_wpseo_metadesc || truncate(post.post_content || post.post_excerpt);
        const description = resolveRankMathVariables(rawDesc, post, { location: 'UAE', excerpt: truncate(post.post_content || post.post_excerpt) });
        const canonical = `${SITE_ORIGIN}/${blogPrefix}/${blogSlug}`;

        const schema = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.post_title,
          'description': description,
          'datePublished': formatIsoDate(post.post_date),
          'dateModified': formatIsoDate(post.post_modified) || formatIsoDate(post.post_date),
          ...(featuredImage ? { 'image': `${SITE_ORIGIN}${featuredImage}` } : {}),
          'publisher': {
            '@type': 'Organization',
            'name': 'Trikonet',
            'logo': {
              '@type': 'ImageObject',
              'url': `${SITE_ORIGIN}/assets/logo.png`
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonical
          }
        };

        const ssrHtml = `
          <main class="blog-post-page">
            <div class="wrap">
              <article class="post-article">
                <header class="post-header">
                  <h1>${esc(post.post_title)}</h1>
                  <time datetime="${formatIsoDate(post.post_date)}">${new Date(post.post_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                </header>
                ${featuredImage ? `<div class="post-featured-image"><img src="${esc(featuredImage)}" alt="${esc(post.post_title)}"></div>` : ''}
                <div class="wordpress-content">
                  ${post.post_content}
                </div>
              </article>
            </div>
          </main>
        `;

        return {
          title,
          description,
          canonical,
          schema,
          ssrHtml,
          ogImage: featuredImage ? `${SITE_ORIGIN}${featuredImage}` : `${SITE_ORIGIN}/assets/hero.webp`,
          ogType: 'article'
        };
      }
      return notFoundPageData(cleanPath);
    } catch (err) {
      console.error('Error fetching SSR blog:', err);
    }
  }

  // 4. Job Location: /job-location/:slug
  if (cleanPath.startsWith('/job-location/')) {
    const locSlug = cleanPath.slice('/job-location/'.length);
    try {
      const [terms] = await wpDb.query(`
        SELECT t.name, t.slug 
        FROM wp_terms t 
        JOIN wp_term_taxonomy tt ON tt.term_id = t.term_id 
        WHERE tt.taxonomy = 'job_listing_location' AND t.slug = ?
        LIMIT 1
      `, [locSlug]);

      const locName = terms[0]?.name || locSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const title = `Jobs in ${locName}, UAE - Latest Vacancies | Trikonet`;
      const description = `Browse active verified job vacancies in ${locName}, UAE across top industries. Apply directly to leading employers on Trikonet.`;
      const canonical = `${SITE_ORIGIN}/job-location/${locSlug}`;

      return {
        title,
        description,
        canonical,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': title,
          'description': description,
          'url': canonical
        },
        ssrHtml: `
          <main class="jobs-layout-page">
            <div class="wrap">
              <h1>Jobs in ${esc(locName)}, UAE</h1>
              <p>${esc(description)}</p>
            </div>
          </main>
        `,
        ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
        ogType: 'website'
      };
    } catch (err) {
      console.error('Error fetching SSR job-location:', err);
    }
  }

  // 5. Job Category: /category/:slug
  if (cleanPath.startsWith('/category/')) {
    const catSlug = cleanPath.slice('/category/'.length);
    try {
      const [terms] = await wpDb.query(`
        SELECT t.name, t.slug 
        FROM wp_terms t 
        JOIN wp_term_taxonomy tt ON tt.term_id = t.term_id 
        WHERE tt.taxonomy = 'job_listing_category' AND t.slug = ?
        LIMIT 1
      `, [catSlug]);

      const catName = terms[0]?.name || catSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const title = `${catName} Jobs in UAE - Verified Vacancies | Trikonet`;
      const description = `Explore thousands of verified ${catName} job openings in Dubai, Abu Dhabi, and across the UAE with direct employer application.`;
      const canonical = `${SITE_ORIGIN}/category/${catSlug}`;

      return {
        title,
        description,
        canonical,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': title,
          'description': description,
          'url': canonical
        },
        ssrHtml: `
          <main class="jobs-layout-page">
            <div class="wrap">
              <h1>${esc(catName)} Jobs in UAE</h1>
              <p>${esc(description)}</p>
            </div>
          </main>
        `,
        ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
        ogType: 'website'
      };
    } catch (err) {
      console.error('Error fetching SSR category:', err);
    }
  }

  // 6. Nurse jobs landing page: /nurse-jobs-in-uae
  if (cleanPath === '/nurse-jobs-in-uae') {
    const title = 'Nurse Jobs in UAE - Hospital & Clinic Vacancies | Trikonet';
    const description = 'Discover verified nursing, clinical care, and hospital positions across Dubai, Abu Dhabi, and Northern Emirates with direct employer application.';
    const canonical = `${SITE_ORIGIN}/nurse-jobs-in-uae`;
    return {
      title,
      description,
      canonical,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': title,
        'description': description,
        'url': canonical
      },
      ssrHtml: `
        <main class="nurse-results-page">
          <div class="wrap">
            <h1>Nurse Jobs in UAE</h1>
            <p>${esc(description)}</p>
          </div>
        </main>
      `,
      ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
      ogType: 'website'
    };
  }

  // 7. General Jobs directory: /jobs
  if (cleanPath === '/jobs' || cleanPath === '/job-list' || cleanPath === '/job-openings') {
    const title = 'Find Jobs in UAE - 13,000+ Verified Vacancies | Trikonet';
    const description = 'Search and apply for thousands of verified job vacancies in Dubai, Abu Dhabi, and across the UAE with direct employer application.';
    const canonical = `${SITE_ORIGIN}/jobs`;
    return {
      title,
      description,
      canonical,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': title,
        'description': description,
        'url': canonical
      },
      ssrHtml: `
        <main class="jobs-layout-page">
          <div class="wrap">
            <h1>Find Jobs in UAE</h1>
            <p>${esc(description)}</p>
          </div>
        </main>
      `,
      ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
      ogType: 'website'
    };
  }

  // 8. Employers directory: /employers
  if (cleanPath === '/employers') {
    const title = 'Top Employers & Companies Hiring in UAE | Trikonet';
    const description = "Explore Trikonet's list of the top employers in UAE and find your dream job at the best companies in the country.";
    const canonical = `${SITE_ORIGIN}/employers`;
    return {
      title,
      description,
      canonical,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': title,
        'description': description,
        'url': canonical
      },
      ssrHtml: `
        <main class="emp-directory-page">
          <div class="wrap">
            <h1>Top Employers in UAE</h1>
            <p>${esc(description)}</p>
          </div>
        </main>
      `,
      ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
      ogType: 'website'
    };
  }

  // 9. Blog Directory: /blog
  if (cleanPath === '/blog') {
    const title = 'Career Tips, Visa Guides & Job Advice | Trikonet Blog';
    const description = 'Expert career tips, interview advice, UAE visa regulations, and job market insights to help you navigate your professional journey.';
    const canonical = `${SITE_ORIGIN}/blog`;
    return {
      title,
      description,
      canonical,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        'name': title,
        'description': description,
        'url': canonical
      },
      ssrHtml: `
        <main class="blog-directory-page">
          <div class="wrap">
            <h1>Career Tips & Blog</h1>
            <p>${esc(description)}</p>
          </div>
        </main>
      `,
      ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
      ogType: 'website'
    };
  }

  // 10. Static pages: /about, /contact, /privacy-policy, /terms, /faq
  const staticPages = {
    '/about': {
      title: 'About Us | Trikonet',
      description: 'Learn about Trikonet, the trusted job portal connecting job seekers with verified career opportunities and top employers across the UAE and GCC.'
    },
    '/contact': {
      title: 'Contact Us | Trikonet',
      description: 'Get in touch with the Trikonet team for support, employer hiring partnerships, or career assistance.'
    },
    '/privacy-policy': {
      title: 'Privacy Policy | Trikonet',
      description: 'Review Trikonet privacy policy detailing how your personal data, job applications, and resume details are protected and processed.'
    },
    '/terms': {
      title: 'Terms and Conditions | Trikonet',
      description: 'Review the terms and conditions governing the use of Trikonet recruitment services and portal features.'
    },
    '/faq': {
      title: 'Frequently Asked Questions (FAQ) | Trikonet',
      description: 'Find answers to common questions about job searching, employer applications, and account features on Trikonet.'
    }
  };

  if (staticPages[cleanPath]) {
    const page = staticPages[cleanPath];
    const canonical = `${SITE_ORIGIN}${cleanPath}`;
    return {
      title: page.title,
      description: page.description,
      canonical,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': page.title,
        'description': page.description,
        'url': canonical
      },
      ssrHtml: `
        <main class="content-page">
          <div class="wrap">
            <h1>${esc(page.title.split('|')[0].trim())}</h1>
            <p>${esc(page.description)}</p>
          </div>
        </main>
      `,
      ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
      ogType: 'website'
    };
  }

  // 11. Homepage: /
  if (cleanPath === '/') {
    const title = 'Trikonet - Jobs in UAE | Over 13,621+ Verified Vacancies in Dubai & GCC';
    const description = 'With Trikonet, you can search unlimited jobs online to find the next step in your career in UAE. With tools for job search, company reviews and more.';
    const canonical = `${SITE_ORIGIN}/`;
    return {
      title,
      description,
      canonical,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Trikonet',
        'url': canonical,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${SITE_ORIGIN}/jobs?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      ssrHtml: '', // Let client app render homepage
      ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
      ogType: 'website'
    };
  }

  // Fallback for other paths
  return {
    title: 'Trikonet - Jobs in UAE',
    description: 'Find verified job vacancies and career opportunities across Dubai, Abu Dhabi, and the UAE on Trikonet.',
    canonical: `${SITE_ORIGIN}${cleanPath}`,
    schema: null,
    ssrHtml: '',
    ogImage: `${SITE_ORIGIN}/assets/hero.webp`,
    ogType: 'website'
  };
}

export function injectSsrIntoHtml(templateHtml, pageData, isBot = false) {
  let html = templateHtml;

  // 1. Replace <title>
  if (pageData.title) {
    if (/<title>.*?<\/title>/i.test(html)) {
      html = html.replace(/<title>.*?<\/title>/i, `<title>${esc(pageData.title)}</title>`);
    } else {
      html = html.replace('<head>', `<head>\n  <title>${esc(pageData.title)}</title>`);
    }
  }

  // 2. Replace or inject <meta name="description">
  if (pageData.description) {
    if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(pageData.description)}">`);
    } else {
      html = html.replace('<head>', `<head>\n  <meta name="description" content="${esc(pageData.description)}">`);
    }
  }

  // 3. Replace or inject <link rel="canonical">
  if (pageData.canonical) {
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${esc(pageData.canonical)}">`);
    } else {
      html = html.replace('<head>', `<head>\n  <link rel="canonical" href="${esc(pageData.canonical)}">`);
    }
  }

  // 4. Head meta tags block (OpenGraph, Twitter, Schema)
  const headInject = [];

  if (pageData.statusCode === 404) {
    headInject.push('<meta name="robots" content="noindex,follow">');
  }

  // Open Graph
  headInject.push(`<meta property="og:site_name" content="Trikonet">`);
  headInject.push(`<meta property="og:title" content="${esc(pageData.title)}">`);
  if (pageData.description) {
    headInject.push(`<meta property="og:description" content="${esc(pageData.description)}">`);
  }
  if (pageData.canonical) {
    headInject.push(`<meta property="og:url" content="${esc(pageData.canonical)}">`);
  }
  headInject.push(`<meta property="og:type" content="${esc(pageData.ogType || 'website')}">`);
  if (pageData.ogImage) {
    headInject.push(`<meta property="og:image" content="${esc(pageData.ogImage)}">`);
  }

  // Twitter Card
  headInject.push(`<meta name="twitter:card" content="summary_large_image">`);
  headInject.push(`<meta name="twitter:title" content="${esc(pageData.title)}">`);
  if (pageData.description) {
    headInject.push(`<meta name="twitter:description" content="${esc(pageData.description)}">`);
  }
  if (pageData.ogImage) {
    headInject.push(`<meta name="twitter:image" content="${esc(pageData.ogImage)}">`);
  }

  // JSON-LD Schema
  if (pageData.schema) {
    headInject.push(`<script type="application/ld+json">\n${JSON.stringify(pageData.schema, null, 2)}\n</script>`);
  }

  // Inject before </head>
  html = html.replace('</head>', `${headInject.join('\n  ')}\n</head>`);

  // 3. SSR body inside <div id="app"> if bot or ssrHtml present
  if (pageData.ssrHtml && isBot) {
    html = html.replace('<div id="app"></div>', `<div id="app">${pageData.ssrHtml}</div>`);
  }

  return html;
}
