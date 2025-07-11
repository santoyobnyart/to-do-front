const STATIC_CACHE_NAME = 'todo-app-static-v1';
const DYNAMIC_CACHE_NAME = 'todo-app-dynamic-v1';

// NOTA: Recuerda actualizar esta lista con los archivos de tu carpeta 'dist/assets'
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.css', 
  // Ejemplo de cómo se verían los archivos de Vite:
  // '/assets/index-aBC123de.js',
  // '/assets/index-fGH456ij.css',
  '/icons/icon192x192.png',
  '/icons/icon512x512.png'
];

// 1. Instalar el Service Worker y cachear el App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Cacheando el App Shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

// 2. Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Interceptar peticiones con la estrategia "Cache, falling back to Network"
self.addEventListener('fetch', (event) => {
  // Para las rutas de navegación (HTML), devuelve el index.html principal
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match('/index.html'));
    return;
  }

  // Para otros recursos, aplica la estrategia de caché
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el recurso está en caché, lo devuelve.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no, lo busca en la red.
      return fetch(event.request).then((networkResponse) => {
        
        // --- INICIO DE LA CORRECCIÓN ---
        // Solo cacheamos las peticiones válidas (ignoramos las de extensiones de chrome, etc.)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        // --- FIN DE LA CORRECCIÓN ---

        return networkResponse;
      });
    })
  );
});