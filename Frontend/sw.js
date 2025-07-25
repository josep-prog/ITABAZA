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
  console.log("Service Worker installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", function (event) {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Don't intercept API requests to your backend
  if (requestUrl.origin === 'https://itabaza.onrender.com' || 
      requestUrl.hostname === 'itabaza.onrender.com') {
    // Let API requests pass through without interference
    return;
  }
  
  // Don't intercept navigation requests
  if (event.request.mode === 'navigate') {
    return;
  }
  
  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return a fallback
        return new Response("Offline or resource not available", {
          status: 503,
          statusText: "Service Unavailable"
        });
      })
  );
});
