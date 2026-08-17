import { useAuthStore } from "@/app/store/authStore";
import { usePushStore, waitForPushStoreHydration } from "@/push/store";
import { isPushConfigured } from "@/push/config";
import { ensureFcmServiceWorker } from "@/push/service-worker";
import { initDeviceId } from "@/push/device-id";
import { isTelegramMiniApp } from "@/telegram/detect";

const VISIBILITY_DEBOUNCE_MS = 2_000;
let visibilityTimer: ReturnType<typeof setTimeout> | undefined;
let boundUid: string | null = null;
let stopAuthBridge: (() => void) | null = null;

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

async function runForUser(uid: string | null): Promise<void> {
  await waitForPushStoreHydration();

  if (!uid) {
    void usePushStore.getState().sync(null);
    return;
  }

  if (!isPushConfigured() || isTelegramMiniApp()) {
    return;
  }

  bindVisibilityRefresh(uid);
  void usePushStore.getState().sync(uid);
}

/**
 * Call once when the authenticated inbox mounts.
 * - Stable device id
 * - Ensure unified SW is ready when push is configured (bootstrap also registers it)
 * - Token refresh when user is signed in and push is enabled
 */
export function initPushModule(): void {
  void initDeviceId();

  if (isTelegramMiniApp() || !("serviceWorker" in navigator)) {
    return;
  }

  if (import.meta.env.PROD && isPushConfigured()) {
    void ensureFcmServiceWorker();
  }

  stopAuthBridge?.();

  const { user, isHydrating } = useAuthStore.getState();
  if (!isHydrating && user?.uid) {
    void runForUser(user.uid);
  }

  stopAuthBridge = useAuthStore.subscribe((state) => {
    if (state.isHydrating) return;
    void runForUser(state.user?.uid ?? null);
  });
}
