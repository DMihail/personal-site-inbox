import { firebaseAuth } from "@/utils/firebase";

const MIN_REPLY_LENGTH = 2;

export function isPortfolioApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_PORTFOLIO_API_URL?.trim());
}

export function getPortfolioApiLabel(): string {
  const base = import.meta.env.VITE_PORTFOLIO_API_URL?.trim();
  if (!base) return "Not configured";
  try {
    return new URL(base.replace(/\/$/, "")).origin;
  } catch {
    return "Invalid URL";
  }
}

function portfolioApiBase(): string {
  const base = import.meta.env.VITE_PORTFOLIO_API_URL?.trim().replace(/\/$/, "");
  if (!base) {
    throw new Error("VITE_PORTFOLIO_API_URL is not configured");
  }
  return base;
}

function replyErrorMessage(status: number, serverMessage?: string): string {
  if (serverMessage) return serverMessage;
  switch (status) {
    case 401:
      return "Session expired — sign in again";
    case 403:
      return "Your account is not allowed to send replies";
    case 404:
      return "Message not found";
    case 503:
      return "Email is not configured on the portfolio server (SMTP)";
    case 502:
      return "Email delivery failed — try again later";
    default:
      return `Request failed (${status})`;
  }
}

export async function sendInboxReply(messageId: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (trimmed.length < MIN_REPLY_LENGTH) {
    throw new Error("Reply is too short");
  }

  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to send a reply");
  }

  const idToken = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${portfolioApiBase()}/api/inbox/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ messageId, body: trimmed }),
    });
  } catch {
    throw new Error("Could not reach portfolio API — check VITE_PORTFOLIO_API_URL and CORS (INBOX_APP_URL)");
  }

  let payload: { error?: string; success?: boolean } = {};
  try {
    payload = await res.json();
  } catch {
    /* non-JSON */
  }

  if (!res.ok) {
    throw new Error(replyErrorMessage(res.status, payload.error));
  }
}
