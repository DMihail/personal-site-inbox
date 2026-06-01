import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { migratePushPersist } from "./persistMigrate";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import { registerFcmToken, subscribeForegroundMessages, unregisterFcmToken } from "../push/fcm";
import {
  getNotificationPermission,
  getNotificationPermissionError,
  getPushNotificationSupport,
} from "../push/notificationPermission";
import { notifyFromFcmPayload } from "../push/notify";
import { runSendTestNotification, type SendTestNotificationResult } from "../push/sendTestNotification";

interface PushState {
  enabled: boolean;
  token: string | null;
  error: string | null;
  isRegistering: boolean;
  setEnabled: (enabled: boolean, uid: string | null) => Promise<void>;
  syncWithUser: (uid: string | null) => Promise<void>;
  sendTestNotification: () => Promise<SendTestNotificationResult>;
  isSendingTest: boolean;
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
      isSendingTest: false,

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

        try {
          const support = getPushNotificationSupport();
          if (!support.ok) {
            set({
              enabled: false,
              token: null,
              error: support.message,
            });
            return;
          }

          const permission = getNotificationPermission();
          if (permission !== "granted") {
            set({
              enabled: false,
              token: null,
              error: getNotificationPermissionError(permission),
            });
            return;
          }

          const result = await registerFcmToken(uid);
          let fcmWarning: string | null = null;
          let token: string | null = null;

          if (result.ok) {
            token = result.token;
          } else if (result.reason === "no-vapid") {
            fcmWarning =
              "In-tab alerts only. Add VITE_FIREBASE_VAPID_KEY (Firebase → Cloud Messaging) for background push.";
          } else if (result.reason === "permission-denied") {
            set({
              enabled: false,
              token: null,
              error: getNotificationPermissionError("denied"),
            });
            return;
          } else {
            fcmWarning =
              result.message ??
              "FCM token not saved — in-tab Firestore alerts still work. Check the browser console and Firestore rules.";
          }

          if (token) {
            await startForegroundListener();
          }

          set({
            enabled: true,
            token,
            error: fcmWarning,
          });
        } catch (e) {
          set({
            enabled: false,
            token: null,
            error: e instanceof Error ? e.message : "Failed to enable push notifications",
          });
        } finally {
          set({ isRegistering: false });
        }
      },

      sendTestNotification: async () => {
        set({ isSendingTest: true });
        try {
          return await runSendTestNotification({ pushEnabled: get().enabled });
        } finally {
          set({ isSendingTest: false });
        }
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

        if (!isFcmConfigured()) {
          set({ token: null, error: null });
          return;
        }

        const result = await registerFcmToken(uid);
        if (result.ok) {
          await startForegroundListener();
          set({ token: result.token, error: null });
        } else if (result.reason === "no-vapid") {
          set({ token: null, error: null });
        } else if (result.reason !== "permission-denied") {
          set({ error: result.message ?? "Push token refresh failed" });
        }
      },
    }),
    {
      name: "push-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ enabled: s.enabled }),
      version: 3,
      migrate: migratePushPersist,
    },
  ),
);
