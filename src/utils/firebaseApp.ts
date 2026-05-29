import { getApp, getApps, initializeApp } from "firebase/app";

const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID?.trim();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  ...(messagingSenderId ? { messagingSenderId } : {}),
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
