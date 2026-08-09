import { describe, expect, it } from "vitest";
import {
  clampSwipeOffset,
  resolveSwipeOpen,
  SWIPE_MAX_REVEAL,
} from "@/app/hooks/swipeRowGesture";

describe("swipeRowGesture", () => {
  it("clamps offset to the left reveal range", () => {
    expect(clampSwipeOffset(40)).toBe(0);
    expect(clampSwipeOffset(-40)).toBe(-40);
    expect(clampSwipeOffset(-999)).toBe(-SWIPE_MAX_REVEAL);
  });

  it("opens on strong left velocity or past threshold", () => {
    expect(resolveSwipeOpen(-20, -0.6)).toBe(true);
    expect(resolveSwipeOpen(-SWIPE_MAX_REVEAL * 0.5, 0)).toBe(true);
    expect(resolveSwipeOpen(-10, 0.2)).toBe(false);
  });
});
