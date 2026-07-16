/**
 * Push uses the unified app service worker (`/sw.js`), which loads FCM via importScripts.
 */
export {
  ensureAppServiceWorker as ensureFcmServiceWorker,
  getAppServiceWorkerRegistration as getActiveFcmRegistration,
} from "@/pwa/appServiceWorker";
