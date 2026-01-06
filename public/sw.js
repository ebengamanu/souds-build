const CACHE_NAME = 'sounds-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tentative de mise en cache des assets critiques
        return cache.addAll(urlsToCache).catch(err => console.warn('Erreur cache addAll', err));
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retourner la réponse
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200) {
              return response;
            }
            
            // On cache les requêtes standards, Tailwind et les icônes
            const isBasic = response.type === 'basic';
            const isTailwind = event.request.url.includes('cdn.tailwindcss.com');
            const isFlaticon = event.request.url.includes('cdn-icons-png.flaticon.com');

            if (isBasic || isTailwind || isFlaticon) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
            }

            return response;
          }
        ).catch(() => {
           // Fallback pour la navigation (SPA) en cas de hors-ligne total
           if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
           }
        });
      })
  );
});

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
  event.waitUntil(clients.claim());
});