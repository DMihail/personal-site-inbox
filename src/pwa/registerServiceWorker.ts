import { waitForServiceWorkerActive } from "@/pwa/waitForServiceWorker";

let registerPromise: Promise<ServiceWorkerRegistration | null> | null = null;

/** Registers `/sw.js` immediately (production PWA). Safe to call multiple times. */
export function registerAppServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  registerPromise ??= navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => waitForServiceWorkerActive(registration))
    .catch(() => null);

  return registerPromise;
}
