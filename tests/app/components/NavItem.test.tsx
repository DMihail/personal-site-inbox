import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Inbox } from "lucide-react";
import { NavItem } from "@/app/components/NavItem";

describe("NavItem", () => {
  it("marks current page with aria-current", () => {
    render(
      <NavItem
        icon={Inbox}
        label="Inbox"
        view="inbox"
        currentView="inbox"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
  });

  it("calls onSelect with view when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <NavItem
        icon={Inbox}
        label="Unread"
        view="unread"
        currentView="inbox"
        count={3}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Unread/i }));
    expect(onSelect).toHaveBeenCalledWith("unread");
  });

  it("shows count badge when count is positive", () => {
    render(
      <NavItem
        icon={Inbox}
        label="Inbox"
        view="inbox"
        currentView="settings"
        count={5}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
