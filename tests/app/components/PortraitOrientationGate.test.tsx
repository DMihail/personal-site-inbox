import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PortraitOrientationGate } from "@/app/components/PortraitOrientationGate";
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

    render(<PortraitOrientationGate />);

    expect(screen.getByRole("alertdialog", { name: "Rotate to portrait" })).toBeInTheDocument();
    expect(screen.getByText(/portrait mode on phones and tablets/i)).toBeInTheDocument();
  });

  it("renders nothing in portrait or on desktop", () => {
    mockMatchMedia({
      [MEDIA_QUERIES.phoneOrTabletLandscape]: false,
    });

    const { container } = render(<PortraitOrientationGate />);
    expect(container).toBeEmptyDOMElement();
  });
});
