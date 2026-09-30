import { indexable, slugify } from './seo-job-pages.mjs';
export async function handleSeoRequest(req,res,path,requestUrl,{seoRepository,currentAdminSession,sendJson,readJsonBody}) {
  if(path==='/api/job-category-links' && req.method==='GET') {
    try{return sendJson(req,res,200,await seoRepository.directory());}
    catch{return sendJson(req,res,503,{error:'Job categories are temporarily unavailable.'});}
  }
  // SEO pages use a separate durable table; only administrators can manage them.
  if (path.startsWith('/api/admin/seo-job-pages')) {
    const admin = currentAdminSession(req);
    if (!admin || admin.expiresAt <= Date.now()) return sendJson(req,res,401,{error:'Sign in to manage SEO pages.'});
    if (admin.role !== 'Administrator') return sendJson(req,res,403,{error:'Only administrators can manage SEO job pages.'});
    try {
      if (path === '/api/admin/seo-job-pages' && req.method === 'GET') return sendJson(req,res,200,(await seoRepository.list(true)).filter(p=>p.pageType==='category_location'));
      if (path === '/api/admin/seo-job-pages/main-categories' && req.method === 'GET') return sendJson(req,res,200,(await seoRepository.list()).filter(p=>p.pageType==='main_category'));
      if (path === '/api/admin/seo-job-pages/main-categories' && req.method === 'POST') return sendJson(req,res,200,await seoRepository.createMain(await readJsonBody(req)));
      if (path === '/api/admin/seo-job-pages/bulk' && req.method === 'POST') {
        const body=await readJsonBody(req);
        return sendJson(req,res,200,(await seoRepository.bulk(body.ids || [],body.action)).filter(p=>p.pageType==='category_location'));
      }
      const match=path.match(/^\/api\/admin\/seo-job-pages\/([^/]+)(\/regenerate)?$/);
      if (match && (req.method==='PUT' || (req.method==='POST' && match[2]))) return sendJson(req,res,200,await seoRepository.update(decodeURIComponent(match[1]),match[2]?{}:await readJsonBody(req),Boolean(match[2])));
      return sendJson(req,res,405,{error:'Unsupported SEO page operation.'});
    } catch(error) { console.error('SEO page operation failed:',error.message); return sendJson(req,res,400,{error:error.code ? 'Unable to save or load SEO pages. Please try again.' : error.message}); }
  }
  if (path === '/api/seo-job-pages' || path.startsWith('/api/seo-job-pages/')) {
    try {
      const list=await seoRepository.list();
      if (path==='/api/seo-job-pages') return sendJson(req,res,200,list.filter(indexable).map(p=>({slug:p.slug,title:p.title,category:p.category,location:p.location,pageType:p.pageType})));
      const slug=slugify(decodeURIComponent(path.slice('/api/seo-job-pages/'.length)));
      let page=list.find(p=>p.slug===slug);
      if(!page){
        const legacy=await seoRepository.resolveDestination?.(slug);
        if(legacy){
          const registered=list.find(p=>p.pageType===legacy.pageType && p.categoryId===legacy.categoryId && (p.pageType==='main_category'||p.location===legacy.location));
          page=registered || legacy;
        }
      }
      if (!page || page.status !== 'Published') return sendJson(req,res,404,{error:'Page not found',seoPage:Boolean(page)});
      const jobs=await seoRepository.jobs(page);
      if(page.legacyDestination && page.pageType==='category_location' && jobs.length<10)return sendJson(req,res,404,{error:'Destination has fewer than 10 active jobs.',seoPage:true});
      const pageNumber=Math.max(1,Number(requestUrl.searchParams.get('page')) || 1);
      return sendJson(req,res,200,{page:{...page,activeJobCount:jobs.length,canonical:'https://www.trikonet.com/'+page.slug},jobs:jobs.slice((pageNumber-1)*10,pageNumber*10),total:jobs.length,links:(await seoRepository.directory()).filter(p=>p.category===page.category && p.slug!==page.slug)});
    } catch(error) { return sendJson(req,res,503,{error:'SEO pages are temporarily unavailable.'}); }
  }
  if (path === '/sitemap-seo-job-pages.xml' && req.method === 'GET') {
    try {
      const list=(await seoRepository.list()).filter(indexable);
      const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+list.map(p=>'<url><loc>https://www.trikonet.com/'+p.slug+'</loc><lastmod>'+String(p.updatedAt || p.createdAt).slice(0,10)+'</lastmod></url>').join('')+'</urlset>';
      res.writeHead(200,{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store'});return res.end(xml);
    } catch { res.writeHead(503);return res.end('Unable to load sitemap'); }
  }
}
