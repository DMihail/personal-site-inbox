import { describe, expect, it } from "vitest";
import {
  messageDeepLinkPath,
  mutationErrorMessage,
  parseMessageIdFromSearch,
} from "@/app/features/inbox/messageLinks";

describe("messageLinks", () => {
  it("builds a deep link for a message id", () => {
    expect(messageDeepLinkPath("abc 123")).toBe("/inbox?message=abc%20123");
    expect(messageDeepLinkPath("  ")).toBe("/inbox");
  });

  it("parses message id from search strings", () => {
    expect(parseMessageIdFromSearch("?message=msg-1")).toBe("msg-1");
    expect(parseMessageIdFromSearch("message=msg-1&x=1")).toBe("msg-1");
    expect(parseMessageIdFromSearch("")).toBeNull();
    expect(parseMessageIdFromSearch("?foo=bar")).toBeNull();
  });

  it("formats mutation errors", () => {
    expect(mutationErrorMessage(new Error("nope"))).toBe("nope");
    expect(mutationErrorMessage("x", "fallback")).toBe("fallback");
  });
});
