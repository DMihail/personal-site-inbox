import {
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";
import { getServiceWorkerActivationTimeoutMs } from "@/pwa/runtime";

let inflightRegister: Promise<ServiceWorkerRegistration | null> | null = null;

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

/** Registers `/sw.js` immediately (production PWA). Safe to call multiple times. */
export function registerAppServiceWorker(options?: {
  retry?: boolean;
}): Promise<ServiceWorkerRegistration | null> {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  if (options?.retry) {
    inflightRegister = null;
  }

  if (!inflightRegister) {
    inflightRegister = attemptAppServiceWorkerRegister().then((result) => {
      if (!result?.active && !result?.installing && !result?.waiting) {
        inflightRegister = null;
      }
      return result;
    });
  }

  return inflightRegister;
}
