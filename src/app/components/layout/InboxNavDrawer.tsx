import { DeveloperInboxNavPanel } from "./DeveloperInboxNavPanel";
import { SlideDrawer } from "./SlideDrawer";
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
  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      enableGesture
      edgeWidth={20}
      labelledBy="inbox-nav-drawer-title"
      panelClassName="z-[60] w-[min(100vw,17rem)]"
    >
      <DeveloperInboxNavPanel
        titleId="inbox-nav-drawer-title"
        isOnline={isOnline}
        currentView={currentView}
        inboxCount={inboxCount}
        unreadCount={unreadCount}
        importantCount={importantCount}
        onSelectView={onSelectView}
        onClose={onClose}
        showDesktopMeta={showDesktopMeta}
      />
    </SlideDrawer>
  );
}
