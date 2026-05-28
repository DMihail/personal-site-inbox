import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { firebaseAuth } from "@/utils/firebase";

setPersistence(firebaseAuth, browserLocalPersistence);

export interface LoginFormValues {
  email: string;
  password: string;
}

export const firebaseSignIn = async ({ email, password }: LoginFormValues) =>
  signInWithEmailAndPassword(firebaseAuth, email, password);

export const firebaseSignOut = async () => {
  await signOut(firebaseAuth);
};
