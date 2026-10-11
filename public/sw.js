// Bump the version to purge every older cache on activate.
const CACHE_NAME = "regards-perdus-v2";
const IMAGE_CACHE_NAME = "regards-perdus-images-v2";
const MAX_IMAGE_ENTRIES = 150;
const OFFLINE_URL = "/offline";

// Only the offline page is precached; dynamic HTML pages are never precached.
const PRECACHE_ASSETS = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const keep = [CACHE_NAME, IMAGE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !keep.includes(name))
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Keep the image cache bounded: drop the oldest entries beyond the limit.
async function trimImageCache() {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const keys = await cache.keys();
  const excess = keys.length - MAX_IMAGE_ENTRIES;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}

// Cache-first: serve from any cache, otherwise fetch and store in `cacheName`.
// The write is registered with event.waitUntil so the browser can't stop the
// worker once the response is delivered, before the entry is stored.
function cacheFirst(event, cacheName, afterPut) {
  const { request } = event;
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request).then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        event.waitUntil(
          caches
            .open(cacheName)
            .then(async (cache) => {
              await cache.put(request, responseClone);
              if (afterPut) await afterPut();
            })
            .catch(() => {})
        );
      }
      return response;
    });
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API requests and admin pages
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  // Navigations: network first, offline page as fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone))
                .catch(() => {})
            );
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Content-hashed build assets never change: cache first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event, CACHE_NAME));
    return;
  }

  // Images: cache first, bounded cache
  if (request.destination === "image") {
    event.respondWith(cacheFirst(event, IMAGE_CACHE_NAME, trimImageCache));
    return;
  }

  // Other assets: network first, cache fallback. Only same-origin responses
  // are cached, and never RSC payloads (per-navigation, unbounded).
  const cacheable =
    url.origin === self.location.origin &&
    !url.searchParams.has("_rsc") &&
    request.headers.get("RSC") !== "1";

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (cacheable && response.ok) {
          const responseClone = response.clone();
          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
              .catch(() => {})
          );
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
