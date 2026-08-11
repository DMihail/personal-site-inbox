/* App service worker — FCM (bundled) must register before Workbox precache. */
import { registerFirebaseMessagingBackground } from "./pwa/firebaseMessagingBackground";
import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import {
  WORKBOX_ASSETS_MAX_AGE_SECONDS,
  WORKBOX_ASSETS_MAX_ENTRIES,
} from "./pwa/workboxCacheLimits.js";

registerFirebaseMessagingBackground();

self.addEventListener("message", (event) => {
  if (event?.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/** Drop legacy duplicate runtime cache (precache already covers JS/CSS). */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((name) => name.includes("app-shell")).map((name) => caches.delete(name)),
        ),
      ),
  );
});

/** Must run at top level — `clientsClaim()` only registers an `activate` listener. */
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

registerRoute(
  ({ request }) => request.destination === "image" || request.destination === "font",
  new CacheFirst({
    cacheName: "assets",
    matchOptions: { ignoreVary: true },
    plugins: [
      new ExpirationPlugin({
        maxEntries: WORKBOX_ASSETS_MAX_ENTRIES,
        maxAgeSeconds: WORKBOX_ASSETS_MAX_AGE_SECONDS,
      }),
    ],
  }),
);
