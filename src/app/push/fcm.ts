import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import app, { firestoreDb } from "@/utils/firebase";

const MESSAGING_SW_URL = "/firebase/firebase-messaging-sw.js";
const MESSAGING_SW_SCOPE = "/firebase/";

let messaging: Messaging | null = null;
let foregroundUnsub: (() => void) | null = null;

export type FcmRegisterResult =
  | { ok: true; token: string }
  | { ok: false; reason: "unsupported" | "permission-denied" | "no-vapid" | "no-token" | "error"; message?: string };

async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (!(await isSupported())) return null;
  if (!messaging) {
    messaging = getMessaging(app);
  }
  return messaging;
}

export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const existing = await navigator.serviceWorker.getRegistration(MESSAGING_SW_SCOPE);
  if (existing?.active) return existing;

  return navigator.serviceWorker.register(MESSAGING_SW_URL, { scope: MESSAGING_SW_SCOPE });
}

export async function registerFcmToken(uid: string): Promise<FcmRegisterResult> {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    return { ok: false, reason: "no-vapid" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "permission-denied" };
  }

  const messagingInstance = await getMessagingIfSupported();
  if (!messagingInstance) {
    return { ok: false, reason: "unsupported" };
  }

  try {
    const swReg = await registerMessagingServiceWorker();
    if (!swReg) {
      return { ok: false, reason: "unsupported" };
    }

    const token = await getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: swReg });
    if (!token) {
      return { ok: false, reason: "no-token" };
    }

    await setDoc(
      doc(firestoreDb, "fcmTokens", uid),
      {
        token,
        uid,
        updatedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
      },
      { merge: true },
    );

    return { ok: true, token };
  } catch (e) {
    const message = e instanceof Error ? e.message : "FCM registration failed";
    return { ok: false, reason: "error", message };
  }
}

export async function unregisterFcmToken(uid: string): Promise<void> {
  const messagingInstance = await getMessagingIfSupported();
  if (messagingInstance) {
    try {
      await deleteToken(messagingInstance);
    } catch {
      // best-effort
    }
  }

  try {
    await deleteDoc(doc(firestoreDb, "fcmTokens", uid));
  } catch {
    // best-effort
  }
}

export async function subscribeForegroundMessages(
  onPayload: (payload: import("firebase/messaging").MessagePayload) => void,
): Promise<() => void> {
  const messagingInstance = await getMessagingIfSupported();
  if (!messagingInstance) {
    return () => {};
  }

  foregroundUnsub?.();
  foregroundUnsub = onMessage(messagingInstance, onPayload);

  return () => {
    foregroundUnsub?.();
    foregroundUnsub = null;
  };
}
