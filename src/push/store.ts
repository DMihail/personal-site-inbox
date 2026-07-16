import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withSecurePersist } from "@/shared/persist/securePersist";
import { migratePushPersist } from "@/shared/persist/persistMigrate";
import { isPushConfigured } from "@/push/config";
import {
  registerPushToken,
  subscribeForegroundPush,
  unregisterPushToken,
  unsubscribeForegroundPush,
} from "@/push/messaging";
import { notifyFromPushPayload } from "@/push/display";
import {
  getNotificationPermission,
  getNotificationPermissionError,
  getPushNotificationSupport,
} from "@/push/permissions";
import { runPushTest } from "@/push/run-test";

interface PushState {
  enabled: boolean;
  token: string | null;
  error: string | null;
  isRegistering: boolean;
  isSendingTest: boolean;
  setEnabled: (enabled: boolean, uid: string | null) => Promise<void>;
  sync: (uid: string | null) => Promise<void>;
  sendTest: () => ReturnType<typeof runPushTest>;
}

let inflightSync: Promise<void> | null = null;

async function startForeground(): Promise<void> {
  await subscribeForegroundPush((payload) => {
    void notifyFromPushPayload(payload);
  });
}

export const usePushStore = create<PushState>()(
  persist(
    (set, get) => ({
      enabled: false,
      token: null,
      error: null,
      isRegistering: false,
      isSendingTest: false,

      setEnabled: async (enabled, uid) => {
        if (!uid) {
          set({ enabled: false, token: null, error: "Sign in to enable push notifications" });
          return;
        }

        if (!enabled) {
          set({ enabled: false, isRegistering: true, error: null });
          await unregisterPushToken(uid);
          unsubscribeForegroundPush();
          set({ token: null, isRegistering: false });
          return;
        }

        set({ isRegistering: true, error: null });

        const support = getPushNotificationSupport();
        if (!support.ok) {
          set({ enabled: false, token: null, isRegistering: false, error: support.message });
          return;
        }

        if (getNotificationPermission() !== "granted") {
          set({
            enabled: false,
            token: null,
            isRegistering: false,
            error: getNotificationPermissionError(getNotificationPermission()),
          });
          return;
        }

        const result = await registerPushToken(uid);
        if (result.ok) {
          await startForeground();
          set({ enabled: true, token: result.token, isRegistering: false, error: null });
          return;
        }

        if (result.reason === "permission-denied") {
          set({
            enabled: false,
            token: null,
            isRegistering: false,
            error: getNotificationPermissionError("denied"),
          });
          return;
        }

        const warning =
          result.reason === "no-vapid"
            ? "In-tab alerts only — configure VITE_FIREBASE_VAPID_KEY for background push."
            : (result.message ?? "Could not register push token.");

        set({
          enabled: false,
          token: null,
          isRegistering: false,
          error: warning,
        });
      },

      sync: async (uid) => {
        if (inflightSync) return inflightSync;

        inflightSync = (async () => {
          const { enabled } = get();
          if (!uid || !enabled) {
            unsubscribeForegroundPush();
            if (!uid) set({ token: null });
            return;
          }
          if (!isPushConfigured()) {
            set({ token: null, error: null });
            return;
          }

          const result = await registerPushToken(uid);
          if (result.ok) {
            await startForeground();
            set({ token: result.token, error: null });
          } else if (result.reason !== "permission-denied") {
            set({
              token: null,
              error: result.message ?? "Push token refresh failed — toggle push off and on.",
            });
          }
        })().finally(() => {
          inflightSync = null;
        });

        return inflightSync;
      },

      sendTest: async () => {
        set({ isSendingTest: true });
        try {
          return await runPushTest(get().enabled);
        } finally {
          set({ isSendingTest: false });
        }
      },
    }),
    withSecurePersist({
      name: "push-store",
      partialize: (s) => ({ enabled: s.enabled }),
      version: 3,
      migrate: migratePushPersist,
    }),
  ),
);

/** Resolves after IndexedDB rehydration so bootstrap sync sees persisted `enabled`. */
export function waitForPushStoreHydration(): Promise<void> {
  return new Promise((resolve) => {
    if (usePushStore.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsub = usePushStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
