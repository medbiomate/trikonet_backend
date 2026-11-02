import test from 'node:test';
import assert from 'node:assert/strict';
import {createJobApplicationStarts} from './job-application-starts.mjs';
test('counts unique account/job pairs, without counting repeated Apply clicks',async()=>{
 const pairs=new Set();let tables=0;
 const pool={query:async(sql,args)=>{
  if(sql.startsWith('CREATE')){tables++;return []}
  if(sql.startsWith('INSERT')){pairs.add(JSON.stringify(args));return []}
  return [[{total:[...pairs].filter(value=>JSON.parse(value)[0]===args[0]).length}]];
 }};
 const activity=createJobApplicationStarts(pool);
 await activity.record('nurse','one');await activity.record('nurse','one');await activity.record('nurse','two');await activity.record('teacher','one');
 assert.equal(await activity.count('nurse'),2);assert.equal(await activity.count('new-job'),0);assert.equal(tables,1);
});
