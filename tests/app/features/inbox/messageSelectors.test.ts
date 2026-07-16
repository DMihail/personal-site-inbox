import { describe, expect, it, beforeEach } from "vitest";
import { createMessage, resetMessageIds } from "@tests/fixtures/messages";
import {
  selectFilteredMessages,
  selectImportantCount,
  selectInboxCount,
  selectMessageCounts,
  selectSelectedMessage,
  selectUnreadCount,
} from "@/app/features/inbox/messageSelectors";

describe("messageSelectors", () => {
  beforeEach(() => {
    resetMessageIds();
  });

  const sampleMessages = () => [
    createMessage({
      id: "a",
      senderName: "Alice",
      timestamp: new Date("2024-06-10T10:00:00Z"),
      isRead: false,
      isImportant: true,
    }),
    createMessage({
      id: "b",
      senderName: "Bob",
      timestamp: new Date("2024-06-12T10:00:00Z"),
      isRead: true,
      isImportant: false,
    }),
    createMessage({
      id: "c",
      senderName: "Carol",
      timestamp: new Date("2024-06-08T10:00:00Z"),
      isRead: false,
      isArchived: true,
    }),
  ];

  describe("selectMessageCounts", () => {
    it("counts inbox/unread/important in one pass", () => {
      expect(selectMessageCounts(sampleMessages())).toEqual({
        inboxCount: 2,
        unreadCount: 1,
        importantCount: 1,
      });
    });
  });

  describe("selectInboxCount", () => {
    it("counts non-archived messages", () => {
      expect(selectInboxCount(sampleMessages())).toBe(2);
    });
  });

  describe("selectUnreadCount", () => {
    it("counts unread non-archived messages", () => {
      expect(selectUnreadCount(sampleMessages())).toBe(1);
    });
  });

  describe("selectImportantCount", () => {
    it("counts important non-archived messages", () => {
      expect(selectImportantCount(sampleMessages())).toBe(1);
    });
  });

  describe("selectSelectedMessage", () => {
    it("returns message by id", () => {
      const messages = sampleMessages();
      expect(selectSelectedMessage(messages, "b")?.senderName).toBe("Bob");
    });

    it("returns null when id is missing", () => {
      expect(selectSelectedMessage(sampleMessages(), "missing")).toBeNull();
    });
  });

  describe("selectFilteredMessages", () => {
    it("filters unread view", () => {
      const result = selectFilteredMessages(sampleMessages(), "unread", "all", "", "newest");
      expect(result.map((m) => m.id)).toEqual(["a"]);
    });

    it("filters archived view", () => {
      const result = selectFilteredMessages(sampleMessages(), "archived", "all", "", "newest");
      expect(result.map((m) => m.id)).toEqual(["c"]);
    });

    it("filters important view", () => {
      const result = selectFilteredMessages(sampleMessages(), "important", "all", "", "newest");
      expect(result.map((m) => m.id)).toEqual(["a"]);
    });

    it("applies search on sender name", () => {
      const result = selectFilteredMessages(sampleMessages(), "inbox", "all", "bob", "newest");
      expect(result.map((m) => m.id)).toEqual(["b"]);
    });

    it("sorts oldest first", () => {
      const result = selectFilteredMessages(sampleMessages(), "inbox", "all", "", "oldest");
      expect(result.map((m) => m.id)).toEqual(["a", "b"]);
    });

    it("sorts newest first", () => {
      const result = selectFilteredMessages(sampleMessages(), "inbox", "all", "", "newest");
      expect(result.map((m) => m.id)).toEqual(["b", "a"]);
    });

    it("combines filter unread with view inbox", () => {
      const result = selectFilteredMessages(sampleMessages(), "inbox", "unread", "", "newest");
      expect(result.map((m) => m.id)).toEqual(["a"]);
    });
  });
});
