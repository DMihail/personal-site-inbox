import {
  ensurePersistentStorage,
  getPersistedString,
  setPersistedString,
} from "@/pwa/persistentBrowserStorage";

const STORAGE_KEY = "inbox-push-device-id";

let cachedDeviceId: string | null = null;
let initPromise: Promise<string> | null = null;

function isValidDeviceId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id);
}

async function loadOrCreateDeviceId(): Promise<string> {
  await ensurePersistentStorage();
  const existing = (await getPersistedString(STORAGE_KEY))?.trim();
  if (existing && isValidDeviceId(existing)) return existing;

  const id = crypto.randomUUID();
  await setPersistedString(STORAGE_KEY, id);
  return id;
}

export function initDeviceId(): Promise<string> {
  if (cachedDeviceId) return Promise.resolve(cachedDeviceId);
  initPromise ??= loadOrCreateDeviceId().then((id) => {
    cachedDeviceId = id;
    return id;
  });
  return initPromise;
}

export function getDeviceId(): string {
  if (cachedDeviceId) return cachedDeviceId;
  if (typeof window === "undefined") return "ssr";

  try {
    const legacy = localStorage.getItem(STORAGE_KEY)?.trim();
    if (legacy && isValidDeviceId(legacy)) {
      cachedDeviceId = legacy;
      void setPersistedString(STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    // ignore
  }

  const id = crypto.randomUUID();
  cachedDeviceId = id;
  void setPersistedString(STORAGE_KEY, id);
  return id;
}

export function resetDeviceIdCacheForTests(): void {
  cachedDeviceId = null;
  initPromise = null;
}
