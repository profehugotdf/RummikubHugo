// Service Worker del Rummikub — cachea lo esencial para que la app
// abra rápido como app instalada y también sin conexión.
const CACHE_NOMBRE = "rummikub-cache-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NOMBRE).then((cache) => cache.addAll(ARCHIVOS)).catch(()=>{})
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter((n) => n !== CACHE_NOMBRE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estrategia: red primero (para tener siempre la última versión si hay
// internet), y si falla, usar lo cacheado (para que abra igual sin red).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE_NOMBRE).then((cache) => cache.put(e.request, copia)).catch(()=>{});
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
