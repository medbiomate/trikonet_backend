// Normalize encoded source HTML, then keep only safe formatting elements.
export function normalizeImportedDescription(value){
 let html=String(value||'');
 for(let pass=0;pass<2;pass++){
  if(!/&(?:amp;)?lt;\/?(?:p|strong|ul|ol|li|br|div|span|h[1-6])\b/i.test(html))break;
  html=html.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
 }
 html=html.replace(/<(script|style|iframe|object|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
 const allowed=new Set(['p','br','ul','ol','li','strong','b','em','i','h2','h3','h4','blockquote']);
 return html.replace(/<[^>]*>/g,tag=>{const m=tag.match(/^<(\/?)\s*([a-z0-9]+)/i);return m&&allowed.has(m[2].toLowerCase())?`<${m[1]}${m[2].toLowerCase()}>`:'';});
}
