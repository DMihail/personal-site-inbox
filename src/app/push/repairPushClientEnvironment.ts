import { clearFcmClientStorage } from "@/app/push/clearFcmClientStorage";

/**
 * Last-resort recovery when FCM storage is corrupted.
 * Not used when disabling push — that would break the PWA offline shell.
 */
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
