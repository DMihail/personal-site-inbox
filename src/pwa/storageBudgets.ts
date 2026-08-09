/** 1 MiB — shared unit for cache budget constants. */
const MIB = 1024 * 1024;

/** Firestore persistent offline cache on desktop. */
export const FIRESTORE_OFFLINE_CACHE_BYTES = 48 * MIB;

/** Smaller Firestore cache on phones — leaves room for FCM + notification storage. */
export const FIRESTORE_OFFLINE_CACHE_BYTES_MOBILE = 24 * MIB;
