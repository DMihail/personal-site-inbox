import type { Message } from "../features/inbox/types";

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
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: `message:${message.id}`,
        data: { messageId: message.id },
      });
      return;
    }

    // Fallback (tab must be open).
    new Notification(title, { body, icon: "/favicon.png" });
  } catch {
    // best-effort
  }
}

