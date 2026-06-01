import type { Firestore } from "firebase/firestore";
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
            /** Cap offline message cache — default can grow large on mobile. */
            cacheSizeBytes: 12 * 1024 * 1024,
          }),
        }),
    );
  }
  return firestorePromise;
}
