import { MEDIA_QUERIES } from "@/shared/constants/media-queries";
import { usePushStore } from "@/push/store";
import { canShowBrowserNotifications } from "@/push/permissions";

export function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MEDIA_QUERIES.desktop).matches;
}

/** Firestore in-tab fallback when push is enabled but FCM token is missing. */
export function shouldNotifyViaFirestore(): boolean {
  if (!canShowBrowserNotifications()) return false;
  const { enabled, token } = usePushStore.getState();
  return enabled && !token;
}

/** Toast when FCM cannot deliver (desktop always toasts new messages in-tab). */
export function shouldToastNewMessage(): boolean {
  if (isDesktopViewport()) return true;
  const { enabled, token } = usePushStore.getState();
  return !(enabled && token);
}
