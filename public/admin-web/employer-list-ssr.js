import {renderSiteHeader} from './site-header.js';
import {renderSiteFooter} from './site-footer.js';
import {renderEmployerDirectory} from './employer-directory.js';
export function injectInitialEmployers(html,employers,params=new URLSearchParams(),total=employers.length) {
 const start=html.indexOf('<div id="app">'),end=html.indexOf('<style>',start);
 if(start<0||end<0)return html;
 const names=value=>Array.isArray(value)?value:Object.values(value||{});
 const records=employers.map(item=>{const m=item.metas||{};return {...item,title:item.title?.rendered??item.title??'',logo:item.logo||m._employer_logo||m._employer_featured_image_img||m._employer_featured_image||'',categories:names(item.categories||m._employer_category),locations:names(item.locations||m._employer_location),openJobs:Number(item.openJobs||m._employer_open_jobs)||0};});
 const content=renderSiteHeader({path:'/employers'})+renderEmployerDirectory({data:{employers:records,counts:{employer:total},employerResultTotal:total},queryParams:params,currentPage:Number(params.get('page'))||1,pageSize:10,pager:(base,count)=>{const page=Math.max(1,Number(params.get('page'))||1),pages=Math.ceil(count/10);const link=n=>{const query=new URLSearchParams(params);query.set('page',String(n));return base+'?'+query};return pages>1?`<nav class="data-pagination" aria-label="Company pages">${page>1?`<a href="${link(page-1)}">Previous</a>`:''}<span>Page ${page} of ${pages}</span>${page<pages?`<a href="${link(page+1)}">Next</a>`:''}</nav>`:''}})+renderSiteFooter();
 return html.slice(0,start)+`<div id="app" data-server-rendered="employers">${content}</div><script id="initial-employer-list" type="application/json">${JSON.stringify({employers:records,total}).replace(/</g,'\\u003c')}</script>`+html.slice(end);
}
