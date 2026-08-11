import { waitForServiceWorkerActive } from "@/pwa/waitForServiceWorker";
import { getServiceWorkerActivationTimeoutMs } from "@/pwa/runtime";
import { isPwaRuntime } from "@/pwa/config";
import { isTelegramMiniApp } from "@/telegram/detect";

/** Unified Workbox + FCM service worker (see `src/sw.js`). */
export const APP_SERVICE_WORKER_URL = "/sw.js";

function scriptUrl(reg: ServiceWorkerRegistration): string {
  const w = reg.active ?? reg.installing ?? reg.waiting;
  return w?.scriptURL ?? "";
}

/** Primary app SW — Workbox precache that bundles FCM (`firebase/messaging/sw`). */
export function isAppServiceWorker(reg: ServiceWorkerRegistration): boolean {
  const url = scriptUrl(reg);
  return url.includes("/sw.js") && !url.includes("firebase-messaging-sw");
}

/** Legacy standalone FCM SW — competes with `/sw.js` at scope `/`. */
export function isLegacyMessagingServiceWorker(reg: ServiceWorkerRegistration): boolean {
  return scriptUrl(reg).includes("firebase-messaging-sw");
}

/**
 * Removes standalone `/firebase-messaging-sw.js` registrations so only `/sw.js` owns scope `/`.
 * Does not wipe Workbox caches (offline shell depends on them).
 */
async function migrateAwayFromLegacyMessagingSw(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter(isLegacyMessagingServiceWorker)
      .map((reg) => reg.unregister().catch(() => undefined)),
  );
}

let inflightRegister: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Ensures a single production SW: `/sw.js` (FCM background + Workbox offline).
 * Safe to call repeatedly — one in-flight registration.
 */
export async function ensureAppServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  if (!isPwaRuntime) return null;
  if (isTelegramMiniApp()) return null;

  if (!inflightRegister) {
    inflightRegister = (async () => {
      const timeoutMs = getServiceWorkerActivationTimeoutMs();
      await migrateAwayFromLegacyMessagingSw();

      const registrations = await navigator.serviceWorker.getRegistrations();
      const active = registrations.find((reg) => isAppServiceWorker(reg) && reg.active);
      if (active) return active;

      const pending = registrations.find(isAppServiceWorker);
      if (pending) {
        try {
          const ready = await waitForServiceWorkerActive(pending, timeoutMs);
          if (ready.active) return ready;
        } catch {
          if (pending.active) return pending;
        }
      }

      try {
        const reg = await navigator.serviceWorker.register(APP_SERVICE_WORKER_URL, {
          scope: "/",
        });
        try {
          return await waitForServiceWorkerActive(reg, timeoutMs);
        } catch {
          return reg.active ? reg : null;
        }
      } catch (error) {
        console.warn("[pwa] App service worker registration failed", error);
        return null;
      }
    })().finally(() => {
      inflightRegister = null;
    });
  }

  return inflightRegister;
}

export async function getAppServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.find((reg) => isAppServiceWorker(reg) && reg.active) ?? null;
}

/** Ask waiting SW to activate (handled in `src/sw.js` via SKIP_WAITING). */
export function requestAppServiceWorkerUpdate(
  registration: ServiceWorkerRegistration | null | undefined,
): void {
  registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
}
