/** Normalizes legacy persisted auth-store payloads (any version). */
export function migrateAuthPersist(persisted: unknown): { lastKnownUid: string | null } {
  if (!persisted || typeof persisted !== "object") {
    return { lastKnownUid: null };
  }

  const state = persisted as Record<string, unknown>;
  const uid = state.lastKnownUid;

  return {
    lastKnownUid: typeof uid === "string" && uid.length > 0 ? uid : null,
  };
}

/** Normalizes legacy persisted push-store payloads (FCM / Web Push shapes). */
export function migratePushPersist(persisted: unknown): { enabled: boolean } {
  if (!persisted || typeof persisted !== "object") {
    return { enabled: false };
  }

  const state = persisted as Record<string, unknown>;

  return {
    enabled: Boolean(state.enabled),
  };
}
