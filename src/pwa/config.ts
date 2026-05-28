/** PWA / Workbox service worker is production-only; dev uses Vite directly. */
export const isPwaRuntime = import.meta.env.PROD;
