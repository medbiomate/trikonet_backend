import test from 'node:test';
import assert from 'node:assert/strict';
import { newestFirst } from './record-order.mjs';

test('newly appended imports appear before older records, without mutating input', () => {
  const records = [{id:1,date:'2026-09-22 11:06:44'}, {id:2,date:'2026-09-30 10:30:43'}];
  assert.deepEqual(newestFirst(records).slice(0,1).map(r=>r.id), [2]);
  assert.deepEqual(records.map(r=>r.id), [1,2]);
});
test('ties use descending IDs and invalid dates sort last', () => {
  assert.deepEqual(newestFirst([{id:9,date:'invalid'}, {id:1,date:'2026-09-30T10:30:43'}, {id:2,date:'2026-09-30 10:30:43'}]).map(r=>r.id), [2,1,9]);
});
test('pagination after sorting has no duplicate or skipped records', () => {
  const sorted = newestFirst(Array.from({length:23}, (_,id)=>({id,date:'2026-09-30'})));
  assert.deepEqual([...sorted.slice(0,10),...sorted.slice(10,20),...sorted.slice(20)].map(r=>r.id), Array.from({length:23},(_,i)=>22-i));
});
