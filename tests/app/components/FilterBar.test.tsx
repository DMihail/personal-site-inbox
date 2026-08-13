import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterBar } from "@/app/components/FilterBar";

describe("FilterBar", () => {
  it("does not write filter state when archived is stale outside Archived view", () => {
    const onFilterChange = vi.fn();
    render(
      <FilterBar
        sortBy="newest"
        onSortChange={() => {}}
        filterBy="archived"
        onFilterChange={onFilterChange}
        currentView="inbox"
      />,
    );

    expect(onFilterChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Filter: All Messages" })).toBeInTheDocument();
  });
});
