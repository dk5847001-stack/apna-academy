const CACHE_VERSION = "apnaacademy-static-v2";
const STATIC_CACHE = CACHE_VERSION;
const OFFLINE_URL = "/offline.html";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.png",
  OFFLINE_URL,
];

const isSameOrigin = (request) =>
  new URL(request.url).origin === self.location.origin;

const isStaticAssetRequest = (request) => {
  const url = new URL(request.url);
  return (
    isSameOrigin(request) &&
    ["style", "script", "font", "image"].includes(request.destination)
  );
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isSameOrigin(request)) {
    return;
  }

  // Never intercept API/auth/payment/video/PDF requests. Those remain
  // network-controlled so private or user-specific data is not cached.
  if (new URL(request.url).pathname.startsWith("/api/")) {
    return;
  }

  if (isStaticAssetRequest(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, copy);
              });
            }
            return response;
          })
          .catch(() => caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // SPA navigation: prefer the network so normal React routes stay current.
  // If the network is unavailable, serve the cached app shell/offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then(
          (cached) => cached || caches.match(OFFLINE_URL)
        )
      )
    );
  }
});
