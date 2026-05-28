import { MailX } from "lucide-react";
import { InboxItem } from "../InboxItem";
import { MessageDetail } from "../MessageDetail";
import { EmptyState } from "../EmptyState";
import { SearchBar } from "../SearchBar";
import { FilterBar } from "../FilterBar";
import { scrollPaneClass } from "./scrollPane";
import { InboxAppHeader } from "./InboxAppHeader";
import { InboxNavDrawer } from "./InboxNavDrawer";
import { VIEW_SECTION_HEADINGS } from "../../features/inbox/viewRouting";
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
  const listHeading =
    currentView === "settings"
      ? "Settings"
      : VIEW_SECTION_HEADINGS[currentView as keyof typeof VIEW_SECTION_HEADINGS];

  return (
    <div className="hidden h-full min-h-0 flex-col overflow-hidden md:flex">
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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {currentView === "settings" ? (
          <main id="app-main" className={`${scrollPaneClass} w-full`} aria-label="Settings">
            {settingsView}
          </main>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1">
            <aside
              className="flex w-full max-w-md shrink-0 flex-col border-e border-glass-border glass backdrop-blur-xl md:max-w-sm lg:w-96 lg:max-w-none"
              aria-label="Message list"
            >
              <section
                className="shrink-0 space-y-3 border-b border-glass-border p-4"
                aria-labelledby="inbox-list-heading"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 id="inbox-list-heading" className="text-text-primary capitalize">
                    {listHeading}
                  </h2>
                  <p className="font-mono text-meta text-text-muted" aria-live="polite">
                    <span className="sr-only">Message count: </span>
                    {filteredMessages.length}
                  </p>
                </div>
                <SearchBar value={searchQuery} onChange={onSearchChange} />
                <FilterBar
                  sortBy={sortBy}
                  onSortChange={onSortChange}
                  filterBy={filterBy}
                  onFilterChange={onFilterChange}
                />
              </section>

              <div className={scrollPaneClass}>
                {filteredMessages.length > 0 ? (
                  <ul className="m-0 list-none space-y-2 p-3" aria-label="Messages">
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
                  </ul>
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
            </aside>

            <main
              id="app-main"
              className="min-h-0 min-w-0 flex-1 overflow-hidden bg-background"
              aria-label="Message details"
            >
              <MessageDetail
                message={selectedMessage}
                onMarkAsRead={onMarkAsRead}
                onArchive={onArchive}
                onToggleImportant={onToggleImportant}
                onDelete={onDelete}
                onReply={onReply}
              />
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
