import { MailX } from "lucide-react";
import { InboxItem } from "../InboxItem";
import { EmptyState } from "../EmptyState";
import { SearchBar } from "../SearchBar";
import { FilterBar } from "../FilterBar";
import { scrollPaneClass } from "./scrollPane";
import type { Message } from "../../features/inbox/types";
import type { FilterOption, SortOption } from "../FilterBar";

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
  onDelete: (messageId: string) => void;
  headingId?: string;
  className?: string;
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
  onDelete,
  headingId = "inbox-list-heading",
  className = "",
}: InboxMessagesPanelProps) {
  const emptyDescription =
    searchQuery
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
          <output className="text-meta tabular-nums text-text-muted" aria-live="polite" aria-atomic="true">
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

      <div className={scrollPaneClass}>
        {filteredMessages.length > 0 ? (
          <ul className="m-0 list-none space-y-2 p-3 md:p-4" role="listbox" aria-label="Messages">
            {filteredMessages.map((message) => (
              <InboxItem
                key={message.id}
                message={message}
                isActive={message.id === selectedMessageId}
                onClick={() => onSelectMessage(message.id)}
                onToggleImportant={onToggleImportant}
                onDelete={onDelete}
                showActions
              />
            ))}
          </ul>
        ) : (
          <EmptyState icon={MailX} title="No messages" description={emptyDescription} />
        )}
      </div>
    </div>
  );
}
