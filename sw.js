/* Bolle K317: funziona anche senza rete (l'app e la libreria PDF restano nella memoria del telefono) */
const V='bk317-v1';
const CORE=['./','./index.html','./config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    /* i file dell'app: prima la rete (così gli aggiornamenti arrivano), se manca la rete la copia salvata */
    e.respondWith(fetch(r).then(x=>{if(x&&x.ok){const cp=x.clone();caches.open(V).then(c=>c.put(r,cp))}return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));
  }else if(u.hostname==='cdnjs.cloudflare.com'){
    /* la libreria PDF: una volta scaricata resta */
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const cp=x.clone();caches.open(V).then(c=>c.put(r,cp))}return x})));
  }
});
