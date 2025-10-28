// sw.js
const CACHE_NAME = 'erosion-offline-v16'; // ⬅️ súbelo para forzar update
const STATIC_ASSETS = [
  './',
  './index.html',
  './choices.json',   // ⬅️ importante para que se cachee
  './sw.js'
  // agrega otros archivos si corresponde (css, icons, etc.)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Cache-first con actualización en segundo plano para GET
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // no manejar POST/otros

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        // Sólo cachea respuestas OK y mismo origen
        if (res && res.ok && new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Si falla la red, entrega el cache si existe
        return cached;
      });

      // Respuesta inmediata del cache, y si no hay, de la red
      return cached || fetchPromise;
    })
  );
});
