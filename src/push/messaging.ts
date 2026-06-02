import { firebaseApp } from "@/utils/firebaseApp";
import type { PushPayload, PushRegisterResult } from "@/push/types";
import { getVapidKey, isPushConfigured } from "@/push/config";
import { logPush, maskToken } from "@/push/debug";
import { saveTokenToFirestore, removeTokenFromFirestore } from "@/push/firestore";
import { ensureFcmServiceWorker } from "@/push/service-worker";
import { promiseWithTimeout } from "@/pwa/waitForServiceWorker";
import { isAndroidDevice, isIosLikeDevice, isStandaloneDisplayMode } from "@/pwa/runtime";

type FcmBindings = {
  getMessaging: (app: typeof firebaseApp) => unknown;
  getToken: (
    messaging: unknown,
    options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration },
  ) => Promise<string>;
  deleteToken: (messaging: unknown) => Promise<boolean>;
  isSupported: () => Promise<boolean>;
  onMessage: (messaging: unknown, handler: (payload: PushPayload) => void) => () => void;
};

let fcmModule: FcmBindings | null = null;
let messagingInstance: unknown | null = null;
let inflightRegister: Promise<PushRegisterResult> | null = null;

const TOKEN_TIMEOUT_MS = 30_000;
const TOKEN_TIMEOUT_ANDROID_MS = 18_000;

async function loadFcm(): Promise<FcmBindings | null> {
  if (!isPushConfigured()) return null;
  if (!fcmModule) {
    const mod = (await import("firebase/messaging")) as FcmBindings;
    if (!(await mod.isSupported())) return null;
    fcmModule = mod;
  }
  return fcmModule;
}

async function getMessagingInstance(): Promise<unknown | null> {
  const mod = await loadFcm();
  if (!mod) return null;
  if (!messagingInstance) {
    messagingInstance = mod.getMessaging(firebaseApp);
  }
  return messagingInstance;
}

function tokenTimeoutMs(): number {
  return isAndroidDevice() ? TOKEN_TIMEOUT_ANDROID_MS : TOKEN_TIMEOUT_MS;
}

function registrationErrorMessage(): string {
  if (isIosLikeDevice() && !isStandaloneDisplayMode()) {
    return "On iPhone, add Inbox to the Home Screen, open it from the icon, then enable notifications.";
  }
  return "Could not start the push service worker. Reload the app and try again.";
}

async function fetchToken(
  mod: FcmBindings,
  messaging: unknown,
  sw: ServiceWorkerRegistration,
): Promise<string> {
  return promiseWithTimeout(
    mod.getToken(messaging, { vapidKey: getVapidKey(), serviceWorkerRegistration: sw }),
    tokenTimeoutMs(),
    "FCM getToken timed out",
  );
}

async function registerTokenInternal(uid: string): Promise<PushRegisterResult> {
  if (!isPushConfigured()) {
    return { ok: false, reason: "no-vapid", message: "FCM is not configured (VAPID / sender id)." };
  }

  if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
    return { ok: false, reason: "permission-denied" };
  }

  const mod = await loadFcm();
  const messaging = await getMessagingInstance();
  if (!mod || !messaging) {
    return { ok: false, reason: "unsupported" };
  }

  const sw = await ensureFcmServiceWorker();
  if (!sw?.active) {
    return { ok: false, reason: "unsupported", message: registrationErrorMessage() };
  }

  try {
    const token = await fetchToken(mod, messaging, sw);
    if (!token) return { ok: false, reason: "no-token" };

    await saveTokenToFirestore(uid, token);
    logPush("token-ready", { token: maskToken(token) });
    return { ok: true, token };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FCM registration failed";
    return { ok: false, reason: "error", message };
  }
}

/** Registers SW, obtains FCM token, writes to Firestore. Safe to call on every app open. */
export function registerPushToken(uid: string): Promise<PushRegisterResult> {
  if (inflightRegister) return inflightRegister;
  inflightRegister = registerTokenInternal(uid).finally(() => {
    inflightRegister = null;
  });
  return inflightRegister;
}

export async function unregisterPushToken(uid: string): Promise<void> {
  const mod = await loadFcm();
  const messaging = await getMessagingInstance();
  if (mod && messaging) {
    try {
      await mod.deleteToken(messaging);
    } catch {
      // best-effort
    }
  }
  await removeTokenFromFirestore(uid);
  logPush("unregistered");
}

let unsubscribeForeground: (() => void) | null = null;

export async function subscribeForegroundPush(
  onPayload: (payload: PushPayload) => void,
): Promise<void> {
  const mod = await loadFcm();
  const messaging = await getMessagingInstance();
  if (!mod || !messaging) return;

  unsubscribeForeground?.();
  unsubscribeForeground = mod.onMessage(messaging, (payload) => {
    logPush("foreground-message", { messageId: payload.data?.messageId });
    onPayload(payload);
  });
}

export function unsubscribeForegroundPush(): void {
  unsubscribeForeground?.();
  unsubscribeForeground = null;
}
