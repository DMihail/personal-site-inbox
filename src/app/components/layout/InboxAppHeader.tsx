import { List, Menu } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PushNotificationButton } from "../PushNotificationButton";
import { StatusIndicator } from "../StatusIndicator";

interface InboxAppHeaderProps {
  isOnline: boolean;
  unreadCount: number;
  onOpenNav: () => void;
  showMessagesListToggle?: boolean;
  onOpenMessagesList?: () => void;
  compact?: boolean;
  pushEnabled: boolean;
  pushRegistering: boolean;
  isSendingTest: boolean;
  pushError: string | null;
  onEnablePush: () => void;
  onDisablePush: () => void;
  onTestPush: () => void;
}

export function InboxAppHeader({
  isOnline,
  unreadCount,
  onOpenNav,
  showMessagesListToggle = false,
  onOpenMessagesList,
  compact,
  pushEnabled,
  pushRegistering,
  isSendingTest,
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
          className="ui-hover-ghost shrink-0"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="min-w-0 space-y-0.5">
          <h1 className="truncate text-body text-text-primary md:text-heading-sm">Developer Inbox</h1>
          {compact ? (
            <StatusIndicator
              label={isOnline ? "Connected" : "Offline"}
              status={isOnline ? "online" : "offline"}
            />
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        {showMessagesListToggle && onOpenMessagesList ? (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenMessagesList}
            className="tablet-messages-toggle glass ui-hover-glass border-glass-border lg:hidden"
            aria-label="Open message list"
          >
            <List className="me-2 shrink-0" aria-hidden="true" />
            <span className="hidden md:inline">All messages</span>
          </Button>
        ) : null}

        {!compact ? (
          <div className="hidden items-center gap-4 md:flex lg:flex">
            <StatusIndicator
              label={isOnline ? "Connected" : "Offline"}
              status={isOnline ? "online" : "offline"}
            />
            <span className="text-meta hidden text-text-muted xl:inline">Installable app</span>
          </div>
        ) : null}

        <PushNotificationButton
          enabled={pushEnabled}
          isRegistering={pushRegistering}
          isSendingTest={isSendingTest}
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
