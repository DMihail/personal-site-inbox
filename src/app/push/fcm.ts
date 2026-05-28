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
import { isPwaRuntime } from "@/pwa/config";
import {
  getActiveServiceWorkerRegistration,
  isMessagingServiceWorker,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";

const LEGACY_MESSAGING_SW_SCOPE = "/firebase/";
const DEV_MESSAGING_SW_URL = "/firebase-messaging-sw.js";

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

/** PWA Workbox SW (imports firebase-messaging-sw.js) — same registration used for background push. */
export async function getPwaServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  return getActiveServiceWorkerRegistration("/");
}

async function unregisterLegacyMessagingServiceWorker(): Promise<void> {
  try {
    const legacy = await navigator.serviceWorker.getRegistration(LEGACY_MESSAGING_SW_SCOPE);
    if (legacy) {
      await legacy.unregister();
    }
  } catch {
    // best-effort migration from older /firebase/ scoped SW
  }
}

async function registerDevMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const reg of registrations) {
    if (isMessagingServiceWorker(reg)) {
      return waitForServiceWorkerActive(reg);
    }
  }

  for (const reg of registrations) {
    if (!isMessagingServiceWorker(reg)) {
      await reg.unregister().catch(() => undefined);
    }
  }

  try {
    const reg = await navigator.serviceWorker.register(DEV_MESSAGING_SW_URL, { scope: "/" });
    return await waitForServiceWorkerActive(reg);
  } catch {
    return null;
  }
}

async function registerProdMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  const active = await getActiveServiceWorkerRegistration("/");
  if (active) return active;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return await waitForServiceWorkerActive(reg);
  } catch {
    return getActiveServiceWorkerRegistration("/");
  }
}

export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  await unregisterLegacyMessagingServiceWorker();

  if (!isPwaRuntime) {
    return registerDevMessagingServiceWorker();
  }

  return registerProdMessagingServiceWorker();
}

export async function registerFcmToken(
  uid: string,
  options?: { requestPermission?: boolean },
): Promise<FcmRegisterResult> {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    return { ok: false, reason: "no-vapid" };
  }

  if (options?.requestPermission !== false) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, reason: "permission-denied" };
    }
  } else if (Notification.permission !== "granted") {
    return { ok: false, reason: "permission-denied" };
  }

  const messagingInstance = await getMessagingIfSupported();
  if (!messagingInstance) {
    return { ok: false, reason: "unsupported" };
  }

  try {
    const swReg = await registerMessagingServiceWorker();
    if (!swReg) {
      return {
        ok: false,
        reason: "unsupported",
        message: "Could not register service worker for push notifications",
      };
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
