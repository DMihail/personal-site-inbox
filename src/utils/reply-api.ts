import { firebaseAuth } from "@/utils/firebaseAuth";
import { getPortfolioApiEnvBase, portfolioApiUrl } from "@/utils/portfolio-api-url";

const MIN_REPLY_LENGTH = 2;

export function isPortfolioApiConfigured(): boolean {
  return Boolean(getPortfolioApiEnvBase());
}

export function getPortfolioApiLabel(): string {
  const base = getPortfolioApiEnvBase();
  if (!base) return "Not configured";
  try {
    return new URL(base).origin;
  } catch {
    return "Invalid URL";
  }
}

export { portfolioApiBase } from "@/utils/portfolio-api-url";

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
      return "Email is not configured on the server (SMTP)";
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
    res = await fetch(portfolioApiUrl("/api/inbox/reply"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ messageId, body: trimmed }),
    });
  } catch {
    throw new Error("Could not reach reply API — check VITE_PORTFOLIO_API_URL and CORS");
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
