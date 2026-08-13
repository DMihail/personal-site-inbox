/// <reference lib="webworker" />

import { initializeApp, getApps } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare const self: ServiceWorkerGlobalScope;

function safeInAppUrl(rawUrl: string | undefined): string {
  try {
    const url = new URL(rawUrl || "/", self.location.origin);
    if (url.origin !== self.location.origin) {
      return `${self.location.origin}/`;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function readFirebaseConfig() {
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID?.trim();
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim();
  return {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY ?? "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    ...(messagingSenderId ? { messagingSenderId } : {}),
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
    ...(measurementId ? { measurementId } : {}),
  };
}

type BackgroundPayload = {
  data?: Record<string, string | undefined>;
  notification?: { title?: string; body?: string; icon?: string };
};

function showPushNotification(payload: BackgroundPayload) {
  const data = payload.data ?? {};
  const title = data.title || payload.notification?.title || "New contact message";
  const body = data.body || payload.notification?.body || data.preview || "";
  const messageId = data.messageId;
    const url = data.url || (messageId ? `/inbox?message=${encodeURIComponent(messageId)}` : "/inbox");

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: payload.notification?.icon || "/favicon.png",
    badge: "/favicon.png",
    tag: messageId ? `message:${messageId}` : undefined,
    renotify: true,
    data: { ...data, url },
  };

  return self.registration.showNotification(title, options);
}

/** Registers notification click + FCM background handler inside the unified `/sw.js`. */
export function registerFirebaseMessagingBackground(): void {
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const targetUrl = safeInAppUrl((event.notification.data as { url?: string } | undefined)?.url);

    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (list) => {
        for (const client of list) {
          if (!("focus" in client)) continue;
          await client.focus();
          const windowClient = client as WindowClient;
          if ("navigate" in windowClient && typeof windowClient.navigate === "function") {
            try {
              await windowClient.navigate(targetUrl);
              return;
            } catch {
              /* fall through to postMessage */
            }
          }
          windowClient.postMessage({ type: "NOTIFICATION_NAVIGATE", url: targetUrl });
          return;
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
    );
  });

  const config = readFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId) {
    return;
  }

  const app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  const messaging = getMessaging(app);
  onBackgroundMessage(messaging, (payload) => showPushNotification(payload));
}
