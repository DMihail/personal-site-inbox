import type { FilterOption, SortOption } from "@/app/features/inbox/types";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  /** When not on the Archived view, hide the archived-only filter (dead end). */
  currentView?: string;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  unread: "Unread First",
  important: "Important First",
};

const FILTER_LABELS: Record<FilterOption, string> = {
  all: "All Messages",
  unread: "Unread Only",
  important: "Important Only",
  archived: "Archived",
};

export function FilterBar({
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  currentView,
}: FilterBarProps) {
  const showArchivedFilter = currentView === "archived";

  useEffect(() => {
    if (!showArchivedFilter && filterBy === "archived") {
      onFilterChange("all");
    }
  }, [showArchivedFilter, filterBy, onFilterChange]);

  const effectiveFilter =
    !showArchivedFilter && filterBy === "archived" ? "all" : filterBy;

  return (
    <div
      role="group"
      aria-label="Sort and filter messages"
      className="m-0 flex min-w-0 flex-wrap items-center gap-2"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass ui-hover-glass border-glass-border"
            aria-label={`Sort: ${SORT_LABELS[sortBy]}`}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {SORT_LABELS[sortBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-elevated border-glass-border">
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
            <DropdownMenuSeparator className="bg-glass-border" />
            <DropdownMenuRadioItem value="unread">Unread First</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="important">Important First</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass ui-hover-glass border-glass-border"
            aria-label={`Filter: ${FILTER_LABELS[effectiveFilter]}`}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
            {FILTER_LABELS[effectiveFilter]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-elevated border-glass-border">
          <DropdownMenuRadioGroup
            value={effectiveFilter}
            onValueChange={(value) => onFilterChange(value as FilterOption)}
          >
            <DropdownMenuRadioItem value="all">All Messages</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="unread">Unread Only</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="important">Important Only</DropdownMenuRadioItem>
            {showArchivedFilter ? (
              <>
                <DropdownMenuSeparator className="bg-glass-border" />
                <DropdownMenuRadioItem value="archived">Archived</DropdownMenuRadioItem>
              </>
            ) : null}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
