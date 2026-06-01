import { clearFcmClientStorage } from "@/app/push/clearFcmClientStorage";

/** Wipes FCM IndexedDB, Cache API, and service workers so push can re-register cleanly. */
export async function repairPushClientEnvironment(): Promise<void> {
  await clearFcmClientStorage();

  if (typeof caches !== "undefined") {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister().catch(() => undefined)));
  }
}
