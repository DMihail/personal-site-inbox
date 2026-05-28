import { isSupported } from "firebase/messaging";

export interface PushEnvironmentStatus {
  messagingSupported: boolean;
  hasVapidKey: boolean;
  permission: NotificationPermission | "unsupported";
  serviceWorker: boolean;
}

export async function getPushEnvironmentStatus(): Promise<PushEnvironmentStatus> {
  const permission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported";

  return {
    messagingSupported: await isSupported(),
    hasVapidKey: Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim()),
    permission,
    serviceWorker: typeof navigator !== "undefined" && "serviceWorker" in navigator,
  };
}

export function logPushEnvironmentHint(status: PushEnvironmentStatus): void {
  if (!import.meta.env.DEV) return;

  if (!status.hasVapidKey) {
    console.warn(
      "[push] VITE_FIREBASE_VAPID_KEY is missing — only in-tab Firestore alerts work. " +
        "Add Web Push key from Firebase Console → Cloud Messaging.",
    );
  }
  if (!status.messagingSupported) {
    console.warn("[push] Firebase Messaging is not supported in this browser.");
  }
}
