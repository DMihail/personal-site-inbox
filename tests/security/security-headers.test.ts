import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  devSecurityHeaders,
  productionSecurityHeaders,
} from "@security/headers";

describe("security headers", () => {
  it("includes baseline hardening headers in dev and production", () => {
    for (const headers of [devSecurityHeaders, productionSecurityHeaders]) {
      expect(headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(headers["X-Frame-Options"]).toBe("DENY");
      expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["Content-Security-Policy"]).toBeTruthy();
      expect(headers["Permissions-Policy"]).toContain("notifications=(self)");
    }
  });

  it("adds HSTS only for production", () => {
    expect(devSecurityHeaders["Strict-Transport-Security"]).toBeUndefined();
    expect(productionSecurityHeaders["Strict-Transport-Security"]).toMatch(/max-age=/);
  });

  it("builds a CSP that blocks framing and object embeds", () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).toContain("https://*.googleapis.com");
  });
});
