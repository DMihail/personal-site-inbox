import { firebaseAuth } from "@/utils/firebase";

function portfolioApiBase(): string {
  const base = import.meta.env.VITE_PORTFOLIO_API_URL?.trim().replace(/\/$/, "");
  if (!base) {
    throw new Error("VITE_PORTFOLIO_API_URL is not configured");
  }
  return base;
}

export async function sendInboxReply(messageId: string, body: string): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to send a reply");
  }

  const idToken = await user.getIdToken();
  const res = await fetch(`${portfolioApiBase()}/api/inbox/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ messageId, body }),
  });

  let payload: { error?: string; success?: boolean } = {};
  try {
    payload = await res.json();
  } catch {
    /* non-JSON */
  }

  if (!res.ok) {
    throw new Error(payload.error ?? `Request failed (${res.status})`);
  }
}
