import type { FilterOption, SortOption } from "@/app/features/inbox/types";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

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
    <fieldset className="m-0 flex min-w-0 flex-wrap items-center gap-2 border-0 p-0">
      <legend className="sr-only">Sort and filter messages</legend>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass ui-hover-glass border-glass-border"
            aria-label={`Sort: ${sortLabels[sortBy]}`}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortLabels[sortBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-elevated border-glass-border">
          <DropdownMenuItem onClick={() => onSortChange("newest")} aria-checked={sortBy === "newest"}>
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("oldest")} aria-checked={sortBy === "oldest"}>
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-glass-border" />
          <DropdownMenuItem onClick={() => onSortChange("unread")} aria-checked={sortBy === "unread"}>
            Unread First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("important")} aria-checked={sortBy === "important"}>
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
            className="glass ui-hover-glass border-glass-border"
            aria-label={`Filter: ${filterLabels[filterBy]}`}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
            {filterLabels[filterBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-elevated border-glass-border">
          <DropdownMenuItem onClick={() => onFilterChange("all")} aria-checked={filterBy === "all"}>
            All Messages
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("unread")} aria-checked={filterBy === "unread"}>
            Unread Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("important")} aria-checked={filterBy === "important"}>
            Important Only
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-glass-border" />
          <DropdownMenuItem onClick={() => onFilterChange("archived")} aria-checked={filterBy === "archived"}>
            Archived
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </fieldset>
  );
}
