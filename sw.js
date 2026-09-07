const CACHE_NAME = "cuaderno-roca-v173";
const CORE_ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
const PDFJS_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try { await cache.addAll(CORE_ASSETS); } catch(e) {}
      try { await cache.addAll(PDFJS_ASSETS); } catch(e) {}
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia "red primero": siempre intenta traer la versión más reciente.
// Solo recurre a la copia guardada si no hay conexión. Así, cada vez que
// se actualiza la app, el dispositivo la ve de inmediato en cuanto haya
// internet, en vez de quedarse pegado a una copia antigua para siempre.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
