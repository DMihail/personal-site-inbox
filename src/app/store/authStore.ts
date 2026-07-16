import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withSecurePersist } from "@/shared/persist/securePersist";
import { migrateAuthPersist } from "@/shared/persist/persistMigrate";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/firebaseAuth";
import { firebaseSignIn, firebaseSignOut } from "@/utils/auth";
import { getFirebaseAuthErrorMessage } from "@/utils/firebaseAuthErrors";

interface AuthState {
  user: User | null;
  isHydrating: boolean;
  authError: string | null;
  lastKnownUid: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  startAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrating: true,
      authError: null,
      lastKnownUid: null,

      startAuthListener: () => {
        const unsub = onAuthStateChanged(
          firebaseAuth,
          (user) => {
            set((state) => ({
              user,
              lastKnownUid: user?.uid ?? state.lastKnownUid ?? null,
              isHydrating: false,
              authError: user ? null : state.authError,
            }));
          },
          (err) => set({ authError: err.message, isHydrating: false }),
        );
        return unsub;
      },

      login: async (email, password) => {
        set({ authError: null });
        try {
          const { user } = await firebaseSignIn({
            email: email.trim(),
            password,
          });
          // Set immediately so RequireAuth sees user before navigate (onAuthStateChanged is async).
          set({ user, isHydrating: false });
        } catch (e) {
          const message = getFirebaseAuthErrorMessage(e);
          set({ authError: message, user: null });
          throw e;
        }
      },

      logout: async () => {
        set({ authError: null });
        await firebaseSignOut();
        // user will be cleared by onAuthStateChanged
      },
    }),
    withSecurePersist({
      name: "auth-store",
      partialize: (s) => ({ lastKnownUid: s.lastKnownUid }),
      version: 3,
      migrate: migrateAuthPersist,
    }),
  ),
);

