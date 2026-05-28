import type { MessagePayload } from "firebase/messaging";
import type { Message } from "../features/inbox/types";
import { getPwaServiceWorkerRegistration } from "./fcm";
import { getNotificationPermission } from "./notificationPermission";

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
    if (getNotificationPermission() !== "granted") return;

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

export async function notifyNewMessage(message: Message) {
  try {
    if (!("Notification" in window)) return;
    if (getNotificationPermission() !== "granted") return;

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
