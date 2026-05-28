import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { firebaseAuth } from "@/utils/firebaseAuth";

const persistenceReady = setPersistence(firebaseAuth, browserLocalPersistence);

export interface LoginFormValues {
  email: string;
  password: string;
}

export const firebaseSignIn = async ({ email, password }: LoginFormValues) => {
  await persistenceReady;
  return signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
};

export const firebaseSignOut = async () => {
  await signOut(firebaseAuth);
};
