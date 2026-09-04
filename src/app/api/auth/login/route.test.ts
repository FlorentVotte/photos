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

import { POST, __resetLoginRateLimitersForTests } from "./route";

describe("POST /api/auth/login", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    __resetLoginRateLimitersForTests();
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

  function createDelayedBodyRequest(
    body: unknown,
    headers: Record<string, string> = {}
  ) {
    const request = createRequest(body, headers);
    vi.spyOn(request, "json").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(body), 0);
        })
    );
    return request;
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
          // "lax", not "strict": the Adobe OAuth callback is reached by a
          // cross-site top-level redirect from adobelogin.com, and browsers
          // never send SameSite=Strict cookies on those. Strict made
          // requireAuth() in the callback fail every time.
          sameSite: "lax",
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

    it("should return 429 on the sixth failed attempt from one client", async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const response = await POST(
          createRequest({ password: "wrong-password" }, { "x-real-ip": "192.0.2.1" })
        );
        expect(response.status).toBe(401);
      }

      const response = await POST(
        createRequest({ password: "wrong-password" }, { "x-real-ip": "192.0.2.1" })
      );
      expect(response.status).toBe(429);
    });

    it("should return 429 on the 51st failed attempt globally", async () => {
      for (let attempt = 0; attempt < 50; attempt++) {
        const response = await POST(
          createRequest(
            { password: "wrong-password" },
            { "x-real-ip": `192.0.2.${attempt + 1}` }
          )
        );
        expect(response.status).toBe(401);
      }

      const response = await POST(
        createRequest({ password: "wrong-password" }, { "x-real-ip": "198.51.100.1" })
      );
      expect(response.status).toBe(429);
    });

    it("should not clear global failures after a successful login", async () => {
      for (let attempt = 0; attempt < 49; attempt++) {
        const response = await POST(
          createRequest(
            { password: "wrong-password" },
            { "x-real-ip": `203.0.113.${attempt + 1}` }
          )
        );
        expect(response.status).toBe(401);
      }

      const success = await POST(
        createRequest({ password: "test-password-123" }, { "x-real-ip": "198.51.100.1" })
      );
      expect(success.status).toBe(200);

      const fiftiethFailure = await POST(
        createRequest({ password: "wrong-password" }, { "x-real-ip": "198.51.100.2" })
      );
      expect(fiftiethFailure.status).toBe(401);

      const response = await POST(
        createRequest({ password: "wrong-password" }, { "x-real-ip": "198.51.100.3" })
      );
      expect(response.status).toBe(429);
    });

    it("should enforce the per-client limit for concurrent body reads", async () => {
      const responses = await Promise.all(
        Array.from({ length: 10 }, () =>
          POST(
            createDelayedBodyRequest(
              { password: "wrong-password" },
              { "x-real-ip": "192.0.2.44" }
            )
          )
        )
      );

      expect(responses.filter((response) => response.status === 401)).toHaveLength(5);
      expect(responses.filter((response) => response.status === 429)).toHaveLength(5);
    });

    it("should enforce the global limit for concurrent body reads", async () => {
      const responses = await Promise.all(
        Array.from({ length: 60 }, (_, attempt) =>
          POST(
            createDelayedBodyRequest(
              { password: "wrong-password" },
              { "x-real-ip": `198.51.100.${attempt + 1}` }
            )
          )
        )
      );

      expect(responses.filter((response) => response.status === 401)).toHaveLength(50);
      expect(responses.filter((response) => response.status === 429)).toHaveLength(10);
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
    it("should normalize the first non-empty forwarded address", async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        await POST(
          createRequest(
            { password: "wrong" },
            { "x-forwarded-for": "  , 192.0.2.10, 10.0.0.1" }
          )
        );
      }

      const response = await POST(
        createRequest(
          { password: "wrong" },
          { "x-forwarded-for": "192.0.2.10" }
        )
      );
      expect(response.status).toBe(429);
    });

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
    it("returns a 400 public error for malformed JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: "Invalid JSON body" });
    });

    it("returns 413 for an oversized login body", async () => {
      const request = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Length": "4097" },
        body: "{}",
      });

      const response = await POST(request);

      expect(response.status).toBe(413);
      await expect(response.json()).resolves.toEqual({ error: "Request body too large" });
    });
  });
});
