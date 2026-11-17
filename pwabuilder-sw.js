const CACHE = "pomodoro-v1";

const FILES = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "animation.js",
  "manifest.json",
  "clouds.png",
  "coffee1.png",
  "coffee2.png",
  "cat1.png",
  "cat2.png",
  "moon1.png",
  "moon2.png",
  "images/icon1.png",
  "images/icon2.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});