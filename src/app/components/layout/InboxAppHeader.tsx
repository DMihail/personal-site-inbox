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
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-glass-border glass px-4 py-3 backdrop-blur-xl md:h-16 md:px-6 md:py-0">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenNav}
          className="shrink-0 hover:glass-elevated"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="min-w-0 space-y-0.5">
          <h1 className="truncate text-body text-text-primary md:text-heading-sm">Developer Inbox</h1>
          {compact ? (
            <StatusIndicator label="sync.online" status={isOnline ? "online" : "offline"} />
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        {!compact ? (
          <div className="hidden items-center gap-4 lg:flex">
            <StatusIndicator label="realtime.active" status={isOnline ? "online" : "offline"} />
            <SystemMetadata className="hidden xl:inline">pwa.v1</SystemMetadata>
          </div>
        ) : null}

        <PushNotificationButton
          enabled={pushEnabled}
          isRegistering={pushRegistering}
          error={pushError}
          onEnable={onEnablePush}
          onDisable={onDisablePush}
          onTest={onTestPush}
        />

        {unreadCount > 0 ? (
          <Badge
            variant="secondary"
            className="border border-cyan/30 bg-cyan/20 text-cyan"
            aria-label={`${unreadCount} unread messages`}
          >
            <span aria-hidden="true">{unreadCount}</span>
            <span className="hidden sm:inline"> unread</span>
          </Badge>
        ) : null}
      </div>
    </header>
  );
}
