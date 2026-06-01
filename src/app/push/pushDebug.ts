/** Set `VITE_PUSH_DEBUG=true` on Vercel/local to trace token + delivery (tokens are masked). */
export function isPushDebugEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_PUSH_DEBUG === "true";
}

/** Short fingerprint for logs — never log full FCM tokens in production. */
export function maskFcmToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) return "(empty)";
  if (trimmed.length <= 12) return "***";
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-6)}`;
}

export function logPushDebug(event: string, details?: Record<string, unknown>): void {
  if (!isPushDebugEnabled()) return;
  if (details) {
    console.info(`[push:debug] ${event}`, details);
  } else {
    console.info(`[push:debug] ${event}`);
  }
}
