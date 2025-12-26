import { describe, it, expect } from "vitest";
import {
  transformAlbum,
  transformPhoto,
  transformAlbums,
  transformPhotos,
  transformPhotosWithAlbum,
} from "./transformers";
import type { Album as PrismaAlbum, Photo as PrismaPhoto } from "@prisma/client";

describe("transformers", () => {
  describe("transformAlbum", () => {
    const basePrismaAlbum: PrismaAlbum = {
      id: "album-1",
      slug: "test-album",
      title: "Test Album",
      subtitle: "A subtitle",
      description: "A description",
      location: "Paris, France",
      date: "2024-01-15",
      coverImage: "/photos/cover.jpg",
      photoCount: 42,
      sortOrder: 1,
      featured: true,
      galleryUrl: "https://example.com/gallery",
      galleryId: "gallery-1",
      lastSynced: new Date("2024-01-15T10:00:00Z"),
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
    };

    it("should transform all fields correctly", () => {
      const result = transformAlbum(basePrismaAlbum);

      expect(result).toEqual({
        id: "album-1",
        slug: "test-album",
        title: "Test Album",
        subtitle: "A subtitle",
        description: "A description",
        location: "Paris, France",
        date: "2024-01-15",
        coverImage: "/photos/cover.jpg",
        photoCount: 42,
        sortOrder: 1,
        featured: true,
        galleryUrl: "https://example.com/gallery",
        lastSynced: "2024-01-15T10:00:00.000Z",
      });
    });

    it("should use 'Unknown' for null location", () => {
      const album = { ...basePrismaAlbum, location: null };
      const result = transformAlbum(album);
      expect(result.location).toBe("Unknown");
    });

    it("should use undefined for null optional fields", () => {
      const album = {
        ...basePrismaAlbum,
        subtitle: null,
        description: null,
      };
      const result = transformAlbum(album);
      expect(result.subtitle).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it("should use empty string for null required string fields", () => {
      const album = {
        ...basePrismaAlbum,
        date: null,
        coverImage: null,
        galleryUrl: null,
        lastSynced: null,
      };
      const result = transformAlbum(album);
      expect(result.date).toBe("");
      expect(result.coverImage).toBe("");
      expect(result.galleryUrl).toBe("");
      expect(result.lastSynced).toBe("");
    });
  });

  describe("transformPhoto", () => {
    const basePrismaPhoto: PrismaPhoto = {
      id: "photo-1",
      title: "Test Photo",
      caption: "A beautiful sunset",
      sortOrder: 5,
      thumbPath: "/photos/thumb/1.jpg",
      mediumPath: "/photos/medium/1.jpg",
      fullPath: "/photos/full/1.jpg",
      originalUrl: "https://lightroom.adobe.com/original/1.jpg",
      date: "2024-01-15",
      location: "Paris, France",
      city: "Paris",
      width: 1920,
      height: 1080,
      camera: "Sony A7IV",
      lens: "24-70mm f/2.8",
      aperture: "f/4",
      shutterSpeed: "1/250",
      iso: "100",
      focalLength: "50mm",
      latitude: 48.8566,
      longitude: 2.3522,
      albumId: "album-1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
    };

    it("should transform all fields correctly", () => {
      const result = transformPhoto(basePrismaPhoto);

      expect(result).toEqual({
        id: "photo-1",
        title: "Test Photo",
        caption: "A beautiful sunset",
        src: {
          thumb: "/photos/thumb/1.jpg",
          medium: "/photos/medium/1.jpg",
          full: "/photos/full/1.jpg",
          original: "https://lightroom.adobe.com/original/1.jpg",
        },
        metadata: {
          date: "2024-01-15",
          location: "Paris, France",
          city: "Paris",
          width: 1920,
          height: 1080,
          camera: "Sony A7IV",
          lens: "24-70mm f/2.8",
          aperture: "f/4",
          shutterSpeed: "1/250",
          iso: "100",
          focalLength: "50mm",
          latitude: 48.8566,
          longitude: 2.3522,
        },
        albumId: "album-1",
        albumTitle: undefined,
        albumSlug: undefined,
        sortOrder: 5,
      });
    });

    it("should include album info when provided", () => {
      const result = transformPhoto(basePrismaPhoto, {
        title: "My Album",
        slug: "my-album",
      });

      expect(result.albumTitle).toBe("My Album");
      expect(result.albumSlug).toBe("my-album");
    });

    it("should use empty string for null title", () => {
      const photo = { ...basePrismaPhoto, title: null };
      const result = transformPhoto(photo);
      expect(result.title).toBe("");
    });

    it("should use undefined for null caption", () => {
      const photo = { ...basePrismaPhoto, caption: null };
      const result = transformPhoto(photo);
      expect(result.caption).toBeUndefined();
    });

    it("should use empty strings for null src paths", () => {
      const photo = {
        ...basePrismaPhoto,
        thumbPath: null,
        mediumPath: null,
        fullPath: null,
        originalUrl: null,
      };
      const result = transformPhoto(photo);
      expect(result.src.thumb).toBe("");
      expect(result.src.medium).toBe("");
      expect(result.src.full).toBe("");
      expect(result.src.original).toBe("");
    });

    it("should use 'Unknown' for null location in metadata", () => {
      const photo = { ...basePrismaPhoto, location: null };
      const result = transformPhoto(photo);
      expect(result.metadata.location).toBe("Unknown");
    });

    it("should use 0 for null dimensions", () => {
      const photo = { ...basePrismaPhoto, width: null, height: null };
      const result = transformPhoto(photo);
      expect(result.metadata.width).toBe(0);
      expect(result.metadata.height).toBe(0);
    });

    it("should use undefined for null optional metadata", () => {
      const photo = {
        ...basePrismaPhoto,
        city: null,
        camera: null,
        lens: null,
        aperture: null,
        shutterSpeed: null,
        iso: null,
        focalLength: null,
        latitude: null,
        longitude: null,
      };
      const result = transformPhoto(photo);
      expect(result.metadata.city).toBeUndefined();
      expect(result.metadata.camera).toBeUndefined();
      expect(result.metadata.lens).toBeUndefined();
      expect(result.metadata.aperture).toBeUndefined();
      expect(result.metadata.shutterSpeed).toBeUndefined();
      expect(result.metadata.iso).toBeUndefined();
      expect(result.metadata.focalLength).toBeUndefined();
      expect(result.metadata.latitude).toBeUndefined();
      expect(result.metadata.longitude).toBeUndefined();
    });
  });

  describe("transformAlbums", () => {
    it("should transform multiple albums", () => {
      const albums: PrismaAlbum[] = [
        {
          id: "1",
          slug: "album-1",
          title: "Album 1",
          subtitle: null,
          description: null,
          location: "Paris",
          date: "2024-01",
          coverImage: "/cover1.jpg",
          photoCount: 10,
          sortOrder: 0,
          featured: false,
          galleryUrl: null,
          galleryId: null,
          lastSynced: new Date("2024-01-01"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          slug: "album-2",
          title: "Album 2",
          subtitle: null,
          description: null,
          location: "Tokyo",
          date: "2024-02",
          coverImage: "/cover2.jpg",
          photoCount: 20,
          sortOrder: 1,
          featured: true,
          galleryUrl: null,
          galleryId: null,
          lastSynced: new Date("2024-02-01"),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = transformAlbums(albums);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
    });

    it("should return empty array for empty input", () => {
      const result = transformAlbums([]);
      expect(result).toEqual([]);
    });
  });

  describe("transformPhotos", () => {
    it("should transform multiple photos", () => {
      const photos: PrismaPhoto[] = [
        {
          id: "p1",
          title: "Photo 1",
          caption: null,
          sortOrder: 0,
          thumbPath: "/thumb1.jpg",
          mediumPath: "/medium1.jpg",
          fullPath: "/full1.jpg",
          originalUrl: null,
          date: "2024-01-01",
          location: "Paris",
          city: "Paris",
          width: 1920,
          height: 1080,
          camera: null,
          lens: null,
          aperture: null,
          shutterSpeed: null,
          iso: null,
          focalLength: null,
          latitude: null,
          longitude: null,
          albumId: "album-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "p2",
          title: "Photo 2",
          caption: null,
          sortOrder: 1,
          thumbPath: "/thumb2.jpg",
          mediumPath: "/medium2.jpg",
          fullPath: "/full2.jpg",
          originalUrl: null,
          date: "2024-01-02",
          location: "Tokyo",
          city: "Tokyo",
          width: 1920,
          height: 1080,
          camera: null,
          lens: null,
          aperture: null,
          shutterSpeed: null,
          iso: null,
          focalLength: null,
          latitude: null,
          longitude: null,
          albumId: "album-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = transformPhotos(photos);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("p1");
      expect(result[1].id).toBe("p2");
    });
  });

  describe("transformPhotosWithAlbum", () => {
    it("should include album info when present", () => {
      const photos = [
        {
          id: "p1",
          title: "Photo 1",
          caption: null,
          sortOrder: 0,
          thumbPath: "/thumb1.jpg",
          mediumPath: null,
          fullPath: null,
          originalUrl: null,
          date: null,
          location: null,
          city: null,
          width: null,
          height: null,
          camera: null,
          lens: null,
          aperture: null,
          shutterSpeed: null,
          iso: null,
          focalLength: null,
          latitude: null,
          longitude: null,
          albumId: "album-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          album: { title: "My Album", slug: "my-album" },
        },
      ];

      const result = transformPhotosWithAlbum(photos);

      expect(result[0].albumTitle).toBe("My Album");
      expect(result[0].albumSlug).toBe("my-album");
    });

    it("should handle null album relation", () => {
      const photos = [
        {
          id: "p1",
          title: "Photo 1",
          caption: null,
          sortOrder: 0,
          thumbPath: "/thumb1.jpg",
          mediumPath: null,
          fullPath: null,
          originalUrl: null,
          date: null,
          location: null,
          city: null,
          width: null,
          height: null,
          camera: null,
          lens: null,
          aperture: null,
          shutterSpeed: null,
          iso: null,
          focalLength: null,
          latitude: null,
          longitude: null,
          albumId: "album-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          album: null,
        },
      ];

      const result = transformPhotosWithAlbum(photos);

      expect(result[0].albumTitle).toBeUndefined();
      expect(result[0].albumSlug).toBeUndefined();
    });
  });
});
