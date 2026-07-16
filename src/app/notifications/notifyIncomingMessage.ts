import type { Message } from "@/app/features/inbox/types";
import { toastNewMessage } from "@/app/notifications/toastNewMessage";
import { notifyNewMessage } from "@/push/display";
import { showNotificationOnce } from "@/push/dedupe";
import { shouldNotifyViaFirestore, shouldToastNewMessage } from "@/push/fallback";
import { usePushStore } from "@/push/store";

/**
 * Decides how to alert the operator about a newly arrived message.
 * Kept outside messagesStore so the store stays a data layer.
 */
export function notifyIncomingMessage(
  message: Message,
  onOpen: (messageId: string) => void,
): void {
  if (shouldToastNewMessage()) {
    toastNewMessage(message, onOpen);
    return;
  }

  if (shouldNotifyViaFirestore()) {
    void notifyNewMessage(message);
    return;
  }

  const { enabled, token } = usePushStore.getState();
  if (enabled && token && message.source === "portfolio") {
    void showNotificationOnce(message.id, () => notifyNewMessage(message));
  }
}
