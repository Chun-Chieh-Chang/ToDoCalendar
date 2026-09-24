// Versioned per build via the ?v= query set in main.tsx; old caches are purged on activate
const BUILD_ID = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_NAME = `todocalendar-${BUILD_ID}`;
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // cache: 'reload' bypasses the HTTP cache (GitHub Pages sends max-age=600),
      // which could otherwise hand the new worker the previous build's index.html
      const fresh = (url) => new Request(url, { cache: 'reload' });
      await cache.addAll(ASSETS_TO_CACHE.map(fresh));
      // Precache this build's hashed entry JS/CSS. Old caches are deleted on
      // activate, so the new cache must be complete for offline use on its own.
      const html = await (await cache.match('./index.html')).text();
      const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
      await cache.addAll(assets.map(fresh));
    })
  );
  self.skipWaiting();
});

const purgeOldCaches = () =>
  caches.keys().then((cacheNames) =>
    Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
  );

self.addEventListener('activate', (event) => {
  event.waitUntil(purgeOldCaches().then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  // We only cache GET requests
  if (event.request.method !== 'GET') return;

  // Page navigations: network first so an online user always gets the latest
  // index.html (and therefore the latest hashed assets); cache is the offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Other assets: stale-while-revalidate (hashed filenames make stale hits safe)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails, we've already tried to return from cache
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('./');
    })
  );
});

