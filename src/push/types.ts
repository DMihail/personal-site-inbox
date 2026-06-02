/** FCM data payload (matches Firebase `MessagePayload`). */
export type PushPayload = {
  notification?: { title?: string; body?: string; icon?: string };
  data?: Record<string, string | undefined>;
};

export type PushRegisterResult =
  | { ok: true; token: string }
  | {
      ok: false;
      reason: "unsupported" | "permission-denied" | "no-vapid" | "no-token" | "error";
      message?: string;
    };
