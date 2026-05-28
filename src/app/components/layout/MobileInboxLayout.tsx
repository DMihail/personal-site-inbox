import type { ReactNode } from "react";
import { Archive, Inbox, Mail, Menu, Settings, Star, X, MailX } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { InboxItem } from "../InboxItem";
import { MessageDetail } from "../MessageDetail";
import { EmptyState } from "../EmptyState";
import { FilterBar } from "../FilterBar";
import { NavItem } from "../NavItem";
import { ScrollArea } from "../ui/scroll-area";
import { SearchBar } from "../SearchBar";
import { Separator } from "../ui/separator";
import { StatusIndicator } from "../StatusIndicator";
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
  mobileMenuOpen: boolean;
  mobileDetailOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
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
  mobileMenuOpen,
  mobileDetailOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
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
}: MobileInboxLayoutProps) {
  return (
    <div className="md:hidden h-full flex flex-col">
      <div className="border-b border-glass-border glass backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMobileMenu}
              className="hover:glass-elevated"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="space-y-0.5">
              <h2 className="text-base text-text-primary">Developer Inbox</h2>
              <StatusIndicator label="sync.online" status={isOnline ? "online" : "offline"} />
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-cyan/20 text-cyan border border-cyan/30">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute inset-0 z-50 bg-background">
          <div className="border-b border-glass-border glass backdrop-blur-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-text-primary">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseMobileMenu}
                className="hover:glass-elevated"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-1">
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
            <Separator className="my-3 bg-glass-border" />
            <NavItem
              icon={Settings}
              label="Settings"
              view="settings"
              currentView={currentView}
              onSelect={onSelectView}
            />
          </div>
        </div>
      )}

      {currentView === "settings" ? (
        settingsView
      ) : !mobileDetailOpen ? (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-glass-border space-y-2">
            <SearchBar value={searchQuery} onChange={onSearchChange} />
            <FilterBar
              sortBy={sortBy}
              onSortChange={onSortChange}
              filterBy={filterBy}
              onFilterChange={onFilterChange}
            />
          </div>
          {filteredMessages.length > 0 ? (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
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
              </div>
            </ScrollArea>
          ) : (
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
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="border-b border-glass-border p-3 glass">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseDetail}
              className="hover:glass-elevated"
            >
              <X className="h-4 w-4 mr-2" />
              Back to Inbox
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
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
        </div>
      )}
    </div>
  );
}

