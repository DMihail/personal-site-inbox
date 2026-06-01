import { afterEach, describe, expect, it, vi } from "vitest";
import { portfolioApiUrl } from "@/utils/portfolio-api-url";

describe("portfolioApiUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses same-origin path for local API in dev", () => {
    vi.stubEnv("VITE_PORTFOLIO_API_URL", "http://localhost:3000");
    expect(portfolioApiUrl("/api/inbox/test-push")).toBe("/api/inbox/test-push");
  });

  it("uses full origin for HTTPS API", () => {
    vi.stubEnv("VITE_PORTFOLIO_API_URL", "https://api.example.com");
    expect(portfolioApiUrl("/api/inbox/reply")).toBe("https://api.example.com/api/inbox/reply");
  });
});
