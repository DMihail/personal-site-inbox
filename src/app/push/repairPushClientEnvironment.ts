import { logPushDebug } from "@/app/push/pushDebug";
import { clearFcmClientStorage } from "@/app/push/clearFcmClientStorage";
import {
  evictWorkboxFromMobile,
  registerMobileMessagingServiceWorker,
  registerAppServiceWorker,
} from "@/pwa/registerServiceWorker";
import { isMobilePushDevice } from "@/pwa/runtime";

/**
 * Recovery when FCM storage fails. On mobile, drops Workbox caches only (keeps FCM SW).
 * On desktop, clears caches and re-registers the unified `/sw.js`.
 */
export async function repairPushClientEnvironment(): Promise<void> {
  logPushDebug("repair-push-environment-start", {
    mobile: isMobilePushDevice(),
    note: "does not call deleteToken — only clears FCM IDB and re-registers SW",
  });
  await clearFcmClientStorage();

  if (isMobilePushDevice()) {
    await evictWorkboxFromMobile();
    await registerMobileMessagingServiceWorker({ retry: true });
    return;
  }

  if (typeof caches !== "undefined") {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister().catch(() => undefined)));
  }

  await registerAppServiceWorker({ retry: true });
}
