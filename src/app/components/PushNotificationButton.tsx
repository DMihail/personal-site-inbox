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
import { beginEnablePushFlow } from "../notifications/beginEnablePushFlow";
import { NotificationPermissionHelp } from "./NotificationPermissionHelp";

interface PushNotificationButtonProps {
  enabled: boolean;
  isRegistering: boolean;
  isSendingTest?: boolean;
  error: string | null;
  onEnable: () => void;
  onDisable: () => void;
  onTest?: () => void;
}

export function PushNotificationButton({
  enabled,
  isRegistering,
  isSendingTest = false,
  error,
  onEnable,
  onDisable,
  onTest,
}: PushNotificationButtonProps) {
  const { permission, refresh } = useNotificationPermission();
  const recheckPermission = useRecheckPushPermission(refresh);

  const isActive = enabled && permission === "granted";
  const isDenied = permission === "denied";
  const Icon = isDenied ? BellOff : isActive ? BellRing : Bell;

  const handleEnable = () => {
    const result = beginEnablePushFlow(onEnable);

    if (result.status === "unsupported") {
      toast.error("Could not enable notifications", { description: result.message });
      return;
    }

    if (result.status === "blocked") {
      toast.message("Unblock in browser settings", {
        description: "Follow the steps below, reload, then tap Check again.",
      });
      return;
    }

    if (result.status === "enabled") {
      refresh();
      return;
    }

    void result.promise.then((ok) => {
      if (ok) refresh();
    });
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && refresh()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`ui-hover-ghost shrink-0 ${isActive ? "text-cyan" : ""}`}
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
              <DropdownMenuItem disabled={isSendingTest} onSelect={onTest}>
                {isSendingTest ? "Testing…" : "Send test notification"}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={onDisable}>Turn off</DropdownMenuItem>
          </>
        ) : isDenied ? (
          <DropdownMenuItem onSelect={recheckPermission}>Check permission again</DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={isRegistering}
            onSelect={(event) => {
              event.preventDefault();
              handleEnable();
            }}
          >
            {isRegistering ? "Enabling…" : "Enable notifications"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
