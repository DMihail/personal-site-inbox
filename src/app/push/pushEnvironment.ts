import { isFcmConfigured } from "@/utils/firebaseConfig";

export interface PushEnvironmentStatus {
  messagingSupported: boolean;
  hasMessagingSenderId: boolean;
  hasVapidKey: boolean;
  permission: NotificationPermission | "unsupported";
  serviceWorker: boolean;
}

export async function getPushEnvironmentStatus(): Promise<PushEnvironmentStatus> {
  const permission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported";

  let messagingSupported = false;
  if (isFcmConfigured()) {
    const { isSupported } = await import("firebase/messaging");
    messagingSupported = await isSupported();
  }

  return {
    messagingSupported,
    hasMessagingSenderId: Boolean(import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID?.trim()),
    hasVapidKey: Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim()),
    permission,
    serviceWorker: typeof navigator !== "undefined" && "serviceWorker" in navigator,
  };
}

export function logPushEnvironmentHint(status: PushEnvironmentStatus): void {
  if (!import.meta.env.DEV) return;

  if (!status.hasMessagingSenderId) {
    console.warn(
      "[push] VITE_FIREBASE_MESSAGE_SENDER_ID is missing — add it from Firebase Console → Project settings → General.",
    );
  }
  if (!status.hasVapidKey) {
    console.warn(
      "[push] VITE_FIREBASE_VAPID_KEY is missing — only in-tab Firestore alerts work. " +
        "Add Web Push key from Firebase Console → Cloud Messaging.",
    );
  }
  if (!status.messagingSupported && status.hasMessagingSenderId && status.hasVapidKey) {
    console.warn("[push] Firebase Messaging is not supported in this browser.");
  }
}
