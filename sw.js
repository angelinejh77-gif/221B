const CACHE='221b-v35';
const FILES=["./", "icon-180.png", "icon-192.png", "icon-512.png", "index.html", "photos.js", "photos/mirror.jpg", "photos/rainy-cab.jpg", "photos/kl-street.jpg", "photos/london-night.jpg", "photos/cafe.jpg", "photos/sofa.jpg", "photos/waltz.jpg", "photos/qipao.jpg", "letter.js", "letter.css", "persona.js", "chat.js", "manifest.webmanifest", "page-cabinet.html", "page-casebook.html", "page-casefile.html", "page-desk.html", "page-postcards.html", "page-records.html", "page-sky.html", "page-letter-case.html", "page-letter-2026-10-18.html", "page-letters.html", "letters-index.js", "page-violin.html", "page-moon.html", "page-palace.html", "page-street.html", "page-thread.html", "page-mixtape.html", "page-cipher.html", "page-tea.html", "page-watch.html", "page-score.html", "hourly.js", "memories.js", "tellhim.js","chatbridge.js", "page-bouquet.html", "page-kiss.html", "kiss.mp3", "kiss-art.jpg", "page-hourly.html", "page-journal.html", "page-dayas.html", "page-typewriter.html", "page-telegram.html", "page-fluster.html", "page-dictionary.html", "page-contract.html", "page-tickets.html", "page-seal.html", "page-crossword.html", "page-typewriter-case.html"];
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
