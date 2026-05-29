import type { Message } from "@/app/features/inbox/types";

let idCounter = 0;

export function createMessage(overrides: Partial<Message> = {}): Message {
  idCounter += 1;
  const id = overrides.id ?? `msg-${idCounter}`;
  return {
    id,
    senderName: "Jane Doe",
    senderEmail: "jane@example.com",
    company: "Acme",
    subject: `Message from Jane Doe`,
    preview: "Hello, I would like to discuss a project.",
    timestamp: new Date("2024-06-15T12:00:00Z"),
    isRead: false,
    isImportant: false,
    isArchived: false,
    source: "contact",
    ...overrides,
  };
}

export function resetMessageIds(): void {
  idCounter = 0;
}
