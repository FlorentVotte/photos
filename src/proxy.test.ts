import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, config, proxy } from "./proxy";

describe("buildContentSecurityPolicy", () => {
  it("uses a nonce-based strict policy for scripts and styles", () => {
    const policy = buildContentSecurityPolicy("test-nonce", false);

    expect(policy).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(policy).toContain("style-src-elem 'self' 'nonce-test-nonce'");
    expect(policy).toContain("style-src-attr 'unsafe-inline'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("img-src 'self' blob: data: https://tiles.openfreemap.org");
    expect(policy).toContain(
      "connect-src 'self' https://tiles.openfreemap.org wss://tiles.openfreemap.org"
    );
  });

  it("allows eval only during development", () => {
    expect(buildContentSecurityPolicy("test-nonce", false)).not.toContain(
      "'unsafe-eval'"
    );
    expect(buildContentSecurityPolicy("test-nonce", true)).toContain(
      "'unsafe-eval'"
    );
  });
});

describe("proxy", () => {
  it("redirects an unauthenticated admin request to its internal login path", async () => {
    const response = await proxy(
      new NextRequest("https://photos.example.test/admin", {
        headers: { cookie: "admin_auth=invalid" },
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://photos.example.test/login?redirect=%2Fadmin"
    );
  });

  it("passes the nonce upstream and enforces the policy for document requests", async () => {
    const response = await proxy(
      new NextRequest("https://photos.example.test/")
    );
    const nonce = response.headers.get("x-middleware-request-x-nonce");
    const policy = response.headers.get("content-security-policy");

    expect(nonce).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(policy).toContain(`'nonce-${nonce}'`);
  });

  it("runs only for document routes", () => {
    for (const url of [
      "/api/photos",
      "/_next/static/chunk.js",
      "/_next/image?url=%2Fphoto.jpg",
      "/favicon.ico",
      "/manifest.webmanifest",
      "/icons/icon-192.png",
      "/photos/album/photo.jpg",
      "/globe/earth-blue-marble.jpg",
    ]) {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
    }

    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: "/admin" })
    ).toBe(true);
  });
});
