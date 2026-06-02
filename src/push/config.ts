export function isPushConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID?.trim() &&
      import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim(),
  );
}

export function getVapidKey(): string {
  return import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim() ?? "";
}
