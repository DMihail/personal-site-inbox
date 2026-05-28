import { DeveloperInboxNavPanel } from "./DeveloperInboxNavPanel";
import type { View } from "../../features/inbox/types";

interface InboxNavDrawerProps {
  open: boolean;
  isOnline: boolean;
  currentView: View;
  inboxCount: number;
  unreadCount: number;
  importantCount: number;
  onSelectView: (view: View) => void;
  onClose: () => void;
  showDesktopMeta?: boolean;
}

export function InboxNavDrawer({
  open,
  isOnline,
  currentView,
  inboxCount,
  unreadCount,
  importantCount,
  onSelectView,
  onClose,
  showDesktopMeta,
}: InboxNavDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Developer Inbox menu">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(100vw,17rem)] flex-col border-r border-glass-border bg-background shadow-2xl">
        <DeveloperInboxNavPanel
          isOnline={isOnline}
          currentView={currentView}
          inboxCount={inboxCount}
          unreadCount={unreadCount}
          importantCount={importantCount}
          onSelectView={onSelectView}
          onClose={onClose}
          showDesktopMeta={showDesktopMeta}
        />
      </aside>
    </div>
  );
}
