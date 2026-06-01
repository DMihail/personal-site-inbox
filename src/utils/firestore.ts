import type { Firestore } from "firebase/firestore";
import {
  FIRESTORE_OFFLINE_CACHE_BYTES,
  FIRESTORE_OFFLINE_CACHE_BYTES_MOBILE,
} from "@/pwa/storageBudgets";
import { isMobilePushDevice } from "@/pwa/runtime";
import { firebaseApp } from "./firebaseApp";

function getFirestoreCacheSizeBytes(): number {
  return isMobilePushDevice()
    ? FIRESTORE_OFFLINE_CACHE_BYTES_MOBILE
    : FIRESTORE_OFFLINE_CACHE_BYTES;
}

let firestorePromise: Promise<Firestore> | null = null;

/** Loads Firestore only when needed (keeps login bundle smaller). */
export function getFirestoreDb(): Promise<Firestore> {
  if (!firestorePromise) {
    firestorePromise = import("firebase/firestore").then(
      ({ initializeFirestore, persistentLocalCache, persistentSingleTabManager }) =>
        initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentSingleTabManager({}),
            cacheSizeBytes: getFirestoreCacheSizeBytes(),
          }),
        }),
    );
  }
  return firestorePromise;
}
