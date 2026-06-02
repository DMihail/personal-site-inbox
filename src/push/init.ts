import { useAuthStore } from "@/app/store/authStore";
import { usePushStore } from "@/push/store";
import { isPushConfigured } from "@/push/config";
import { ensureFcmServiceWorker } from "@/push/service-worker";
import { initDeviceId } from "@/push/device-id";
import { isTelegramMiniApp } from "@/telegram/detect";

const VISIBILITY_DEBOUNCE_MS = 2_000;
let visibilityTimer: ReturnType<typeof setTimeout> | undefined;
let boundUid: string | null = null;

function scheduleSync(uid: string): void {
  if (visibilityTimer) clearTimeout(visibilityTimer);
  visibilityTimer = setTimeout(() => {
    if (usePushStore.getState().enabled) {
      void usePushStore.getState().sync(uid);
    }
  }, VISIBILITY_DEBOUNCE_MS);
}

function onVisibilityChange(): void {
  if (document.visibilityState === "visible" && boundUid) {
    scheduleSync(boundUid);
  }
}

function bindVisibilityRefresh(uid: string): void {
  if (boundUid === uid) return;
  boundUid = uid;
  document.removeEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
}

/**
 * Call once at app start (production).
 * - Stable device id
 * - FCM service worker
 * - Token refresh when user is signed in and push is enabled
 */
export function initPushModule(): void {
  void initDeviceId();

  if (
    isTelegramMiniApp() ||
    !import.meta.env.PROD ||
    !isPushConfigured() ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  void ensureFcmServiceWorker();

  const runForUser = (uid: string | null) => {
    if (!uid) {
      void usePushStore.getState().sync(null);
      return;
    }
    bindVisibilityRefresh(uid);
    void usePushStore.getState().sync(uid);
  };

  const { user, isHydrating } = useAuthStore.getState();
  if (!isHydrating && user?.uid) {
    runForUser(user.uid);
  }

  useAuthStore.subscribe((state) => {
    if (state.isHydrating) return;
    runForUser(state.user?.uid ?? null);
  });
}
