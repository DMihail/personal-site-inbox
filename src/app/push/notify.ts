import type { MessagePayload } from "firebase/messaging";
import type { Message } from "../features/inbox/types";

function pickServiceWorkerRegistration(regs: Array<ServiceWorkerRegistration | undefined>) {
  return regs.find((r) => r?.showNotification) ?? null;
}

export async function notifyFromFcmPayload(payload: MessagePayload) {
  const title = payload.notification?.title ?? payload.data?.title ?? "New contact message";
  const body =
    payload.notification?.body ??
    payload.data?.body ??
    (payload.data?.preview ? String(payload.data.preview) : "");
  const messageId = payload.data?.messageId;
  const url = payload.data?.url ?? "/";

  try {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const reg = pickServiceWorkerRegistration([
      await navigator.serviceWorker.getRegistration("/firebase/"),
      await navigator.serviceWorker.getRegistration(),
    ]);

    const options: NotificationOptions = {
      body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: messageId ? `message:${messageId}` : undefined,
      data: { ...payload.data, url },
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

    // Prefer SW notifications (works better in installed PWA).
    const reg = pickServiceWorkerRegistration([
      await navigator.serviceWorker.getRegistration("/firebase/"),
      await navigator.serviceWorker.getRegistration(),
    ]);
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

    // Fallback (tab must be open).
    new Notification(title, { body, icon: "/favicon.png" });
  } catch {
    // best-effort
  }
}

