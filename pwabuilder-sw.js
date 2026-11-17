const CACHE = "pomodoro2";

const FILES = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "animation.js",
  "manifest.json",
  "clouds.png",
  "favicon.png",
  "folder1.png",
  "coffee1.png",
  "coffee2.png",
  "coffee3.png",
  "coffee4.png",
  "coffee5.png",
  "cat1.png",
  "cat2.png",
  "cat3.png",
  "moon1.png",
  "moon2.png",
  "moon3.png",
  "moon4.png",
  "moon5.png",
  "images/icon1.png",
  "images/icon2.png",
  "images/icon3.png"
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