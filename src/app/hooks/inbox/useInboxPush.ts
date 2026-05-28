import { useCallback, useEffect, useMemo } from "react";
import { getNotificationPermission } from "@/app/push/notificationPermission";
import { usePushStore } from "@/app/store/pushStore";
import type { InboxPushHandlers } from "./inbox-layout.types";

export function useInboxPush(userId: string | null | undefined) {
  const pushEnabled = usePushStore((s) => s.enabled);
  const pushRegistering = usePushStore((s) => s.isRegistering);
  const pushError = usePushStore((s) => s.error);
  const setPushEnabled = usePushStore((s) => s.setEnabled);
  const syncPushWithUser = usePushStore((s) => s.syncWithUser);
  const sendTestNotification = usePushStore((s) => s.sendTestNotification);

  useEffect(() => {
    if (getNotificationPermission() === "denied" && usePushStore.getState().enabled) {
      usePushStore.setState({ enabled: false, error: null });
    }
    void syncPushWithUser(userId ?? null);
  }, [userId, syncPushWithUser]);

  const onEnablePush = useCallback(() => {
    void setPushEnabled(true, userId ?? null);
  }, [setPushEnabled, userId]);

  const onDisablePush = useCallback(() => {
    void setPushEnabled(false, userId ?? null);
  }, [setPushEnabled, userId]);

  const onTestPush = useCallback(() => {
    void sendTestNotification();
  }, [sendTestNotification]);

  const handlePushEnabledChange = useCallback(
    (enabled: boolean) => {
      void setPushEnabled(enabled, userId ?? null);
    },
    [setPushEnabled, userId],
  );

  const handlers: InboxPushHandlers = useMemo(
    () => ({
      pushEnabled,
      pushRegistering,
      pushError,
      onEnablePush,
      onDisablePush,
      onTestPush,
    }),
    [pushEnabled, pushRegistering, pushError, onEnablePush, onDisablePush, onTestPush],
  );

  return { handlers, handlePushEnabledChange };
}
