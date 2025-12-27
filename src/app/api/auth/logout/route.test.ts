import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the cookies module
const mockCookieDelete = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(),
    set: vi.fn(),
    delete: mockCookieDelete,
  })),
}));

import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success response", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should delete the admin_auth cookie", async () => {
    await POST();

    expect(mockCookieDelete).toHaveBeenCalledWith("admin_auth");
    expect(mockCookieDelete).toHaveBeenCalledTimes(1);
  });
});
