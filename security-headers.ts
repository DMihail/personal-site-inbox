/**
 * Shared HTTP security headers for Vite dev/preview and Vercel (`vercel.json`).
 * Keep `vercel.json` in sync — run `npm run sync:security-headers` after edits.
 */

/** Standard features only — `notifications` / `push` are not valid Permissions-Policy tokens in Chromium. */
const PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), browsing-topics=(), interest-cohort=()";

/** Vercel Preview Comments / Live toolbar (injected on preview deployments only). */
const VERCEL_LIVE_ORIGIN = "https://vercel.live";

function buildConnectSrc(extra: string[] = []): string {
  return [
    "connect-src 'self'",
    VERCEL_LIVE_ORIGIN,
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    "https://*.firebaseapp.com",
    "https://www.gstatic.com",
    "https:",
    ...extra,
  ].join(" ");
}

const SCRIPT_SRC = [
  "script-src 'self' 'unsafe-inline'",
  "https://www.gstatic.com",
  "https://storage.googleapis.com",
  VERCEL_LIVE_ORIGIN,
].join(" ");

/** Production Content-Security-Policy for the inbox SPA, Firebase, Google Fonts, and reply API. */
export function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    SCRIPT_SRC,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: https://www.gstatic.com ${VERCEL_LIVE_ORIGIN}`,
    buildConnectSrc(),
    `frame-src 'self' ${VERCEL_LIVE_ORIGIN}`,
    "worker-src 'self' blob: https://www.gstatic.com https://storage.googleapis.com",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Dev CSP: no upgrade-insecure-requests; allows local portfolio API over HTTP. */
export function buildDevContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    SCRIPT_SRC,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: https://www.gstatic.com ${VERCEL_LIVE_ORIGIN}`,
    buildConnectSrc([
      "http://localhost:*",
      "http://127.0.0.1:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
    ]),
    `frame-src 'self' ${VERCEL_LIVE_ORIGIN}`,
    "worker-src 'self' blob: https://www.gstatic.com https://storage.googleapis.com",
    "manifest-src 'self'",
  ].join("; ");
}

const sharedSecurityHeaders: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": PERMISSIONS_POLICY,
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/** Local dev / Vite (no HSTS; relaxed connect-src for localhost API). */
export const devSecurityHeaders: Record<string, string> = {
  ...sharedSecurityHeaders,
  "Content-Security-Policy": buildDevContentSecurityPolicy(),
};

/** Production (Vercel + `vite preview`). */
export const productionSecurityHeaders: Record<string, string> = {
  ...sharedSecurityHeaders,
  "Content-Security-Policy": buildContentSecurityPolicy(),
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/** Ordered pairs for `vercel.json` `headers` array. */
export function vercelHeaderEntries(): Array<{ key: string; value: string }> {
  return Object.entries(productionSecurityHeaders).map(([key, value]) => ({ key, value }));
}
