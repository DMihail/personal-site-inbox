const FCM_IDB_NAMES = [
  "firebase-messaging-database",
  "firebase-installations-database",
  "firebase-heartbeat-database",
] as const;

function deleteIndexedDb(name: string): Promise<void> {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onblocked = () => resolve();
    request.onerror = () => resolve();
  });
}

/** Clears corrupted Firebase Messaging token storage (common after reinstall / permission reset on Android). */
export async function clearFcmClientStorage(): Promise<void> {
  await Promise.all(FCM_IDB_NAMES.map((name) => deleteIndexedDb(name)));
}
