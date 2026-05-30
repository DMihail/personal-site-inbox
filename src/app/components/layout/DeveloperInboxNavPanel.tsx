import { Archive, Inbox, Mail, Settings, Star, X } from "lucide-react";
import { NavItem } from "../NavItem";
import { StatusIndicator } from "../StatusIndicator";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { scrollPaneClass } from "./scrollPane";
import { AppVersion } from "../AppVersion";
import type { View } from "../../features/inbox/types";

interface DeveloperInboxNavPanelProps {
  titleId: string;
  isOnline: boolean;
  inboxCount: number;
  unreadCount: number;
  importantCount: number;
  onSelectView: (view: View) => void;
  onClose: () => void;
  showDesktopMeta?: boolean;
}

export function DeveloperInboxNavPanel({
  titleId,
  isOnline,
  inboxCount,
  unreadCount,
  importantCount,
  onSelectView,
  onClose,
  showDesktopMeta = false,
}: DeveloperInboxNavPanelProps) {
  return (
    <>
      <header className="shrink-0 space-y-3 border-b border-glass-border glass p-4 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="truncate text-lg text-text-primary md:text-heading-sm">
              Developer Inbox
            </h2>
            <p className="text-meta text-text-muted">Contact messages</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ui-hover-ghost shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <StatusIndicator
            label={isOnline ? "Connected" : "Offline"}
            status={isOnline ? "online" : "offline"}
          />
          {showDesktopMeta ? (
            <StatusIndicator
              label="Live sync"
              status={isOnline ? "online" : "offline"}
              showPulse={false}
            />
          ) : null}
        </div>
      </header>

      <div className={scrollPaneClass}>
        <nav className="space-y-1 p-3" aria-label="Inbox views">
          <NavItem
            icon={Inbox}
            label="Inbox"
            view="inbox"
            count={inboxCount}
            onSelect={onSelectView}
          />
          <NavItem
            icon={Mail}
            label="Unread"
            view="unread"
            count={unreadCount}
            onSelect={onSelectView}
          />
          <NavItem
            icon={Star}
            label="Important"
            view="important"
            count={importantCount}
            onSelect={onSelectView}
          />
          <NavItem
            icon={Archive}
            label="Archived"
            view="archived"
            onSelect={onSelectView}
          />
          <Separator className="my-3 bg-glass-border" />
          <NavItem
            icon={Settings}
            label="Settings"
            view="settings"
            onSelect={onSelectView}
          />
        </nav>

        {showDesktopMeta ? <AppVersion className="mt-6 px-1" /> : null}
      </div>
    </>
  );
}
