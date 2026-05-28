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

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
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
      message: "Notifications require HTTPS or localhost. Open the app over a secure URL.",
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

  if (isIosDevice() && !isStandaloneDisplayMode()) {
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

/**
 * Call directly from a click / tap handler (Settings switch, menu item).
 * Do not await other work before this runs — user activation may expire.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  const support = getPushNotificationSupport();
  if (!support.ok) {
    return support.permission === "granted" ? "granted" : support.permission;
  }

  const current = getNotificationPermission();
  if (current === "granted" || current === "denied") {
    return current;
  }

  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch {
    return "unsupported";
  }
}

export type PushPermissionRequestResult =
  | { ok: true; permission: "granted" }
  | { ok: false; error: string; permission: NotificationPermissionState };

export async function requestPushPermissionFromUserGesture(): Promise<PushPermissionRequestResult> {
  const support = getPushNotificationSupport();
  if (!support.ok) {
    return { ok: false, error: support.message, permission: support.permission };
  }

  const permission = await requestNotificationPermission();
  if (permission === "granted") {
    return { ok: true, permission: "granted" };
  }

  return {
    ok: false,
    error: getNotificationPermissionError(permission),
    permission,
  };
}
