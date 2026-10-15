import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {GALLERY,unlockedMemories} from '../gallery.js';
const root=new URL('../',import.meta.url);
test('prepared photo rewards exist and cover every level',()=>{
 assert.ok(GALLERY.length>=15);assert.equal(new Set(GALLERY.map(p=>p.id)).size,GALLERY.length);
 for(let level=1;level<=15;level++)assert.ok(GALLERY.some(p=>p.level===level),`missing reward ${level}`);
 for(const p of GALLERY){assert.ok(p.title&&p.caption&&p.catLabel);assert.ok(Number.isInteger(p.level)&&p.level>=1&&p.level<=15);for(const path of [p.src,p.thumb]){assert.match(path,/^\.\/assets\/gallery\/photo-\d{3}(-thumb)?\.jpg$/);assert.ok(existsSync(new URL(path,root)));const bytes=readFileSync(new URL(path,root));assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);}}
});
test('only completed levels reveal their own photographs; older progress works',()=>{
 assert.deepEqual(unlockedMemories({}),[]);const save={1:{stars:3,score:500},3:{stars:1,score:200}};
 const open=unlockedMemories(save);assert.ok(open.length);assert.ok(open.every(p=>p.level===1||p.level===3));assert.equal(open.length,GALLERY.filter(p=>p.level===1||p.level===3).length);
 const all=Object.fromEntries(Array.from({length:15},(_,i)=>[i+1,{stars:3,score:500}]));assert.equal(unlockedMemories(all).length,GALLERY.length);
});
