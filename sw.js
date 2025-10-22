// AUMENTA ESTE NOMBRE SI ACTUALIZAS (obliga a recachear)
const CACHE_NAME = 'erosion-offline-v5';

// Archivos que deben quedar disponibles sin señal
const ASSETS = [
  './',                // importante para GitHub Pages
  './index.html',
  './choices.json',
  './manifest.json',
  './sw.js'
];

// Instala y precachea
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activa, limpia caches viejos y toma control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia cache-first con fallback a red
self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Opcional: cachear on-the-fly si pertenece a nuestro origen
        const url = new URL(req.url);
        if (url.origin === location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => cached); // si falla red, devuelve lo que haya
    })
  );
});
