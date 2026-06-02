/**
 * Workbox `/sw.js` is not used for push (FCM-only SW). App updates reload from the browser cache bust.
 * This banner is disabled until a safe update path exists without breaking FCM.
 */
export function PwaUpdateBanner() {
  return null;
}
