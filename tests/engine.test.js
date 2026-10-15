import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,LEVELS,BOW_COST} from '../engine.js';
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function blank(level=LEVELS[0]){const g=new Game(level,seeded(44));for(let i=0;i<49;i++)g.board[i]=g.cell((i%7+Math.floor(i/7)*2)%6);return g;}
test('all 15 levels start full, match-free and playable across 100 seeds',()=>{for(const l of LEVELS)for(let s=1;s<=100;s++){const g=new Game(l,seeded(s));assert.equal(g.groups().length,0);assert.ok(g.possible());assert.equal(g.board.length,49);assert.ok(g.board.every(Boolean));if(l.task==='cords')assert.equal(g.cords.size,l.target);}});
test('invalid and wrapped swaps spend no moves',()=>{const g=blank();const before=JSON.stringify(g.board);assert.equal(g.move(6,7).valid,false);assert.equal(g.move(0,48).valid,false);assert.equal(g.moves,g.level.moves);assert.equal(JSON.stringify(g.board),before);});
test('four creates striped special and five creates rainbow',()=>{for(const count of [4,5]){const g=blank();for(let p=14;p<14+count;p++)g.board[p].type=0;g.resolve(15);assert.ok(g.board.some(c=>c.special===(count===5?'rainbow':'row')));assert.equal(g.groups().length,0);}});
test('rainbow removes its swapped color, chains resolve, one move spent',()=>{const g=blank();g.board[0].special='rainbow';const result=g.move(0,1);assert.ok(result.valid);assert.equal(g.moves,g.level.moves-1);assert.ok(g.score>=100);assert.equal(g.groups().length,0);assert.equal(new Set(g.board.map(c=>c.id)).size,49);});
test('Tequila clears a cross and cords, once without spending a move',()=>{const g=blank(LEVELS[1]);g.cords=new Set([21,22,23,1,8]);assert.ok(g.skill('queen',22).length);assert.equal(g.progress,5);assert.equal(g.skill('queen',22).length,0);assert.equal(g.moves,g.level.moves);assert.equal(g.turnsTaken,0);});
test('mouse survives blasts and is delivered at bottom; new mouse spawns',()=>{const g=blank(LEVELS[2]);g.board[42]=g.cell(6);g.mouseCount=1;g.blast([42,43]);assert.equal(g.progress,1);assert.equal(g.mouseCount,2);assert.equal(g.board.filter(c=>c.type===6).length,1);});
test('two specials trigger large combination',()=>{const g=blank();g.board[0].special='row';g.board[1].special='bomb';assert.ok(g.move(0,1).valid);assert.ok(g.score>=650);assert.equal(g.groups().length,0);});
test('complete runs preserve engine invariants across 15 levels and 20 seeds',()=>{for(const l of LEVELS)for(let seed=1;seed<=20;seed++){const g=new Game(l,seeded(seed));let steps=0;while(!g.finished&&steps++<l.moves+1){const p=g.possible();assert.ok(p,`level ${l.id}`);const old=g.moves;assert.ok(g.move(...p).valid);assert.equal(g.moves,old-1);assert.equal(g.groups().length,0);assert.ok(g.board.every(Boolean));assert.equal(new Set(g.board.map(c=>c.id)).size,49);if(g.level.task==='mouse')assert.ok(g.board.filter(c=>c.type===6).length<=1);}assert.ok(g.finished);}});

test('Lime converts six eligible tiles to springs once, preserving mice, specials, existing springs and moves',()=>{
 const g=blank(LEVELS[2]);g.board[0]=g.cell(6);g.board[1].special='row';g.board[2].type=4;
 const before=g.board.map(c=>({...c})),moves=g.moves;assert.ok(g.skill('purr').length);
 const converted=g.frames[0].board;const changed=converted.filter((c,i)=>c.type!==before[i].type);
 assert.equal(changed.length,6);assert.ok(changed.every(c=>c.type===4));
 for(const i of [0,1,2])assert.deepEqual(converted[i],before[i]);
 assert.equal(g.moves,moves);assert.equal(g.turnsTaken,0);assert.equal(g.groups().length,0);assert.equal(g.skill('purr').length,0);assert.equal(g.skill('zoomies').length,0);
});
test('Lime handles fewer than six eligible tiles without changing boosters',()=>{
 const g=blank();for(const c of g.board)c.special='row';for(const i of [8,16])g.board[i].special=null;
 g.skill('purr');assert.equal(g.frames[0].board.filter((c,i)=>c.type!==g.frames[0].board[i].type).length,0);
 assert.equal(g.frames[0].board[8].type,4);assert.equal(g.frames[0].board[16].type,4);
});
test('joint skill requires six successful moves and preserves mice',()=>{const g=new Game(LEVELS[2],seeded(12));for(let i=0;i<6;i++){assert.equal(g.skill('zoomies').length,0);assert.ok(g.move(...g.possible()).valid);}assert.equal(g.turnsTaken,6);const before=g.moves,progress=g.progress;assert.ok(g.skill('zoomies').length);assert.equal(g.moves,before);assert.ok(g.progress>=progress);assert.ok(g.board.filter(c=>c.type===6).length<=1);assert.equal(g.groups().length,0);assert.equal(g.skill('zoomies').length,0);assert.equal(new Set(g.board.map(c=>c.id)).size,49);});
test('invalid skills, invalid centers and finished games cannot spend skills',()=>{const g=blank();for(const center of [-1,49,1.5,NaN])assert.equal(g.skill('queen',center).length,0);assert.equal(g.skill('unknown').length,0);assert.equal(g.skillsUsed.size,0);g.moves=0;for(const kind of ['purr','queen','zoomies'])assert.equal(g.skill(kind).length,0);assert.equal(g.skillsUsed.size,0);});
test('a rejected swap never charges the shared skill',()=>{const g=blank();g.move(6,7);assert.equal(g.turnsTaken,0);assert.equal(g.snapshot().turnsTaken,0);assert.deepEqual(g.snapshot().skillsUsed,[]);});

