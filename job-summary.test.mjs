import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeJob } from './job-summary.mjs';

test('cards omit full descriptions while retaining identity, filters and dates', () => {
  const record = { id: 1, slug: 'nurse', title: 'Nurse', description: '<p>Provide patient care.</p>'.repeat(100), content: {rendered:'<p>Clinical duties</p>'}, categories:['Nursing'], locations:['Dubai'], urlAliases:['/job/old-nurse'], updatedAt:'2026-10-17', metas:{_job_employer_name:'Hospital'} };
  const card = summarizeJob(record);
  assert.equal(card.description, undefined);
  assert.equal(card.content, undefined);
  assert.equal(card.searchText, undefined);
  assert.equal(card.excerpt, 'Clinical duties');
  for (const field of ['id','slug','categories','locations','urlAliases','updatedAt','metas']) assert.deepEqual(card[field],record[field]);
  assert.ok(JSON.stringify(card).length < JSON.stringify(record).length / 4);
  assert.ok(record.description.includes('<p>'), 'detail record must remain unchanged');
});

test('search can still match text beyond the visible card excerpt', () => {
  const record = {description:'<p>'+'Patient care '.repeat(100)+' rare qualification</p>',content:{rendered:'<p>Additional responsibilities</p>'}};
  const card = summarizeJob(record,{searchable:true});
  assert.ok(card.searchText.includes('rare qualification'));
  assert.ok(card.searchText.includes('Additional responsibilities'));
  assert.ok(card.excerpt.length <= 240);
  assert.doesNotMatch(card.searchText, /<p>/);
});


test('empty content objects fall back to the description without object labels', () => {
  const card = summarizeJob({excerpt:{},content:{},description:'<p>Clinical responsibilities</p>'},{searchable:true});
  assert.equal(card.excerpt,'Clinical responsibilities');
  assert.equal(card.searchText,'Clinical responsibilities');
});
