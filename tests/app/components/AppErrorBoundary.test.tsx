import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppErrorBoundary } from "@/app/components/AppErrorBoundary";

function Boom(): never {
  throw new Error("boom-test");
}

describe("AppErrorBoundary", () => {
  it("renders recovery UI when a child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AppErrorBoundary title="Inbox crashed">
        <Boom />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Inbox crashed");
    expect(screen.getByText("boom-test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload app" })).toBeInTheDocument();

    spy.mockRestore();
  });
});
