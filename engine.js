export const SIZE = 7;
export const ITEMS = ['kibble','foil','cable','berries','spring','bow','mouse'];
export const BOW_COST = 10;
export const NAMES = ['Съедобные камушки','шарик из фольги','кабель зарядки','ягоды','резинка-пружинка','бантик','мышка'];
export const STORIES = [
 {title:'Солнечный подоконник',text:'Лайм нашла тёплое пятнышко. До важных дел можно немного помурчать.',reward:'Маленькое солнце',caption:'Весь мир подождёт. У нас тихий час.',cat:'ginger'},
 {title:'Охота за фольгой',text:'Лайм уже заметила блестящий шарик из фольги. Текила, старшая кошка, пока наблюдает с королевским спокойствием.',reward:'Нить приключения',caption:'У этого шарика не было ни единого шанса.',cat:'gray'},
 {title:'Захват дивана',text:'Королева квартиры Текила заняла диван. Лайм зовёт на вечерние приключения — вдвоём веселее.',reward:'Дом там, где вы',caption:'Самое любимое место — рядом с тобой.',cat:'both'}
];
export const LEVELS = Array.from({length:15},(_,i)=>{
 const chapter=Math.floor(i/5), task=['food','cords','mouse','food','cords'][i%5];
 const titles=['Завтрак готов','Шарик убежал','Тихая охота','Ещё кусочек','Мягкие лапки','Хрустящий день','Провода повсюду','Под диваном','Большой аппетит','Тёплый плед','Пир на весь дом','Хитрый провод','Ночная погоня','Ужин вдвоём','Наш уютный дом'];
 return {id:i+1,chapter,title:titles[i],task,target:task==='food'?18+chapter*6+(i%5)*2:task==='cords'?10+chapter*4:2+Math.floor(chapter/2),moves:task==='mouse'?26+chapter*3:task==='cords'?22+chapter: (i===0?22:20+chapter)};
});
export class Game {
 constructor(level=LEVELS[0],rng=Math.random){this.level=level;this.rng=rng;this.serial=0;this.moves=level.moves;this.progress=0;this.score=0;this.skillsUsed=new Set();this.turnsTaken=0;this.bowCharge=0;this.cords=new Set();this.mouseCount=0;this.frames=[];this.makeBoard();}
 cell(type){return {id:++this.serial,type:type??Math.floor(this.rng()*6),special:null};}
 makeBoard(){
  this.board=Array.from({length:49},()=>this.cell());
  for(let i=0;i<49;i++){let guard=0;while(((i%7>=2&&this.board[i].type===this.board[i-1].type&&this.board[i].type===this.board[i-2].type)||(i>=14&&this.board[i].type===this.board[i-7].type&&this.board[i].type===this.board[i-14].type))&&guard++<30)this.board[i].type=(this.board[i].type+1)%6;}
  if(this.level.task==='cords'){const positions=Array.from({length:49},(_,i)=>i);for(let n=0;n<this.level.target;n++){let j=Math.floor(this.rng()*positions.length);this.cords.add(positions.splice(j,1)[0]);}}
  if(this.level.task==='mouse')this.spawnMouse();
  this.ensureMoves();
 }
 snapshot(pop=[],note=''){return {board:this.board.map(c=>c?{...c}:null),cords:[...this.cords],moves:this.moves,progress:this.progress,score:this.score,skillsUsed:[...this.skillsUsed],turnsTaken:this.turnsTaken,bowCharge:this.bowCharge,pop:[...pop],note};}
 frame(pop=[],note=''){this.frames.push(this.snapshot(pop,note));}
 groups(){const found=[];for(let row=0;row<7;row++)for(let col=0;col<7;col++)for(const step of [1,7]){
  const i=row*7+col,c=this.board[i];if(!c||c.type===6)continue;
  if(step===1&&col>0&&this.board[i-1]?.type===c.type)continue;
  if(step===7&&row>0&&this.board[i-7]?.type===c.type)continue;
  const run=[];for(let j=i;j<49&&(step===7||Math.floor(j/7)===row)&&this.board[j]?.type===c.type;j+=step)run.push(j);
  if(run.length>=3)found.push({cells:run,step});
 }return found;}
 adjacent(a,b){return Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&a<49&&b<49&&(Math.abs(a-b)===7||(Math.floor(a/7)===Math.floor(b/7)&&Math.abs(a-b)===1));}
 swapCells(a,b){[this.board[a],this.board[b]]=[this.board[b],this.board[a]];}
 canSwap(a,b){if(!this.adjacent(a,b))return false;const x=this.board[a],y=this.board[b];if(x.type===6||y.type===6)return false;if(x.special==='rainbow'||y.special==='rainbow'||(x.special&&y.special))return true;this.swapCells(a,b);const valid=this.groups().length>0;this.swapCells(a,b);return valid;}
 possible(){for(let i=0;i<49;i++)for(const d of [1,7])if(this.canSwap(i,i+d))return [i,i+d];return null;}
 ensureMoves(){if(this.possible())return;for(let n=0;n<100;n++){
   const indices=this.board.map((c,i)=>c.type!==6&&!c.special?i:-1).filter(i=>i>=0);
   for(let k=indices.length-1;k>0;k--){let j=Math.floor(this.rng()*(k+1));this.swapCells(indices[k],indices[j]);}
   if(!this.groups().length&&this.possible()){this.frame([],'Новый поворот! Поле перемешано');return;}
  }
  // A deterministic playable pocket protects even pathological random generators.
  const types=[0,1,0,2,0,3];[0,1,2,7,8,9].forEach((p,i)=>{this.board[p]=this.cell(types[i]);});
  if(this.groups().length)this.resolve();
 }
 spawnMouse(){if(this.mouseCount>=this.level.target)return;const col=(2+this.mouseCount*2)%7;this.board[col]=this.cell(6);this.mouseCount++;}
 drop(){for(let col=0;col<7;col++){const cells=[];for(let row=6;row>=0;row--)if(this.board[row*7+col])cells.push(this.board[row*7+col]);for(let row=6;row>=0;row--)this.board[row*7+col]=cells[6-row]??this.cell();}}
 deliver(){if(this.level.task!=='mouse')return false;let done=false;for(let i=42;i<49;i++)if(this.board[i]?.type===6){this.board[i]=null;this.progress++;this.score+=500;done=true;}if(done){this.frame([],'Мышка поймана!');this.drop();if(this.progress<this.level.target)this.spawnMouse();this.frame();}return done;}
 blast(initial,creation=new Map()){
  const hit=new Set(initial),queue=[...hit];
  for(let k=0;k<queue.length;k++){
   const p=queue[k],c=this.board[p];if(!c||c.type===6||creation.has(p))continue;
   let extra=[];
   if(c.special==='row')extra=Array.from({length:7},(_,i)=>Math.floor(p/7)*7+i);
   if(c.special==='col')extra=Array.from({length:7},(_,i)=>p%7+i*7);
   if(c.special==='bomb')for(let r=Math.max(0,Math.floor(p/7)-1);r<=Math.min(6,Math.floor(p/7)+1);r++)for(let col=Math.max(0,p%7-1);col<=Math.min(6,p%7+1);col++)extra.push(r*7+col);
   if(c.special==='rainbow')extra=this.board.map((v,i)=>v&&v.type===c.type?i:-1).filter(i=>i>=0);
   for(const q of extra)if(!hit.has(q)){hit.add(q);queue.push(q);}
  }
  const removed=[...hit].filter(p=>this.board[p]?.type!==6&&!creation.has(p));
  for(const p of hit){if(this.cords.delete(p)&&this.level.task==='cords')this.progress++;}
  for(const p of removed){if(this.level.task==='food'&&this.board[p]?.type===0)this.progress++;if(this.board[p]?.type===5&&!this.skillsUsed.has('scratch'))this.bowCharge=Math.min(BOW_COST,this.bowCharge+1);this.score+=50;}
  this.frame(removed,removed.length>7?'Мур-комбо!':'');
  for(const p of removed)this.board[p]=null;
  for(const [p,special]of creation){if(this.board[p])this.board[p].special=special;}
  this.frame();this.drop();this.frame();this.deliver();
 }
 resolve(preferred){let loops=0;while(loops++<100){const groups=this.groups();if(!groups.length)break;const creation=new Map();
  for(const g of groups)if(g.cells.length>=4){const p=g.cells.includes(preferred)?preferred:g.cells[Math.floor(g.cells.length/2)];creation.set(p,g.cells.length>=5?'rainbow':g.step===1?'row':'col');}
  for(const a of groups)for(const b of groups)if(a!==b&&a.step!==b.step){const p=a.cells.find(x=>b.cells.includes(x));if(p!==undefined)creation.set(p,'bomb');}
  this.blast(groups.flatMap(g=>g.cells),creation);preferred=undefined;
 }return loops;}
 move(a,b){this.frames=[];if(this.finished||!this.canSwap(a,b))return {valid:false,frames:[]};const x={...this.board[a]},y={...this.board[b]};this.swapCells(a,b);this.moves--;this.turnsTaken++;this.frame();
  if(x.special==='rainbow'||y.special==='rainbow'){
   const other=x.special==='rainbow'?y:x;
   const hit=this.board.map((c,i)=>(other.special==='rainbow'||c.type===other.type)&&c.type!==6?i:-1).filter(i=>i>=0);hit.push(a,b);this.blast(hit);
  }else if(x.special&&y.special){const hit=[];for(let i=0;i<49;i++)if(Math.floor(i/7)===Math.floor(a/7)||i%7===a%7||Math.floor(i/7)===Math.floor(b/7)||i%7===b%7)hit.push(i);this.blast(hit);}
  this.resolve(b);if(!this.finished)this.ensureMoves();this.frame();return {valid:true,frames:this.frames};
 }
 skill(kind,center=24){
  this.frames=[];
  if(this.finished||!['purr','queen','zoomies','scratch'].includes(kind)||this.skillsUsed.has(kind))return [];
  if(kind==='zoomies'&&this.turnsTaken<6)return [];
  if(kind==='scratch'&&this.bowCharge<BOW_COST)return [];
  if(['queen','scratch'].includes(kind)&&(!Number.isInteger(center)||center<0||center>=49))return [];
  this.skillsUsed.add(kind);
  if(kind==='purr'){
   const candidates=this.board.map((c,i)=>c.type!==4&&c.type!==6&&!c.special?i:-1).filter(i=>i>=0);
   for(let n=0;n<6&&candidates.length;n++){const p=candidates.splice(Math.floor(this.rng()*candidates.length),1)[0];this.board[p].type=4;}
   this.frame([],'Лайм намурчала резинки-пружинки ♡');this.resolve();if(!this.finished)this.ensureMoves();this.frame();return this.frames;
  }
  const hit=[];
  if(kind==='queen'){
   for(let i=0;i<49;i++)if(Math.floor(i/7)===Math.floor(center/7)||i%7===center%7)hit.push(i);
  }else if(kind==='scratch'){
   this.bowCharge-=BOW_COST;const left=Math.min(4,Math.max(0,center%7-1));
   for(let row=0;row<7;row++)for(let col=left;col<left+3;col++)hit.push(row*7+col);
  }else{
   const candidates=this.board.map((c,i)=>c.type!==6?i:-1).filter(i=>i>=0);
   for(let n=0;n<12&&candidates.length;n++)hit.push(candidates.splice(Math.floor(this.rng()*candidates.length),1)[0]);
  }
  this.blast(hit);this.resolve();if(!this.finished)this.ensureMoves();
  this.frame([],kind==='scratch'?'Коготки наточены. Три столбца стали свободнее!':kind==='queen'?'Текила навела порядок. Так решила королева.':'Лайм и Текила: вечерние бесоебства начались!');return this.frames;
 }
 // This is a gentle heuristic, not a prediction of random cascades.
 get needsHusbandHelp(){
  if(this.finished||this.moves>2)return false;
  const remaining=this.level.target-this.progress;
  if(this.level.task!=='mouse')return remaining>this.moves*3;
  const mouse=this.board.findIndex(c=>c?.type===6);
  return remaining>1||(mouse>=0&&6-Math.floor(mouse/7)>this.moves*2);
 }
 husbandHelp(){
  this.frames=[];if(!this.needsHusbandHelp)return [];
  this.moves+=5;this.frame([],'Я рядом. Всё получится ♡');return this.frames;
 }
 get won(){return this.progress>=this.level.target;}
 get finished(){return this.won||this.moves<=0;}
}
