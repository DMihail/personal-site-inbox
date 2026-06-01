import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
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
  const isSendingTest = usePushStore((s) => s.isSendingTest);

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
    const pending = toast.loading("Running notification test…", {
      description: "Local alert + optional POST to portfolio API (server FCM).",
    });
    void sendTestNotification().then((result) => {
      toast.dismiss(pending);
      if (result.ok) {
        toast.success("Test complete", {
          description: result.message,
          duration: 12_000,
        });
        return;
      }
      toast.error("Test notification failed", { description: result.message });
    });
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
      isSendingTest,
      onEnablePush,
      onDisablePush,
      onTestPush,
    }),
    [
      pushEnabled,
      pushRegistering,
      pushError,
      isSendingTest,
      onEnablePush,
      onDisablePush,
      onTestPush,
    ],
  );

  return { handlers, handlePushEnabledChange };
}
