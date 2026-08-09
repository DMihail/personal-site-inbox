import { lazy, Suspense, useState } from "react";
import { MailX, X } from "lucide-react";
import { Button } from "../ui/button";
import { InboxItem } from "../InboxItem";
import { MessageDetail } from "../MessageDetail";
import { EmptyState } from "../EmptyState";
import { FilterBar } from "../FilterBar";
import { SearchBar } from "../SearchBar";
import { MessageVirtualList } from "../MessageVirtualList";
import { scrollPaneClass } from "./scrollPane";
import { KeepAlivePane } from "./KeepAlivePane";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import type { InboxLayoutBaseProps } from "@/app/hooks/inbox/inbox-layout.types";

const SettingsView = lazy(() =>
  import("../SettingsView").then((m) => ({ default: m.SettingsView })),
);

function SettingsFallback() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center text-text-muted" role="status">
      Loading settings…
    </div>
  );
}

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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {settingsMounted ? (
          <KeepAlivePane mode={showSettings ? "visible" : "hidden"} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <main id={showSettings ? "app-main" : undefined} className={scrollPaneClass} aria-label="Settings">
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
            </main>
          </KeepAlivePane>
        ) : null}

        <KeepAlivePane mode={showList ? "visible" : "hidden"} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <main
            id={showList ? "app-main" : undefined}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            aria-label="Inbox"
          >
            <section
              className="shrink-0 space-y-2 border-b border-glass-border p-3"
              aria-label="Search and filters"
            >
              <SearchBar value={searchQuery} onChange={onSearchChange} />
              <FilterBar
                sortBy={sortBy}
                onSortChange={onSortChange}
                filterBy={filterBy}
                onFilterChange={onFilterChange}
              />
            </section>
            {filteredMessages.length > 0 ? (
              <MessageVirtualList
                items={filteredMessages}
                getKey={(message) => message.id}
                scrollClassName={scrollPaneClass}
                listClassName="m-0 list-none space-y-2 p-3"
                aria-label="Messages"
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
                <EmptyState
                  icon={MailX}
                  title="No messages"
                  description={
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
                />
              </div>
            )}
          </main>
        </KeepAlivePane>

        {detailMounted ? (
          <KeepAlivePane mode={showDetail ? "visible" : "hidden"} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <main
              id={showDetail ? "app-main" : undefined}
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
                >
                  <X className="me-2 h-4 w-4" aria-hidden="true" />
                  Back to inbox
                </Button>
              </div>
              <div className={scrollPaneClass}>
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
              </div>
            </main>
          </KeepAlivePane>
        ) : null}
      </div>
    </div>
  );
}
