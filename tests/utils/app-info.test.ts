import { describe, expect, it } from "vitest";
import { APP_NAME, APP_VERSION } from "@/utils/app-info";

describe("app-info", () => {
  it("exposes name and semver from package.json", () => {
    expect(APP_NAME).toBe("Developer Inbox");
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});
