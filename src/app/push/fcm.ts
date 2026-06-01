import { firebaseApp } from "@/utils/firebaseApp";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import {
  getActiveServiceWorkerRegistration,
  isMessagingServiceWorker,
  isWorkboxServiceWorker,
  promiseWithTimeout,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";
import { clearFcmClientStorage } from "@/app/push/clearFcmClientStorage";
import { repairPushClientEnvironment } from "@/app/push/repairPushClientEnvironment";
import { saveDeviceFcmToken, removeDeviceFcmToken } from "@/app/push/fcmTokenStore";
import {
  getServiceWorkerActivationTimeoutMs,
  isAndroidDevice,
  isIosLikeDevice,
  isStandaloneDisplayMode,
} from "@/pwa/runtime";
import {
  registerIosMessagingServiceWorker,
  registerProductionServiceWorker,
} from "@/pwa/registerServiceWorker";

const FCM_GET_TOKEN_TIMEOUT_MS = 30_000;

const LEGACY_MESSAGING_SW_SCOPE = "/firebase/";
const MESSAGING_SW_URL = "/firebase-messaging-sw.js";

type MessagingModule = typeof import("firebase/messaging");
type MessagingInstance = Awaited<ReturnType<MessagingModule["getMessaging"]>>;
type MessagePayload = import("firebase/messaging").MessagePayload;

let messagingModule: MessagingModule | null = null;
let messaging: MessagingInstance | null = null;
let foregroundUnsub: (() => void) | null = null;

type FcmRegisterResult =
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
    const reg = await navigator.serviceWorker.register(MESSAGING_SW_URL, { scope: "/" });
    return await waitForServiceWorkerActive(reg, getServiceWorkerActivationTimeoutMs());
  } catch {
    return null;
  }
}

async function waitForServiceWorkerControl(timeoutMs: number): Promise<void> {
  if (navigator.serviceWorker.controller) return;

  await promiseWithTimeout(
    new Promise<void>((resolve) => {
      const onChange = () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.removeEventListener("controllerchange", onChange);
          resolve();
        }
      };
      navigator.serviceWorker.addEventListener("controllerchange", onChange);
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.removeEventListener("controllerchange", onChange);
        resolve();
      }
    }),
    timeoutMs,
    "Service worker did not take control of the page",
  );
}

function isRecoverableFcmStorageError(message: string): boolean {
  return /storage|indexeddb|quota|push service|registration failed/i.test(message);
}

function fcmStorageFailureMessage(): string {
  return "Push storage failed in this browser. Free disk space on the phone, turn off private mode, then in Chrome → Site settings → Inbox → Clear storage (not only cache). Reopen the PWA and enable push again.";
}

async function getFcmRegistrationToken(
  mod: MessagingModule,
  messagingInstance: MessagingInstance,
  vapidKey: string,
  swReg: ServiceWorkerRegistration,
): Promise<string> {
  return promiseWithTimeout(
    mod.getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: swReg }),
    FCM_GET_TOKEN_TIMEOUT_MS,
    "FCM getToken timed out — check service worker and VAPID key",
  );
}

function serviceWorkerRegistrationFailureMessage(): string {
  if (isIosLikeDevice() && !isStandaloneDisplayMode()) {
    return "On iPhone, add this app to the Home Screen, open it from the icon, then enable notifications again.";
  }
  if (isIosLikeDevice()) {
    return "Could not start the notification service worker. Close the app completely, reopen from the Home Screen, and try again.";
  }
  return "Could not register service worker for push notifications. Reload the page and try again.";
}

/** Production: bootstrap registers platform SW; ensure it is active before FCM token refresh. */
async function registerProdMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  const timeoutMs = getServiceWorkerActivationTimeoutMs();

  if (isIosLikeDevice()) {
    const registered = await registerIosMessagingServiceWorker();
    if (registered?.active) return registered;
    return registerIosMessagingServiceWorker({ retry: true });
  }

  let registered = await registerProductionServiceWorker();
  if (registered?.active) return registered;

  if (registered && !registered.active) {
    try {
      registered = await waitForServiceWorkerActive(registered, timeoutMs);
      if (registered.active) return registered;
    } catch {
      if (registered.active) return registered;
    }
  }

  registered = await registerProductionServiceWorker({ retry: true });
  if (registered?.active) return registered;

  try {
    const ready = await promiseWithTimeout(
      navigator.serviceWorker.ready,
      timeoutMs,
      "Service worker ready timed out",
    );
    if (isWorkboxServiceWorker(ready) || isMessagingServiceWorker(ready)) {
      return ready;
    }
  } catch {
    // fall through
  }

  return getActiveServiceWorkerRegistration("/", timeoutMs);
}

export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  await unregisterLegacyMessagingServiceWorker();

  if (import.meta.env.DEV) {
    return registerDevMessagingServiceWorker();
  }

  return registerProdMessagingServiceWorker();
}

/** Caller must request notification permission before calling (see notificationPermission.ts). */
export async function registerFcmToken(uid: string): Promise<FcmRegisterResult> {
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

  if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
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
        message: serviceWorkerRegistrationFailureMessage(),
      };
    }

    if (!swReg.active) {
      try {
        await waitForServiceWorkerActive(swReg, getServiceWorkerActivationTimeoutMs());
      } catch {
        if (!swReg.active) {
          return {
            ok: false,
            reason: "unsupported",
            message: serviceWorkerRegistrationFailureMessage(),
          };
        }
      }
    }

    try {
      await waitForServiceWorkerControl(getServiceWorkerActivationTimeoutMs());
    } catch {
      // getToken may still succeed when a worker is activating
    }

    if (isAndroidDevice()) {
      await clearFcmClientStorage();
    }

    let token: string;
    try {
      token = await getFcmRegistrationToken(mod, messagingInstance, vapidKey, swReg);
    } catch (firstError) {
      const raw =
        firstError instanceof Error ? firstError.message : "FCM registration failed";
      if (!isRecoverableFcmStorageError(raw)) {
        throw firstError;
      }

      await repairPushClientEnvironment();
      try {
        await mod.deleteToken(messagingInstance);
      } catch {
        // best-effort reset before retry
      }

      const freshSwReg = await registerMessagingServiceWorker();
      if (!freshSwReg?.active) {
        throw firstError;
      }

      token = await getFcmRegistrationToken(mod, messagingInstance, vapidKey, freshSwReg);
    }

    if (!token) {
      return { ok: false, reason: "no-token" };
    }

    await saveDeviceFcmToken(uid, token);

    return { ok: true, token };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "FCM registration failed";
    const message = isRecoverableFcmStorageError(raw) ? fcmStorageFailureMessage() : raw;
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

  await repairPushClientEnvironment();

  try {
    await removeDeviceFcmToken(uid);
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
