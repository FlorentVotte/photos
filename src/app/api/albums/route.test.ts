import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Hoisted mocks - these are hoisted before imports
const { mockRequireAuth, mockPrisma } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockPrisma: {
    album: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock authentication
vi.mock("@/lib/auth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

// Mock Prisma
vi.mock("@/lib/db", () => ({
  default: mockPrisma,
}));

import { GET, PUT, PATCH } from "./route";
import { VALIDATION } from "@/lib/constants";

describe("/api/albums", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(null); // Authenticated by default
  });

  describe("GET", () => {
    it("should return albums list", async () => {
      const mockAlbums = [
        {
          id: "album-1",
          slug: "test-album",
          title: "Test Album",
          subtitle: null,
          description: null,
          location: "Paris",
          date: "Jan 2024",
          coverImage: "/photos/cover.jpg",
          photoCount: 10,
          sortOrder: 0,
          featured: false,
          lastSynced: new Date(),
        },
      ];
      mockPrisma.album.findMany.mockResolvedValue(mockAlbums);

      const response = await GET();

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.albums).toHaveLength(1);
      expect(body.albums[0].title).toBe("Test Album");
    });

    it("should return empty array when no albums", async () => {
      mockPrisma.album.findMany.mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.albums).toEqual([]);
    });

    it("should order by sortOrder and lastSynced", async () => {
      mockPrisma.album.findMany.mockResolvedValue([]);

      await GET();

      expect(mockPrisma.album.findMany).toHaveBeenCalledWith({
        orderBy: [{ sortOrder: "asc" }, { lastSynced: "desc" }],
        select: expect.objectContaining({
          id: true,
          slug: true,
          title: true,
          coverImage: true,
        }),
      });
    });

    it("should return 500 on database error", async () => {
      mockPrisma.album.findMany.mockRejectedValue(new Error("DB error"));

      const response = await GET();

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Failed to fetch albums");
    });
  });

  describe("PUT (reorder)", () => {
    function createPutRequest(body: unknown) {
      return new NextRequest("http://localhost:3000/api/albums", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    it("should require authentication", async () => {
      mockRequireAuth.mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
      );

      const request = createPutRequest({ albumOrder: ["a", "b"] });
      const response = await PUT(request);

      expect(response.status).toBe(401);
    });

    it("should reorder albums successfully", async () => {
      mockPrisma.album.update.mockResolvedValue({});

      const request = createPutRequest({ albumOrder: ["album-1", "album-2", "album-3"] });
      const response = await PUT(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it("should update sortOrder for each album", async () => {
      mockPrisma.album.update.mockResolvedValue({});

      const request = createPutRequest({ albumOrder: ["album-a", "album-b"] });
      await PUT(request);

      expect(mockPrisma.album.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.album.update).toHaveBeenCalledWith({
        where: { id: "album-a" },
        data: { sortOrder: 0 },
      });
      expect(mockPrisma.album.update).toHaveBeenCalledWith({
        where: { id: "album-b" },
        data: { sortOrder: 1 },
      });
    });

    it("should return 400 when albumOrder is missing", async () => {
      const request = createPutRequest({});
      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("albumOrder array is required");
    });

    it("should return 400 when albumOrder is not an array", async () => {
      const request = createPutRequest({ albumOrder: "not-an-array" });
      const response = await PUT(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("albumOrder array is required");
    });

    it("should return 500 on database error", async () => {
      mockPrisma.album.update.mockRejectedValue(new Error("DB error"));

      const request = createPutRequest({ albumOrder: ["album-1"] });
      const response = await PUT(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Failed to reorder albums");
    });
  });

  describe("PATCH (update metadata)", () => {
    function createPatchRequest(body: unknown) {
      return new NextRequest("http://localhost:3000/api/albums", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    it("should require authentication", async () => {
      mockRequireAuth.mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
      );

      const request = createPatchRequest({ id: "album-1", title: "New Title" });
      const response = await PATCH(request);

      expect(response.status).toBe(401);
    });

    it("should update album title", async () => {
      const updatedAlbum = { id: "album-1", title: "New Title" };
      mockPrisma.album.update.mockResolvedValue(updatedAlbum);

      const request = createPatchRequest({ id: "album-1", title: "New Title" });
      const response = await PATCH(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.album.title).toBe("New Title");
    });

    it("should update multiple fields", async () => {
      mockPrisma.album.update.mockResolvedValue({});

      const request = createPatchRequest({
        id: "album-1",
        title: "New Title",
        subtitle: "New Subtitle",
        location: "New Location",
      });
      await PATCH(request);

      expect(mockPrisma.album.update).toHaveBeenCalledWith({
        where: { id: "album-1" },
        data: {
          title: "New Title",
          subtitle: "New Subtitle",
          location: "New Location",
        },
      });
    });

    it("should update coverImage", async () => {
      mockPrisma.album.update.mockResolvedValue({});

      const request = createPatchRequest({
        id: "album-1",
        coverImage: "/photos/new-cover.jpg",
      });
      await PATCH(request);

      expect(mockPrisma.album.update).toHaveBeenCalledWith({
        where: { id: "album-1" },
        data: { coverImage: "/photos/new-cover.jpg" },
      });
    });

    it("should set empty string fields to null", async () => {
      mockPrisma.album.update.mockResolvedValue({});

      const request = createPatchRequest({
        id: "album-1",
        subtitle: "",
        description: "",
      });
      await PATCH(request);

      expect(mockPrisma.album.update).toHaveBeenCalledWith({
        where: { id: "album-1" },
        data: { subtitle: null, description: null },
      });
    });

    it("should return 400 when id is missing", async () => {
      const request = createPatchRequest({ title: "New Title" });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Album ID is required");
    });

    it("should return 400 when id is too long", async () => {
      const request = createPatchRequest({
        id: "a".repeat(VALIDATION.MAX_ID_LENGTH + 1),
        title: "New Title",
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Invalid album ID");
    });

    it("should return 400 when title is too long", async () => {
      const request = createPatchRequest({
        id: "album-1",
        title: "a".repeat(VALIDATION.MAX_TITLE_LENGTH + 1),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("Title must be less than");
    });

    it("should return 400 when coverImage path is too long", async () => {
      const request = createPatchRequest({
        id: "album-1",
        coverImage: "a".repeat(VALIDATION.MAX_PATH_LENGTH + 1),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Invalid cover image path");
    });

    it("should return 400 when no fields to update", async () => {
      const request = createPatchRequest({ id: "album-1" });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("No fields to update");
    });

    it("should return 500 on database error", async () => {
      mockPrisma.album.update.mockRejectedValue(new Error("DB error"));

      const request = createPatchRequest({ id: "album-1", title: "New Title" });
      const response = await PATCH(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Failed to update album");
    });
  });
});
