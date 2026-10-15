const CACHE='mur-mur-v6-husband-help';
const FILES=['./','./index.html','./style.css','./app.js','./engine.js','./art.js','./assets/items.svg','./assets/sofa-cozy.png','./photos.js','./gallery.js','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/fonts/manrope-500.ttf','./assets/fonts/manrope-700.ttf','./assets/fonts/manrope-600.ttf','./assets/fonts/manrope-400.ttf','./assets/fonts/comfortaa-600.ttf','./assets/fonts/manrope-800.ttf','./assets/fonts/comfortaa-700.ttf','./assets/fonts/comfortaa-500.ttf'];
FILES.push(...Array.from({length:37},(_,i)=>{const base='./assets/gallery/photo-'+String(i+1).padStart(3,'0');return [base+'.jpg',base+'-thumb.jpg'];}).flat());
// Query-versioned assets prevent stale HTTP caches from hiding new illustrations/code.
for(let i=0;i<FILES.length;i++)if(/\.(js|css|svg|png)$/.test(FILES[i]))FILES[i]+='?v=6';
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Keep previous release assets while an open game may still reference them.
 await self.clients.claim();
 const keys=(await caches.keys()).filter(k=>k.startsWith('mur-mur-'));
 await Promise.all(keys.filter(k=>k!==CACHE&&k!==keys.filter(key=>key!==CACHE).at(-1)).map(k=>caches.delete(k)));
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{
   try{const response=await fetch(new Request(event.request,{cache:'no-store'}));if(response.ok)return response;}catch{}
   return (await caches.open(CACHE)).match('./index.html');
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),hit=await cache.match(event.request);
  if(hit)return hit;
  try{return await fetch(new Request(event.request,{cache:'no-cache'}));}catch(error){
   const old=await caches.match(event.request);if(old)return old;throw error;
  }
 })());
});
