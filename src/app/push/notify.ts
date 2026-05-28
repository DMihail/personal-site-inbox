import type { MessagePayload } from "firebase/messaging";
import type { Message } from "../features/inbox/types";
import { getPwaServiceWorkerRegistration } from "./fcm";

export async function notifyFromFcmPayload(payload: MessagePayload) {
  const data = payload.data ?? {};
  const title = payload.notification?.title ?? data.title ?? "New contact message";
  const body =
    payload.notification?.body ??
    data.body ??
    (data.preview ? String(data.preview) : "");
  const messageId = data.messageId;
  const url = data.url ?? "/";

  try {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const reg = await getPwaServiceWorkerRegistration();

    const options: NotificationOptions = {
      body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: messageId ? `message:${messageId}` : undefined,
      data: { ...data, url },
    };

    if (reg?.showNotification) {
      await reg.showNotification(title, options);
      return;
    }

    new Notification(title, options);
  } catch {
    // best-effort
  }
}

export async function ensureNotificationPermission() {
  try {
    if (!("Notification" in window)) return "unsupported" as const;
    if (Notification.permission === "granted") return "granted" as const;
    if (Notification.permission === "denied") return "denied" as const;

    return await Notification.requestPermission();
  } catch {
    return "unsupported" as const;
  }
}

export async function notifyNewMessage(message: Message) {
  try {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const title = "New contact message";
    const body = `${message.senderName} · ${message.senderEmail}`;

    const reg = await getPwaServiceWorkerRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: `message:${message.id}`,
        data: { messageId: message.id, url: "/" },
      });
      return;
    }

    new Notification(title, { body, icon: "/favicon.png" });
  } catch {
    // best-effort
  }
}
