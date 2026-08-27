import { lazy, Suspense, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { InboxItem } from "../InboxItem";
import { FilterBar } from "../FilterBar";
import { SearchBar } from "../SearchBar";
import { MessageVirtualList } from "../MessageVirtualList";
import { MessagesListStatus } from "../MessagesListStatus";
import { scrollPaneClass } from "./scrollPane";
import { KeepAlivePane } from "./KeepAlivePane";
import { SettingsFallback } from "./SettingsFallback";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import type { InboxLayoutBaseProps } from "@/app/hooks/inbox/inbox-layout.types";
import { VIEW_SECTION_HEADINGS } from "../../features/inbox/viewRouting";

const SettingsView = lazy(() =>
  import("../SettingsView").then((m) => ({ default: m.SettingsView })),
);
const MessageDetail = lazy(() =>
  import("../MessageDetail").then((m) => ({ default: m.MessageDetail })),
);

interface MobileInboxLayoutProps extends InboxLayoutBaseProps {
  mobileDetailOpen: boolean;
  onOpenDetail: () => void;
  onCloseDetail: () => void;
  onSelectMessage: (messageId: string) => void;
}

export function MobileInboxLayout({
  isOnline,
  currentView,
  selectedMessage,
  filteredMessages,
  inboxCount,
  unreadCount,
  importantCount,
  searchQuery,
  sortBy,
  filterBy,
  navMenuOpen,
  mobileDetailOpen,
  onOpenNavMenu,
  onCloseNavMenu,
  onSelectView,
  onOpenDetail,
  onCloseDetail,
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
  pushEnabled,
  pushRegistering,
  isSendingTest,
  pushError,
  onEnablePush,
  onDisablePush,
  onTestPush,
}: MobileInboxLayoutProps) {
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  const showSettings = currentView === "settings";
  const showList = !showSettings && !mobileDetailOpen;
  const showDetail = !showSettings && mobileDetailOpen;

  const [settingsMounted, setSettingsMounted] = useState(showSettings);
  const [detailMounted, setDetailMounted] = useState(showDetail);
  if (showSettings && !settingsMounted) setSettingsMounted(true);
  if (showDetail && !detailMounted) setDetailMounted(true);

  const mainLabel = showSettings ? "Settings" : showDetail ? "Message details" : "Inbox";
  const listHeading =
    currentView === "settings"
      ? "All messages"
      : VIEW_SECTION_HEADINGS[currentView as keyof typeof VIEW_SECTION_HEADINGS];

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden md:hidden">
      <InboxAppHeader
        isOnline={isOnline}
        unreadCount={unreadCount}
        onOpenNav={onOpenNavMenu}
        compact
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
      />

      <main
        id="app-main"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        aria-label={mainLabel}
      >
        {settingsMounted ? (
          <KeepAlivePane
            mode={showSettings ? "visible" : "hidden"}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <section className={scrollPaneClass} aria-labelledby="settings-page-heading">
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
          mode={showList ? "visible" : "hidden"}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <section
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            aria-labelledby="mobile-inbox-list-heading"
          >
            <div className="shrink-0 space-y-2 border-b border-glass-border p-3">
              <div className="flex items-center justify-between gap-2">
                <h2
                  id="mobile-inbox-list-heading"
                  className="text-text-primary capitalize md:text-heading-sm"
                >
                  {listHeading}
                </h2>
                <output
                  className="text-meta tabular-nums text-text-muted"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="sr-only">Message count: </span>
                  {filteredMessages.length}
                </output>
              </div>
              <SearchBar value={searchQuery} onChange={onSearchChange} />
              <FilterBar
                sortBy={sortBy}
                onSortChange={onSortChange}
                filterBy={filterBy}
                onFilterChange={onFilterChange}
                currentView={currentView}
              />
            </div>
            {filteredMessages.length > 0 && !isLoading && !messagesError ? (
              <MessageVirtualList
                items={filteredMessages}
                getKey={(message) => message.id}
                scrollClassName={scrollPaneClass}
                listClassName="m-0 list-none space-y-2 p-3"
                labelledBy="mobile-inbox-list-heading"
                renderItem={(message) => (
                  <InboxItem
                    message={message}
                    isActive={selectedMessage?.id === message.id}
                    onClick={() => {
                      onSelectMessage(message.id);
                      onOpenDetail();
                    }}
                    onToggleImportant={onToggleImportant}
                    onArchive={onArchive}
                    onDelete={onDelete}
                    enableSwipe
                    swipeOpen={openSwipeId === message.id}
                    onSwipeOpenChange={(open) => setOpenSwipeId(open ? message.id : null)}
                  />
                )}
              />
            ) : (
              <div className={`${scrollPaneClass} flex items-center justify-center`}>
                <MessagesListStatus
                  isLoading={isLoading}
                  error={messagesError}
                  isEmpty
                  emptyDescription={
                    searchQuery
                      ? "No results found"
                      : currentView === "unread"
                        ? "All caught up!"
                        : currentView === "important"
                          ? "No important messages"
                          : currentView === "archived"
                            ? "No archived messages"
                            : "Your inbox is empty"
                  }
                  onRetry={onRetryMessages}
                />
              </div>
            )}
          </section>
        </KeepAlivePane>

        {detailMounted ? (
          <KeepAlivePane
            mode={showDetail ? "visible" : "hidden"}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <section
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              aria-label="Message details"
            >
              <div className="shrink-0 border-b border-glass-border p-3 glass">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCloseDetail}
                  className="ui-hover-ghost"
                  aria-label="Back to inbox"
                >
                  <X className="me-2 h-4 w-4" aria-hidden="true" />
                  Back to inbox
                </Button>
              </div>
              <div className={scrollPaneClass}>
                <Suspense
                  fallback={
                    <div
                      className="flex min-h-0 flex-1 items-center justify-center text-text-muted"
                      role="status"
                    >
                      Loading message…
                    </div>
                  }
                >
                  <MessageDetail
                    message={selectedMessage}
                    onMarkAsRead={onMarkAsRead}
                    onArchive={(id) => {
                      onArchive(id);
                      onCloseDetail();
                    }}
                    onToggleImportant={onToggleImportant}
                    onDelete={(id) => {
                      onDelete(id);
                      onCloseDetail();
                    }}
                    onReply={onReply}
                  />
                </Suspense>
              </div>
            </section>
          </KeepAlivePane>
        ) : null}
      </main>
    </div>
  );
}
