import { registerFcmToken, registerMessagingServiceWorker } from "@/app/push/fcm";
import { notifyNewMessage, type ShowBrowserNotificationResult } from "@/app/push/notify";
import {
  getNotificationPermission,
  getNotificationPermissionError,
} from "@/app/push/notificationPermission";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import { firebaseAuth } from "@/utils/firebaseAuth";
import { sendInboxTestPush } from "@/utils/push-api";
import { isPortfolioApiConfigured } from "@/utils/reply-api";

export type SendTestNotificationResult = {
  ok: boolean;
  message: string;
  local: ShowBrowserNotificationResult | null;
  /** Server FCM via portfolio API — optional; client Firebase cannot send push. */
  serverPush: "sent" | "not-configured" | "not-available" | "skipped" | "failed";
  fcmTokenRefreshed: boolean;
};

export async function runSendTestNotification(options: {
  pushEnabled: boolean;
  /** When true and API is configured, also POST /api/inbox/test-push (real FCM from server). */
  includeServerPush?: boolean;
}): Promise<SendTestNotificationResult> {
  if (!options.pushEnabled) {
    return {
      ok: false,
      message: "Enable push notifications first (Settings or the bell icon).",
      local: null,
      serverPush: "skipped",
      fcmTokenRefreshed: false,
    };
  }

  const permission = getNotificationPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      message: getNotificationPermissionError(permission),
      local: null,
      serverPush: "skipped",
      fcmTokenRefreshed: false,
    };
  }

  if ("serviceWorker" in navigator) {
    await registerMessagingServiceWorker();
  }

  let fcmTokenRefreshed = false;
  const uid = firebaseAuth.currentUser?.uid;
  if (uid && isFcmConfigured()) {
    const tokenResult = await registerFcmToken(uid, { requestPermission: false });
    fcmTokenRefreshed = tokenResult.ok;
  }

  const local = await notifyNewMessage({
    id: "test",
    senderName: "Test",
    senderEmail: "test@example.com",
    company: "Developer Inbox",
    subject: "Test notification",
    preview: "If you see this, browser notifications work.",
    timestamp: new Date(),
    isRead: false,
    isImportant: false,
    isArchived: false,
    source: "test",
  });

  if (!local.ok) {
    return {
      ok: false,
      message: local.message,
      local,
      serverPush: "skipped",
      fcmTokenRefreshed,
    };
  }

  let serverPush: SendTestNotificationResult["serverPush"] = "skipped";
  if (options.includeServerPush && isPortfolioApiConfigured()) {
    try {
      const server = await sendInboxTestPush();
      serverPush = server.status;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server test push failed";
      return {
        ok: false,
        message: `${message} Local notification was shown.`,
        local,
        serverPush: "failed",
        fcmTokenRefreshed,
      };
    }
  }

  const parts: string[] = [
    'Local alert shown: "New contact message" — Test · test@example.com.',
  ];
  if (fcmTokenRefreshed) {
    parts.push("FCM token refreshed via firebase/messaging (see googleapis.com + Firestore).");
  } else if (isFcmConfigured()) {
    parts.push("FCM token not refreshed — check VAPID keys and console.");
  } else {
    parts.push("Add VITE_FIREBASE_VAPID_KEY for FCM registration.");
  }
  if (serverPush === "sent") {
    parts.push(
      'Server FCM sent — look for a second system alert titled "Test notification" (body: "server push works").',
    );
  } else if (serverPush === "not-available") {
    parts.push(
      "Backend has no /api/inbox/test-push — restart engineering-profile after pulling latest code.",
    );
  } else if (serverPush === "not-configured") {
    parts.push("Set VITE_PORTFOLIO_API_URL=http://localhost:3000 to test server FCM.");
  }

  return {
    ok: true,
    message: parts.join(" "),
    local,
    serverPush,
    fcmTokenRefreshed,
  };
}
