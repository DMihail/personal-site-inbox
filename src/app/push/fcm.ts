import { firebaseApp } from "@/utils/firebaseApp";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import { getFirestoreDb } from "@/utils/firestore";
import {
  getActiveServiceWorkerRegistration,
  isMessagingServiceWorker,
  isWorkboxServiceWorker,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";

const LEGACY_MESSAGING_SW_SCOPE = "/firebase/";
const DEV_MESSAGING_SW_URL = "/firebase-messaging-sw.js";

type MessagingModule = typeof import("firebase/messaging");
type MessagingInstance = Awaited<ReturnType<MessagingModule["getMessaging"]>>;
type MessagePayload = import("firebase/messaging").MessagePayload;

let messagingModule: MessagingModule | null = null;
let messaging: MessagingInstance | null = null;
let foregroundUnsub: (() => void) | null = null;

export type FcmRegisterResult =
  | { ok: true; token: string }
  | {
      ok: false;
      reason: "unsupported" | "permission-denied" | "no-vapid" | "no-token" | "error";
      message?: string;
    };

async function loadMessagingModule(): Promise<MessagingModule | null> {
  if (!messagingModule) {
    const mod = await import("firebase/messaging");
    if (!(await mod.isSupported())) return null;
    messagingModule = mod;
  }
  return messagingModule;
}

async function getMessagingIfSupported(): Promise<MessagingInstance | null> {
  if (!isFcmConfigured()) return null;

  const mod = await loadMessagingModule();
  if (!mod) return null;

  if (!messaging) {
    try {
      messaging = mod.getMessaging(firebaseApp);
    } catch {
      messaging = null;
      return null;
    }
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

/** Production: app bootstrap registers `/sw.js`; ensure it is active before FCM token refresh. */
async function registerProdMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  const { registerAppServiceWorker } = await import("@/pwa/registerServiceWorker");
  const registered = await registerAppServiceWorker();
  if (registered) return registered;

  try {
    const ready = await navigator.serviceWorker.ready;
    if (isWorkboxServiceWorker(ready) || isMessagingServiceWorker(ready)) {
      return ready;
    }
  } catch {
    // fall through
  }

  return getActiveServiceWorkerRegistration("/");
}

export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  await unregisterLegacyMessagingServiceWorker();

  if (import.meta.env.DEV) {
    return registerDevMessagingServiceWorker();
  }

  return registerProdMessagingServiceWorker();
}

export async function registerFcmToken(
  uid: string,
  options?: { requestPermission?: boolean },
): Promise<FcmRegisterResult> {
  if (!isFcmConfigured()) {
    return {
      ok: false,
      reason: "no-vapid",
      message:
        "FCM is not configured. Set VITE_FIREBASE_MESSAGE_SENDER_ID and VITE_FIREBASE_VAPID_KEY in .env.",
    };
  }

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
    const mod = await loadMessagingModule();
    if (!mod) {
      return { ok: false, reason: "unsupported" };
    }

    const swReg = await registerMessagingServiceWorker();
    if (!swReg) {
      return {
        ok: false,
        reason: "unsupported",
        message: "Could not register service worker for push notifications",
      };
    }

    const token = await mod.getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: swReg });
    if (!token) {
      return { ok: false, reason: "no-token" };
    }

    const firestoreDb = await getFirestoreDb();
    const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
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
  const mod = await loadMessagingModule();
  const messagingInstance = await getMessagingIfSupported();
  if (mod && messagingInstance) {
    try {
      await mod.deleteToken(messagingInstance);
    } catch {
      // best-effort
    }
  }

  try {
    const firestoreDb = await getFirestoreDb();
    const { deleteDoc, doc } = await import("firebase/firestore");
    await deleteDoc(doc(firestoreDb, "fcmTokens", uid));
  } catch {
    // best-effort
  }
}

export async function subscribeForegroundMessages(
  onPayload: (payload: MessagePayload) => void,
): Promise<() => void> {
  const mod = await loadMessagingModule();
  const messagingInstance = await getMessagingIfSupported();
  if (!mod || !messagingInstance) {
    return () => {};
  }

  foregroundUnsub?.();
  foregroundUnsub = mod.onMessage(messagingInstance, onPayload);

  return () => {
    foregroundUnsub?.();
    foregroundUnsub = null;
  };
}
