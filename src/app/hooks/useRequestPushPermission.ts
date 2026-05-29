import { useCallback } from "react";
import { toast } from "sonner";
import { requestPushPermissionFromUserGesture } from "../push/notificationPermission";

/**
 * Requests notification permission from a user gesture, then runs `onGranted`.
 * Permission must be requested here — not inside async store actions.
 */
export function useRequestPushPermission(onGranted: () => void) {
  return useCallback(async () => {
    const result = await requestPushPermissionFromUserGesture();
    if (!result.ok) {
      toast.error("Could not enable notifications", { description: result.error });
      return false;
    }
    onGranted();
    return true;
  }, [onGranted]);
}
