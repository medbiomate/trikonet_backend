import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./server.mjs',import.meta.url),'utf8');const start=source.indexOf('let jobPresenceReady;');const body=source.slice(start,source.indexOf('\n}',start)+2);
test('presence table initialization shares concurrent requests and skips repeated DDL',async()=>{
 let calls=0,release;const context={wpDb:{query:()=>{calls++;return new Promise(resolve=>{release=resolve;});}}};vm.createContext(context);vm.runInContext(body,context);
 const first=context.ensureJobPresence();assert.equal(context.ensureJobPresence(),first);assert.equal(calls,1);release([]);await first;await context.ensureJobPresence();assert.equal(calls,1);
});
test('failed presence initialization can retry',async()=>{
 let calls=0;const context={wpDb:{query:async()=>{if(++calls===1)throw Error('offline');return [];}}};vm.createContext(context);vm.runInContext(body,context);await assert.rejects(context.ensureJobPresence(),/offline/);await context.ensureJobPresence();assert.equal(calls,2);
});
