import { describe, expect, it } from "vitest";
import { maskFcmToken } from "@/app/push/pushDebug";

describe("maskFcmToken", () => {
  it("masks long tokens for safe logging", () => {
    const token = "a".repeat(140);
    const masked = maskFcmToken(token);
    expect(masked).toMatch(/^aaaaaaaa…aaaaaa$/);
    expect(masked).not.toBe(token);
  });

  it("handles empty tokens", () => {
    expect(maskFcmToken("")).toBe("(empty)");
  });
});
