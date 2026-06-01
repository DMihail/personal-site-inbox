/** 1 MiB — shared unit for cache budget constants. */
export const MIB = 1024 * 1024;

/** Firestore persistent offline cache (messages + metadata). */
export const FIRESTORE_OFFLINE_CACHE_BYTES = 48 * MIB;

/** Workbox runtime cache for images/fonts (Android / desktop Workbox SW). */
export const WORKBOX_ASSETS_MAX_ENTRIES = 100;
export const WORKBOX_ASSETS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
