import { useCallback } from "react";
import { toast } from "sonner";
import {
  beginNotificationPermissionRequest,
  finishNotificationPermissionRequest,
} from "../push/notificationPermission";

/**
 * Requests notification permission from a user gesture, then runs `onGranted`.
 * The browser prompt must be started synchronously inside the click/tap handler.
 */
export function useRequestPushPermission(onGranted: () => void) {
  return useCallback(() => {
    const began = beginNotificationPermissionRequest();
    if (!began.ok) {
      toast.error("Could not enable notifications", { description: began.error });
      return Promise.resolve(false);
    }

    return finishNotificationPermissionRequest(began.permissionPromise).then((result) => {
      if (!result.ok) {
        toast.error("Could not enable notifications", { description: result.error });
        return false;
      }
      void onGranted();
      return true;
    });
  }, [onGranted]);
}
