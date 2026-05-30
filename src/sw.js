/* App service worker — FCM must register push listeners before Workbox async setup. */
importScripts("/firebase-messaging-sw.js");
importScripts("https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js");

self.skipWaiting();
workbox.core.clientsClaim();
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
workbox.precaching.cleanupOutdatedCaches();

workbox.routing.registerRoute(
  new workbox.routing.NavigationRoute(workbox.precaching.createHandlerBoundToURL("/index.html")),
);

workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "app-shell",
    matchOptions: { ignoreVary: true },
  }),
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "image" || request.destination === "font",
  new workbox.strategies.CacheFirst({
    cacheName: "assets",
    matchOptions: { ignoreVary: true },
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);
