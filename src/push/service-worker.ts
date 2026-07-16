/**
 * Push uses the unified app service worker (`/sw.js`), which loads FCM via importScripts.
 * Kept as thin re-exports so messaging/init keep stable import paths.
 */
export {
  ensureAppServiceWorker as ensureFcmServiceWorker,
  getAppServiceWorkerRegistration as getActiveFcmRegistration,
  isAppServiceWorker,
} from "@/pwa/appServiceWorker";
