const CACHE = 'biozen-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/variables.css',
  '/assets/css/styles.css',
  '/assets/css/responsive.css',
  '/assets/css/animations.css',
  '/assets/css/app.css',
  '/assets/css/testimonials.css',
  '/assets/js/whatsapp.js',
  '/assets/js/products.js',
  '/assets/js/modal.js',
  '/assets/js/gsap-effects.js',
  '/assets/js/analytics.js',
  '/assets/js/main.js',
  '/assets/js/app.js',
  '/assets/js/testimonials.js',
  '/assets/js/sw-register.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request).then(function (response) {
        if (response && response.status === 200 && event.request.method === 'GET') {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function () {
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});
