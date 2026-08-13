import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReplyDialog } from "@/app/components/ReplyDialog";
import { createMessage, resetMessageIds } from "@tests/fixtures/messages";

describe("ReplyDialog", () => {
  it("renders a responsive reply composer with send and mail actions", () => {
    resetMessageIds();
    const message = createMessage({ senderName: "Alex Rivera" });

    render(
      <ReplyDialog
        isOpen
        onClose={() => {}}
        message={message}
        onSend={vi.fn()}
        onOpenInMailClient={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("reply-dialog");
    expect(screen.getByRole("heading", { name: "Reply to Alex Rivera" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveClass("reply-composer");
    expect(screen.getByRole("button", { name: "Send Reply" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open in Mail" })).toBeInTheDocument();
  });
});
