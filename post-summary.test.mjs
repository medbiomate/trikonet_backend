import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizePost } from './post-summary.mjs';
test('listing summaries retain article metadata but omit full bodies and private metadata', () => {
 const article = {id:1,slug:'example',title:{rendered:'Title'},featured_image:'/image.webp',content:{rendered:'<p>'+ 'Long article '.repeat(2000)+'</p>'},excerpt:{rendered:''},metas:{large:'payload'}};
 const summary = summarizePost(article);
 assert.equal(summary.slug,article.slug);
 assert.equal(summary.featured_image,article.featured_image);
 assert.equal(summary.content.rendered,'');
 assert.equal(summary.excerpt.rendered.length,320);
 assert.deepEqual(summary.metas,{});
 assert.ok(article.content.rendered.length>20000);
 assert.ok(JSON.stringify(summary).length < JSON.stringify(article).length / 10);
});
