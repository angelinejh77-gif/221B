const CACHE='221b-v2';
const FILES=["./", "icon-180.png", "icon-192.png", "icon-512.png", "index.html", "manifest.webmanifest", "page-cabinet.html", "page-casebook.html", "page-casefile.html", "page-desk.html", "page-postcards.html", "page-records.html", "page-sky.html"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const html=r.mode==='navigate'||(r.headers.get('accept')||'').includes('text/html');
  if(html){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok&&new URL(r.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));
});
