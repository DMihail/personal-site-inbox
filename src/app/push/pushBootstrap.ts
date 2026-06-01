import { useAuthStore } from "@/app/store/authStore";
import { usePushStore } from "@/app/store/pushStore";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import { getActivePushServiceWorkerRegistration } from "@/pwa/registerServiceWorker";

async function syncPushIfEnabled(uid: string): Promise<void> {
  const { enabled } = usePushStore.getState();
  if (!enabled || !isFcmConfigured()) return;

  const { registerMessagingServiceWorker } = await import("@/app/push/fcm");
  await registerMessagingServiceWorker();
  await usePushStore.getState().syncWithUser(uid);
}

function watchPushServiceWorkerActivation(uid: string): void {
  if (!("serviceWorker" in navigator)) return;

  void getActivePushServiceWorkerRegistration().then((reg) => {
    if (!reg) return;

    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;

      worker.addEventListener("statechange", () => {
        if (worker.state !== "activated") return;
        if (!usePushStore.getState().enabled) return;
        void syncPushIfEnabled(uid);
      });
    });
  });
}

/** Refresh FCM token + foreground listener as soon as auth is ready (not only on inbox mount). */
export function bootstrapPushForAuthenticatedUser(): void {
  if (!isFcmConfigured() || !("serviceWorker" in navigator)) return;

  const { user, isHydrating } = useAuthStore.getState();
  if (!isHydrating && user?.uid) {
    void syncPushIfEnabled(user.uid);
    watchPushServiceWorkerActivation(user.uid);
    return;
  }

  const unsub = useAuthStore.subscribe((state) => {
    if (state.isHydrating) return;
    unsub();
    if (state.user?.uid) {
      void syncPushIfEnabled(state.user.uid);
      watchPushServiceWorkerActivation(state.user.uid);
    }
  });
}
