import {
  isMessagingServiceWorker,
  isPushCapableServiceWorker,
  isWorkboxServiceWorker,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";
import { getServiceWorkerActivationTimeoutMs } from "@/pwa/runtime";

let inflightWorkboxRegister: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Mobile used a standalone FCM SW; production now uses unified `/sw.js` everywhere
 * (imports `firebase-messaging-sw.js`) so push and updates share one registration.
 */
async function migrateToUnifiedPushServiceWorker(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const workbox = registrations.find((reg) => isWorkboxServiceWorker(reg));

  if (workbox) {
    await Promise.all(
      registrations
        .filter((reg) => isMessagingServiceWorker(reg) && !isWorkboxServiceWorker(reg))
        .map((reg) => reg.unregister().catch(() => undefined)),
    );
    return;
  }

  await Promise.all(
    registrations
      .filter((reg) => isMessagingServiceWorker(reg) && !isWorkboxServiceWorker(reg))
      .map((reg) => reg.unregister().catch(() => undefined)),
  );
}

async function attemptAppServiceWorkerRegister(): Promise<ServiceWorkerRegistration | null> {
  const timeoutMs = getServiceWorkerActivationTimeoutMs();

  await migrateToUnifiedPushServiceWorker();

  const registrations = await navigator.serviceWorker.getRegistrations();
  const existing = registrations.find((reg) => isWorkboxServiceWorker(reg) && reg.active);
  if (existing) {
    return existing;
  }

  const pending = registrations.find(isWorkboxServiceWorker);
  if (pending) {
    try {
      const active = await waitForServiceWorkerActive(pending, timeoutMs);
      if (active.active) return active;
    } catch {
      if (pending.active) return pending;
    }
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    try {
      return await waitForServiceWorkerActive(registration, timeoutMs);
    } catch {
      if (registration.active || registration.installing || registration.waiting) {
        return registration;
      }
    }
  } catch (error) {
    console.warn("[pwa] Failed to register /sw.js", error);
  }

  return null;
}

/** Registers `/sw.js` (Workbox + FCM via importScripts) on all platforms in production. */
export function registerAppServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  if (options?.retry) {
    inflightWorkboxRegister = null;
  }

  if (!inflightWorkboxRegister) {
    inflightWorkboxRegister = attemptAppServiceWorkerRegister().then((result) => {
      if (!result?.active && !result?.installing && !result?.waiting) {
        inflightWorkboxRegister = null;
      }
      return result;
    });
  }

  return inflightWorkboxRegister;
}

/** @deprecated Standalone FCM SW — use registerAppServiceWorker / registerProductionServiceWorker. */
export function registerMobileMessagingServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  return registerAppServiceWorker(options);
}

/** @deprecated Use registerAppServiceWorker */
export const registerIosMessagingServiceWorker = registerMobileMessagingServiceWorker;

/** Production SW: unified Workbox + FCM on all platforms. */
export function registerProductionServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  return registerAppServiceWorker(options);
}

/** Returns the active push-capable registration if one exists. */
export function getActivePushServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker.getRegistrations().then((registrations) => {
    const active = registrations.find((reg) => isPushCapableServiceWorker(reg) && reg.active);
    return active ?? null;
  });
}
