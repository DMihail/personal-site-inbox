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
    // Portfolio reply/test-push API origin (configured via VITE_PORTFOLIO_API_URL).
    "https:",
    ...extra,
  ].join(" ");
}

const OBJECT_SRC = "object-src 'none'";

/**
 * Production: external Vite bundles only — no unsafe-inline (CSP audit).
 * Dev: Vite HMR + @vitejs/plugin-react inject inline preamble scripts.
 */
const SCRIPT_SRC_PRODUCTION = "script-src 'self'";
const SCRIPT_SRC_DEVELOPMENT = "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

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
    // Tailwind + Radix use style attributes; hashes would require a build-time pipeline.
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: blob: https://www.gstatic.com ${VERCEL_LIVE_ORIGIN}`,
    buildConnectSrc(options.connectExtra),
    `frame-src 'self' ${VERCEL_LIVE_ORIGIN}`,
    "worker-src 'self' blob: https://www.gstatic.com https://storage.googleapis.com",
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
