import { useState } from "react";
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
import { getNotificationPermission } from "../push/notificationPermission";
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
  const [permission, setPermission] = useState(() => getNotificationPermission());

  const isActive = enabled && permission === "granted";
  const isDenied = permission === "denied";
  const Icon = isDenied ? BellOff : isActive ? BellRing : Bell;

  const refreshPermission = () => setPermission(getNotificationPermission());

  return (
    <DropdownMenu onOpenChange={(open) => open && refreshPermission()}>
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
      <DropdownMenuContent align="end" className="glass-elevated border-glass-border w-64">
        <div className="px-2 py-1.5 text-sm text-text-primary font-medium">Push notifications</div>
        <p className="px-2 pb-2 text-xs text-text-muted">
          {isDenied
            ? "Blocked in browser settings — allow notifications for this site."
            : isActive
              ? "Enabled: alerts while the app is open and when it is installed in the background."
              : "Enable to get alerts for new contact messages (open tab or installed app)."}
        </p>
        {error ? <p className="px-2 pb-2 text-xs text-error">{error}</p> : null}
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
        ) : (
          <DropdownMenuItem
            className="hover:bg-glass-elevated"
            disabled={isDenied || isRegistering}
            onClick={() => {
              if (isDenied) {
                toast.error("Notifications blocked", {
                  description: "Allow notifications in your browser site settings.",
                });
                return;
              }
              refreshPermission();
              onEnable();
            }}
          >
            {isRegistering ? "Enabling…" : "Enable notifications"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
