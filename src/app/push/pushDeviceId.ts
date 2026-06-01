const STORAGE_KEY = "inbox-push-device-id";

/** Stable id per browser/PWA install — used as Firestore `devices/{deviceId}` doc id. */
export function getOrCreatePushDeviceId(): string {
  if (typeof window === "undefined") {
    return "ssr";
  }

  try {
    const existing = localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
      return existing;
    }

    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
