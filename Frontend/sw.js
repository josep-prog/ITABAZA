const CACHE_NAME = "itabaza-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/Styles/land.css",
  "/Scripts/navbar.js",
  "/Scripts/footer.js",
  "/Files/favicon.ico",
  // add other key files like offline.html, images, etc.
];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Install service worker
self.addEventListener("install", function (e) {
  console.log("Service Worker installed");
  self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", function (event) {
  console.log("Service Worker activated");
  // Clear old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch handler that doesn't interfere with API calls
self.addEventListener("fetch", function (event) {
  // Skip API requests - let them go directly to network
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/department/') ||
      event.request.url.includes('/doctor/') ||
      event.request.url.includes('/appointment/') ||
      event.request.url.includes('/admin/') ||
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/user/')) {
    return; // Let API requests pass through without interference
  }
  
  // Only cache static resources
  if (event.request.destination === 'document' ||
      event.request.destination === 'script' ||
      event.request.destination === 'style' ||
      event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          // Only cache successful responses
          if (fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return fetchResponse;
        }).catch(() => {
          // Return cached version if network fails
          return caches.match(event.request);
        });
      })
    );
  }
});
