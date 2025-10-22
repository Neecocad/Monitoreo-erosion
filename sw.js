// Sube la versión para forzar recacheo
const CACHE_NAME = 'erosion-offline-v12';

// Todo lo necesario para funcionar sin señal
const ASSETS = [
  './',                // raíz del sitio en GitHub Pages
  './index.html',
  './choices.json',
  './manifest.json',
  './sw.js'
];

// Instala: precachea
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activa: elimina caches antiguos y toma control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: cache-first y, MUY IMPORTANTE, ignorar query (?v=...)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Cachear on-the-fly lo del mismo origen
        const url = new URL(req.url);
        if (url.origin === location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

    })
  );
});
