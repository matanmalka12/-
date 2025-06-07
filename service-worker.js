self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('date-app').then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './cards.js',
        './script.js',
        './style.css'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request);
    })
  );
});
