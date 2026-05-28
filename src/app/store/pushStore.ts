import { create } from "zustand";
import { persist } from "zustand/middleware";
import { registerFcmToken, subscribeForegroundMessages, unregisterFcmToken } from "../push/fcm";
import { notifyFromFcmPayload } from "../push/notify";

interface PushState {
  enabled: boolean;
  token: string | null;
  error: string | null;
  isRegistering: boolean;
  setEnabled: (enabled: boolean, uid: string | null) => Promise<void>;
  syncWithUser: (uid: string | null) => Promise<void>;
}

let unsubscribeForeground: (() => void) | null = null;

async function startForegroundListener() {
  unsubscribeForeground?.();
  unsubscribeForeground = await subscribeForegroundMessages((payload) => {
    void notifyFromFcmPayload(payload);
  });
}

function stopForegroundListener() {
  unsubscribeForeground?.();
  unsubscribeForeground = null;
}

export const usePushStore = create<PushState>()(
  persist(
    (set, get) => ({
      enabled: false,
      token: null,
      error: null,
      isRegistering: false,

      setEnabled: async (enabled, uid) => {
        if (!uid) {
          set({ enabled: false, token: null, error: "Sign in to enable push notifications" });
          return;
        }

        if (!enabled) {
          set({ enabled: false, isRegistering: true, error: null });
          await unregisterFcmToken(uid);
          stopForegroundListener();
          set({ token: null, isRegistering: false });
          return;
        }

        set({ isRegistering: true, error: null });
        const result = await registerFcmToken(uid);

        if (!result.ok) {
          const error =
            result.reason === "no-vapid"
              ? "Add VITE_FIREBASE_VAPID_KEY to .env (Firebase Console → Cloud Messaging → Web Push certificates)"
              : result.reason === "permission-denied"
                ? "Notification permission denied"
                : result.message ?? "Could not enable push notifications";
          set({ enabled: false, token: null, isRegistering: false, error });
          return;
        }

        await startForegroundListener();
        set({ enabled: true, token: result.token, isRegistering: false, error: null });
      },

      syncWithUser: async (uid) => {
        const { enabled } = get();
        if (!uid || !enabled) {
          stopForegroundListener();
          if (!uid) {
            set({ token: null });
          }
          return;
        }

        const result = await registerFcmToken(uid);
        if (result.ok) {
          await startForegroundListener();
          set({ token: result.token, error: null });
        } else if (result.reason !== "permission-denied") {
          set({ error: result.message ?? "Push token refresh failed" });
        }
      },
    }),
    {
      name: "push-store",
      partialize: (s) => ({ enabled: s.enabled }),
      version: 1,
    },
  ),
);
