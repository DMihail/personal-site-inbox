import { describe, expect, it } from "vitest";
import { cn } from "@/app/components/ui/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves tailwind conflicts with last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignores falsy values", () => {
    const hidden = false as boolean;
    expect(cn("text-sm", hidden && "hidden", undefined, "font-medium")).toBe(
      "text-sm font-medium",
    );
  });
});
