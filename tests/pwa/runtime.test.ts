import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPwaInstallPlatform,
  isStandaloneDisplayMode,
} from "@/pwa/runtime";

describe("pwa/runtime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects standalone display mode", () => {
    vi.stubGlobal("window", {
      matchMedia: (query: string) => ({
        matches: query.includes("standalone"),
      }),
    });
    vi.stubGlobal("navigator", { standalone: false });

    expect(isStandaloneDisplayMode()).toBe(true);
  });

  it("offers iOS install when not standalone", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: false }),
    });
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
      standalone: false,
    });

    expect(getPwaInstallPlatform()).toBe("ios");
  });
});
