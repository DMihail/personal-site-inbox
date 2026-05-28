import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/firebase";
import { firebaseSignIn, firebaseSignOut } from "@/utils/auth";

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
          (user) =>
            set({
              user,
              lastKnownUid: user?.uid ?? null,
              isHydrating: false,
            }),
          (err) => set({ authError: err.message, isHydrating: false }),
        );
        return unsub;
      },

      login: async (email, password) => {
        set({ authError: null });
        try {
          const { user } = await firebaseSignIn({ email, password });
          // Set immediately so RequireAuth sees user before navigate (onAuthStateChanged is async).
          set({ user, isHydrating: false });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Authentication failed";
          set({ authError: message });
          throw e;
        }
      },

      logout: async () => {
        set({ authError: null });
        await firebaseSignOut();
        // user will be cleared by onAuthStateChanged
      },
    }),
    {
      name: "auth-store",
      partialize: (s) => ({ lastKnownUid: s.lastKnownUid }),
      version: 1,
    },
  ),
);

