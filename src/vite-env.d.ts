/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_APIKEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MESSAGE_SENDER_ID: string;
  readonly VITE_FIREBASE_VAPID_KEY: string;
  readonly VITE_ZUSTAND_STORAGE_KEY?: string;
  readonly VITE_PORTFOLIO_API_URL: string;
  /** Set to `true` to style/layout as Telegram Mini App without the Telegram client. */
  readonly VITE_TELEGRAM_MINI_APP_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
