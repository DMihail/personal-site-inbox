import { waitForServiceWorkerActive } from "@/pwa/waitForServiceWorker";
import { getServiceWorkerActivationTimeoutMs } from "@/pwa/runtime";

const FCM_SW_URL = "/firebase-messaging-sw.js";

function scriptUrl(reg: ServiceWorkerRegistration): string {
  const w = reg.active ?? reg.installing ?? reg.waiting;
  return w?.scriptURL ?? "";
}

function isFcmWorker(reg: ServiceWorkerRegistration): boolean {
  return scriptUrl(reg).includes("firebase-messaging-sw");
}

/** Non-FCM workers at `/` break background push — remove Workbox and legacy scopes. */
async function removeCompetingRegistrations(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((reg) => !isFcmWorker(reg))
      .map((reg) => reg.unregister().catch(() => undefined)),
  );

  if (typeof caches === "undefined") return;
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter(
        (name) =>
          name.includes("workbox") ||
          name.includes("precache") ||
          name === "assets" ||
          name.includes("app-shell"),
      )
      .map((name) => caches.delete(name)),
  );
}

let inflightRegister: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Single FCM service worker for all platforms.
 * Token from `getToken()` must use this same registration.
 */
export async function ensureFcmServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  if (!inflightRegister) {
    inflightRegister = (async () => {
      const timeoutMs = getServiceWorkerActivationTimeoutMs();
      await removeCompetingRegistrations();

      const registrations = await navigator.serviceWorker.getRegistrations();
      const active = registrations.find((reg) => isFcmWorker(reg) && reg.active);
      if (active) return active;

      const pending = registrations.find(isFcmWorker);
      if (pending) {
        try {
          const ready = await waitForServiceWorkerActive(pending, timeoutMs);
          if (ready.active) return ready;
        } catch {
          if (pending.active) return pending;
        }
      }

      try {
        const reg = await navigator.serviceWorker.register(FCM_SW_URL, { scope: "/" });
        try {
          return await waitForServiceWorkerActive(reg, timeoutMs);
        } catch {
          return reg.active ? reg : null;
        }
      } catch (error) {
        console.warn("[push] FCM service worker registration failed", error);
        return null;
      }
    })().finally(() => {
      inflightRegister = null;
    });
  }

  return inflightRegister;
}

export async function getActiveFcmRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.find((reg) => isFcmWorker(reg) && reg.active) ?? null;
}
