// Cache-first: the game opens instantly and keeps working when the network is flaky.
// A new build changes VERSION, so the browser installs this worker again and re-caches.
const VERSION = 'c75aebcf675b';
const CACHE = 'dino-bricks-' + VERSION;
const SHELL = ["./","assets/Baloo2-983902d8-8NeBJN4T.woff2","assets/LilitaOne-2d81a505-CiZ7RRtu.woff2","assets/index-BAjveZE0.js","assets/index-CIT2a_LY.css","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];

// 'reload' skips the browser's HTTP cache, so a page fetched just before an update can't end up in the new set.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('dino-bricks-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req)));
});
