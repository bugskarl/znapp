const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `znapp-v${CACHE_VERSION}`;

const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './manifest.json',
    './icon.svg'
];

const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Caching external assets');
                return cache.addAll(EXTERNAL_ASSETS);
            })
        ])
    );
    // Force activation
    self.skipWaiting();
});

// Network first, then cache for dynamic content
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Handle the fetch
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Check if we received a valid response
                if (!response || response.status !== 200) {
                    throw Error('Invalid response');
                }

                // Only cache local assets
                const url = new URL(event.request.url);
                if (url.origin === location.origin) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                }

                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        // If not in cache, return a basic offline page
                        return new Response('Offline - No cached version available');
                    });
            })
    );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('znapp-') && cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all clients
            clients.claim()
        ])
    );
});
