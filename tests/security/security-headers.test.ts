import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildDevContentSecurityPolicy,
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
      expect(headers["Permissions-Policy"]).not.toContain("notifications=");
      expect(headers["Permissions-Policy"]).not.toContain("push=");
    }
  });

  it("adds HSTS only for production", () => {
    expect(devSecurityHeaders["Strict-Transport-Security"]).toBeUndefined();
    expect(productionSecurityHeaders["Strict-Transport-Security"]).toMatch(/max-age=/);
  });

  it("uses production CSP on production headers (not dev localhost rules)", () => {
    expect(productionSecurityHeaders["Content-Security-Policy"]).toContain("upgrade-insecure-requests");
    expect(productionSecurityHeaders["Content-Security-Policy"]).not.toContain("http://localhost:*");
    expect(devSecurityHeaders["Content-Security-Policy"]).toContain("http://localhost:*");
  });

  it("builds a CSP that blocks framing and object embeds", () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-eval'/);
    expect(csp).not.toMatch(/script-src[^;]*data:/);
    expect(csp).not.toMatch(/script-src[^;]*\shttps:(;|$)/);
    expect(csp).not.toMatch(/object-src[^;]*https:/);
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).toContain("https://*.googleapis.com");
    expect(csp).toContain("https://vercel.live");
    expect(csp).toContain("https://apis.google.com");
    expect(csp).toContain("frame-src");
    expect(csp).toContain("https://*.firebaseapp.com");
    expect(csp).toMatch(/style-src 'self' 'unsafe-inline'/);
    expect(csp).not.toMatch(/script-src[^;]*gstatic/);
    expect(csp).not.toMatch(/worker-src[^;]*gstatic/);
  });

  it("allows Firebase Auth GAPI + Vercel Live in script-src; no unsafe-inline in prod", () => {
    const prod = buildContentSecurityPolicy();
    expect(prod).toMatch(
      /script-src 'self' https:\/\/vercel\.live https:\/\/apis\.google\.com(;|$)/,
    );
    expect(prod).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(prod).not.toMatch(/script-src[^;]*'unsafe-eval'/);
    expect(prod).toContain("object-src 'none'");

    const dev = buildDevContentSecurityPolicy();
    expect(dev).toMatch(
      /script-src 'self' 'unsafe-inline' 'unsafe-eval' https:\/\/vercel\.live https:\/\/apis\.google\.com/,
    );
    expect(dev).toContain("object-src 'none'");
  });

  it("dev CSP allows local HTTP API and skips upgrade-insecure-requests", () => {
    const csp = buildDevContentSecurityPolicy();
    expect(csp).toContain("http://localhost:*");
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(devSecurityHeaders["Content-Security-Policy"]).toBe(csp);
  });
});
