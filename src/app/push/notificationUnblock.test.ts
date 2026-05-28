import { describe, expect, it } from "vitest";
import { getNotificationUnblockSteps } from "./notificationUnblock";

describe("getNotificationUnblockSteps", () => {
  it("returns actionable steps", () => {
    const steps = getNotificationUnblockSteps();
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps.some((s) => /reload/i.test(s))).toBe(true);
  });
});
