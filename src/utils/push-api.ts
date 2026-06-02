import { initDeviceId } from "@/push/device-id";
import { firebaseAuth } from "@/utils/firebaseAuth";
import { isPortfolioApiConfigured } from "@/utils/reply-api";
import { portfolioApiUrl } from "@/utils/portfolio-api-url";

export type InboxTestPushResult =
  | { status: "sent" }
  | { status: "not-configured" }
  | { status: "not-available" };

function testPushErrorMessage(status: number, serverMessage?: string): string {
  if (serverMessage) return serverMessage;
  switch (status) {
    case 401:
      return "Session expired — sign in again";
    case 403:
      return "Your account is not allowed to send test push";
    case 503:
      return "Push is not configured on the server (FCM)";
    default:
      return `Test push request failed (${status})`;
  }
}

/**
 * Asks the portfolio backend to send FCM test messages (should target all `devices` tokens).
 * Endpoint is optional — 404 means the server has no test-push route yet.
 */
export async function sendInboxTestPush(): Promise<InboxTestPushResult> {
  if (!isPortfolioApiConfigured()) {
    return { status: "not-configured" };
  }

  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to request a server test push");
  }

  const idToken = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(portfolioApiUrl("/api/inbox/test-push"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ deviceId: await initDeviceId() }),
    });
  } catch {
    throw new Error(
      import.meta.env.DEV
        ? "Could not reach API — is engineering-profile running on port 3000? Restart inbox dev server after .env changes."
        : "Could not reach API — check VITE_PORTFOLIO_API_URL and CORS",
    );
  }

  let payload: { error?: string } = {};
  try {
    payload = await res.json();
  } catch {
    /* non-JSON */
  }

  if (res.status === 404) {
    if (payload.error) {
      throw new Error(payload.error);
    }
    return { status: "not-available" };
  }

  if (!res.ok) {
    throw new Error(testPushErrorMessage(res.status, payload.error));
  }

  return { status: "sent" };
}
