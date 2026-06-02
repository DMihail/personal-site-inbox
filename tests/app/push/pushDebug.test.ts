import { describe, expect, it } from "vitest";
import { maskToken } from "@/push/debug";

describe("maskToken", () => {
  it("masks long tokens for safe logging", () => {
    const token = "a".repeat(140);
    const masked = maskToken(token);
    expect(masked).toMatch(/^aaaaaaaa…aaaaaa$/);
    expect(masked).not.toBe(token);
  });
});
