import { usePushStore } from "../store/pushStore";
import { canShowBrowserNotifications } from "./notificationPermission";

/**
 * Firestore realtime fallback when FCM token is not registered (e.g. no VAPID).
 * When FCM token exists, portfolio push + onMessage / background SW handle alerts.
 */
export function shouldNotifyNewMessages(): boolean {
  if (!canShowBrowserNotifications()) return false;
  const { enabled, token } = usePushStore.getState();
  if (!enabled) return false;
  return !token;
}
