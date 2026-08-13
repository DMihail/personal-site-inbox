import { describe, expect, it } from "vitest";
import {
  isFirestoreMessageDoc,
  mapFirestoreMessage,
} from "@/app/features/inbox/mapFirestoreMessage";

describe("mapFirestoreMessage", () => {
  it("maps a valid document", () => {
    const mapped = mapFirestoreMessage("id-1", {
      name: "Ada",
      email: "ada@example.com",
      company: "Analytical",
      message: "Hello",
      createdAt: { toDate: () => new Date("2024-01-02T00:00:00.000Z") },
      source: "portfolio",
      read: true,
      important: true,
    });

    expect(mapped).toMatchObject({
      id: "id-1",
      senderName: "Ada",
      senderEmail: "ada@example.com",
      company: "Analytical",
      preview: "Hello",
      isRead: true,
      isImportant: true,
      source: "portfolio",
      tags: ["portfolio"],
    });
    expect(mapped?.timestamp.toISOString()).toBe("2024-01-02T00:00:00.000Z");
  });

  it("returns null for malformed documents", () => {
    expect(mapFirestoreMessage("x", null)).toBeNull();
    expect(mapFirestoreMessage("x", { name: "", email: "a@b.c", message: "hi" })).toBeNull();
    expect(mapFirestoreMessage("x", { name: "A", email: " ", message: "hi" })).toBeNull();
    expect(mapFirestoreMessage("x", { name: "A", email: "a@b.c" })).toBeNull();
  });

  it("defaults optional fields safely", () => {
    const mapped = mapFirestoreMessage("id-2", {
      name: " Bob ",
      email: " bob@example.com ",
      message: "Ping",
    });
    expect(mapped).toMatchObject({
      senderName: "Bob",
      senderEmail: "bob@example.com",
      company: "—",
      source: "contact",
      isRead: false,
      isArchived: false,
    });
    expect(mapped?.tags).toBeUndefined();
    expect(isFirestoreMessageDoc({ name: "A", email: "a@b.c", message: "" })).toBe(true);
  });
});
