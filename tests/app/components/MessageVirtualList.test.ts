import { describe, expect, it } from "vitest";
import { MESSAGE_LIST_VIRTUALIZE_AFTER } from "@/app/components/MessageVirtualList";

describe("MessageVirtualList threshold", () => {
  it("virtualizes only after a meaningful list size", () => {
    expect(MESSAGE_LIST_VIRTUALIZE_AFTER).toBeGreaterThanOrEqual(32);
  });
});
