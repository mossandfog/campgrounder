// Campgrounder Service Worker v4
// Strategy:
//   App shell (index.html, manifest)  → Cache-first, background update
//   Leaflet CDN assets                → Cache-first (stable, versioned URLs)
//   Map tiles (ESRI)                  → Network-first, cache fallback
//   Weather API (Open-Meteo)          → Network-only (always fresh)
//   Everything else                   → Network-first, cache fallback

const CACHE_SHELL   = 'campgrounder-shell-v4';
const CACHE_ASSETS  = 'campgrounder-assets-v4';
const CACHE_TILES   = 'campgrounder-tiles-v4';

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

const ASSET_URLS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

// ── Install: pre-cache shell + stable assets ─────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_SHELL).then(c => c.addAll(SHELL_URLS)),
      caches.open(CACHE_ASSETS).then(c =>
        Promise.allSettled(ASSET_URLS.map(u => c.add(u)))
      ),
    ])
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ───────────────────────────────
self.addEventListener('activate', e => {
  const keep = new Set([CACHE_SHELL, CACHE_ASSETS, CACHE_TILES]);
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !keep.has(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch routing ────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const { url } = e.request;

  // Never intercept non-GET or chrome-extension requests
  if (e.request.method !== 'GET' || url.startsWith('chrome-extension')) return;

  // Weather API → always go to network (needs live data)
  if (url.includes('open-meteo.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Map tiles → network-first, cache fallback, cap tile cache at 500 entries
  if (url.includes('arcgisonline.com')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_TILES).then(c => {
            c.keys().then(keys => {
              if (keys.length > 500) c.delete(keys[0]);
            });
            c.put(e.request, clone);
          });
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Leaflet CDN → cache-first (versioned, never changes)
  if (url.includes('unpkg.com/leaflet')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }

  // App shell → cache-first, revalidate in background
  if (url.includes('/index.html') || url.endsWith('/') || url.includes('/manifest.json')) {
    e.respondWith(
      caches.open(CACHE_SHELL).then(async c => {
        const cached = await c.match(e.request);
        const fetchPromise = fetch(e.request).then(res => {
          c.put(e.request, res.clone());
          return res;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default → network-first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_ASSETS).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
