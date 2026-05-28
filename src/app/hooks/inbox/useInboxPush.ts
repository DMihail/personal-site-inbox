import { useCallback, useEffect, useMemo } from "react";
import { getNotificationPermission } from "@/app/push/notificationPermission";
import { usePushStore } from "@/app/store/pushStore";
import { isFcmConfigured } from "@/utils/firebaseConfig";
import type { InboxPushHandlers } from "./inbox-layout.types";

export function useInboxPush(userId: string | null | undefined) {
  const pushEnabled = usePushStore((s) => s.enabled);
  const pushRegistering = usePushStore((s) => s.isRegistering);
  const pushError = usePushStore((s) => s.error);
  const setPushEnabled = usePushStore((s) => s.setEnabled);
  const syncPushWithUser = usePushStore((s) => s.syncWithUser);
  const sendTestNotification = usePushStore((s) => s.sendTestNotification);

  useEffect(() => {
    if (!userId || !isFcmConfigured() || !("serviceWorker" in navigator)) return;
    void import("@/app/push/fcm").then((m) => m.registerMessagingServiceWorker());
  }, [userId]);

  useEffect(() => {
    if (getNotificationPermission() === "denied" && usePushStore.getState().enabled) {
      usePushStore.setState({ enabled: false, error: null });
    }

    if (!userId) {
      void syncPushWithUser(null);
      return;
    }

    if (!isFcmConfigured() || !("serviceWorker" in navigator)) {
      void syncPushWithUser(userId);
      return;
    }

    let cancelled = false;

    const onControllerChange = () => {
      if (!cancelled) void syncPushWithUser(userId);
    };

    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange);

    void import("@/app/push/fcm").then(async (m) => {
      await m.registerMessagingServiceWorker();
      if (!cancelled) await syncPushWithUser(userId);
    });

    return () => {
      cancelled = true;
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
    };
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
