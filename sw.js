const VERSION='adiel-portfolio-20261017-r5';
const BASE=new URL('./',self.location.href);
const FILES=['./','index.html','styles.css?v=20261017-r5','marketing.css?v=20261017-r5','editorial.css?v=20261017-r5','app.js?v=20261017-r5','projects.js?v=20261017-r5','project-utils.js?v=20261017-r5','sculpture.js?v=20261017-r5','platformer.js?v=20261017-r5','platformer.css?v=20261017-r5','gallery.css?v=20261017-r5','reference-polish.css?v=20261017-r5','theme.js?v=20261017-r5','theme.css?v=20261017-r5','assets/gallery/automacao.webp','assets/gallery/dados.webp','assets/gallery/sistemas.webp','assets/gallery/estudos.webp','motion-scenes.js?v=20261017-r5','motion-scenes.css?v=20261017-r5','offline.js?v=20261017-r5','manifest.webmanifest','assets/favicon.svg','assets/adiel-alves-linkedin.webp','assets/adiel-portrait-mask.png','assets/skills/python.svg','assets/skills/javascript.svg','assets/marketing/reel-efapi-novidade.jpg','assets/marketing/reel-efapi-pov.jpg','assets/marketing/reel-efapi-atencao.jpg','assets/marketing/arte-concordia-teo.jpg','assets/marketing/arte-concordia-obras.jpg'];
const URLS=FILES.map(file=>new URL(file,BASE).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(URLS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('adiel-portfolio-')&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='CHECK_OFFLINE'&&event.ports[0])event.waitUntil(caches.open(VERSION).then(async cache=>{const found=await Promise.all(URLS.map(url=>cache.match(url)));event.ports[0].postMessage({ready:found.every(Boolean),version:VERSION});}));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>response.ok?response:caches.open(VERSION).then(cache=>cache.match(new URL('index.html',BASE).href))).catch(()=>caches.open(VERSION).then(cache=>cache.match(new URL('index.html',BASE).href))));return;}
 if(URLS.includes(url.href))event.respondWith(caches.open(VERSION).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
