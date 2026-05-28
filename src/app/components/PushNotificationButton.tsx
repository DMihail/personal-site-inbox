import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import { useRecheckPushPermission } from "../hooks/useRecheckPushPermission";
import { useRequestPushPermission } from "../hooks/useRequestPushPermission";
import { getPushNotificationSupport } from "../push/notificationPermission";
import { NotificationPermissionHelp } from "./NotificationPermissionHelp";

interface PushNotificationButtonProps {
  enabled: boolean;
  isRegistering: boolean;
  error: string | null;
  onEnable: () => void;
  onDisable: () => void;
  onTest?: () => void;
}

export function PushNotificationButton({
  enabled,
  isRegistering,
  error,
  onEnable,
  onDisable,
  onTest,
}: PushNotificationButtonProps) {
  const { permission, refresh } = useNotificationPermission();
  const requestPermissionAndEnable = useRequestPushPermission(onEnable);
  const recheckPermission = useRecheckPushPermission(refresh);

  const isActive = enabled && permission === "granted";
  const isDenied = permission === "denied";
  const Icon = isDenied ? BellOff : isActive ? BellRing : Bell;

  const handleEnable = () => {
    refresh();

    const support = getPushNotificationSupport();
    if (!support.ok) {
      toast.error("Could not enable notifications", { description: support.message });
      return;
    }

    if (permission === "denied") {
      toast.message("Unblock in browser settings", {
        description: "Follow the steps below, reload, then tap Check again.",
      });
      return;
    }

    if (permission === "granted") {
      onEnable();
      return;
    }

    void requestPermissionAndEnable().then((ok) => {
      if (ok) refresh();
    });
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && refresh()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 hover:glass-elevated ${isActive ? "text-cyan" : ""}`}
          aria-label="Push notifications"
          disabled={isRegistering}
        >
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glass-elevated border-glass-border w-[min(100vw-2rem,20rem)]"
      >
        <div className="px-2 py-1.5 text-sm font-medium text-text-primary">Push notifications</div>
        <p className="px-2 pb-2 text-xs text-text-muted">
          {isDenied
            ? "Blocked for this site — allow in the browser, reload, then check again."
            : isActive
              ? "Enabled: alerts while the app is open and when it is installed in the background."
              : "Enable to get alerts for new contact messages (open tab or installed app)."}
        </p>
        {isDenied ? (
          <div className="px-2 pb-2">
            <NotificationPermissionHelp compact onRecheck={recheckPermission} />
          </div>
        ) : null}
        {error && !isDenied ? <p className="px-2 pb-2 text-xs text-error">{error}</p> : null}
        <DropdownMenuSeparator className="bg-glass-border" />
        {isActive ? (
          <>
            {onTest ? (
              <DropdownMenuItem className="hover:bg-glass-elevated" onClick={onTest}>
                Send test notification
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className="hover:bg-glass-elevated" onClick={onDisable}>
              Turn off
            </DropdownMenuItem>
          </>
        ) : isDenied ? (
          <DropdownMenuItem className="hover:bg-glass-elevated" onClick={recheckPermission}>
            Check permission again
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="hover:bg-glass-elevated"
            disabled={isRegistering}
            onClick={handleEnable}
          >
            {isRegistering ? "Enabling…" : "Enable notifications"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
