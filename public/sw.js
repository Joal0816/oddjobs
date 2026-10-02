/* oddJobs service worker — hand-written, zero dependencies.
 *
 * Caching strategies
 * ------------------
 *  /_next/static/**     cache-first      (content-hashed & immutable)
 *  navigations (HTML)   stale-while-revalidate, then network, then cache,
 *                       then the offline fallback page
 *  images / other GET    cache-first with a bounded LRU cache (~60 entries)
 *
 * Never cached: non-GET, POST, anything under /api/, cross-origin requests.
 */

// Bump this to invalidate every cache at once on a deploy.
const CACHE_VERSION = "v1";

const PRECACHE = `oddjobs-precache-${CACHE_VERSION}`;
const RUNTIME = `oddjobs-runtime-${CACHE_VERSION}`;
const PAGES = `oddjobs-pages-${CACHE_VERSION}`;

// App shell — must stay small; these are what make the first load work offline.
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/logo-circle.png",
  "/favicon.ico",
  "/apple-touch-icon.png",
];

const MAX_RUNTIME_ENTRIES = 60;
const OFFLINE_URL = "/offline.html";

// ---------------------------------------------------------------------------
// install — precache the app shell
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      // A single missing file must not fail the whole install.
      .catch(() =>
        caches.open(PRECACHE).then((cache) =>
          Promise.all(
            PRECACHE_URLS.map((url) =>
              fetch(url, { credentials: "same-origin" })
                .then((res) => res.ok && cache.put(url, res))
                .catch(() => undefined)
            )
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// activate — drop caches from previous CACHE_VERSIONs, claim open clients
// ---------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  const keep = new Set([PRECACHE, RUNTIME, PAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only same-origin GET requests are ever eligible.
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  const url = new URL(request.url);

  // Never touch the API layer (e.g. /api/crawl) — it must always hit the network.
  if (url.pathname.startsWith("/api/")) return;

  // Hashed build assets: safe to cache forever.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Page navigations: serve fast from cache, refresh in the background,
  // fall back to the network, then to the cached page, then to offline.html.
  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(event, request));
    return;
  }

  // Images and other same-origin static files: bounded cache-first.
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script" ||
    url.pathname.startsWith("/_next/image")
  ) {
    event.respondWith(cacheFirstBounded(request));
    return;
  }

  // Everything else: try cache, then network (without writing to a cache).
  event.respondWith(cacheFirst(request, { write: false }));
});

// ---------------------------------------------------------------------------
// strategies
// ---------------------------------------------------------------------------

/** Cache-first, optionally writing the response back into the cache. */
async function cacheFirst(request, { write = true } = {}) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (write && response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

/** Cache-first with a cap: once over MAX_RUNTIME_ENTRIES, evict oldest-first. */
async function cacheFirstBounded(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    if (keys.length > MAX_RUNTIME_ENTRIES) {
      // `keys()` returns insertion order, so the front is the oldest.
      await Promise.all(
        keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES).map((key) => cache.delete(key))
      );
    }
  }
  return response;
}

/**
 * Stale-while-revalidate for navigations:
 *   cached page shown immediately + refreshed in background;
 *   if uncached, try network; if offline, use cached "/" ; last resort offline.html.
 */
async function navigationHandler(event, request) {
  const cache = await caches.open(PAGES);

  // Refresh in the background while we answer from cache.
  // event.waitUntil() keeps the SW alive until the revalidation lands.
  const refresh = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  event.waitUntil(refresh);

  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await refresh;
  if (response) return response;

  // Offline: prefer the cached shell, then the offline fallback page.
  const shell = (await cache.match("/")) || (await caches.match("/"));
  if (shell) return shell;

  const offline = await caches.match(OFFLINE_URL);
  if (offline) return offline;

  return new Response("You are offline.", {
    status: 503,
    headers: { "Content-Type": "text/plain" },
  });
}
