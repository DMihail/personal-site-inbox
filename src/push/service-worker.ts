/**
 * Push uses the unified app service worker (`/sw.js`), which bundles FCM via
 * `firebase/messaging/sw` (no remote gstatic importScripts).
 */
export {
  ensureAppServiceWorker as ensureFcmServiceWorker,
  getAppServiceWorkerRegistration as getActiveFcmRegistration,
} from "@/pwa/appServiceWorker";
