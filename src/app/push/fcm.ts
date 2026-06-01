import { firebaseApp } from "@/utils/firebaseApp";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import {
  getActiveServiceWorkerRegistration,
  isMessagingServiceWorker,
  isWorkboxServiceWorker,
  promiseWithTimeout,
  waitForServiceWorkerActive,
} from "@/pwa/waitForServiceWorker";
import { saveDeviceFcmToken, removeDeviceFcmToken } from "@/app/push/fcmTokenStore";
import {
  getServiceWorkerActivationTimeoutMs,
  isIosLikeDevice,
  isStandaloneDisplayMode,
} from "@/pwa/runtime";

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

/** iOS fallback when Workbox `/sw.js` fails to activate (FCM-only worker). */
async function registerIosMessagingServiceWorkerFallback(): Promise<ServiceWorkerRegistration | null> {
  if (!isIosLikeDevice()) return null;

  const timeoutMs = getServiceWorkerActivationTimeoutMs();
  const registrations = await navigator.serviceWorker.getRegistrations();

  for (const reg of registrations) {
    const script = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? reg.waiting?.scriptURL ?? "";
    if (script.includes("/sw.js") && !reg.active) {
      await reg.unregister().catch(() => undefined);
    }
  }

  try {
    const reg = await navigator.serviceWorker.register(MESSAGING_SW_URL, { scope: "/" });
    try {
      return await waitForServiceWorkerActive(reg, timeoutMs);
    } catch {
      return reg.active || reg.installing || reg.waiting ? reg : null;
    }
  } catch (error) {
    console.warn("[fcm] iOS messaging service worker fallback failed", error);
    return null;
  }
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

/** Production: app bootstrap registers `/sw.js`; ensure it is active before FCM token refresh. */
async function registerProdMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  const { registerAppServiceWorker } = await import("@/pwa/registerServiceWorker");
  const timeoutMs = getServiceWorkerActivationTimeoutMs();

  let registered = await registerAppServiceWorker();
  if (registered?.active) return registered;

  if (registered && !registered.active) {
    try {
      registered = await waitForServiceWorkerActive(registered, timeoutMs);
      if (registered.active) return registered;
    } catch {
      if (registered.active) return registered;
    }
  }

  registered = await registerAppServiceWorker({ retry: true });
  if (registered?.active) return registered;
  if (registered?.installing || registered?.waiting) {
    try {
      const activated = await waitForServiceWorkerActive(registered, timeoutMs);
      if (activated.active) return activated;
    } catch {
      if (registered.active || registered.installing || registered.waiting) {
        return registered;
      }
    }
  }

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

  const existing = await getActiveServiceWorkerRegistration("/", timeoutMs);
  if (existing?.active) return existing;

  return registerIosMessagingServiceWorkerFallback();
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

    const token = await promiseWithTimeout(
      mod.getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: swReg }),
      FCM_GET_TOKEN_TIMEOUT_MS,
      "FCM getToken timed out — check service worker and VAPID key",
    );
    if (!token) {
      return { ok: false, reason: "no-token" };
    }

    await saveDeviceFcmToken(uid, token);

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
