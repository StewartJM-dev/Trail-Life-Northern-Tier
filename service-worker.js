// Scope-relative caching; calendar data and pages always try the network first.
const CACHE_NAME = 'traillife-northern-tier-v2';
const ASSETS = ['index.html', 'events.html', 'css/style.css', 'js/main.js', 'js/calendar.js', 'images/TL_ClassicLogo_1_RGB.png'];
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('traillife-northern-tier-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
    event.respondWith(fetch(event.request).then(response => {
        if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)));
        }
        return response;
    }).catch(() => caches.match(event.request).then(response => response || Response.error())));
});
