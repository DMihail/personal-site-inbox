export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as NotificationPermissionState;
}

export function canShowBrowserNotifications(): boolean {
  return getNotificationPermission() === "granted";
}
