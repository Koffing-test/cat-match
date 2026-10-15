// Photos remain on this device. Only re-encoded raster blobs enter IndexedDB.
const DATABASE='mur-mur-local-photos';
let pending;
function database(){
 if(!pending)pending=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DATABASE,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('photos');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(new Error('Не удалось открыть хранилище фотографий.'));
  request.onblocked=()=>reject(new Error('Закрой другие вкладки игры и попробуй снова.'));
 }).catch(error=>{pending=null;throw error;});
 return pending;
}
async function transaction(mode,run){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('photos',mode);const result=run(tx.objectStore('photos'));tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(new Error('Не удалось сохранить фото. Проверь свободное место на устройстве.'));});}
export async function loadPhotos(){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('photos','readonly'),s=tx.objectStore('photos'),photos=new Map();for(let i=0;i<3;i++){const r=s.get(i);r.onsuccess=()=>{const value=r.result;if(value instanceof Blob)photos.set(i,value);else if(value?.bytes instanceof ArrayBuffer&&value.mimeType==='image/jpeg')photos.set(i,new Blob([value.bytes],{type:value.mimeType}));};}tx.oncomplete=()=>resolve(photos);tx.onerror=tx.onabort=()=>reject(new Error('Не удалось прочитать фотоальбом.'));});}
export async function preparePhoto(file){
 if(!(file instanceof Blob)||file.size===0||file.size>25*1024*1024)throw new Error('Выбери фотографию размером до 25 МБ.');
 if(!/^image\/(jpeg|png|webp|heic|heif|avif)$/i.test(file.type))throw new Error('Подойдёт JPEG, PNG или WebP. Фото HEIC можно пересохранить в JPEG.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;
  try{await image.decode();}catch{throw new Error('Не удалось открыть фото. Попробуй сохранить его в JPEG.');}
  if(!image.naturalWidth||!image.naturalHeight)throw new Error('Это изображение не удалось прочитать.');
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');context.fillStyle='#fff1f5';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.86));
  if(!blob)throw new Error('Не удалось подготовить фотографию.');return blob;
 }finally{URL.revokeObjectURL(url);}
}
export async function storePhotos(entries){
 if(entries.some(([id,blob])=>!Number.isInteger(id)||id<0||id>2||!(blob instanceof Blob)||blob.type!=='image/jpeg'))throw new Error('Неверная фотография.');
 // Store bytes rather than file-backed Blobs: Safari can reject Blob persistence.
 const records=await Promise.all(entries.map(async([id,blob])=>[id,{bytes:await blob.arrayBuffer(),mimeType:'image/jpeg'}]));
 await transaction('readwrite',store=>{for(const [id,record]of records)store.put(record,id);});
}
function dataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}
export async function exportAlbum(){const photos=await loadPhotos();const entries=await Promise.all([...photos].map(async([chapter,blob])=>({chapter,image:await dataURL(blob)})));return new Blob([JSON.stringify({format:'mur-mur-photo-album',version:1,photos:entries})],{type:'application/json'});}
export async function importAlbum(file){
 if(file.size>16*1024*1024)throw new Error('Копия альбома слишком большая.');
 let data;try{data=JSON.parse(await file.text());}catch{throw new Error('Не удалось прочитать копию альбома.');}
 if(data?.format!=='mur-mur-photo-album'||data.version!==1||!Array.isArray(data.photos)||data.photos.length>3)throw new Error('Это не копия фотоальбома «Мур-мур».');
 const seen=new Set(),entries=[];
 for(const photo of data.photos){
  if(!Number.isInteger(photo?.chapter)||photo.chapter<0||photo.chapter>2||seen.has(photo.chapter)||typeof photo.image!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo.image))throw new Error('В копии альбома неверные данные.');
  seen.add(photo.chapter);let bytes;try{bytes=Uint8Array.from(atob(photo.image.split(',')[1]),c=>c.charCodeAt(0));}catch{throw new Error('Фотография в копии повреждена.');}
  // Decode and re-encode imports too: don't trust data URLs from a JSON file.
  const blob=await preparePhoto(new Blob([bytes],{type:'image/jpeg'}));entries.push([photo.chapter,blob]);
 }
 await storePhotos(entries);return entries.length;
}
