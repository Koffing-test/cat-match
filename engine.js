export const SIZE = 7;
export const ITEMS = ['kibble','foil','cable','berries','spring','bow','mouse'];
export const BOW_COST = 10;
export const NAMES = ['Съедобные камушки','шарик из фольги','кабель зарядки','ягоды','резинка-пружинка','бантик','мышка'];
export const STORIES = [
 {title:'Солнечный подоконник',text:'Лайм нашла тёплое пятнышко. До важных дел можно немного помурчать.',reward:'Маленькое солнце',caption:'Весь мир подождёт. У нас тихий час.',cat:'ginger'},
 {title:'Охота за фольгой',text:'Лайм уже заметила блестящий шарик из фольги. Текила, старшая кошка, пока наблюдает с королевским спокойствием.',reward:'Нить приключения',caption:'У этого шарика не было ни единого шанса.',cat:'gray'},
 {title:'Захват дивана',text:'Королева квартиры Текила заняла диван. Лайм зовёт на вечерние приключения — вдвоём веселее.',reward:'Дом там, где вы',caption:'Самое любимое место — рядом с тобой.',cat:'both'}
];
const INTRO_LEVELS = Array.from({length:15},(_,i)=>{
 const chapter=Math.floor(i/5), task=['food','cords','mouse','food','cords'][i%5];
 const titles=['Завтрак готов','Шарик убежал','Тихая охота','Ещё кусочек','Мягкие лапки','Хрустящий день','Провода повсюду','Под диваном','Большой аппетит','Тёплый плед','Пир на весь дом','Хитрый провод','Ночная погоня','Ужин вдвоём','Наш уютный дом'];
 return {id:i+1,chapter,title:titles[i],task,target:task==='food'?18+chapter*6+(i%5)*2:task==='cords'?10+chapter*4:2+Math.floor(chapter/2),moves:task==='mouse'?26+chapter*3:task==='cords'?22+chapter: (i===0?22:20+chapter)};
});
export const CHAPTER_SIZE=5;
export const LEVEL_COUNT=1000;
const THEMES=[
 {title:'Утренние потягушки',text:'Лайм проснулась раньше всех. Пока дом тихий, можно поискать любимые игрушки.',cat:'lime'},
 {title:'Королевский обход',text:'Текила проверяет квартиру: всё ли лежит достаточно удобно для кошки?',cat:'tequila'},
 {title:'Шуршащие сокровища',text:'За диваном снова что-то блестит. У Лайм и Текилы намечается маленькая экспедиция.',cat:'both'},
 {title:'Пружинная охота',text:'Резинки разбежались по дому. Лайм точно знает, как собрать их в одном месте.',cat:'lime'},
 {title:'Бантики для двоих',text:'Текила выбирает самый красивый бантик, а Лайм уже придумала новую игру.',cat:'both'},
 {title:'Тихий час на диване',text:'Можно никуда не спешить: рядом мягкий диван и две довольные кошки.',cat:'tequila'},
 {title:'Вечерние приключения',text:'Дом готовится ко сну. У девочек на этот вечер совсем другие планы.',cat:'both'},
 {title:'Лапки у окна',text:'За окном меняется день, а дома всё ещё тепло. Ещё несколько любимых мелочей — и можно мурчать.',cat:'lime'},
 {title:'Большая уборка',text:'Лайм и Текила помогают наводить порядок. Каждая, конечно, по-своему.',cat:'both'},
 {title:'Ночная погоня',text:'Мышка шуршит где-то рядом. Текила наблюдает, а Лайм уже крадётся к дивану.',cat:'both'}
];
export const CHAPTERS=Array.from({length:LEVEL_COUNT/CHAPTER_SIZE},(_,i)=>i<STORIES.length?STORIES[i]:{
 ...THEMES[(i-3)%THEMES.length],title:THEMES[(i-3)%THEMES.length].title+' · '+(Math.floor((i-3)/THEMES.length)+1)
});
export const COLLECT_TYPES={food:0,foil:1,cable:2,spring:4,bow:5};
const TASK_ORDER=['foil','spring','bow','cords','score','mouse','cable','specials','food','cascade'];
const TASK_TITLES={foil:['Шуршащая находка','Блестящий тайник','Фольга для Лайм'],spring:['Пружинки разбежались','Прыгающая добыча','Резинка под диваном'],bow:['Бантики для девочек','Ленты и лапки','Подарок для Текилы'],cords:['Рамочки по углам','Следы на коврике','Наводим порядок'],score:['Большая кошачья игра','Лапки набирают очки','Рекорд на подоконнике'],mouse:['Шорох под диваном','Хвостатая погоня','Мышиный маршрут'],cable:['Белая змейка','Зарядка для кошек','Провод нашёлся'],specials:['Кошачья магия','Четыре лапки в ряд','Искры на коврике'],food:['Вкусная прогулка','Камушки к ужину','Хрустящий сюрприз'],cascade:['Цепная реакция','Одно за другим','Лавина игрушек']};
export const LEVELS=Array.from({length:LEVEL_COUNT},(_,i)=>{
 if(i<INTRO_LEVELS.length)return INTRO_LEVELS[i];
 const n=i-15,task=TASK_ORDER[(n+Math.floor(n/10)*3)%TASK_ORDER.length],tier=Math.min(5,Math.floor(n/100)),slot=i%CHAPTER_SIZE,variation=Math.floor(n/TASK_ORDER.length);
 let target,moves;
 if(task==='cords'){target=12+tier*2+slot*2;moves=24+(slot===0?3:0);}
 else if(task==='mouse'){target=2+(tier>=3?1:0);moves=28+(target-2)*4+(slot===0?3:0);}
 else if(task==='score'){target=4500+tier*700+slot*350;moves=23+(slot===0?3:0);}
 else if(task==='specials'){target=3+Math.floor(tier/2)+(slot===4?1:0);moves=25+(slot===0?3:0);}
 else if(task==='cascade'){target=3+Math.floor(tier/2)+(slot===4?1:0);moves=25+(slot===0?3:0);}
 else {target=22+tier*3+slot*2+variation%3;moves=23+(slot===0?3:0);}
 return {id:i+1,chapter:Math.floor(i/CHAPTER_SIZE),title:TASK_TITLES[task][variation%3],task,target,moves,...(task==='cords'?{layout:variation%6}:{} )};
});

