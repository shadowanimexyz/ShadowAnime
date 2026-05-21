const CACHE_NAME = "shadow-anime-v1";

const FILES_TO_CACHE = [
  "index.html",
  "Anime.html",
  "movies.html",
  "popular.html",
  "manga.html",
  "community.html",
  "watchlist.html",
  "policy.html",
  "profile.html",
  "style.css",
  "script.js",
  "site-control.js",
  "smart-search.js",
  "anime.json",
  "movies.json",
  "manga.json",
  "image/icon-192.png",
  "image/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if(key !== CACHE_NAME){
          return caches.delete(key);
        }
      }))
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});