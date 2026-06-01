import { isIosLikeDevice, isStandaloneDisplayMode } from "@/pwa/runtime";

export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

export function canShowBrowserNotifications(): boolean {
  return getNotificationPermission() === "granted";
}

export type PushNotificationSupport =
  | { ok: true }
  | { ok: false; message: string; permission: NotificationPermissionState };

/** Checks environment before calling `Notification.requestPermission`. */
export function getPushNotificationSupport(): PushNotificationSupport {
  if (typeof window === "undefined") {
    return { ok: false, message: "Notifications are unavailable during SSR.", permission: "unsupported" };
  }

  if (!window.isSecureContext) {
    return {
      ok: false,
      message:
        "Notifications require HTTPS (or localhost). If you open the dev server by LAN IP (http://192.168.x.x), use https or adb reverse to localhost instead.",
      permission: "unsupported",
    };
  }

  if (!("Notification" in window)) {
    return {
      ok: false,
      message: "This browser does not support notifications.",
      permission: "unsupported",
    };
  }

  if (isIosLikeDevice() && !isStandaloneDisplayMode()) {
    return {
      ok: false,
      message:
        "On iPhone and iPad, install the app to the Home Screen first, then enable notifications here.",
      permission: getNotificationPermission(),
    };
  }

  return { ok: true };
}

export function getNotificationPermissionError(
  permission: NotificationPermissionState,
): string {
  switch (permission) {
    case "granted":
      return "";
    case "denied":
      return "Notifications are blocked for this site. Allow them in browser settings, then reload.";
    case "default":
      return "Notification permission was not granted. Try again and choose Allow in the browser prompt.";
    case "unsupported":
    default:
      return "Notifications are not supported in this browser or context.";
  }
}

type BeginPermissionRequestResult =
  | { ok: true; permissionPromise: Promise<NotificationPermission> }
  | { ok: false; error: string; permission: NotificationPermissionState };

/**
 * Start `Notification.requestPermission()` in the same synchronous turn as a click/tap.
 * Call this directly from the event handler — do not `await` anything before it.
 */
export function beginNotificationPermissionRequest(): BeginPermissionRequestResult {
  const support = getPushNotificationSupport();
  if (!support.ok) {
    return { ok: false, error: support.message, permission: support.permission };
  }

  const current = getNotificationPermission();
  if (current === "granted") {
    return { ok: true, permissionPromise: Promise.resolve("granted") };
  }
  if (current === "denied") {
    return {
      ok: false,
      error: getNotificationPermissionError("denied"),
      permission: "denied",
    };
  }

  try {
    return { ok: true, permissionPromise: Notification.requestPermission() };
  } catch {
    return {
      ok: false,
      error: getNotificationPermissionError("unsupported"),
      permission: "unsupported",
    };
  }
}

type PushPermissionRequestResult =
  | { ok: true; permission: "granted" }
  | { ok: false; error: string; permission: NotificationPermissionState };

/** Completes a permission request started with `beginNotificationPermissionRequest`. */
export async function finishNotificationPermissionRequest(
  permissionPromise: Promise<NotificationPermission>,
): Promise<PushPermissionRequestResult> {
  try {
    const permission = (await permissionPromise) as NotificationPermissionState;
    if (permission === "granted") {
      return { ok: true, permission: "granted" };
    }
    return {
      ok: false,
      error: getNotificationPermissionError(permission),
      permission,
    };
  } catch {
    return {
      ok: false,
      error: getNotificationPermissionError("unsupported"),
      permission: "unsupported",
    };
  }
}

/**
 * Prefer calling `beginNotificationPermissionRequest()` from the click handler, then
 * `finishNotificationPermissionRequest()`. This helper is for callers that cannot split the flow.
 */
export async function requestPushPermissionFromUserGesture(): Promise<PushPermissionRequestResult> {
  const began = beginNotificationPermissionRequest();
  if (!began.ok) {
    return { ok: false, error: began.error, permission: began.permission };
  }
  return finishNotificationPermissionRequest(began.permissionPromise);
}
