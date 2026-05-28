import { List } from "lucide-react";
import { Button } from "../ui/button";
import { MessageDetail } from "../MessageDetail";
import { scrollPaneClass } from "./scrollPane";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import { InboxMessagesDrawer } from "./InboxMessagesDrawer";
import { InboxMessagesPanel } from "./InboxMessagesPanel";
import { VIEW_SECTION_HEADINGS } from "../../features/inbox/viewRouting";
import { useEdgeDrawerOpenGesture } from "../../hooks/useEdgeDrawerOpenGesture";
import { useIsTabletLayout } from "../../hooks/useMediaQuery";
import { useRef } from "react";
import type { InboxLayoutBaseProps } from "@/app/hooks/inbox/inbox-layout.types";

interface DesktopInboxLayoutProps extends InboxLayoutBaseProps {
  onSelectMessage: (messageId: string) => void;
}

export function DesktopInboxLayout({
  isOnline,
  currentView,
  selectedMessage,
  selectedMessageId,
  filteredMessages,
  inboxCount,
  unreadCount,
  importantCount,
  searchQuery,
  sortBy,
  filterBy,
  navMenuOpen,
  messagesListOpen,
  onOpenNavMenu,
  onCloseNavMenu,
  onOpenMessagesList,
  onCloseMessagesList,
  onSelectView,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onSelectMessage,
  onArchive,
  onToggleImportant,
  onDelete,
  onMarkAsRead,
  onReply,
  settingsView,
  pushEnabled,
  pushRegistering,
  pushError,
  onEnablePush,
  onDisablePush,
  onTestPush,
}: DesktopInboxLayoutProps) {
  const isTablet = useIsTabletLayout();
  const detailRef = useRef<HTMLElement>(null);

  const listHeading =
    currentView === "settings"
      ? "Settings"
      : VIEW_SECTION_HEADINGS[currentView as keyof typeof VIEW_SECTION_HEADINGS];

  const showMessagesDrawer =
    isTablet && currentView !== "settings";

  useEdgeDrawerOpenGesture({
    enabled: showMessagesDrawer && !messagesListOpen,
    onOpen: onOpenMessagesList,
    targetRef: detailRef,
  });

  const messagesPanelProps = {
    listHeading,
    filteredMessages,
    selectedMessageId,
    searchQuery,
    sortBy,
    filterBy,
    currentView,
    onSearchChange,
    onSortChange,
    onFilterChange,
    onSelectMessage,
    onToggleImportant,
    onDelete,
  };

  return (
    <div className="hidden h-full min-h-0 flex-col overflow-hidden md:flex">
      <InboxAppHeader
        isOnline={isOnline}
        unreadCount={unreadCount}
        onOpenNav={onOpenNavMenu}
        showMessagesListToggle={false}
        onOpenMessagesList={onOpenMessagesList}
        pushEnabled={pushEnabled}
        pushRegistering={pushRegistering}
        pushError={pushError}
        onEnablePush={onEnablePush}
        onDisablePush={onDisablePush}
        onTestPush={onTestPush}
      />

      <InboxNavDrawer
        open={navMenuOpen}
        isOnline={isOnline}
        currentView={currentView}
        inboxCount={inboxCount}
        unreadCount={unreadCount}
        importantCount={importantCount}
        onSelectView={onSelectView}
        onClose={onCloseNavMenu}
        showDesktopMeta
      />

      {showMessagesDrawer ? (
        <InboxMessagesDrawer
          open={messagesListOpen}
          persistent
          onClose={onCloseMessagesList}
          {...messagesPanelProps}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {currentView === "settings" ? (
          <main id="app-main" className={`${scrollPaneClass} w-full tablet-detail-scroll`} aria-label="Settings">
            {settingsView}
          </main>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1">
            {/* Desktop lg+: fixed message list */}
            <aside
              className="hidden w-[28rem] shrink-0 flex-col border-e border-glass-border glass backdrop-blur-xl lg:flex xl:w-[32rem]"
              aria-label="Message list"
            >
              <InboxMessagesPanel {...messagesPanelProps} />
            </aside>

            <main
              ref={detailRef}
              id="app-main"
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background"
              aria-label="Message details"
            >
              {showMessagesDrawer && !messagesListOpen ? (
                <div className="tablet-detail-toolbar shrink-0 border-b border-glass-border glass lg:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenMessagesList}
                    className="tablet-messages-toggle glass ui-hover-glass w-full justify-start border-glass-border sm:w-auto"
                  >
                    <List className="me-2.5 shrink-0" aria-hidden="true" />
                    {listHeading}
                  </Button>
                </div>
              ) : null}
              <div className={`min-h-0 flex-1 overflow-hidden ${showMessagesDrawer ? "tablet-detail-scroll" : ""}`}>
                <MessageDetail
                  message={selectedMessage}
                  onMarkAsRead={onMarkAsRead}
                  onArchive={onArchive}
                  onToggleImportant={onToggleImportant}
                  onDelete={onDelete}
                  onReply={onReply}
                />
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
