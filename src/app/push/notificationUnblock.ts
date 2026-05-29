import { getNotificationPermission } from "./notificationPermission";

export type UnblockBrowser = "chrome" | "edge" | "firefox" | "safari" | "generic";

export function detectNotificationSettingsBrowser(): UnblockBrowser {
  if (typeof navigator === "undefined") return "generic";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua)) return "safari";
  if (/Chrome\//.test(ua) || /Chromium\//.test(ua)) return "chrome";
  return "generic";
}

export function getNotificationUnblockSteps(): string[] {
  const host =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "this site";

  switch (detectNotificationSettingsBrowser()) {
    case "firefox":
      return [
        "Click the lock icon in the address bar",
        "Open the Connection secure / Permissions panel",
        `Set Notifications to Allow for ${host}`,
        "Reload the page, then enable push again",
      ];
    case "safari":
      return [
        "Safari menu → Settings (or Preferences) → Websites → Notifications",
        `Select ${host} and choose Allow`,
        "Reload the page, then enable push again",
        "On iPhone/iPad: Settings → Notifications → your installed Inbox app → Allow",
      ];
    case "edge":
      return [
        "Click the lock icon left of the address bar",
        "Permissions for this site → Notifications → Allow",
        "Reload the page, then enable push again",
      ];
    case "chrome":
    case "generic":
    default:
      return [
        "Click the lock or tune icon left of the address bar",
        "Open Site settings (Chrome) or Permissions",
        `Set Notifications to Allow for ${host}`,
        "Reload the page, then enable push again",
      ];
  }
}

export function isNotificationPermissionBlocked(): boolean {
  return getNotificationPermission() === "denied";
}
