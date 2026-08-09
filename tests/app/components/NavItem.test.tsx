import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Inbox } from "lucide-react";
import { NavItem } from "@/app/components/NavItem";

function renderNavItem(props: Parameters<typeof NavItem>[0], initialPath = "/inbox") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavItem {...props} />
    </MemoryRouter>,
  );
}

describe("NavItem", () => {
  it("marks current page with aria-current", () => {
    renderNavItem(
      {
        icon: Inbox,
        label: "Inbox",
        view: "inbox",
        onSelect: vi.fn(),
      },
      "/inbox",
    );

    expect(screen.getByRole("link", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
  });

  it("calls onSelect with view when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderNavItem({
      icon: Inbox,
      label: "Unread",
      view: "unread",
      count: 3,
      onSelect,
    });

    await user.click(screen.getByRole("link", { name: /Unread/i }));
    expect(onSelect).toHaveBeenCalledWith("unread");
  });

  it("shows count badge when count is positive", () => {
    renderNavItem({
      icon: Inbox,
      label: "Inbox",
      view: "inbox",
      count: 5,
      onSelect: vi.fn(),
    });

    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
