const DB_NAME = "personal-site-inbox";
const DB_VERSION = 1;
const STORE_NAME = "kv";

let persistRequest: Promise<boolean> | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Requests durable origin storage (reduces eviction on mobile PWA). */
export async function ensurePersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) {
    return false;
  }

  persistRequest ??= (async () => {
    try {
      if (typeof navigator.storage.persisted === "function" && (await navigator.storage.persisted())) {
        return true;
      }
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  })();

  return persistRequest;
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) {
    return Promise.resolve(null);
  }

  dbPromise ??= new Promise<IDBDatabase | null>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });

  return dbPromise.catch(() => null);
}

function idbGet(db: IDBDatabase, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => {
      const value = request.result;
      resolve(typeof value === "string" ? value : null);
    };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"));
  });
}

function idbSet(db: IDBDatabase, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB write failed"));
  });
}

function idbRemove(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB delete failed"));
  });
}

function legacyGet(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(key);
}

function legacySet(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value);
}

function legacyRemove(key: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(key);
}

/** Reads a string value (IndexedDB, with one-time migration from localStorage). */
export async function getPersistedString(key: string): Promise<string | null> {
  const db = await openDatabase();
  if (db) {
    const fromIdb = await idbGet(db, key);
    if (fromIdb !== null) {
      return fromIdb;
    }

    const legacy = legacyGet(key);
    if (legacy !== null) {
      await idbSet(db, key, legacy);
      legacyRemove(key);
      return legacy;
    }

    return null;
  }

  return legacyGet(key);
}

/** Writes a string value to durable storage. */
export async function setPersistedString(key: string, value: string): Promise<void> {
  const db = await openDatabase();
  if (db) {
    await idbSet(db, key, value);
    legacyRemove(key);
    return;
  }

  legacySet(key, value);
}

/** Removes a persisted string value. */
export async function removePersistedString(key: string): Promise<void> {
  const db = await openDatabase();
  if (db) {
    await idbRemove(db, key);
  }
  legacyRemove(key);
}

/** Test helper — clears in-memory DB handle and legacy keys. */
export async function resetPersistentBrowserStorageForTests(): Promise<void> {
  persistRequest = null;
  dbPromise = null;
  if (!hasIndexedDb()) {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB delete failed"));
    request.onblocked = () => resolve();
  }).catch(() => undefined);

  if (typeof localStorage !== "undefined") {
    localStorage.clear();
  }
}
