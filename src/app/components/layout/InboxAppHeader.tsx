import { Menu } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PushNotificationButton } from "../PushNotificationButton";
import { StatusIndicator } from "../StatusIndicator";
import { SystemMetadata } from "../SystemMetadata";

interface InboxAppHeaderProps {
  isOnline: boolean;
  unreadCount: number;
  onOpenNav: () => void;
  compact?: boolean;
  pushEnabled: boolean;
  pushRegistering: boolean;
  pushError: string | null;
  onEnablePush: () => void;
  onDisablePush: () => void;
  onTestPush: () => void;
}

export function InboxAppHeader({
  isOnline,
  unreadCount,
  onOpenNav,
  compact,
  pushEnabled,
  pushRegistering,
  pushError,
  onEnablePush,
  onDisablePush,
  onTestPush,
}: InboxAppHeaderProps) {
  return (
    <div className="shrink-0 border-b border-glass-border glass backdrop-blur-xl px-4 py-3 md:px-6 md:py-0 md:h-16 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenNav}
          className="shrink-0 hover:glass-elevated"
          aria-label="Open Developer Inbox menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-base md:text-lg text-text-primary truncate">Developer Inbox</h1>
          {compact && (
            <StatusIndicator label="sync.online" status={isOnline ? "online" : "offline"} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {!compact && (
          <div className="hidden lg:flex items-center gap-4">
            <StatusIndicator label="realtime.active" status={isOnline ? "online" : "offline"} />
            <SystemMetadata className="hidden xl:inline">pwa.v1</SystemMetadata>
          </div>
        )}

        <PushNotificationButton
          enabled={pushEnabled}
          isRegistering={pushRegistering}
          error={pushError}
          onEnable={onEnablePush}
          onDisable={onDisablePush}
          onTest={onTestPush}
        />

        {unreadCount > 0 && (
          <Badge variant="secondary" className="bg-cyan/20 text-cyan border border-cyan/30">
            {unreadCount}
            <span className="hidden sm:inline"> unread</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
