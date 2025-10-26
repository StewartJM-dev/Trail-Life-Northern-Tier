// Trail Life Northeast Region - Service Worker
// Version 1.0.0

const CACHE_NAME = 'traillife-northeast-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/blog.html',
  '/resources.html',
  '/events.html',
  '/gallery.html',
  '/troops.html',
  '/spotlight.html',
  '/leaders.html',
  '/achievements.html',
  '/contact.html',
  '/css/style.css',
  '/js/main.js',
  '/images/TL_ClassicLogo_1_RGB.png',
  '/images/TL_ClassicLogo_3_RGB.png',
  '/images/TL_Block_Logo-Tag_RGB.png',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
