import { Archive, Inbox, Mail, Settings, Star, X } from "lucide-react";
import { NavItem } from "../NavItem";
import { StatusIndicator } from "../StatusIndicator";
import { SystemMetadata } from "../SystemMetadata";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { scrollPaneClass } from "./scrollPane";
import type { View } from "../../features/inbox/types";

interface DeveloperInboxNavPanelProps {
  titleId: string;
  isOnline: boolean;
  currentView: View;
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
  currentView,
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
            <h2 id={titleId} className="truncate text-lg text-text-primary">
              Developer Inbox
            </h2>
            <SystemMetadata>inbox.v1</SystemMetadata>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 hover:glass-elevated"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <StatusIndicator label="sync.online" status={isOnline ? "online" : "offline"} />
          {showDesktopMeta ? (
            <StatusIndicator label="firestore.live" status="online" showPulse={false} />
          ) : null}
        </div>
      </header>

      <div className={scrollPaneClass}>
        <nav className="space-y-1 p-3" aria-label="Inbox views">
          <NavItem
            icon={Inbox}
            label="Inbox"
            view="inbox"
            currentView={currentView}
            count={inboxCount}
            onSelect={onSelectView}
          />
          <NavItem
            icon={Mail}
            label="Unread"
            view="unread"
            currentView={currentView}
            count={unreadCount}
            onSelect={onSelectView}
          />
          <NavItem
            icon={Star}
            label="Important"
            view="important"
            currentView={currentView}
            count={importantCount}
            onSelect={onSelectView}
          />
          <NavItem
            icon={Archive}
            label="Archived"
            view="archived"
            currentView={currentView}
            onSelect={onSelectView}
          />
          <Separator className="my-3 bg-glass-border" />
          <NavItem
            icon={Settings}
            label="Settings"
            view="settings"
            currentView={currentView}
            onSelect={onSelectView}
          />
        </nav>
      </div>
    </>
  );
}