export class Game {
 constructor(level=LEVELS[0],rng=Math.random){this.level=level;this.rng=rng;this.serial=0;this.moves=level.moves;this.progress=0;this.score=0;this.skillsUsed=new Set();this.turnsTaken=0;this.bowCharge=0;this.cords=new Set();this.mouseCount=0;this.frames=[];this.makeBoard();}
 toSave(){
  return {version:1,level:{id:this.level.id,target:this.level.target,moves:this.level.moves},
   ...this.snapshot(),serial:this.serial,mouseCount:this.mouseCount};
 }
 static restore(data,rng=Math.random){
  // Only accept a complete, settled board. Do not run the random constructor on resume.
  try{
   const integer=(v,max=1000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
   if(!data||data.version!==1||!integer(data.level?.id,LEVELS.length)||data.level.id<1)return null;
   const level=LEVELS[data.level.id-1];
   if(!integer(data.level.target,level.task==='cords'?49:level.task==='score'?100000:100)||data.level.target<1||!integer(data.level.moves,1000)||data.level.moves<1)return null;
   if(!['moves','progress','score','turnsTaken','serial','mouseCount','bowCharge'].every(k=>integer(data[k],k==='score'?1000000000:1000000))||data.bowCharge>BOW_COST)return null;
   if(!Array.isArray(data.board)||data.board.length!==49||!data.board.every(c=>c&&integer(c.id,1000000000)&&c.id>0&&integer(c.type,6)&&[null,'row','col','bomb','rainbow'].includes(c.special)&&(c.type!==6||c.special===null)))return null;
   if(new Set(data.board.map(c=>c.id)).size!==49||data.serial<Math.max(...data.board.map(c=>c.id)))return null;
   if(!Array.isArray(data.cords)||!data.cords.every(p=>integer(p,48))||new Set(data.cords).size!==data.cords.length)return null;
   if(!Array.isArray(data.skillsUsed)||new Set(data.skillsUsed).size!==data.skillsUsed.length||!data.skillsUsed.every(k=>['purr','queen','zoomies','scratch'].includes(k)))return null;
   const mice=data.board.filter(c=>c.type===6).length;
   if(level.task==='cords'?(data.cords.length+data.progress!==data.level.target):data.cords.length!==0)return null;
   if(level.task==='mouse'){
    if(mice>1||data.mouseCount>data.level.target||data.mouseCount!==data.progress+mice)return null;
    if(data.progress<data.level.target&&mice!==1)return null;
   }else if(mice||data.mouseCount)return null;
   const game=Object.assign(Object.create(Game.prototype),{level:{...level,target:data.level.target,moves:data.level.moves},rng,
    board:data.board.map(c=>({id:c.id,type:c.type,special:c.special})),cords:new Set(data.cords),skillsUsed:new Set(data.skillsUsed),frames:[]});
   for(const key of ['moves','progress','score','turnsTaken','serial','mouseCount','bowCharge'])game[key]=data[key];
   if(game.groups().length||(!game.finished&&!game.possible()))return null;
   return game;
  }catch{return null;}
 }
 cell(type){return {id:++this.serial,type:type??Math.floor(this.rng()*6),special:null};}
 makeBoard(){
  this.board=Array.from({length:49},()=>this.cell());
  for(let i=0;i<49;i++){let guard=0;while(((i%7>=2&&this.board[i].type===this.board[i-1].type&&this.board[i].type===this.board[i-2].type)||(i>=14&&this.board[i].type===this.board[i-7].type&&this.board[i].type===this.board[i-14].type))&&guard++<30)this.board[i].type=(this.board[i].type+1)%6;}
  if(this.level.task==='cords'){
   const positions=Array.from({length:49},(_,i)=>i);
   if(this.level.id<=15){for(let n=0;n<this.level.target;n++){const j=Math.floor(this.rng()*positions.length);this.cords.add(positions.splice(j,1)[0]);}}
   else{
    // Shuffle ties, then place frames in a recognisable pattern. Every cell stays playable.
    const priorities=p=>{const r=Math.floor(p/7),c=p%7;return [0,Math.min(r,c,6-r,6-c),Math.abs(r-c),Math.abs(c-3),((r+c)%2),Math.abs(r-3)+Math.abs(c-3)][this.level.layout??0];};
    const ordered=positions.map(p=>({p,rank:priorities(p),tie:this.rng()})).sort((a,b)=>a.rank-b.rank||a.tie-b.tie);
    this.cords=new Set(ordered.slice(0,this.level.target).map(x=>x.p));
   }
  }
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
  for(const p of removed){if(this.level.task in COLLECT_TYPES&&this.board[p]?.type===COLLECT_TYPES[this.level.task])this.progress++;if(this.board[p]?.type===5&&!this.skillsUsed.has('scratch'))this.bowCharge=Math.min(BOW_COST,this.bowCharge+1);this.score+=50;}
  if(this.level.task==='score')this.progress=this.score;
  this.frame(removed,removed.length>7?'Мур-комбо!':'');
  for(const p of removed)this.board[p]=null;
  for(const [p,special]of creation){if(this.board[p])this.board[p].special=special;}
  this.frame();this.drop();this.frame();this.deliver();
 }
 resolve(preferred,initialWave=0){let loops=0,wave=initialWave;while(loops++<100){const groups=this.groups();if(!groups.length)break;if(this.level.task==='cascade'&&++wave>1)this.progress++;const creation=new Map();
  for(const g of groups)if(g.cells.length>=4){const p=g.cells.includes(preferred)?preferred:g.cells[Math.floor(g.cells.length/2)];creation.set(p,g.cells.length>=5?'rainbow':g.step===1?'row':'col');}
  for(const a of groups)for(const b of groups)if(a!==b&&a.step!==b.step){const p=a.cells.find(x=>b.cells.includes(x));if(p!==undefined)creation.set(p,'bomb');}
  if(this.level.task==='specials')this.progress+=creation.size;
  this.blast(groups.flatMap(g=>g.cells),creation);preferred=undefined;
 }return loops;}
 move(a,b){this.frames=[];if(this.finished||!this.canSwap(a,b))return {valid:false,frames:[]};const x={...this.board[a]},y={...this.board[b]};this.swapCells(a,b);this.moves--;this.turnsTaken++;this.frame();
  if(x.special==='rainbow'||y.special==='rainbow'){
   const other=x.special==='rainbow'?y:x;
   const hit=this.board.map((c,i)=>(other.special==='rainbow'||c.type===other.type)&&c.type!==6?i:-1).filter(i=>i>=0);hit.push(a,b);this.blast(hit);
  }else if(x.special&&y.special){const hit=[];for(let i=0;i<49;i++)if(Math.floor(i/7)===Math.floor(a/7)||i%7===a%7||Math.floor(i/7)===Math.floor(b/7)||i%7===b%7)hit.push(i);this.blast(hit);}
  this.resolve(b,x.special==='rainbow'||y.special==='rainbow'||(x.special&&y.special)?1:0);if(!this.finished)this.ensureMoves();this.frame();return {valid:true,frames:this.frames};
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
  this.blast(hit);this.resolve(undefined,1);if(!this.finished)this.ensureMoves();
  this.frame([],kind==='scratch'?'Коготки наточены. Три столбца стали свободнее!':kind==='queen'?'Текила навела порядок. Так решила королева.':'Лайм и Текила: вечерние бесоебства начались!');return this.frames;
 }
 // This is a gentle heuristic, not a prediction of random cascades.
 get needsHusbandHelp(){
  if(this.finished||this.moves>2)return false;
  const remaining=this.level.target-this.progress;
  if(this.level.task!=='mouse'){const rate=this.level.task==='score'?600:['specials','cascade'].includes(this.level.task)?1:3;return remaining>this.moves*rate;}
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
