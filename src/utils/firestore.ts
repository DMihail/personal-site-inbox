import type { Firestore } from "firebase/firestore";
import { FIRESTORE_OFFLINE_CACHE_BYTES } from "@/pwa/storageBudgets";
import { firebaseApp } from "./firebaseApp";

let firestorePromise: Promise<Firestore> | null = null;

/** Loads Firestore only when needed (keeps login bundle smaller). */
export function getFirestoreDb(): Promise<Firestore> {
  if (!firestorePromise) {
    firestorePromise = import("firebase/firestore").then(
      ({ initializeFirestore, persistentLocalCache, persistentSingleTabManager }) =>
        initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentSingleTabManager({}),
            cacheSizeBytes: FIRESTORE_OFFLINE_CACHE_BYTES,
          }),
        }),
    );
  }
  return firestorePromise;
}
