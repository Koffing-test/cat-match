// Deterministic greedy player: a balance diagnostic, not proof of human difficulty.
import {Game,LEVELS} from '../engine.js';
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const results=[];
for(const level of LEVELS){let wins=0;const seeds=100;for(let seed=1;seed<=seeds;seed++){
 const g=new Game(level,random(seed));
 while(!g.finished){const candidates=[];for(let a=0;a<49;a++)for(const d of [1,7])if(g.canSwap(a,a+d))candidates.push([a,a+d]);
 let best,bestValue=-Infinity;
 for(const [a,b]of candidates){const copy=Object.assign(Object.create(Game.prototype),g,{board:g.board.map(c=>({...c})),yarn:new Set(g.yarn),frames:[],rng:random(seed*999+g.moves)});copy.move(a,b);const v=(copy.progress-g.progress)*100+(copy.score-g.score)/50+(level.task==='mouse'?copy.board.reduce((v,c,i)=>v+(c.type===6?Math.floor(i/7)*10:0),0):0);if(v>bestValue){bestValue=v;best=[a,b];}}
 if(!g.helperUsed&&g.moves<=5){const mouse=g.board.findIndex(c=>c.type===6);g.helper(level.task==='mouse'?Math.min(48,mouse+7):24);}
 if(!g.finished)g.move(...best);
 }
 if(g.won)wins++;
 }results.push({level:level.id,task:level.task,target:level.target,moves:level.moves,wins,seeds});
}
console.log(JSON.stringify({method:'Greedy one-ply simulation; random refills cannot be predicted; not human win rates.',results},null,2));
