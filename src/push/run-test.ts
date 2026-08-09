import { registerPushToken } from "@/push/messaging";
import { notifyNewMessage, type ShowBrowserNotificationResult } from "@/push/display";
import { getNotificationPermission, getNotificationPermissionError } from "@/push/permissions";
import { isPushConfigured } from "@/push/config";
import { getFirebaseAuth } from "@/utils/firebaseAuth";
import { sendInboxTestPush } from "@/utils/push-api";
import { isPortfolioApiConfigured } from "@/utils/reply-api";

export type PushTestResult = {
  ok: boolean;
  message: string;
  local: ShowBrowserNotificationResult | null;
  serverPush: "sent" | "not-configured" | "not-available" | "skipped" | "failed";
  tokenRegistered: boolean;
};

export async function runPushTest(pushEnabled: boolean): Promise<PushTestResult> {
  if (!pushEnabled) {
    return {
      ok: false,
      message: "Enable push notifications first.",
      local: null,
      serverPush: "skipped",
      tokenRegistered: false,
    };
  }

  if (getNotificationPermission() !== "granted") {
    return {
      ok: false,
      message: getNotificationPermissionError(getNotificationPermission()),
      local: null,
      serverPush: "skipped",
      tokenRegistered: false,
    };
  }

  let tokenRegistered = false;
  const auth = await getFirebaseAuth();
  const uid = auth.currentUser?.uid;
  if (uid && isPushConfigured()) {
    tokenRegistered = (await registerPushToken(uid)).ok;
  }

  const local = await notifyNewMessage({
    id: "test-local",
    senderName: "Test",
    senderEmail: "test@example.com",
    company: "Developer Inbox",
    subject: "Test",
    preview: "Local notification test",
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
      tokenRegistered,
    };
  }

  let serverPush: PushTestResult["serverPush"] = "skipped";
  if (isPortfolioApiConfigured()) {
    try {
      serverPush = (await sendInboxTestPush()).status;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server test push failed";
      return {
        ok: false,
        message: `${message} (local notification was shown)`,
        local,
        serverPush: "failed",
        tokenRegistered,
      };
    }
  }

  const parts = [
    "Local notification shown.",
    tokenRegistered ? "FCM token saved to Firestore." : "FCM token was not saved — check console.",
  ];
  if (serverPush === "sent") {
    parts.push("Server sent FCM to all registered devices.");
  }

  return {
    ok: true,
    message: parts.join(" "),
    local,
    serverPush,
    tokenRegistered,
  };
}
