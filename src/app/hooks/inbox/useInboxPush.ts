import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getNotificationPermission } from "@/push/permissions";
import { usePushStore } from "@/push/store";
import type { InboxPushHandlers } from "./inbox-layout.types";

export function useInboxPush(userId: string | null | undefined) {
  const pushEnabled = usePushStore((s) => s.enabled);
  const pushRegistering = usePushStore((s) => s.isRegistering);
  const pushError = usePushStore((s) => s.error);
  const setPushEnabled = usePushStore((s) => s.setEnabled);
  const sendTest = usePushStore((s) => s.sendTest);
  const isSendingTest = usePushStore((s) => s.isSendingTest);

  useEffect(() => {
    if (getNotificationPermission() === "denied" && usePushStore.getState().enabled) {
      usePushStore.setState({ enabled: false, error: null });
    }
  }, [userId]);

  const onEnablePush = useCallback(() => {
    void setPushEnabled(true, userId ?? null);
  }, [setPushEnabled, userId]);

  const onDisablePush = useCallback(() => {
    void setPushEnabled(false, userId ?? null);
  }, [setPushEnabled, userId]);

  const onTestPush = useCallback(() => {
    const pending = toast.loading("Running notification test…");
    void sendTest().then((result) => {
      toast.dismiss(pending);
      if (result.ok) {
        toast.success("Test complete", { description: result.message, duration: 12_000 });
        return;
      }
      toast.error("Test failed", { description: result.message });
    });
  }, [sendTest]);

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
