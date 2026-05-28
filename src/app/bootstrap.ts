import { useAuthStore } from "@/app/store/authStore";

/** Side effects run once before React mounts (auth listener only — FCM loads with inbox). */
export function bootstrapApp(): void {
  useAuthStore.getState().startAuthListener();

  if (import.meta.env.DEV) {
    void import("@/app/push/pushEnvironment").then(({ getPushEnvironmentStatus, logPushEnvironmentHint }) =>
      getPushEnvironmentStatus().then(logPushEnvironmentHint),
    );
  }
}
