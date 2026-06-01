import type { MessagePayload } from "firebase/messaging";
import type { Message } from "../features/inbox/types";
import { getPwaServiceWorkerRegistration } from "./fcm";
import { showNotificationOnce } from "./notificationDedupe";
import {
  getNotificationPermission,
  getNotificationPermissionError,
} from "./notificationPermission";

export type ShowBrowserNotificationResult =
  | { ok: true }
  | { ok: false; reason: "permission" | "unsupported" | "error"; message: string };

const DEFAULT_NOTIFICATION_ICON = "/favicon.png";

/** Prefer SW `showNotification` — required on Android when the page is SW-controlled. */
export async function resolveNotificationRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  const scoped = await navigator.serviceWorker.getRegistration("/");
  if (scoped?.active) {
    return scoped;
  }

  if (navigator.serviceWorker.controller) {
    const controlled = await navigator.serviceWorker.getRegistration("/");
    if (controlled?.active) {
      return controlled;
    }
  }

  try {
    const fromPwa = await getPwaServiceWorkerRegistration();
    if (fromPwa?.active) {
      return fromPwa;
    }
  } catch {
    // fall through
  }

  try {
    const ready = await navigator.serviceWorker.ready;
    if (ready.active) {
      return ready;
    }
  } catch {
    // fall through
  }

  return null;
}

/** Shows a system notification via the active service worker when possible. */
export async function showBrowserNotification(
  title: string,
  options: NotificationOptions = {},
): Promise<ShowBrowserNotificationResult> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return {
      ok: false,
      reason: "unsupported",
      message: "This browser does not support notifications.",
    };
  }

  const permission = getNotificationPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      reason: "permission",
      message: getNotificationPermissionError(permission),
    };
  }

  const withIcon: NotificationOptions = {
    icon: DEFAULT_NOTIFICATION_ICON,
    badge: DEFAULT_NOTIFICATION_ICON,
    ...options,
    ...({ renotify: true } as NotificationOptions),
  };

  try {
    const reg = await resolveNotificationRegistration();
    if (reg) {
      await reg.showNotification(title, withIcon);
      return { ok: true };
    }

    if (navigator.serviceWorker?.controller) {
      return {
        ok: false,
        reason: "error",
        message:
          "Service worker is not ready to show notifications. Reload the app, then try again.",
      };
    }

    new Notification(title, withIcon);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not display a notification";
    return { ok: false, reason: "error", message };
  }
}

export async function notifyFromFcmPayload(payload: MessagePayload) {
  const data = payload.data ?? {};
  const title = payload.notification?.title ?? data.title ?? "New contact message";
  const body =
    payload.notification?.body ??
    data.body ??
    (data.preview ? String(data.preview) : "");
  const messageId = typeof data.messageId === "string" ? data.messageId : undefined;
  const url = data.url ?? "/";

  await showNotificationOnce(messageId, () =>
    showBrowserNotification(title, {
      body,
      tag: messageId ? `message:${messageId}` : undefined,
      data: { ...data, url },
    }),
  );
}

export async function notifyNewMessage(message: Message): Promise<ShowBrowserNotificationResult> {
  const title = "New contact message";
  const body = `${message.senderName} · ${message.senderEmail}`;

  return showBrowserNotification(title, {
    body,
    tag: `message:${message.id}`,
    data: { messageId: message.id, url: "/" },
  });
}
