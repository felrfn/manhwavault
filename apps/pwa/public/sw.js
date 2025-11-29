// Versioned cache names
const STATIC_CACHE = "mv-static-v2";
const IMAGE_CACHE = "mv-images-v1";
// Core app shell + frequently used static assets
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  // Home showcase images
  "/home1.jpeg",
  "/home2.jpg",
  "/home3.jpg",
  "/home4.webp",
  // Nav icons (adjust if filenames differ)
  "/nav/library.png",
  "/nav/browse.png",
  "/nav/watchlist.png",
  "/nav/review.png",
  "/nav/profile.png",
  // Loading indicator (must be cached forever)
  "/loading.gif",
];

// Image cache constraints
const MAX_IMAGE_ENTRIES = 120; // adjust based on expected usage
const MAX_IMAGE_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const valid = new Set([STATIC_CACHE, IMAGE_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !valid.has(k)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
      });
      for (const client of clients) {
        client.postMessage({ type: "OFFLINE_READY" });
      }
    })()
  );
});

async function cleanImageCache() {
  const cache = await caches.open(IMAGE_CACHE);
  const requests = await cache.keys();
  // Remove old or excess entries
  for (const req of requests) {
    const res = await cache.match(req);
    if (!res) continue;
    const dateHeader = res.headers.get("sw-cache-added");
    if (dateHeader) {
      const age = Date.now() - Number(dateHeader);
      if (age > MAX_IMAGE_AGE_MS) {
        await cache.delete(req);
        continue;
      }
    }
  }
  const remaining = await cache.keys();
  if (remaining.length > MAX_IMAGE_ENTRIES) {
    // naive trim: delete oldest based on header
    const entriesWithTime = await Promise.all(
      remaining.map(async (r) => {
        const res = await cache.match(r);
        const t = res?.headers.get("sw-cache-added") || `${Date.now()}`;
        return { r, t: Number(t) };
      })
    );
    entriesWithTime.sort((a, b) => a.t - b.t); // oldest first
    const toDelete = entriesWithTime.slice(
      0,
      entriesWithTime.length - MAX_IMAGE_ENTRIES
    );
    await Promise.all(toDelete.map(({ r }) => cache.delete(r)));
  }
}

async function cacheImage(request, networkResponse) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    // augment response with timestamp header by creating a new Response
    const headers = new Headers(networkResponse.headers);
    headers.set("sw-cache-added", `${Date.now()}`);
    const body = await networkResponse.arrayBuffer();
    const cachedResponse = new Response(body, {
      status: networkResponse.status,
      statusText: networkResponse.statusText,
      headers,
    });
    await cache.put(request, cachedResponse);
    cleanImageCache();
  } catch (err) {
    // swallow errors silently
  }
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Ignore analytics or other non-cacheable stuff
  if (url.pathname.startsWith("/api/")) return; // let network handle API (could add stale-while-revalidate later)

  // Image runtime caching (same-origin or cross-origin if CORS allows)
  if (request.destination === "image") {
    e.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached; // cache-first
        try {
          const resp = await fetch(request, { mode: request.mode });
          if (resp && resp.ok) cacheImage(request, resp.clone());
          return resp;
        } catch (err) {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Static asset caching
  e.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const resp = await fetch(request);
        if (resp && resp.ok && url.origin === self.location.origin) {
          cache.put(request, resp.clone());
        }
        return resp;
      } catch (err) {
        return cached || Response.error();
      }
    })()
  );
});
