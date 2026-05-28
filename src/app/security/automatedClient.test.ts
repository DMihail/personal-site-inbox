import { describe, expect, it } from "vitest";
import { isHoneypotTripped } from "./automatedClient";

describe("automatedClient", () => {
  describe("isHoneypotTripped", () => {
    it("returns false for empty values", () => {
      expect(isHoneypotTripped(undefined)).toBe(false);
      expect(isHoneypotTripped("")).toBe(false);
      expect(isHoneypotTripped("   ")).toBe(false);
    });

    it("returns true when honeypot has content", () => {
      expect(isHoneypotTripped("spam")).toBe(true);
      expect(isHoneypotTripped("  bot  ")).toBe(true);
    });
  });
});
