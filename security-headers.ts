/**
 * Shared HTTP security headers for Vite dev/preview and Vercel (`vercel.json`).
 * Keep `vercel.json` in sync — run `npm run sync:security-headers` after edits.
 *
 * For a tight portfolio API allowlist, set `VITE_PORTFOLIO_API_URL` before syncing
 * (or when starting Vite) so `connect-src` includes that origin instead of `https:`.
 */

/** Standard features only — `notifications` / `push` are not valid Permissions-Policy tokens in Chromium. */
const PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), browsing-topics=(), interest-cohort=()";

/** Vercel Preview Comments / Live toolbar (injected on preview deployments only). */
const VERCEL_LIVE_ORIGIN = "https://vercel.live";

/** Firebase Auth loads GAPI (`api.js`) to host the auth iframe handshake. */
const GOOGLE_APIS_ORIGIN = "https://apis.google.com";

/** HTTPS origin for `VITE_PORTFOLIO_API_URL`, or null if unset / invalid / same-origin proxy only. */
export function portfolioApiConnectOrigin(
  raw: string | undefined | null = typeof process !== "undefined"
    ? process.env.VITE_PORTFOLIO_API_URL
    : undefined,
): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function buildConnectSrc(extra: string[] = []): string {
  const portfolioOrigin = portfolioApiConnectOrigin();
  return [
    "connect-src 'self'",
    VERCEL_LIVE_ORIGIN,
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    "https://*.firebaseapp.com",
    "https://www.gstatic.com",
    // Prefer exact portfolio API origin; fall back to https: when unset (local / pre-sync).
    portfolioOrigin ?? "https:",
    ...extra,
  ].join(" ");
}

const OBJECT_SRC = "object-src 'none'";

/**
 * Production: no unsafe-inline / unsafe-eval.
 * - vercel.live: Preview Live toolbar
 * - apis.google.com: Firebase Auth GAPI loader (email/password iframe relay)
 * Dev: Vite HMR + React Refresh need unsafe-inline / unsafe-eval.
 */
const SCRIPT_SRC_HOSTS = `${VERCEL_LIVE_ORIGIN} ${GOOGLE_APIS_ORIGIN}`;
const SCRIPT_SRC_PRODUCTION = `script-src 'self' ${SCRIPT_SRC_HOSTS}`;
const SCRIPT_SRC_DEVELOPMENT = `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${SCRIPT_SRC_HOSTS}`;

function buildCsp(options: {
  upgradeInsecureRequests: boolean;
  scriptSrc: string;
  connectExtra?: string[];
}): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    OBJECT_SRC,
    options.scriptSrc,
    // Sonner + Vite HMR inject <style> tags; Radix uses style attributes.
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: blob: https://www.gstatic.com ${VERCEL_LIVE_ORIGIN}`,
    buildConnectSrc(options.connectExtra),
    // Auth Domain iframe + GAPI + Google accounts (OAuth / relay).
    `frame-src 'self' ${VERCEL_LIVE_ORIGIN} ${GOOGLE_APIS_ORIGIN} https://*.firebaseapp.com https://accounts.google.com`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  if (options.upgradeInsecureRequests) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

/** Production Content-Security-Policy for the inbox SPA, Firebase, and reply API. */
export function buildContentSecurityPolicy(): string {
  return buildCsp({
    upgradeInsecureRequests: true,
    scriptSrc: SCRIPT_SRC_PRODUCTION,
  });
}

/**
 * Dev CSP for `vite` / HMR.
 * Allows inline + eval for React Refresh preamble (not used on Vercel production).
 */
export function buildDevContentSecurityPolicy(): string {
  return buildCsp({
    upgradeInsecureRequests: false,
    scriptSrc: SCRIPT_SRC_DEVELOPMENT,
    connectExtra: [
      "http://localhost:*",
      "http://127.0.0.1:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
    ],
  });
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

/** Local dev / Vite (no HSTS; relaxed connect-src + script-src for HMR). */
export function buildDevSecurityHeaders(): Record<string, string> {
  return {
    ...sharedSecurityHeaders,
    "Content-Security-Policy": buildDevContentSecurityPolicy(),
  };
}

/** Production (Vercel + `vite preview`). */
export function buildProductionSecurityHeaders(): Record<string, string> {
  return {
    ...sharedSecurityHeaders,
    "Content-Security-Policy": buildContentSecurityPolicy(),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  };
}

/** @deprecated Prefer buildDevSecurityHeaders() so CSP picks up env at call time. */
export const devSecurityHeaders: Record<string, string> = buildDevSecurityHeaders();

/** @deprecated Prefer buildProductionSecurityHeaders() so CSP picks up env at call time. */
export const productionSecurityHeaders: Record<string, string> = buildProductionSecurityHeaders();

/** Ordered pairs for `vercel.json` `headers` array. */
export function vercelHeaderEntries(): Array<{ key: string; value: string }> {
  return Object.entries(buildProductionSecurityHeaders()).map(([key, value]) => ({
    key,
    value,
  }));
}
