import { useAuthStore } from "@/app/store/authStore";
import { registerMessagingServiceWorker } from "@/app/push/fcm";
import { getPushEnvironmentStatus, logPushEnvironmentHint } from "@/app/push/pushEnvironment";

/** Side effects run once before React mounts (auth listener, service worker). */
export function bootstrapApp(): void {
  useAuthStore.getState().startAuthListener();

  if ("serviceWorker" in navigator) {
    void registerMessagingServiceWorker();
  }

  void getPushEnvironmentStatus().then(logPushEnvironmentHint);
}
