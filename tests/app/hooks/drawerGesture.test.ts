import { describe, expect, it } from "vitest";
import { clampOffset, getClosedOffset, resolveDrawerOpen } from "@/app/hooks/drawerGesture";

describe("drawerGesture", () => {
  it("computes closed offset for start side", () => {
    expect(getClosedOffset(320, "start")).toBe(-320);
  });

  it("clamps drag offset", () => {
    expect(clampOffset(-400, -320)).toBe(-320);
    expect(clampOffset(10, -320)).toBe(0);
  });

  it("resolves open state from position", () => {
    expect(resolveDrawerOpen(-100, -320, 0)).toBe(true);
    expect(resolveDrawerOpen(-280, -320, 0)).toBe(false);
  });

  it("resolves open state from fling velocity", () => {
    expect(resolveDrawerOpen(-300, -320, 0.6)).toBe(true);
    expect(resolveDrawerOpen(-40, -320, -0.6)).toBe(false);
  });
});
