import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InboxItem } from "@/app/components/InboxItem";
import { createMessage, resetMessageIds } from "@tests/fixtures/messages";

describe("InboxItem swipe a11y", () => {
  it("toggles revealed actions via the more button", async () => {
    resetMessageIds();
    const user = userEvent.setup();
    const onSwipeOpenChange = vi.fn();
    const onArchive = vi.fn();
    const message = createMessage({ id: "m1", senderName: "Alex" });

    const { rerender } = render(
      <ul>
        <InboxItem
          message={message}
          isActive={false}
          onClick={() => {}}
          onToggleImportant={() => {}}
          onArchive={onArchive}
          onDelete={() => {}}
          enableSwipe
          swipeOpen={false}
          onSwipeOpenChange={onSwipeOpenChange}
        />
      </ul>,
    );

    await user.click(screen.getByRole("button", { name: "Show message actions" }));
    expect(onSwipeOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <ul>
        <InboxItem
          message={message}
          isActive={false}
          onClick={() => {}}
          onToggleImportant={() => {}}
          onArchive={onArchive}
          onDelete={() => {}}
          enableSwipe
          swipeOpen
          onSwipeOpenChange={onSwipeOpenChange}
        />
      </ul>,
    );

    await user.click(screen.getByRole("button", { name: "Archive message" }));
    expect(onArchive).toHaveBeenCalledWith("m1");
  });

  it("labels archive action as move to inbox when already archived", () => {
    resetMessageIds();
    render(
      <ul>
        <InboxItem
          message={createMessage({ id: "m2", isArchived: true })}
          isActive={false}
          onClick={() => {}}
          onArchive={() => {}}
          enableSwipe
          swipeOpen
        />
      </ul>,
    );

    expect(screen.getByRole("button", { name: "Move to inbox" })).toBeInTheDocument();
  });
});
