import { lazy, Suspense, useRef, useState } from "react";
import { List } from "lucide-react";
import { Button } from "../ui/button";
import { MessageDetail } from "../MessageDetail";
import { scrollPaneClass } from "./scrollPane";
import { KeepAlivePane } from "./KeepAlivePane";
import { SettingsFallback } from "./SettingsFallback";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import { InboxMessagesDrawer } from "./InboxMessagesDrawer";
import { InboxMessagesPanel } from "./InboxMessagesPanel";
import { VIEW_SECTION_HEADINGS } from "../../features/inbox/viewRouting";
import { useEdgeDrawerOpenGesture } from "../../hooks/useEdgeDrawerOpenGesture";
import { useIsTabletLayout } from "../../hooks/useMediaQuery";
import type { InboxLayoutBaseProps } from "@/app/hooks/inbox/inbox-layout.types";

const SettingsView = lazy(() =>
  import("../SettingsView").then((m) => ({ default: m.SettingsView })),
);

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
  onLogout,
  onPushEnabledChange,
  onRetryMessages,
  isLoading = false,
  messagesError = null,
  isSearchPending = false,
  pushEnabled,
  pushRegistering,
  isSendingTest,
  pushError,
  onEnablePush,
  onDisablePush,
  onTestPush,
}: DesktopInboxLayoutProps) {
  const isTablet = useIsTabletLayout();
  const detailRef = useRef<HTMLElement>(null);

  const showSettings = currentView === "settings";
  const listHeading = showSettings
    ? "Settings"
    : VIEW_SECTION_HEADINGS[currentView as keyof typeof VIEW_SECTION_HEADINGS];

  const showMessagesDrawer = isTablet && !showSettings;

  const [settingsMounted, setSettingsMounted] = useState(showSettings);
  if (showSettings && !settingsMounted) setSettingsMounted(true);

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
    onArchive,
    onDelete,
    isSearchPending,
    isLoading,
    messagesError,
    onRetryMessages,
  };

  return (
    <div className="hidden h-full min-h-0 flex-col overflow-hidden md:flex">
      <InboxAppHeader
        isOnline={isOnline}
        unreadCount={unreadCount}
        onOpenNav={onOpenNavMenu}
        pushEnabled={pushEnabled}
        pushRegistering={pushRegistering}
        isSendingTest={isSendingTest}
        pushError={pushError}
        onEnablePush={onEnablePush}
        onDisablePush={onDisablePush}
        onTestPush={onTestPush}
      />

      <InboxNavDrawer
        open={navMenuOpen}
        isOnline={isOnline}
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

      <main
        id="app-main"
        className="flex min-h-0 flex-1 overflow-hidden"
        aria-label={showSettings ? "Settings" : "Inbox"}
      >
        {settingsMounted ? (
          <KeepAlivePane
            mode={showSettings ? "visible" : "hidden"}
            className="flex min-h-0 flex-1 overflow-hidden"
          >
            <section
              className={`${scrollPaneClass} w-full tablet-detail-scroll`}
              aria-labelledby="settings-page-heading"
            >
              <Suspense fallback={<SettingsFallback />}>
                <SettingsView
                  isOnline={isOnline}
                  onLogout={onLogout}
                  pushEnabled={pushEnabled}
                  pushRegistering={pushRegistering}
                  pushError={pushError}
                  isSendingTest={isSendingTest}
                  onPushEnabledChange={onPushEnabledChange}
                  onTestPush={onTestPush}
                />
              </Suspense>
            </section>
          </KeepAlivePane>
        ) : null}

        <KeepAlivePane
          mode={showSettings ? "hidden" : "visible"}
          className="flex min-h-0 min-w-0 flex-1"
        >
          <div className="flex min-h-0 min-w-0 flex-1">
            {!showMessagesDrawer ? (
              <aside
                className="flex w-[28rem] shrink-0 flex-col border-e border-glass-border glass xl:w-[32rem]"
                aria-label="Message list"
              >
                <InboxMessagesPanel {...messagesPanelProps} />
              </aside>
            ) : null}

            <section
              ref={detailRef}
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
              <div
                className={`min-h-0 flex-1 overflow-hidden ${showMessagesDrawer ? "tablet-detail-scroll" : ""}`}
              >
                <MessageDetail
                  message={selectedMessage}
                  onMarkAsRead={onMarkAsRead}
                  onArchive={onArchive}
                  onToggleImportant={onToggleImportant}
                  onDelete={onDelete}
                  onReply={onReply}
                />
              </div>
            </section>
          </div>
        </KeepAlivePane>
      </main>
    </div>
  );
}
