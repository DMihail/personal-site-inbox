export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_APIKEY?.trim() &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() &&
      import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  );
}
