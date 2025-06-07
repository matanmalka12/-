
const CACHE_NAME = 'date-app-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './cards.js',
  './script.js',
  './style.css',
  './manifest.json',
  './icon-192.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting(); // הפעלה מיידית של גרסה חדשה
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // שליטה מיידית על הדפים
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    // always go to network first for navigation (prevents stale pages)
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('./index.html')
      )
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request).catch(() => {
          return new Response('⚠️ לא ניתן לטעון את הבקשה – ייתכן שאין חיבור לרשת.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
    );
  }
});
