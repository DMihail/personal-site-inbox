import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export type SortOption = "newest" | "oldest" | "unread" | "important";
export type FilterOption = "all" | "unread" | "important" | "archived";

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export function FilterBar({ sortBy, onSortChange, filterBy, onFilterChange }: FilterBarProps) {
  const sortLabels: Record<SortOption, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
    unread: "Unread First",
    important: "Important First",
  };

  const filterLabels: Record<FilterOption, string> = {
    all: "All Messages",
    unread: "Unread Only",
    important: "Important Only",
    archived: "Archived",
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort and filter messages">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass border-glass-border hover:bg-glass-elevated"
            aria-label={`Sort: ${sortLabels[sortBy]}`}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortLabels[sortBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-elevated border-glass-border">
          <DropdownMenuItem
            onClick={() => onSortChange("newest")}
            className="hover:bg-glass-elevated"
          >
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("oldest")}
            className="hover:bg-glass-elevated"
          >
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-glass-border" />
          <DropdownMenuItem
            onClick={() => onSortChange("unread")}
            className="hover:bg-glass-elevated"
          >
            Unread First
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("important")}
            className="hover:bg-glass-elevated"
          >
            Important First
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass border-glass-border hover:bg-glass-elevated"
            aria-label={`Filter: ${filterLabels[filterBy]}`}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
            {filterLabels[filterBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-elevated border-glass-border">
          <DropdownMenuItem
            onClick={() => onFilterChange("all")}
            className="hover:bg-glass-elevated"
          >
            All Messages
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange("unread")}
            className="hover:bg-glass-elevated"
          >
            Unread Only
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange("important")}
            className="hover:bg-glass-elevated"
          >
            Important Only
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-glass-border" />
          <DropdownMenuItem
            onClick={() => onFilterChange("archived")}
            className="hover:bg-glass-elevated"
          >
            Archived
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
