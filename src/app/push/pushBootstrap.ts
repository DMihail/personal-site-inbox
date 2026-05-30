import { useAuthStore } from "@/app/store/authStore";
import { usePushStore } from "@/app/store/pushStore";
import { isFcmConfigured } from "@/utils/firebaseConfig";

async function syncPushIfEnabled(uid: string): Promise<void> {
  const { enabled } = usePushStore.getState();
  if (!enabled || !isFcmConfigured()) return;

  const { registerMessagingServiceWorker } = await import("@/app/push/fcm");
  await registerMessagingServiceWorker();
  await usePushStore.getState().syncWithUser(uid);
}

/** Refresh FCM token + foreground listener as soon as auth is ready (not only on inbox mount). */
export function bootstrapPushForAuthenticatedUser(): void {
  if (!isFcmConfigured() || !("serviceWorker" in navigator)) return;

  const { user, isHydrating } = useAuthStore.getState();
  if (!isHydrating && user?.uid) {
    void syncPushIfEnabled(user.uid);
    return;
  }

  const unsub = useAuthStore.subscribe((state) => {
    if (state.isHydrating) return;
    unsub();
    if (state.user?.uid) {
      void syncPushIfEnabled(state.user.uid);
    }
  });
}
