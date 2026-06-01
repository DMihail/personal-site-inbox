import { afterEach, describe, expect, it, vi } from "vitest";
import { sendInboxTestPush } from "@/utils/push-api";

vi.mock("@/utils/firebaseAuth", () => ({
  firebaseAuth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue("test-token"),
    },
  },
}));

vi.mock("@/utils/reply-api", () => ({
  isPortfolioApiConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock("@/utils/portfolio-api-url", () => ({
  portfolioApiUrl: (path: string) => `https://api.example.com${path}`,
}));

vi.mock("@/app/push/pushDeviceId", () => ({
  getOrCreatePushDeviceId: () => "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
}));

describe("sendInboxTestPush", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns not-configured when API URL is missing", async () => {
    const { isPortfolioApiConfigured } = await import("@/utils/reply-api");
    vi.mocked(isPortfolioApiConfigured).mockReturnValueOnce(false);

    await expect(sendInboxTestPush()).resolves.toEqual({ status: "not-configured" });
  });

  it("POSTs to /api/inbox/test-push when configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendInboxTestPush()).resolves.toEqual({ status: "sent" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/inbox/test-push",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ deviceId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" }),
      }),
    );
  });

  it("returns not-available on 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      }),
    );

    await expect(sendInboxTestPush()).resolves.toEqual({ status: "not-available" });
  });
});
