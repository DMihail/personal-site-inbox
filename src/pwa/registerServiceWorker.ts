import {
  isMessagingServiceWorker,
  isPushCapableServiceWorker,
  isWorkboxServiceWorker,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";
import { getServiceWorkerActivationTimeoutMs, isMobilePushDevice } from "@/pwa/runtime";

const MESSAGING_SW_URL = "/firebase-messaging-sw.js";

let inflightWorkboxRegister: Promise<ServiceWorkerRegistration | null> | null = null;
let inflightMessagingRegister: Promise<ServiceWorkerRegistration | null> | null = null;

/** Workbox precache on Android often fills storage and breaks FCM IndexedDB. */
export async function evictWorkboxFromMobile(): Promise<void> {
  if (!isMobilePushDevice() || typeof navigator === "undefined") return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((reg) => isWorkboxServiceWorker(reg))
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

async function attemptAppServiceWorkerRegister(): Promise<ServiceWorkerRegistration | null> {
  const timeoutMs = getServiceWorkerActivationTimeoutMs();
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

/** Desktop production: Workbox + FCM via importScripts. */
export function registerAppServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  if (
    !import.meta.env.PROD ||
    !("serviceWorker" in navigator) ||
    isMobilePushDevice()
  ) {
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

async function attemptMobileMessagingServiceWorkerRegister(): Promise<ServiceWorkerRegistration | null> {
  const timeoutMs = getServiceWorkerActivationTimeoutMs();

  await evictWorkboxFromMobile();

  const registrations = await navigator.serviceWorker.getRegistrations();
  const existingMessaging = registrations.find(
    (reg) => isMessagingServiceWorker(reg) && reg.active,
  );
  if (existingMessaging) {
    return existingMessaging;
  }

  const pendingMessaging = registrations.find(isMessagingServiceWorker);
  if (pendingMessaging) {
    try {
      const active = await waitForServiceWorkerActive(pendingMessaging, timeoutMs);
      if (active.active) return active;
    } catch {
      if (pendingMessaging.active) return pendingMessaging;
    }
  }

  try {
    const registration = await navigator.serviceWorker.register(MESSAGING_SW_URL, {
      scope: "/",
    });
    try {
      return await waitForServiceWorkerActive(registration, timeoutMs);
    } catch {
      return registration.active || registration.installing || registration.waiting
        ? registration
        : null;
    }
  } catch (error) {
    console.warn("[pwa] Failed to register FCM service worker", error);
    return null;
  }
}

/** iOS / Android: lightweight FCM-only SW (no Workbox precache). */
export function registerMobileMessagingServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator) || !isMobilePushDevice()) {
    return Promise.resolve(null);
  }

  if (options?.retry) {
    inflightMessagingRegister = null;
  }

  if (!inflightMessagingRegister) {
    inflightMessagingRegister = attemptMobileMessagingServiceWorkerRegister().then((result) => {
      if (!result?.active && !result?.installing && !result?.waiting) {
        inflightMessagingRegister = null;
      }
      return result;
    });
  }

  return inflightMessagingRegister;
}

export const registerIosMessagingServiceWorker = registerMobileMessagingServiceWorker;

/** Production: FCM-only on mobile, Workbox on desktop. */
export function registerProductionServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  if (isMobilePushDevice()) {
    return registerMobileMessagingServiceWorker(options);
  }
  return registerAppServiceWorker(options);
}

async function ensureActiveRegistration(
  register: (options?: { retry?: boolean }) => Promise<ServiceWorkerRegistration | null>,
): Promise<ServiceWorkerRegistration | null> {
  const timeoutMs = getServiceWorkerActivationTimeoutMs();

  let registered = await register();
  if (registered?.active) return registered;

  if (registered) {
    try {
      registered = await waitForServiceWorkerActive(registered, timeoutMs);
      if (registered.active) return registered;
    } catch {
      if (registered.active) return registered;
    }
  }

  return register({ retry: true });
}

/** Active push SW for the current platform (retries once). */
export async function ensureActiveProductionServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return ensureActiveRegistration(registerProductionServiceWorker);
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
