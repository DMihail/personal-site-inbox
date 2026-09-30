import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PortraitOrientationGate } from "@/app/components/PortraitOrientationGate";
import { AppProviders } from "@/app/providers/AppProviders";
import { MEDIA_QUERIES } from "@/shared/constants/media-queries";

function mockMatchMedia(matchesByQuery: Record<string, boolean>) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: matchesByQuery[query] ?? false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("PortraitOrientationGate", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows rotate prompt on phone/tablet landscape", () => {
    mockMatchMedia({
      [MEDIA_QUERIES.phoneOrTabletLandscape]: true,
    });

    render(<PortraitOrientationGate open />);

    const dialog = screen.getByRole("alertdialog", { name: "Rotate to portrait" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveFocus();
    expect(screen.getByText(/portrait mode on phones and tablets/i)).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(<PortraitOrientationGate open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("marks app content inert and keeps the gate interactive", () => {
    mockMatchMedia({
      [MEDIA_QUERIES.phoneOrTabletLandscape]: true,
    });

    const { container } = render(
      <AppProviders>
        <button type="button">Behind gate</button>
      </AppProviders>,
    );

    const inertRoot = container.querySelector("[inert]");
    expect(inertRoot).not.toBeNull();
    expect(inertRoot).toContainElement(screen.getByRole("button", { name: "Behind gate" }));
    expect(inertRoot).not.toContainElement(
      screen.getByRole("alertdialog", { name: "Rotate to portrait" }),
    );
  });
});
