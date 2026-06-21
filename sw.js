const CACHE_NAME = 'biozen-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/variables.css',
  '/assets/css/styles.css',
  '/assets/css/animations.css',
  '/assets/css/responsive.css',
  '/assets/css/app.css',
  '/assets/js/main.js',
  '/assets/js/products.js',
  '/assets/js/whatsapp.js',
  '/assets/js/zoom.js',
  '/assets/js/modal.js',
  '/assets/js/gsap-effects.js',
  '/assets/js/scrolltrigger.js',
  '/assets/js/tilt-3d.js',
  '/assets/js/analytics.js',
  '/assets/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});
