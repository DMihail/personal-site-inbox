/**
 * Shared HTTP security headers for Vite dev/preview and Vercel (`vercel.json`).
 * Keep `vercel.json` in sync — run `npm run sync:security-headers` after edits.
 */

const PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), browsing-topics=(), interest-cohort=(), notifications=(self), push=(self)";

/** Production Content-Security-Policy for the inbox SPA, Firebase, Google Fonts, and reply API. */
export function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://www.gstatic.com",
    [
      "connect-src 'self'",
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "wss://*.firebaseio.com",
      "https://*.firebaseapp.com",
      "https://www.gstatic.com",
      "https:",
    ].join(" "),
    "worker-src 'self' blob: https://www.gstatic.com",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Headers safe for local dev (no HSTS — avoids pinning localhost). */
export const devSecurityHeaders: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": PERMISSIONS_POLICY,
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": buildContentSecurityPolicy(),
};

/** Production headers (Vercel + `vite preview`). Includes HSTS. */
export const productionSecurityHeaders: Record<string, string> = {
  ...devSecurityHeaders,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/** Ordered pairs for `vercel.json` `headers` array. */
export function vercelHeaderEntries(): Array<{ key: string; value: string }> {
  return Object.entries(productionSecurityHeaders).map(([key, value]) => ({ key, value }));
}
