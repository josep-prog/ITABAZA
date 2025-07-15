const CACHE = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', ev =>
  ev.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urlsToCache)))
);

self.addEventListener('fetch', ev =>
  ev.respondWith(caches.match(ev.request).then(r => r || fetch(ev.request)))
);
