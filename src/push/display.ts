import type { Message } from "@/app/features/inbox/types";
import { messageDeepLinkPath } from "@/app/features/inbox/messageLinks";
import type { PushPayload } from "@/push/types";
import { getActiveFcmRegistration } from "@/push/service-worker";
import { showNotificationOnce } from "@/push/dedupe";
import { getNotificationPermission, getNotificationPermissionError } from "@/push/permissions";

export type ShowBrowserNotificationResult =
  { ok: true } | { ok: false; reason: "permission" | "unsupported" | "error"; message: string };

const ICON = "/favicon.png";

async function resolveRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration("/")) ?? getActiveFcmRegistration();
}

export async function showBrowserNotification(
  title: string,
  options: NotificationOptions = {},
): Promise<ShowBrowserNotificationResult> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { ok: false, reason: "unsupported", message: "Notifications are not supported." };
  }

  if (getNotificationPermission() !== "granted") {
    return {
      ok: false,
      reason: "permission",
      message: getNotificationPermissionError(getNotificationPermission()),
    };
  }

  const opts: NotificationOptions = {
    icon: ICON,
    badge: ICON,
    ...options,
    ...({ renotify: true } as NotificationOptions),
  };

  try {
    const reg = await resolveRegistration();
    if (reg) {
      await reg.showNotification(title, opts);
      return { ok: true };
    }
    new Notification(title, opts);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not show notification";
    return { ok: false, reason: "error", message };
  }
}

export async function notifyFromPushPayload(payload: PushPayload): Promise<void> {
  const data = payload.data ?? {};
  const title = payload.notification?.title ?? data.title ?? "New contact message";
  const body =
    payload.notification?.body ?? data.body ?? (data.preview ? String(data.preview) : "");
  const messageId = typeof data.messageId === "string" ? data.messageId : undefined;
  const url =
    typeof data.url === "string" && data.url.trim()
      ? data.url
      : messageId
        ? messageDeepLinkPath(messageId)
        : "/inbox";

  await showNotificationOnce(messageId, () =>
    showBrowserNotification(title, {
      body,
      tag: messageId ? `message:${messageId}` : undefined,
      data: { ...data, url },
    }),
  );
}

export async function notifyNewMessage(message: Message): Promise<ShowBrowserNotificationResult> {
  return showBrowserNotification("New contact message", {
    body: `${message.senderName} · ${message.senderEmail}`,
    tag: `message:${message.id}`,
    data: { messageId: message.id, url: messageDeepLinkPath(message.id) },
  });
}
