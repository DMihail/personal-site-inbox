import { firebaseApp } from "@/utils/firebaseApp";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import {
  getActiveServiceWorkerRegistration,
  isMessagingServiceWorker,
  isPushCapableServiceWorker,
  promiseWithTimeout,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";
import { clearFcmClientStorage } from "@/app/push/clearFcmClientStorage";
import { repairPushClientEnvironment } from "@/app/push/repairPushClientEnvironment";
import { isPushDebugEnabled, logPushDebug, maskFcmToken } from "@/app/push/pushDebug";
import { saveDeviceFcmToken, removeDeviceFcmToken } from "@/app/push/fcmTokenStore";
import {
  getServiceWorkerActivationTimeoutMs,
  isAndroidDevice,
  isIosLikeDevice,
  isMobilePushDevice,
  isStandaloneDisplayMode,
} from "@/pwa/runtime";
import {
  ensureActiveProductionServiceWorker,
} from "@/pwa/registerServiceWorker";

const FCM_GET_TOKEN_TIMEOUT_MS = 30_000;
const FCM_GET_TOKEN_ANDROID_TIMEOUT_MS = 18_000;
const DESKTOP_SW_CONTROL_TIMEOUT_MS = 5_000;

const LEGACY_MESSAGING_SW_SCOPE = "/firebase/";
const MESSAGING_SW_URL = "/firebase-messaging-sw.js";

type MessagingModule = typeof import("firebase/messaging");
type MessagingInstance = Awaited<ReturnType<MessagingModule["getMessaging"]>>;
type MessagePayload = import("firebase/messaging").MessagePayload;

let messagingModule: MessagingModule | null = null;
let messaging: MessagingInstance | null = null;
let foregroundUnsub: (() => void) | null = null;
let inflightFcmRegister: Promise<FcmRegisterResult> | null = null;
let inflightSwRegister: Promise<ServiceWorkerRegistration | null> | null = null;

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

/** Reuse an active FCM worker — re-registering invalidates the previous FCM token on the server. */
async function resolveMessagingServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const timeoutMs = getServiceWorkerActivationTimeoutMs();
  const registrations = await navigator.serviceWorker.getRegistrations();
  const activePush = registrations.find((reg) => isPushCapableServiceWorker(reg) && reg.active);
  if (activePush) {
    return activePush;
  }

  const pendingPush = registrations.find(isPushCapableServiceWorker);
  if (pendingPush) {
    try {
      const activated = await waitForServiceWorkerActive(pendingPush, timeoutMs);
      if (activated.active) return activated;
    } catch {
      if (pendingPush.active) return pendingPush;
    }
  }

  return registerMessagingServiceWorker();
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
  if (isAndroidDevice()) {
    return "Not enough storage for push on this phone. In Chrome: open Inbox → lock icon → Site settings → Storage → Clear (removes old app cache). Free system storage, fully close the PWA, reopen from the home screen, then enable push again.";
  }
  if (isIosLikeDevice()) {
    return "Push storage failed. Free iPhone storage, close the PWA completely, reopen from the Home Screen, then enable push again.";
  }
  return "Push storage failed in this browser. Free disk space, then clear site data for Inbox and enable push again.";
}

function getFcmTokenTimeoutMs(): number {
  return isAndroidDevice() ? FCM_GET_TOKEN_ANDROID_TIMEOUT_MS : FCM_GET_TOKEN_TIMEOUT_MS;
}

async function getFcmRegistrationToken(
  mod: MessagingModule,
  messagingInstance: MessagingInstance,
  vapidKey: string,
  swReg: ServiceWorkerRegistration,
): Promise<string> {
  return promiseWithTimeout(
    mod.getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: swReg }),
    getFcmTokenTimeoutMs(),
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

async function registerMessagingServiceWorkerInternal(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  await unregisterLegacyMessagingServiceWorker();

  if (import.meta.env.DEV) {
    return registerDevMessagingServiceWorker();
  }

  return ensureActiveProductionServiceWorker();
}

/** Idempotent: reuses active push SW; does not invalidate FCM token when already registered. */
export function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  if (!inflightSwRegister) {
    inflightSwRegister = registerMessagingServiceWorkerInternal().finally(() => {
      inflightSwRegister = null;
    });
  }

  return inflightSwRegister;
}

/** Ensures SW is active, then saves the current FCM token to Firestore. */
export async function refreshPushRegistration(uid: string): Promise<FcmRegisterResult> {
  await registerMessagingServiceWorker();
  return registerFcmToken(uid);
}

/** @deprecated Use refreshPushRegistration */
export const refreshFcmTokenInFirestore = refreshPushRegistration;

/** Caller must request notification permission before calling (see notificationPermission.ts). */
async function registerFcmTokenInternal(uid: string): Promise<FcmRegisterResult> {
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

    const swReg = await resolveMessagingServiceWorkerRegistration();
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

    if (!isMobilePushDevice()) {
      try {
        await waitForServiceWorkerControl(DESKTOP_SW_CONTROL_TIMEOUT_MS);
      } catch {
        // getToken only needs an active push SW, not page control
      }
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

      await clearFcmClientStorage();

      let freshSwReg = await resolveMessagingServiceWorkerRegistration();
      if (!freshSwReg?.active) {
        await repairPushClientEnvironment();
        freshSwReg = await resolveMessagingServiceWorkerRegistration();
      }

      if (!freshSwReg?.active) {
        throw firstError;
      }

      token = await getFcmRegistrationToken(mod, messagingInstance, vapidKey, freshSwReg);
    }

    if (!token) {
      return { ok: false, reason: "no-token" };
    }

    const saved = await saveDeviceFcmToken(uid, token);
    logPushDebug("fcm-token-registered", {
      deviceId: saved.deviceId,
      token: maskFcmToken(token),
      tokenChanged: saved.tokenChanged,
      hadPrevious: Boolean(saved.previousToken),
    });

    return { ok: true, token };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "FCM registration failed";
    const message = isRecoverableFcmStorageError(raw) ? fcmStorageFailureMessage() : raw;
    return { ok: false, reason: "error", message };
  }
}

export async function registerFcmToken(uid: string): Promise<FcmRegisterResult> {
  if (inflightFcmRegister) {
    return inflightFcmRegister;
  }

  inflightFcmRegister = registerFcmTokenInternal(uid).finally(() => {
    inflightFcmRegister = null;
  });
  return inflightFcmRegister;
}

export async function unregisterFcmToken(uid: string): Promise<void> {
  logPushDebug("fcm-token-unregister", { uid });
  const mod = await loadMessagingModule();
  const messagingInstance = await getMessagingIfSupported();
  if (mod && messagingInstance) {
    try {
      await mod.deleteToken(messagingInstance);
    } catch {
      // best-effort — token may already be invalid
    }
  }

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
  foregroundUnsub = mod.onMessage(messagingInstance, (payload) => {
    const messageId = payload.data?.messageId;
    if (isPushDebugEnabled()) {
      console.info("[push:debug] foreground PUSH RECEIVED", {
        messageId,
        data: payload.data,
      });
    }
    onPayload(payload);
  });

  return () => {
    foregroundUnsub?.();
    foregroundUnsub = null;
  };
}
