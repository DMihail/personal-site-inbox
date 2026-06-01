import type { MessagePayload } from "firebase/messaging";
import type { Message } from "../features/inbox/types";
import { getPwaServiceWorkerRegistration } from "./fcm";
import {
  getNotificationPermission,
  getNotificationPermissionError,
} from "./notificationPermission";

export type ShowBrowserNotificationResult =
  | { ok: true }
  | { ok: false; reason: "permission" | "unsupported" | "error"; message: string };

const DEFAULT_NOTIFICATION_ICON = "/favicon.png";

/** Shows a system notification; falls back to `Notification` when no service worker is active. */
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
  };

  try {
    const reg = await getPwaServiceWorkerRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(title, withIcon);
      return { ok: true };
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
  const messageId = data.messageId;
  const url = data.url ?? "/";

  await showBrowserNotification(title, {
    body,
    tag: messageId ? `message:${messageId}` : undefined,
    data: { ...data, url },
  });
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
