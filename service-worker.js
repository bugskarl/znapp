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
        ]).then(() => self.skipWaiting())
    );
});

// Stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.match(event.request)
                    .then(cachedResponse => {
                        const fetchPromise = fetch(event.request)
                            .then(networkResponse => {
                                if (networkResponse.ok) {
                                    // Only cache successful responses
                                    const url = new URL(event.request.url);
                                    if (url.origin === location.origin || EXTERNAL_ASSETS.includes(event.request.url)) {
                                        cache.put(event.request, networkResponse.clone());
                                    }
                                }
                                return networkResponse;
                            })
                            .catch(() => cachedResponse);

                        // Return cached response immediately if available
                        return cachedResponse || fetchPromise;
                    });
            })
    );
});

// Clean up old caches and take control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName.startsWith('znapp-') && cacheName !== CACHE_NAME)
                        .map((cacheName) => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control immediately
            clients.claim()
        ])
    );
});
