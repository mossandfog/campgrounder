// Campgrounder Service Worker v6
// Strategy:
//   SPA navigations (deep links)      → Network-first, fall back to cached app shell (never trap users on a 404)
//   App shell (index.html, manifest)  → Network-first, cache fallback (ensures fresh deploys show immediately)
//   Leaflet CDN assets                → Cache-first (stable, versioned URLs)
//   Map tiles (ESRI)                  → Network-first, cache fallback
//   Weather API (Open-Meteo)          → Network-only (always fresh)
//   Everything else                   → Network-first, cache fallback
// Note: only successful (200) responses are ever cached, so a transient 404 can't get stuck.

const CACHE_SHELL   = 'campgrounder-shell-v6';
const CACHE_ASSETS  = 'campgrounder-assets-v6';
const CACHE_TILES   = 'campgrounder-tiles-v6';

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

  // SPA navigations (e.g. /campgrounds/<slug> on refresh or deep link) →
  // network-first, but ALWAYS fall back to the cached app shell so the single-page
  // app can boot and route client-side. This guarantees deep links never dead-end
  // on a server 404, even before a routing fix has fully propagated.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_SHELL).then(c => c.put('/', clone));
            return res;
          }
          // Non-OK (e.g. 404) → serve the cached app shell instead
          return caches.match('/').then(shell => shell || caches.match('/index.html') || res);
        })
        .catch(() => caches.match('/').then(shell => shell || caches.match('/index.html')))
    );
    return;
  }

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

  // App shell → network-first, cache fallback (so fresh deploys show on next visit, not second visit)
  if (url.includes('/index.html') || url.endsWith('/') || url.includes('/manifest.json')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_SHELL).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Default → network-first, cache fallback (only cache successful responses)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_ASSETS).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
