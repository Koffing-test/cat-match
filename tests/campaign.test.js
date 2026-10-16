import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game,LEVELS,CHAPTERS,CHAPTER_SIZE,COLLECT_TYPES} from '../engine.js';
const legacy=JSON.parse(readFileSync(new URL('./fixtures/legacy-v9.json',import.meta.url)));
const random=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
function blank(task){const level=LEVELS.find(l=>l.task===task),g=new Game(level,random(71));g.board=Array.from({length:49},(_,i)=>g.cell((i%7+Math.floor(i/7)*2)%6));return g;}
test('1000 levels form 200 five-level chapters, with ten varied goals and bounded difficulty',()=>{
 assert.equal(LEVELS.length,1000);assert.equal(CHAPTERS.length,200);assert.equal(new Set(LEVELS.map(l=>l.task)).size,10);
 for(const [i,l]of LEVELS.entries()){assert.equal(l.id,i+1);assert.equal(l.chapter,Math.floor(i/CHAPTER_SIZE));assert.ok(l.title);assert.ok(l.moves>=20&&l.moves<=36);assert.ok(Number.isInteger(l.target)&&l.target>0);assert.ok(l.target<=(l.task==='score'?12000:l.task==='cords'?49:l.task==='mouse'?3:50));}
 for(let c=0;c<CHAPTERS.length;c++){assert.equal(LEVELS.filter(l=>l.chapter===c).length,5);assert.ok(CHAPTERS[c].text&&CHAPTERS[c].title);}
 assert.equal(new Set(LEVELS.filter(l=>l.id>15&&l.task==='cords').map(l=>l.layout)).size,6);
});
test('the original 15 levels and version-1 active saves remain unchanged',()=>{
 assert.deepEqual(LEVELS.slice(0,15),legacy.levels);
 for(const saved of legacy.runs){const g=Game.restore(saved);assert.ok(g);assert.deepEqual(g.toSave(),saved);if(!g.finished)assert.ok(g.move(...g.possible()).valid);}
});
test('every collectible goal counts only its own removed item, including skill blasts',()=>{
 for(const [task,type]of Object.entries(COLLECT_TYPES)){const g=blank(task);g.board[16].type=type;g.board[17].type=type;g.board[18].type=(type+1)%6;g.blast([16,17,18]);assert.equal(g.progress,2);assert.equal(g.moves,g.level.moves);}
});
test('score goal tracks points from ordinary moves and cat abilities',()=>{
 const g=new Game(LEVELS.find(l=>l.task==='score'),random(4));g.move(...g.possible());assert.ok(g.progress>0);assert.equal(g.progress,g.score);const old=g.progress;g.skill('queen',24);assert.ok(g.progress>old);assert.equal(g.progress,g.score);assert.deepEqual(Game.restore(g.toSave()).toSave(),g.toSave());
});
test('creating a four-match counts a new booster; firing an existing booster does not',()=>{
 const g=blank('specials');for(let p=14;p<18;p++)g.board[p].type=0;g.resolve(15);assert.equal(g.frames[0].progress,1);assert.ok(g.progress>=1);
 const used=blank('specials');used.board[0].special='row';used.blast([0]);assert.equal(used.progress,0);
});
test('cascades count follow-up matching waves and exclude the initial match',()=>{
 const level=LEVELS.find(l=>l.task==='cascade');let withCascade=0;
 for(let seed=1;seed<=60;seed++){const g=new Game(level,random(seed));const result=g.move(...g.possible());const waves=result.frames.filter(f=>f.pop.length>0).length;assert.equal(g.progress,Math.max(0,waves-1));if(g.progress>0)withCascade++;}
 assert.ok(withCascade>0);
});
test('new goal types keep unlimited husband help and avoid offering it one step from completion',()=>{
 for(const task of ['score','specials','cascade','foil','spring','bow','cable']){const g=blank(task);g.moves=1;assert.ok(g.husbandHelp().length);assert.equal(g.moves,6);g.moves=1;assert.ok(g.husbandHelp().length);g.moves=1;g.progress=g.level.target-1;assert.equal(g.needsHusbandHelp,false);}
});
