self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function () {
  // Lässt alle Anfragen normal über das Netz laufen (immer aktuelle Vereinsinfos)
});
