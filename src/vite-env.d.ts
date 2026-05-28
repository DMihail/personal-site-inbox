/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_APIKEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGE_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_VAPID_KEY: string;
  /** AES key for encrypted Zustand persist in localStorage (32+ random chars). */
  readonly VITE_ZUSTAND_STORAGE_KEY?: string;
  /** Portfolio site origin, e.g. https://dzhezhelo.dev */
  readonly VITE_PORTFOLIO_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

