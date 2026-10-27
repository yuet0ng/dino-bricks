// Cache-first: the game opens instantly and keeps working when the network is flaky.
// A new build changes VERSION, so the browser installs this worker again and re-caches.
const VERSION = '069c45dd4b81';
const CACHE = 'dino-bricks-' + VERSION;
const SHELL = ["./","assets/Baloo2-983902d8-8NeBJN4T.woff2","assets/LilitaOne-2d81a505-CiZ7RRtu.woff2","assets/index-C78yPF7J.css","assets/index-DTrVy3-a.js","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'DINO_VERSION' && e.ports && e.ports[0]) {
    e.ports[0].postMessage({type:'DINO_VERSION', build:VERSION, version:'0.8.5'});
  }
});

// 'reload' skips the browser's HTTP cache, so a page fetched just before an update can't end up in the new set.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys(), old = keys.filter(k => k.startsWith('dino-bricks-') && k !== CACHE);
    let previous = null;
    // An old HTML response may still be loading its scripts as this worker takes over.
    for (const key of old) if (await (await caches.open(key)).match(new URL('./', location).href)) previous = key;
    await Promise.all(old.filter(k => k !== previous).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(req, {ignoreSearch: true}))
    .then(async hit => hit || await caches.match(req, {ignoreSearch: true}) || fetch(req)));
});
