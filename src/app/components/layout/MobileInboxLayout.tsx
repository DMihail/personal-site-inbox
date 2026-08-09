import { Activity, useState } from "react";
import { MailX, X } from "lucide-react";
import { Button } from "../ui/button";
import { InboxItem } from "../InboxItem";
import { MessageDetail } from "../MessageDetail";
import { EmptyState } from "../EmptyState";
import { FilterBar } from "../FilterBar";
import { SearchBar } from "../SearchBar";
import { MessageVirtualList } from "../MessageVirtualList";
import { scrollPaneClass } from "./scrollPane";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import type { InboxLayoutBaseProps } from "@/app/hooks/inbox/inbox-layout.types";

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
  settingsView,
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
        <Activity mode={showSettings ? "visible" : "hidden"}>
          <main id={showSettings ? "app-main" : undefined} className={scrollPaneClass} aria-label="Settings">
            {settingsView}
          </main>
        </Activity>

        <Activity mode={showList ? "visible" : "hidden"}>
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
                    isActive={false}
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
        </Activity>

        <Activity mode={showDetail ? "visible" : "hidden"}>
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
        </Activity>
      </div>
    </div>
  );
}
