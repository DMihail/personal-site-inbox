import { MEDIA_QUERIES } from "@/shared/constants/media-queries";
import { usePushStore } from "../store/pushStore";
import { canShowBrowserNotifications } from "./notificationPermission";

export function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MEDIA_QUERIES.desktop).matches;
}

export function isFcmDeliveryAvailable(): boolean {
  if (!canShowBrowserNotifications()) return false;
  const { enabled, token } = usePushStore.getState();
  return enabled && Boolean(token);
}

/** In-tab toast when FCM is off or unavailable (e.g. desktop without token). */
export function shouldToastNewMessage(): boolean {
  if (isDesktopViewport()) return true;
  return !isFcmDeliveryAvailable();
}
