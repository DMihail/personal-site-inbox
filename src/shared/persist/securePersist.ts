import type { PersistOptions } from "zustand/middleware";
import { createSecurePersistStorage } from "@/shared/persist/securePersistStorage";

/** Merges persist options with encrypted IndexedDB storage + Persistent Storage API. */
export function withSecurePersist<S, Persisted extends Partial<S>>(
  options: PersistOptions<S, Persisted>,
): PersistOptions<S, Persisted> {
  return {
    ...options,
    storage: createSecurePersistStorage<Persisted>(),
  };
}