test('bow charge counts only removed bows, not a bow preserved as a special',()=>{
 const g=blank(LEVELS[2]);for(const p of [16,17,18])g.board[p].type=5;
 g.blast([16,17,18],new Map([[17,'row']]));assert.equal(g.bowCharge,2);assert.equal(g.frames[0].bowCharge,2);
 g.bowCharge=BOW_COST-1;for(const p of [30,31,32])g.board[p].type=5;g.blast([30,31,32]);assert.equal(g.bowCharge,BOW_COST);
 const fresh=new Game(LEVELS[2],seeded(4));assert.equal(fresh.bowCharge,0);
});
test('scratching requires 10 bows; invalid targets and finished levels preserve the charge',()=>{
 const g=blank(LEVELS[2]);g.bowCharge=BOW_COST-1;assert.equal(g.skill('scratch',24).length,0);assert.equal(g.skillsUsed.has('scratch'),false);
 g.bowCharge=BOW_COST;for(const center of [-1,49,NaN,1.5])assert.equal(g.skill('scratch',center).length,0);
 assert.equal(g.bowCharge,BOW_COST);assert.equal(g.skillsUsed.has('scratch'),false);g.moves=0;assert.equal(g.skill('scratch',24).length,0);assert.equal(g.bowCharge,BOW_COST);
});
test('scratching clears three valid columns at both edges and center, costs no move and spares the mouse',()=>{
 for(const center of [0,24,48]){const g=blank(LEVELS[2]);g.board[24]=g.cell(6);g.bowCharge=BOW_COST;const moves=g.moves;const frames=g.skill('scratch',center),left=Math.min(4,Math.max(0,center%7-1));
  assert.ok(frames.length);assert.equal(g.moves,moves);assert.equal(g.turnsTaken,0);assert.equal(g.bowCharge,0);assert.equal(g.skill('scratch',center).length,0);
  assert.equal(frames[0].pop.length,center===24?20:21);assert.ok(frames[0].pop.every(p=>p%7>=left&&p%7<left+3));assert.ok(!frames[0].pop.includes(24));
  assert.equal(g.groups().length,0);assert.equal(new Set(g.board.map(c=>c.id)).size,49);assert.ok(g.board.some(c=>c.type===6)||g.progress>0);
 }
});
test('all skills and random play preserve invariants across every level',()=>{
 for(const level of LEVELS)for(let seed=1;seed<=10;seed++){const g=new Game(level,seeded(seed));let turns=0;
  while(!g.finished&&turns++<level.moves+4){if(g.moves<=7)g.skill('purr');if(g.turnsTaken===3)g.skill('queen',24);if(g.turnsTaken>=6)g.skill('zoomies');if(!g.finished&&g.bowCharge===BOW_COST)g.skill('scratch',24);if(g.finished)break;
   assert.ok(g.move(...g.possible()).valid);assert.equal(g.groups().length,0);assert.ok(g.board.every(Boolean));assert.equal(new Set(g.board.map(c=>c.id)).size,49);assert.ok(g.bowCharge>=0&&g.bowCharge<=BOW_COST);
  }assert.ok(g.finished);
 }
});

test('husband help is repeatable at 1–2 moves with a large remaining goal, and preserves the board and skills',()=>{
 const g=blank();const board=JSON.stringify(g.board);g.skillsUsed.add('purr');
 for(const moves of [2,1,2,1,2]){g.moves=moves;assert.ok(g.needsHusbandHelp);assert.ok(g.husbandHelp().length);assert.equal(g.moves,moves+5);assert.equal(g.husbandHelp().length,0);assert.equal(JSON.stringify(g.board),board);assert.deepEqual([...g.skillsUsed],['purr']);assert.equal(g.turnsTaken,0);}
});
test('husband help stays hidden early, at victory, at zero moves and when the goal is close',()=>{
 const g=blank();for(const moves of [g.level.moves,3,0]){g.moves=moves;assert.equal(g.needsHusbandHelp,false);assert.equal(g.husbandHelp().length,0);}
 g.moves=1;g.progress=g.level.target-1;assert.equal(g.needsHusbandHelp,false);g.progress=g.level.target;assert.equal(g.needsHusbandHelp,false);
 const cords=blank(LEVELS[1]);cords.moves=2;cords.progress=cords.level.target-7;assert.ok(cords.needsHusbandHelp);cords.progress=cords.level.target-2;assert.equal(cords.needsHusbandHelp,false);
});
test('mouse rescue considers remaining mice and distance to the bottom',()=>{
 const g=blank(LEVELS[2]);g.moves=2;g.board[2]=g.cell(6);assert.ok(g.needsHusbandHelp);g.progress=g.level.target-1;assert.ok(g.needsHusbandHelp);g.board[2]=g.cell(0);g.board[37]=g.cell(6);assert.equal(g.needsHusbandHelp,false);
});
