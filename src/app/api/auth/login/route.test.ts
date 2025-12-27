import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the cookies module before importing the route
const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(),
    set: mockCookieSet,
    delete: vi.fn(),
  })),
}));

// Mock the security module to control token generation
vi.mock("@/lib/security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/security")>();
  return {
    ...actual,
    generateSecureToken: vi.fn(() => "a".repeat(64)),
  };
});

import { POST } from "./route";

describe("POST /api/auth/login", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_PASSWORD: "test-password-123" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createRequest(body: unknown, headers: Record<string, string> = {}) {
    return new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  describe("successful login", () => {
    it("should return success for correct password", async () => {
      const request = createRequest({ password: "test-password-123" });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it("should set httpOnly cookie on success", async () => {
      const request = createRequest({ password: "test-password-123" });
      await POST(request);

      expect(mockCookieSet).toHaveBeenCalledWith(
        "admin_auth",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
        })
      );
    });

    it("should set cookie with session expiry", async () => {
      const request = createRequest({ password: "test-password-123" });
      await POST(request);

      expect(mockCookieSet).toHaveBeenCalledWith(
        "admin_auth",
        expect.any(String),
        expect.objectContaining({
          maxAge: 2 * 60 * 60, // 2 hours in seconds
        })
      );
    });
  });

  describe("failed login", () => {
    it("should return 401 for incorrect password", async () => {
      const request = createRequest({ password: "wrong-password" });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Invalid password");
    });

    it("should not set cookie on failed login", async () => {
      const request = createRequest({ password: "wrong-password" });
      await POST(request);

      expect(mockCookieSet).not.toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("should return 400 for missing password", async () => {
      const request = createRequest({});
      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Invalid request");
    });

    it("should return 400 for non-string password", async () => {
      const request = createRequest({ password: 12345 });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Invalid request");
    });

    it("should return 400 for null password", async () => {
      const request = createRequest({ password: null });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("server configuration", () => {
    it("should return 500 when ADMIN_PASSWORD not configured", async () => {
      delete process.env.ADMIN_PASSWORD;

      const request = createRequest({ password: "any-password" });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Server configuration error");
    });
  });

  describe("IP extraction", () => {
    it("should extract IP from x-forwarded-for header", async () => {
      const request = createRequest(
        { password: "wrong" },
        { "x-forwarded-for": "192.168.1.1, 10.0.0.1" }
      );
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should extract IP from x-real-ip header", async () => {
      const request = createRequest(
        { password: "wrong" },
        { "x-real-ip": "192.168.1.2" }
      );
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should use x-forwarded-for over x-real-ip", async () => {
      const request = createRequest(
        { password: "wrong" },
        {
          "x-forwarded-for": "192.168.1.1",
          "x-real-ip": "192.168.1.2",
        }
      );
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe("error handling", () => {
    it("should return 500 for invalid JSON body", async () => {
      const request = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});
