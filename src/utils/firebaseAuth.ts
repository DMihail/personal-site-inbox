import type { Auth } from "firebase/auth";
import { firebaseApp } from "./firebaseApp";

let authInstance: Auth | null = null;
let authPromise: Promise<Auth> | null = null;

/** Lazy Auth — keeps `firebase/auth` out of the initial route chunk until needed. */
export function getFirebaseAuth(): Promise<Auth> {
  if (authInstance) return Promise.resolve(authInstance);
  if (!authPromise) {
    authPromise = import("firebase/auth").then(({ getAuth }) => {
      authInstance = getAuth(firebaseApp);
      return authInstance;
    });
  }
  return authPromise;
}
