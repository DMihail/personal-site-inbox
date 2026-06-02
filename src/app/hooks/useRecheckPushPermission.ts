import { useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { usePushStore } from "@/push/store";
import {
  getNotificationPermission,
  getNotificationPermissionError,
} from "@/push/permissions";
import { useRequestPushPermission } from "./useRequestPushPermission";

export function useRecheckPushPermission(refreshPermission: () => void) {
  const user = useAuthStore((s) => s.user);
  const setEnabled = usePushStore((s) => s.setEnabled);
  const requestAndEnable = useRequestPushPermission(() => {
    void setEnabled(true, user?.uid ?? null);
  });

  return useCallback(() => {
    refreshPermission();
    const permission = getNotificationPermission();

    if (permission === "granted") {
      usePushStore.setState({ error: null });
      void setEnabled(true, user?.uid ?? null);
      toast.success("Notifications allowed", { description: "Push is being enabled…" });
      return;
    }

    if (permission === "default") {
      void requestAndEnable();
      return;
    }

    if (permission === "denied") {
      toast.message("Still blocked", {
        description: getNotificationPermissionError("denied"),
      });
      return;
    }

    toast.error("Notifications unavailable", {
      description: getNotificationPermissionError("unsupported"),
    });
  }, [refreshPermission, requestAndEnable, setEnabled, user?.uid]);
}
