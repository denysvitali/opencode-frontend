// Service worker for PWA capabilities
// Dynamic cache name - will be replaced during build with actual commit hash
const CACHE_NAME = 'opencode-frontend-__COMMIT_HASH__';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW Install: Cache name:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Force activation of new SW
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW Activate: Current cache name:', CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('SW Activate: Found caches:', cacheNames);
        const oldCaches = cacheNames.filter((cacheName) => cacheName !== CACHE_NAME);
        console.log('SW Activate: Deleting old caches:', oldCaches);
        return Promise.all(
          oldCaches.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Return cached version
          return response;
        }
        // Fetch from network
        return fetch(event.request).catch((error) => {
          console.error('SW Fetch failed for:', event.request.url, error);
          // For navigation requests, return index.html from cache
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          throw error;
        });
      })
  );
});

// Handle background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // TODO: Implement message queue sync when online
      console.log('Background sync triggered')
    );
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'opencode-notification'
      })
    );
  }
});
