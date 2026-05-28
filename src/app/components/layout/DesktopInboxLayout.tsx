import { Archive, Inbox, Mail, Settings, MailX, Star } from "lucide-react";
import { InboxItem } from "../InboxItem";
import { MessageDetail } from "../MessageDetail";
import { SettingsView } from "../SettingsView";
import { StatusIndicator } from "../StatusIndicator";
import { SystemMetadata } from "../SystemMetadata";
import { TopBar } from "../TopBar";
import { EmptyState } from "../EmptyState";
import { SearchBar } from "../SearchBar";
import { FilterBar } from "../FilterBar";
import { NavItem } from "../NavItem";
import { ScrollArea } from "../ui/scroll-area";
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
  onLogout: () => void;
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
}: DesktopInboxLayoutProps) {
  return (
    <div className="hidden md:flex h-full flex-col">
      <TopBar unreadCount={unreadCount} isOnline={isOnline} />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-glass-border glass backdrop-blur-xl flex flex-col">
          <div className="p-4 border-b border-glass-border space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg text-text-primary">Developer Inbox</h2>
              <SystemMetadata>inbox.v1</SystemMetadata>
            </div>
            <div className="flex flex-col gap-1">
              <StatusIndicator label="sync.online" status={isOnline ? "online" : "offline"} />
              <StatusIndicator label="firestore.live" status="online" showPulse={false} />
            </div>
          </div>

          <div className="flex-1 p-3 space-y-1 overflow-auto">
            <NavItem
              icon={Inbox}
              label="Inbox"
              view="inbox"
              currentView={currentView}
              count={inboxCount}
              onSelect={onSelectView}
            />
            <NavItem
              icon={Mail}
              label="Unread"
              view="unread"
              currentView={currentView}
              count={unreadCount}
              onSelect={onSelectView}
            />
            <NavItem
              icon={Star}
              label="Important"
              view="important"
              currentView={currentView}
              count={importantCount}
              onSelect={onSelectView}
            />
            <NavItem
              icon={Archive}
              label="Archived"
              view="archived"
              currentView={currentView}
              onSelect={onSelectView}
            />
          </div>

          <div className="p-3 border-t border-glass-border">
            <NavItem
              icon={Settings}
              label="Settings"
              view="settings"
              currentView={currentView}
              onSelect={onSelectView}
            />
          </div>
        </div>

        {currentView === "settings" ? (
          <div className="flex-1">
            <SettingsView isOnline={isOnline} onLogout={onLogout} />
          </div>
        ) : (
          <>
            <div className="w-96 border-r border-glass-border glass backdrop-blur-xl flex flex-col min-h-0">
              <div className="p-4 border-b border-glass-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-text-primary">
                    {currentView === "inbox" && "All Messages"}
                    {currentView === "unread" && "Unread"}
                    {currentView === "important" && "Important"}
                    {currentView === "archived" && "Archived"}
                  </h3>
                  <SystemMetadata>{filteredMessages.length}</SystemMetadata>
                </div>
                <SearchBar value={searchQuery} onChange={onSearchChange} />
                <FilterBar
                  sortBy={sortBy}
                  onSortChange={onSortChange}
                  filterBy={filterBy}
                  onFilterChange={onFilterChange}
                />
              </div>

              <ScrollArea className="flex-1 min-h-0">
                {filteredMessages.length > 0 ? (
                  <div className="p-3 space-y-2">
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
              </ScrollArea>
            </div>

            <div className="flex-1 bg-background">
              <MessageDetail
                message={selectedMessage}
                onMarkAsRead={onMarkAsRead}
                onArchive={onArchive}
                onToggleImportant={onToggleImportant}
                onDelete={onDelete}
                onReply={onReply}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

