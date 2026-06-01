import { useCallback, useEffect, useState } from "react";
import { getNotificationPermission, type NotificationPermissionState } from "../push/notificationPermission";

/** Live `Notification.permission` — refreshes when the tab regains focus. */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionState>(() =>
    getNotificationPermission(),
  );

  const refresh = useCallback(() => {
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { permission, refresh };
}
