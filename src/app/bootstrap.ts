import { initPushDeviceId } from "@/app/push/pushDeviceId";
import { useAuthStore } from "@/app/store/authStore";
import { bootstrapPushForAuthenticatedUser } from "@/app/push/pushBootstrap";
import { ensurePersistentStorage } from "@/pwa/persistentBrowserStorage";
import { registerAppServiceWorker } from "@/pwa/registerServiceWorker";

/** Side effects run once before React mounts (auth listener only — FCM loads with inbox). */
export function bootstrapApp(): void {
  void ensurePersistentStorage();
  void initPushDeviceId();

  useAuthStore.getState().startAuthListener();

  if (import.meta.env.PROD) {
    void registerAppServiceWorker();
    bootstrapPushForAuthenticatedUser();
  }

  if (import.meta.env.DEV) {
    void import("@/app/push/pushEnvironment").then(({ getPushEnvironmentStatus, logPushEnvironmentHint }) =>
      getPushEnvironmentStatus().then(logPushEnvironmentHint),
    );
  }
}
