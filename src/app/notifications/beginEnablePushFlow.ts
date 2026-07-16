import { toast } from "sonner";
import {
  beginNotificationPermissionRequest,
  finishNotificationPermissionRequest,
  getNotificationPermission,
  getPushNotificationSupport,
} from "@/push/permissions";

type EnablePushResult =
  | { status: "enabled" }
  | { status: "requesting"; promise: Promise<boolean> }
  | { status: "blocked" }
  | { status: "unsupported"; message: string };

/**
 * Shared enable-push flow for Settings and the header bell menu.
 * Must be called from a user gesture so the browser permission prompt can open.
 */
export function beginEnablePushFlow(onEnable: () => void): EnablePushResult {
  const support = getPushNotificationSupport();
  if (!support.ok) {
    return { status: "unsupported", message: support.message };
  }

  const current = getNotificationPermission();
  if (current === "denied") {
    return { status: "blocked" };
  }

  if (current === "granted") {
    onEnable();
    return { status: "enabled" };
  }

  const began = beginNotificationPermissionRequest();
  if (!began.ok) {
    return { status: "unsupported", message: began.error };
  }

  const promise = finishNotificationPermissionRequest(began.permissionPromise).then((result) => {
    if (!result.ok) {
      toast.error("Could not enable notifications", { description: result.error });
      return false;
    }
    onEnable();
    return true;
  });

  return { status: "requesting", promise };
}
