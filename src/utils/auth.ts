import type { UserCredential } from "firebase/auth";
import { getFirebaseAuth } from "./firebaseAuth";

export const firebaseSignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<UserCredential> => {
  const [{ signInWithEmailAndPassword, setPersistence, browserLocalPersistence }, auth] =
    await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email.trim(), password);
};

export const firebaseSignOut = async () => {
  const [{ signOut }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
  await signOut(auth);
};
