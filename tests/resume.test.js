import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,LEVELS} from '../engine.js';
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const json=value=>JSON.parse(JSON.stringify(value));
test('every settled action restores exactly across all levels, including terminal results and all skills',()=>{
 for(const level of LEVELS)for(let seed=1;seed<=10;seed++){
  const g=new Game(level,seeded(seed));let n=0;
  while(!g.finished&&n++<100){
   if(n===3)g.skill('purr');else if(n===5)g.skill('queen',24);else if(n===8)g.skill('zoomies');else if(g.bowCharge===10&&!g.skillsUsed.has('scratch'))g.skill('scratch',24);else g.move(...g.possible());
   const saved=json(g.toSave()),restored=Game.restore(saved,()=>{throw Error('restoring must not generate a board');});
   assert.ok(restored,`level ${level.id}, seed ${seed}, action ${n}`);assert.deepEqual(restored.toSave(),saved);assert.equal(restored.finished,g.finished);assert.equal(restored.won,g.won);
   assert.notEqual(restored.board,g.board);assert.notEqual(restored.cords,g.cords);assert.notEqual(restored.skillsUsed,g.skillsUsed);
  }
 }
});
test('resumed play preserves special IDs, serial, skills, progress, mouse delivery and bow charge',()=>{
 for(const level of LEVELS){const g=new Game(level,seeded(level.id));for(let n=0;n<6&&!g.finished;n++)g.move(...g.possible());if(!g.finished)g.skill('purr');
  const restored=Game.restore(json(g.toSave()),seeded(90));assert.ok(restored);const count=restored.turnsTaken;
  if(!restored.finished){assert.ok(restored.move(...restored.possible()).valid);assert.equal(restored.turnsTaken,count+1);assert.equal(new Set(restored.board.map(c=>c.id)).size,49);assert.ok(restored.serial>=Math.max(...restored.board.map(c=>c.id)));assert.equal(restored.skill('purr').length,0);}
 }
});
test('husband help is saved and remains repeatable after resuming',()=>{
 const g=new Game(LEVELS[0],seeded(1));g.moves=2;g.husbandHelp();const restored=Game.restore(json(g.toSave()));assert.ok(restored);assert.equal(restored.moves,7);assert.deepEqual(restored.board,g.board);restored.moves=1;assert.ok(restored.husbandHelp().length);assert.equal(restored.moves,6);
});
test('saved level goal and starting move budget survive later balance changes',()=>{
 const g=new Game({...LEVELS[0],target:33,moves:30},seeded(2));g.move(...g.possible());const restored=Game.restore(json(g.toSave()));assert.equal(restored.level.target,33);assert.equal(restored.level.moves,30);assert.equal(restored.moves,29);
});
test('invalid or unsupported saved runs are rejected without throwing',()=>{
 const original=new Game(LEVELS[0],seeded(7)).toSave();
 const edits=[s=>s.version=99,s=>s.level.id=0,s=>s.level.id=16,s=>s.level.target=0,s=>s.level.moves=NaN,s=>s.board.pop(),s=>s.board[1]=null,s=>s.board[1].id=s.board[0].id,s=>s.board[0].type=9,s=>s.board[0].special='unknown',s=>s.serial=0,s=>s.moves=-1,s=>s.score=Infinity,s=>s.bowCharge=11,s=>s.skillsUsed=['unknown'],s=>s.skillsUsed=['purr','purr'],s=>s.cords=[-1],s=>s.mouseCount=1,s=>{for(const c of s.board)c.type=1;}];
 for(const edit of edits){const s=json(original);edit(s);assert.equal(Game.restore(s),null);}
 for(const s of [null,{},[],0,'bad'])assert.equal(Game.restore(s),null);
 const cords=new Game(LEVELS[1],seeded(4)).toSave();cords.cords.pop();assert.equal(Game.restore(cords),null);
 const mouse=new Game(LEVELS[2],seeded(4)).toSave();mouse.mouseCount++;assert.equal(Game.restore(mouse),null);
});
