import { toast } from "sonner";
import type { Message } from "../features/inbox/types";

const DEDUPE_MS = 8_000;
const recentToastByMessageId = new Map<string, number>();

function shouldSkipDuplicateToast(messageId: string): boolean {
  const now = Date.now();
  const last = recentToastByMessageId.get(messageId);
  if (last !== undefined && now - last < DEDUPE_MS) return true;
  recentToastByMessageId.set(messageId, now);
  return false;
}

function formatDescription(message: Message): string {
  const parts = [message.senderName];
  if (message.company && message.company !== "—") {
    parts.push(message.company);
  }
  const meta = parts.join(" · ");
  const preview = message.preview.trim();
  if (!preview) return meta;
  const short = preview.length > 120 ? `${preview.slice(0, 120)}…` : preview;
  return `${meta}\n${short}`;
}

export function toastNewMessage(
  message: Message,
  onOpen: (messageId: string) => void,
): void {
  if (shouldSkipDuplicateToast(message.id)) return;

  toast("New message", {
    description: formatDescription(message),
    duration: 10_000,
    action: {
      label: "Open",
      onClick: () => {
        onOpen(message.id);
      },
    },
  });
}
