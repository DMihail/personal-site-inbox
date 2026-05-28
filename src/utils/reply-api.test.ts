import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFirebaseAuth = vi.hoisted(() => ({
  currentUser: null as { getIdToken: () => Promise<string> } | null,
}));

vi.mock("@/utils/firebaseAuth", () => ({
  firebaseAuth: mockFirebaseAuth,
}));

import { getPortfolioApiLabel, isPortfolioApiConfigured, sendInboxReply } from "./reply-api";

describe("reply-api", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mockFirebaseAuth.currentUser = null;
  });

  describe("isPortfolioApiConfigured", () => {
    it("returns false when env is missing", () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "");
      expect(isPortfolioApiConfigured()).toBe(false);
    });

    it("returns true when env is set", () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "https://example.dev");
      expect(isPortfolioApiConfigured()).toBe(true);
    });
  });

  describe("getPortfolioApiLabel", () => {
    it("returns Not configured when env is empty", () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "");
      expect(getPortfolioApiLabel()).toBe("Not configured");
    });

    it("returns origin for valid URL", () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "https://dzhezhelo.dev/");
      expect(getPortfolioApiLabel()).toBe("https://dzhezhelo.dev");
    });

    it("returns Invalid URL for malformed value", () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "not-a-url");
      expect(getPortfolioApiLabel()).toBe("Invalid URL");
    });
  });

  describe("sendInboxReply", () => {
    it("rejects reply shorter than minimum length", async () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "https://example.dev");
      await expect(sendInboxReply("id-1", "a")).rejects.toThrow("Reply is too short");
    });

    it("requires signed-in user", async () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "https://example.dev");
      await expect(sendInboxReply("id-1", "Hello there")).rejects.toThrow(
        "You must be signed in to send a reply",
      );
    });

    it("sends POST with bearer token on success", async () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "https://example.dev");
      mockFirebaseAuth.currentUser = {
        getIdToken: vi.fn().mockResolvedValue("test-token"),
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      vi.stubGlobal("fetch", fetchMock);

      await sendInboxReply("msg-42", "Thanks for reaching out!");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.dev/api/inbox/reply",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({ messageId: "msg-42", body: "Thanks for reaching out!" }),
        }),
      );
    });

    it("maps API error status to message", async () => {
      vi.stubEnv("VITE_PORTFOLIO_API_URL", "https://example.dev");
      mockFirebaseAuth.currentUser = {
        getIdToken: vi.fn().mockResolvedValue("token"),
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 503,
          json: async () => ({ error: "Email delivery is not configured" }),
        }),
      );

      await expect(sendInboxReply("msg-1", "Hello")).rejects.toThrow(
        "Email delivery is not configured",
      );
    });
  });
});
