export const DEFAULT_SERVICE_WORKER_TIMEOUT_MS = 20_000;
export const IOS_SERVICE_WORKER_TIMEOUT_MS = 45_000;
export const ANDROID_SERVICE_WORKER_TIMEOUT_MS = 12_000;

/** iOS / Android — FCM-only SW in production; desktop uses `/sw.js` (Workbox + FCM). */
export function isMobilePushDevice(): boolean {
  return isIosLikeDevice() || isAndroidDevice();
}

export function getServiceWorkerActivationTimeoutMs(): number {
  if (isIosLikeDevice()) return IOS_SERVICE_WORKER_TIMEOUT_MS;
  if (isAndroidDevice()) return ANDROID_SERVICE_WORKER_TIMEOUT_MS;
  return DEFAULT_SERVICE_WORKER_TIMEOUT_MS;
}

/** True when the app runs as an installed PWA (home screen / standalone). */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** iOS 13+ iPad may report as Mac — treat touch Mac as iPad for install hints. */
export function isIosLikeDevice(): boolean {
  if (isIosDevice()) return true;
  if (typeof navigator === "undefined") return false;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export type PwaInstallPlatform = "ios" | "android" | null;

export function getPwaInstallPlatform(): PwaInstallPlatform {
  if (isStandaloneDisplayMode()) return null;
  if (isIosLikeDevice()) return "ios";
  if (isAndroidDevice()) return "android";
  return null;
}
