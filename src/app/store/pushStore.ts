import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withSecurePersist } from "./securePersist";
import { registerFcmToken, subscribeForegroundMessages, unregisterFcmToken } from "../push/fcm";
import {
  getNotificationPermission,
  getNotificationPermissionError,
  getPushNotificationSupport,
} from "../push/notificationPermission";
import { notifyFromFcmPayload, notifyNewMessage } from "../push/notify";

interface PushState {
  enabled: boolean;
  token: string | null;
  error: string | null;
  isRegistering: boolean;
  setEnabled: (enabled: boolean, uid: string | null) => Promise<void>;
  syncWithUser: (uid: string | null) => Promise<void>;
  sendTestNotification: () => Promise<void>;
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

        const support = getPushNotificationSupport();
        if (!support.ok) {
          set({
            enabled: false,
            token: null,
            isRegistering: false,
            error: support.message,
          });
          return;
        }

        const permission = getNotificationPermission();
        if (permission !== "granted") {
          set({
            enabled: false,
            token: null,
            isRegistering: false,
            error: getNotificationPermissionError(permission),
          });
          return;
        }

        const result = await registerFcmToken(uid, { requestPermission: false });
        let fcmWarning: string | null = null;
        let token: string | null = null;

        if (result.ok) {
          token = result.token;
        } else if (result.reason === "no-vapid") {
          fcmWarning =
            "In-tab alerts only. Add VITE_FIREBASE_VAPID_KEY (Firebase → Cloud Messaging) for desktop push from portfolio.";
        } else if (result.reason !== "permission-denied") {
          fcmWarning =
            result.message ??
            "FCM token not saved — in-tab Firestore alerts still work. Check console and Firestore rules for fcmTokens.";
        } else if (result.reason === "permission-denied") {
          set({
            enabled: false,
            token: null,
            isRegistering: false,
            error: getNotificationPermissionError("denied"),
          });
          return;
        }

        if (token) {
          await startForegroundListener();
        }

        set({
          enabled: true,
          token,
          isRegistering: false,
          error: fcmWarning,
        });
      },

      sendTestNotification: async () => {
        if (!get().enabled) return;
        await notifyNewMessage({
          id: "test",
          senderName: "Test",
          senderEmail: "test@example.com",
          company: "Developer Inbox",
          subject: "Test notification",
          preview: "If you see this, desktop notifications work.",
          timestamp: new Date(),
          isRead: false,
          isImportant: false,
          isArchived: false,
          source: "test",
        });
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

        const result = await registerFcmToken(uid, { requestPermission: false });
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
    withSecurePersist({
      name: "push-store",
      partialize: (s) => ({ enabled: s.enabled }),
      version: 2,
    }),
  ),
);
