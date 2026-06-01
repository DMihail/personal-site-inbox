import {
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
  const existing = (await getPersistedString(STORAGE_KEY))?.trim();
  if (existing && isValidDeviceId(existing)) {
    return existing;
  }

  const id = crypto.randomUUID();
  await setPersistedString(STORAGE_KEY, id);
  return id;
}

/** Call once at app start so sync `getOrCreatePushDeviceId` has a cached value. */
export function initPushDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return Promise.resolve(cachedDeviceId);
  }

  initPromise ??= loadOrCreateDeviceId().then((id) => {
    cachedDeviceId = id;
    return id;
  });

  return initPromise;
}

/** Stable id per browser/PWA install — used as Firestore `devices/{deviceId}` doc id. */
export function getOrCreatePushDeviceId(): string {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  if (typeof window === "undefined") {
    return "ssr";
  }

  try {
    const legacy = localStorage.getItem(STORAGE_KEY)?.trim();
    if (legacy && isValidDeviceId(legacy)) {
      cachedDeviceId = legacy;
      void setPersistedString(STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    // fall through
  }

  const id = crypto.randomUUID();
  cachedDeviceId = id;
  void setPersistedString(STORAGE_KEY, id);
  return id;
}

export function resetPushDeviceIdCacheForTests(): void {
  cachedDeviceId = null;
  initPromise = null;
}
