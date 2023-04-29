// Instalar o service worker
const CACHE_NAME = "my-cache";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto");
      return cache.addAll(["/"]);
    })
  );
});
