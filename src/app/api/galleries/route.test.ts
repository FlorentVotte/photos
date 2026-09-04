import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAuth, mockPrisma } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockPrisma: {
    gallery: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("@/lib/db", () => ({
  default: mockPrisma,
}));

import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("GET /api/galleries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("rejects an unauthenticated request before reading the inventory", async () => {
    mockRequireAuth.mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockPrisma.gallery.findMany).not.toHaveBeenCalled();
  });

  it("returns the existing gallery inventory shape for an authenticated request", async () => {
    mockPrisma.gallery.findMany.mockResolvedValue([
      {
        id: "gallery-1",
        url: "https://lightroom.adobe.com/shares/example",
        albumId: "album-1",
        albumName: "Fallback album title",
        type: "public",
        featured: true,
        album: {
          id: "album-1",
          title: "Paris",
          photoCount: 12,
          lastSynced: new Date("2026-09-04T12:00:00.000Z"),
        },
      },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      galleries: [
        {
          id: "gallery-1",
          url: "https://lightroom.adobe.com/shares/example",
          albumId: "album-1",
          albumName: "Fallback album title",
          type: "public",
          featured: true,
          title: "Paris",
          photoCount: 12,
          lastSynced: "2026-09-04T12:00:00.000Z",
        },
      ],
    });
  });
});

describe("POST /api/galleries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(null);
  });

  it("returns 413 rather than invoking gallery mutations for an oversized body", async () => {
    const request = new NextRequest("http://localhost:3000/api/galleries", {
      method: "POST",
      headers: { "Content-Length": "65537" },
      body: "{}",
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "Request body too large" });
  });
});
