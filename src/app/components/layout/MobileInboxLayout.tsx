import type { ReactNode } from "react";
import { MailX, X } from "lucide-react";
import { Button } from "../ui/button";
import { InboxItem } from "../InboxItem";
import { MessageDetail } from "../MessageDetail";
import { EmptyState } from "../EmptyState";
import { FilterBar } from "../FilterBar";
import { SearchBar } from "../SearchBar";
import { scrollPaneClass } from "./scrollPane";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import type { FilterOption, SortOption } from "../FilterBar";
import type { Message, View } from "../../features/inbox/types";

interface MobileInboxLayoutProps {
  isOnline: boolean;
  currentView: View;
  selectedMessage: Message | null;
  filteredMessages: Message[];
  inboxCount: number;
  unreadCount: number;
  importantCount: number;
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  navMenuOpen: boolean;
  mobileDetailOpen: boolean;
  onOpenNavMenu: () => void;
  onCloseNavMenu: () => void;
  onSelectView: (view: View) => void;
  onOpenDetail: () => void;
  onCloseDetail: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: FilterOption) => void;
  onSelectMessage: (messageId: string) => void;
  onArchive: (messageId: string) => void;
  onToggleImportant: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onReply: () => void;
  settingsView: ReactNode;
  pushEnabled: boolean;
  pushRegistering: boolean;
  pushError: string | null;
  onEnablePush: () => void;
  onDisablePush: () => void;
  onTestPush: () => void;
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
  pushError,
  onEnablePush,
  onDisablePush,
  onTestPush,
}: MobileInboxLayoutProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden md:hidden">
      <InboxAppHeader
        isOnline={isOnline}
        unreadCount={unreadCount}
        onOpenNav={onOpenNavMenu}
        compact
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
      />

      {currentView === "settings" ? (
        <main id="app-main" className={scrollPaneClass} aria-label="Settings">
          {settingsView}
        </main>
      ) : !mobileDetailOpen ? (
        <main id="app-main" className="flex min-h-0 flex-1 flex-col overflow-hidden" aria-label="Inbox">
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
            <div className={scrollPaneClass}>
              <ul className="m-0 list-none space-y-2 p-3" aria-label="Messages">
                {filteredMessages.map((message) => (
                  <InboxItem
                    key={message.id}
                    message={message}
                    isActive={false}
                    onClick={() => {
                      onSelectMessage(message.id);
                      onOpenDetail();
                    }}
                  />
                ))}
              </ul>
            </div>
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
                metadata="inbox.empty"
              />
            </div>
          )}
        </main>
      ) : (
        <main
          id="app-main"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          aria-label="Message details"
        >
          <div className="shrink-0 border-b border-glass-border p-3 glass">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCloseDetail}
              className="hover:glass-elevated"
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
      )}
    </div>
  );
}
