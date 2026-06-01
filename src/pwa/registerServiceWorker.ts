import {
  isMessagingServiceWorker,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";
import { getServiceWorkerActivationTimeoutMs, isMobilePushDevice } from "@/pwa/runtime";

const MESSAGING_SW_URL = "/firebase-messaging-sw.js";

let inflightWorkboxRegister: Promise<ServiceWorkerRegistration | null> | null = null;
let inflightMessagingRegister: Promise<ServiceWorkerRegistration | null> | null = null;

async function attemptAppServiceWorkerRegister(): Promise<ServiceWorkerRegistration | null> {
  const timeoutMs = getServiceWorkerActivationTimeoutMs();

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

/** Registers `/sw.js` (Workbox precache). Desktop production only — mobile uses FCM SW. */
export function registerAppServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator) || isMobilePushDevice()) {
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
  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const reg of registrations) {
    if (!isMessagingServiceWorker(reg)) {
      await reg.unregister().catch(() => undefined);
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

/** iOS / Android: FCM-only SW — faster push setup than Workbox + importScripts. */
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

/** @deprecated Use registerMobileMessagingServiceWorker */
export const registerIosMessagingServiceWorker = registerMobileMessagingServiceWorker;

/** Production SW: FCM-only on mobile, Workbox on desktop. */
export function registerProductionServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  if (isMobilePushDevice()) {
    return registerMobileMessagingServiceWorker(options);
  }
  return registerAppServiceWorker(options);
}
