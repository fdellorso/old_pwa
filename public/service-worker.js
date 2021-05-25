// const CACHE_NAME = 'sw-cache-example';
// const toCache = [
//   '/',
//   '/index.ejs',
//   '/javascripts/status.js',
// ];

// self.addEventListener('install', function(event) {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(function(cache) {
//         return cache.addAll(toCache);
//       })
//       .then(self.skipWaiting())
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .catch(() => {
//         return caches.open(CACHE_NAME)
//           .then((cache) => {
//             return cache.match(event.request);
//           })
//       })
//   );
// });

// self.addEventListener('activate', function(event) {
//   event.waitUntil(
//     caches.keys()
//       .then((keyList) => {
//         return Promise.all(keyList.map((key) => {
//           if (key !== CACHE_NAME) {
//             console.log('[ServiceWorker] Removing old cache', key);
//             return caches.delete(key);
//           }
//         }))
//       })
//       .then(() => self.clients.claim())
//   );
// });

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

workbox.routing.registerRoute(
    /\.(?:css|js)$/,
    new workbox.strategies.StaleWhileRevalidate({
        "cacheName": "assets",
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 1000,
                maxAgeSeconds: 31536000
            })
        ]
    })
);

workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|gif|bmp|webp|svg|ico)$/,
    new workbox.strategies.CacheFirst({
        "cacheName": "images",
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 1000,
                maxAgeSeconds: 31536000
            })
        ]
    })
);
