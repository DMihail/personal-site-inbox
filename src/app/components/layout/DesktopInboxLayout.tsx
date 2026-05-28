import { MailX } from "lucide-react";
import { InboxItem } from "../InboxItem";
import { MessageDetail } from "../MessageDetail";
import { EmptyState } from "../EmptyState";
import { SearchBar } from "../SearchBar";
import { FilterBar } from "../FilterBar";
import { scrollPaneClass } from "./scrollPane";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import type { View } from "../../features/inbox/types";
import type { Message } from "../../features/inbox/types";
import type { FilterOption, SortOption } from "../FilterBar";

interface DesktopInboxLayoutProps {
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
  onOpenNavMenu: () => void;
  onCloseNavMenu: () => void;
  onSelectView: (view: View) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: FilterOption) => void;
  onSelectMessage: (messageId: string) => void;
  onArchive: (messageId: string) => void;
  onToggleImportant: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onReply: () => void;
  settingsView: React.ReactNode;
  pushEnabled: boolean;
  pushRegistering: boolean;
  pushError: string | null;
  onEnablePush: () => void;
  onDisablePush: () => void;
  onTestPush: () => void;
}

export function DesktopInboxLayout({
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
  onOpenNavMenu,
  onCloseNavMenu,
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
  return (
    <div className="hidden md:flex h-full min-h-0 flex-col overflow-hidden">
      <InboxAppHeader
        isOnline={isOnline}
        unreadCount={unreadCount}
        onOpenNav={onOpenNavMenu}
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

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {currentView === "settings" ? (
          <div className={scrollPaneClass}>{settingsView}</div>
        ) : (
          <div className="flex flex-1 min-h-0 min-w-0">
            <div className="flex w-full max-w-md shrink-0 flex-col min-h-0 border-r border-glass-border glass backdrop-blur-xl md:max-w-sm lg:w-96 lg:max-w-none">
              <div className="shrink-0 space-y-3 border-b border-glass-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-text-primary">
                    {currentView === "inbox" && "All Messages"}
                    {currentView === "unread" && "Unread"}
                    {currentView === "important" && "Important"}
                    {currentView === "archived" && "Archived"}
                  </h3>
                  <span className="font-mono text-xs text-text-muted">{filteredMessages.length}</span>
                </div>
                <SearchBar value={searchQuery} onChange={onSearchChange} />
                <FilterBar
                  sortBy={sortBy}
                  onSortChange={onSortChange}
                  filterBy={filterBy}
                  onFilterChange={onFilterChange}
                />
              </div>

              <div className={scrollPaneClass}>
                {filteredMessages.length > 0 ? (
                  <div className="space-y-2 p-3">
                    {filteredMessages.map((message) => (
                      <InboxItem
                        key={message.id}
                        message={message}
                        isActive={message.id === selectedMessage?.id}
                        onClick={() => onSelectMessage(message.id)}
                        onToggleImportant={onToggleImportant}
                        onDelete={onDelete}
                        showActions
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={MailX}
                    title="No messages"
                    description={
                      searchQuery
                        ? "No results found for your search"
                        : currentView === "unread"
                          ? "All messages have been read"
                          : currentView === "important"
                            ? "No important messages"
                            : currentView === "archived"
                              ? "No archived messages"
                              : "Your inbox is empty"
                    }
                    metadata="inbox.empty"
                  />
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 min-w-0 bg-background overflow-hidden">
              <MessageDetail
                message={selectedMessage}
                onMarkAsRead={onMarkAsRead}
                onArchive={onArchive}
                onToggleImportant={onToggleImportant}
                onDelete={onDelete}
                onReply={onReply}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
