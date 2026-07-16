/** Base URL for portfolio API requests (reply, test-push). */
export function getPortfolioApiEnvBase(): string | null {
  const base = import.meta.env.VITE_PORTFOLIO_API_URL?.trim().replace(/\/$/, "");
  return base || null;
}

function isLocalPortfolioApiUrl(base: string): boolean {
  try {
    const { hostname, protocol } = new URL(base);
    return protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

/**
 * In dev, local API URLs are requested via same-origin `/api/*` (Vite proxy → backend).
 * Production and remote HTTPS APIs use the full `VITE_PORTFOLIO_API_URL` origin.
 */
function portfolioApiBase(): string {
  const base = getPortfolioApiEnvBase();
  if (!base) {
    throw new Error("VITE_PORTFOLIO_API_URL is not configured");
  }
  if (import.meta.env.DEV && isLocalPortfolioApiUrl(base)) {
    return "";
  }
  return base;
}

export function portfolioApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = portfolioApiBase();
  return base ? `${base}${normalized}` : normalized;
}
