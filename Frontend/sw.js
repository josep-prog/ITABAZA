self.addEventListener("install", function (e) {
  console.log("✅ Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("✅ Service Worker activated");
});

self.addEventListener("fetch", function (event) {
  if (event.request.mode === 'navigate') {
    // Let navigation requests pass through
    return;
  }
  event.respondWith(fetch(event.request).catch(() => {
    return new Response("Offline or resource not available");
  }));
});
