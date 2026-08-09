import { useState } from "react";
import { MailX } from "lucide-react";
import { InboxItem } from "../InboxItem";
import { EmptyState } from "../EmptyState";
import { SearchBar } from "../SearchBar";
import { FilterBar } from "../FilterBar";
import { MessageVirtualList } from "../MessageVirtualList";
import { scrollPaneClass } from "./scrollPane";
import type { Message } from "../../features/inbox/types";
import type { FilterOption, SortOption } from "@/app/features/inbox/types";

interface InboxMessagesPanelProps {
  listHeading: string;
  filteredMessages: Message[];
  selectedMessageId: string | null;
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  currentView: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: FilterOption) => void;
  onSelectMessage: (messageId: string) => void;
  onToggleImportant: (messageId: string) => void;
  onArchive: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  /** Tablet drawer: swipe actions; desktop column: hover actions */
  enableSwipe?: boolean;
  headingId?: string;
  className?: string;
  isSearchPending?: boolean;
}

export function InboxMessagesPanel({
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
  enableSwipe = false,
  headingId = "inbox-list-heading",
  className = "",
  isSearchPending = false,
}: InboxMessagesPanelProps) {
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  const emptyDescription = searchQuery
    ? "No results found for your search"
    : currentView === "unread"
      ? "All messages have been read"
      : currentView === "important"
        ? "No important messages"
        : currentView === "archived"
          ? "No archived messages"
          : "Your inbox is empty";

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`.trim()}>
      <section
        className="tablet-panel-header shrink-0 space-y-3 border-b border-glass-border p-4 md:p-5"
        aria-labelledby={headingId}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id={headingId} className="text-text-primary capitalize md:text-heading-sm">
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
        />
      </section>

      <div
        className={`flex min-h-0 flex-1 flex-col${isSearchPending ? " opacity-70" : ""}`.trim()}
        aria-busy={isSearchPending || undefined}
      >
        {filteredMessages.length > 0 ? (
          <MessageVirtualList
            items={filteredMessages}
            getKey={(message) => message.id}
            scrollClassName={scrollPaneClass}
            listClassName="m-0 list-none space-y-2 p-3 md:p-4"
            labelledBy={headingId}
            renderItem={(message) => (
              <InboxItem
                message={message}
                isActive={message.id === selectedMessageId}
                onClick={() => onSelectMessage(message.id)}
                onToggleImportant={onToggleImportant}
                onArchive={onArchive}
                onDelete={onDelete}
                showActions={!enableSwipe}
                enableSwipe={enableSwipe}
                swipeOpen={openSwipeId === message.id}
                onSwipeOpenChange={(open) => setOpenSwipeId(open ? message.id : null)}
              />
            )}
          />
        ) : (
          <div className={scrollPaneClass}>
            <EmptyState icon={MailX} title="No messages" description={emptyDescription} />
          </div>
        )}
      </div>
    </div>
  );
}
