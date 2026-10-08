import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listAdminMedia } from './admin-media-library.mjs';
test('includes editor uploads and old attachments, deduplicated and newest first', async () => {
  const hash = 'a'.repeat(64);
  const pool = {async query(sql) {
    if (sql.includes('FROM trikonet_media_library')) return [[{payload: JSON.stringify({id:hash,title:'new.png',url:'https://media.trikonet.com/new.png',date:'2026-10-08'})}]];
    if (sql.includes('FROM trikonet_media m')) return [[{id:hash,filename:'new.png',public_url:'https://media.trikonet.com/new.png',created_at:'2026-10-08'}, {id:'b'.repeat(64),filename:'editor.png',public_url:'https://media.trikonet.com/editor.png',byte_size:2048,created_at:'2026-10-07'}]];
    if (sql.includes('FROM wp_posts')) return [[{ID:10,post_title:'old',post_date:'2025-01-01',attached_file:'old.jpg'}, {ID:11,post_title:'duplicate',post_date:'2026-10-08',attached_file:'new.png'}]];
    if (sql.includes('FROM trikonet_public_media')) return [[{attachment_id:11,checksum:hash,public_url:'https://media.trikonet.com/new.png'}]];
    throw Error(sql);
  }};
  const media = await listAdminMedia(pool);
  assert.deepEqual(media.map(m => m.title), ['new.png','editor.png','old']);
  assert.equal(media[1].size,'2 KB');
  assert.equal(media[2].url,'https://api.trikonet.com/uploads/media/10.jpg');
});
test('missing legacy tables still returns current uploads', async () => {
  const pool = {async query(sql) {
    if (sql.includes('FROM trikonet_media_library')) return [[{payload:JSON.stringify({id:1,url:'https://media.trikonet.com/one.png'})}]];
    throw Object.assign(Error('missing'),{code:'ER_NO_SUCH_TABLE'});
  }};
  assert.equal((await listAdminMedia(pool)).length,1);
});
test('database failures propagate instead of showing a misleading empty library', async () => {
  const pool = {async query() {throw Object.assign(Error('offline'),{code:'ECONNREFUSED'});}};
  await assert.rejects(listAdminMedia(pool),/offline/);
});
