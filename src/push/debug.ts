export function isPushDebugEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_PUSH_DEBUG === "true";
}

export function maskToken(token: string): string {
  const t = token.trim();
  if (!t) return "(empty)";
  if (t.length <= 12) return "***";
  return `${t.slice(0, 8)}…${t.slice(-6)}`;
}

export function logPush(event: string, details?: Record<string, unknown>): void {
  if (!isPushDebugEnabled()) return;
  if (details) console.info(`[push] ${event}`, details);
  else console.info(`[push] ${event}`);
}
