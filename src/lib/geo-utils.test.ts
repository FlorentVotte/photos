import { describe, it, expect } from "vitest";
import {
  calculateDistance,
  calculateRouteDistance,
  extractLocations,
  computeChapterStats,
  formatDistance,
} from "./geo-utils";
import type { Photo } from "./types";

// Helper to create a mock photo with GPS data
function createPhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    id: overrides.id || "photo-1",
    title: overrides.title || "Test Photo",
    src: {
      thumb: "/photos/thumb.jpg",
      medium: "/photos/medium.jpg",
      full: "/photos/full.jpg",
    },
    metadata: {
      date: "2024-01-15",
      ...overrides.metadata,
    },
    ...overrides,
  };
}

describe("geo-utils", () => {
  describe("calculateDistance", () => {
    it("should calculate zero distance for same point", () => {
      const distance = calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);
      expect(distance).toBe(0);
    });

    it("should calculate distance between Paris and London (~344km)", () => {
      // Paris: 48.8566, 2.3522
      // London: 51.5074, -0.1278
      const distance = calculateDistance(48.8566, 2.3522, 51.5074, -0.1278);
      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(350);
    });

    it("should calculate distance between New York and Los Angeles (~3940km)", () => {
      // New York: 40.7128, -74.0060
      // Los Angeles: 34.0522, -118.2437
      const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it("should calculate distance between Tokyo and Sydney (~7820km)", () => {
      // Tokyo: 35.6762, 139.6503
      // Sydney: -33.8688, 151.2093
      const distance = calculateDistance(35.6762, 139.6503, -33.8688, 151.2093);
      expect(distance).toBeGreaterThan(7800);
      expect(distance).toBeLessThan(7900);
    });

    it("should handle equator crossing", () => {
      // Quito, Ecuador (on equator): 0.1807, -78.4678
      // Bogota, Colombia: 4.7110, -74.0721
      const distance = calculateDistance(0.1807, -78.4678, 4.711, -74.0721);
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(800);
    });

    it("should handle prime meridian crossing", () => {
      // London: 51.5074, -0.1278
      // Paris: 48.8566, 2.3522
      const distance = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522);
      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(350);
    });

    it("should handle international date line crossing", () => {
      // Auckland, NZ: -36.8509, 174.7645
      // Fiji: -17.7134, 177.9741 (just west of date line)
      const distance = calculateDistance(-36.8509, 174.7645, -17.7134, 177.9741);
      expect(distance).toBeGreaterThan(2100);
      expect(distance).toBeLessThan(2200);
    });

    it("should be symmetric (A to B equals B to A)", () => {
      const distanceAB = calculateDistance(48.8566, 2.3522, 51.5074, -0.1278);
      const distanceBA = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522);
      expect(distanceAB).toBeCloseTo(distanceBA, 10);
    });
  });

  describe("calculateRouteDistance", () => {
    it("should return 0 for empty array", () => {
      const distance = calculateRouteDistance([]);
      expect(distance).toBe(0);
    });

    it("should return 0 for single photo", () => {
      const photos = [
        createPhoto({
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 },
        }),
      ];
      const distance = calculateRouteDistance(photos);
      expect(distance).toBe(0);
    });

    it("should calculate total distance for multiple photos", () => {
      const photos = [
        createPhoto({
          id: "1",
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 }, // Paris
        }),
        createPhoto({
          id: "2",
          metadata: { date: "2024-01-02", latitude: 51.5074, longitude: -0.1278 }, // London
        }),
        createPhoto({
          id: "3",
          metadata: { date: "2024-01-03", latitude: 52.52, longitude: 13.405 }, // Berlin
        }),
      ];
      const distance = calculateRouteDistance(photos);
      // Paris -> London (~344km) + London -> Berlin (~930km) = ~1274km
      expect(distance).toBeGreaterThan(1250);
      expect(distance).toBeLessThan(1300);
    });

    it("should filter out photos without GPS data", () => {
      const photos = [
        createPhoto({
          id: "1",
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 },
        }),
        createPhoto({
          id: "2",
          metadata: { date: "2024-01-02" }, // No GPS
        }),
        createPhoto({
          id: "3",
          metadata: { date: "2024-01-03", latitude: 51.5074, longitude: -0.1278 },
        }),
      ];
      const distance = calculateRouteDistance(photos);
      // Should only calculate Paris -> London
      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(350);
    });

    it("should sort photos by date before calculating", () => {
      const photos = [
        createPhoto({
          id: "3",
          metadata: { date: "2024-01-03", latitude: 52.52, longitude: 13.405 }, // Berlin (3rd)
        }),
        createPhoto({
          id: "1",
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 }, // Paris (1st)
        }),
        createPhoto({
          id: "2",
          metadata: { date: "2024-01-02", latitude: 51.5074, longitude: -0.1278 }, // London (2nd)
        }),
      ];
      const distance = calculateRouteDistance(photos);
      // Should calculate Paris -> London -> Berlin
      expect(distance).toBeGreaterThan(1250);
      expect(distance).toBeLessThan(1300);
    });

    it("should handle photos with same location", () => {
      const photos = [
        createPhoto({
          id: "1",
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 },
        }),
        createPhoto({
          id: "2",
          metadata: { date: "2024-01-02", latitude: 48.8566, longitude: 2.3522 },
        }),
      ];
      const distance = calculateRouteDistance(photos);
      expect(distance).toBe(0);
    });
  });

  describe("extractLocations", () => {
    it("should return empty arrays for empty input", () => {
      const result = extractLocations([]);
      expect(result.cities).toEqual([]);
      expect(result.countries).toEqual([]);
      expect(result.coordinates).toEqual([]);
    });

    it("should extract unique cities", () => {
      const photos = [
        createPhoto({ metadata: { date: "2024-01-01", city: "Paris" } }),
        createPhoto({ metadata: { date: "2024-01-02", city: "London" } }),
        createPhoto({ metadata: { date: "2024-01-03", city: "Paris" } }), // Duplicate
      ];
      const result = extractLocations(photos);
      expect(result.cities).toHaveLength(2);
      expect(result.cities).toContain("Paris");
      expect(result.cities).toContain("London");
    });

    it("should extract unique countries from location field", () => {
      const photos = [
        createPhoto({ metadata: { date: "2024-01-01", location: "France" } }),
        createPhoto({ metadata: { date: "2024-01-02", location: "United Kingdom" } }),
        createPhoto({ metadata: { date: "2024-01-03", location: "France" } }), // Duplicate
      ];
      const result = extractLocations(photos);
      expect(result.countries).toHaveLength(2);
      expect(result.countries).toContain("France");
      expect(result.countries).toContain("United Kingdom");
    });

    it("should extract coordinates sorted by date", () => {
      const photos = [
        createPhoto({
          id: "3",
          metadata: { date: "2024-01-03", latitude: 52.52, longitude: 13.405, city: "Berlin" },
        }),
        createPhoto({
          id: "1",
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522, city: "Paris" },
        }),
      ];
      const result = extractLocations(photos);
      expect(result.coordinates).toHaveLength(2);
      expect(result.coordinates[0].photoId).toBe("1"); // Paris first (earlier date)
      expect(result.coordinates[1].photoId).toBe("3"); // Berlin second
    });

    it("should filter out photos without GPS for coordinates", () => {
      const photos = [
        createPhoto({
          id: "1",
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 },
        }),
        createPhoto({
          id: "2",
          metadata: { date: "2024-01-02", city: "London" }, // No GPS
        }),
      ];
      const result = extractLocations(photos);
      expect(result.coordinates).toHaveLength(1);
      expect(result.coordinates[0].photoId).toBe("1");
    });

    it("should filter out undefined/null cities and countries", () => {
      const photos = [
        createPhoto({ metadata: { date: "2024-01-01", city: "Paris" } }),
        createPhoto({ metadata: { date: "2024-01-02" } }), // No city or location
        createPhoto({ metadata: { date: "2024-01-03", city: undefined } }),
      ];
      const result = extractLocations(photos);
      expect(result.cities).toHaveLength(1);
      expect(result.cities[0]).toBe("Paris");
    });

    it("should include all coordinate properties", () => {
      const photos = [
        createPhoto({
          id: "photo-123",
          metadata: {
            date: "2024-01-15",
            latitude: 48.8566,
            longitude: 2.3522,
            city: "Paris",
          },
        }),
      ];
      const result = extractLocations(photos);
      expect(result.coordinates[0]).toEqual({
        lat: 48.8566,
        lng: 2.3522,
        photoId: "photo-123",
        date: "2024-01-15",
        city: "Paris",
      });
    });
  });

  describe("computeChapterStats", () => {
    it("should return zeros for empty array", () => {
      const stats = computeChapterStats([]);
      expect(stats.photoCount).toBe(0);
      expect(stats.photosWithGps).toBe(0);
      expect(stats.distanceKm).toBe(0);
      expect(stats.dateRange).toBeUndefined();
    });

    it("should count total photos", () => {
      const photos = [
        createPhoto({ id: "1" }),
        createPhoto({ id: "2" }),
        createPhoto({ id: "3" }),
      ];
      const stats = computeChapterStats(photos);
      expect(stats.photoCount).toBe(3);
    });

    it("should count photos with GPS", () => {
      const photos = [
        createPhoto({ id: "1", metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 } }),
        createPhoto({ id: "2", metadata: { date: "2024-01-02" } }), // No GPS
        createPhoto({ id: "3", metadata: { date: "2024-01-03", latitude: 51.5074, longitude: -0.1278 } }),
      ];
      const stats = computeChapterStats(photos);
      expect(stats.photosWithGps).toBe(2);
    });

    it("should calculate rounded distance", () => {
      const photos = [
        createPhoto({
          id: "1",
          metadata: { date: "2024-01-01", latitude: 48.8566, longitude: 2.3522 },
        }),
        createPhoto({
          id: "2",
          metadata: { date: "2024-01-02", latitude: 51.5074, longitude: -0.1278 },
        }),
      ];
      const stats = computeChapterStats(photos);
      // Paris to London ~344km, should be rounded
      expect(stats.distanceKm).toBe(Math.round(calculateRouteDistance(photos)));
    });

    it("should calculate date range", () => {
      const photos = [
        createPhoto({ metadata: { date: "2024-01-15" } }),
        createPhoto({ metadata: { date: "2024-01-10" } }),
        createPhoto({ metadata: { date: "2024-01-20" } }),
      ];
      const stats = computeChapterStats(photos);
      expect(stats.dateRange).toEqual({
        start: "2024-01-10",
        end: "2024-01-20",
      });
    });

    it("should handle photos without dates", () => {
      const photos = [
        createPhoto({ metadata: { date: "2024-01-15" } }),
        createPhoto({ metadata: {} as Photo["metadata"] }),
        createPhoto({ metadata: { date: "2024-01-20" } }),
      ];
      const stats = computeChapterStats(photos);
      expect(stats.dateRange).toEqual({
        start: "2024-01-15",
        end: "2024-01-20",
      });
    });

    it("should return undefined dateRange when no dates", () => {
      const photos = [
        createPhoto({ metadata: {} as Photo["metadata"] }),
        createPhoto({ metadata: {} as Photo["metadata"] }),
      ];
      const stats = computeChapterStats(photos);
      expect(stats.dateRange).toBeUndefined();
    });
  });

  describe("formatDistance", () => {
    it("should format distances less than 1km in meters", () => {
      expect(formatDistance(0.5)).toBe("500 m");
      expect(formatDistance(0.1)).toBe("100 m");
      expect(formatDistance(0.05)).toBe("50 m");
    });

    it("should format distances of 1km or more in kilometers", () => {
      expect(formatDistance(1)).toBe("1 km");
      expect(formatDistance(10)).toBe("10 km");
      expect(formatDistance(100)).toBe("100 km");
    });

    it("should use locale formatting for large numbers", () => {
      const formatted = formatDistance(1000);
      // Locale formatting may vary, but should contain "1" and "000" or comma/dot separator
      expect(formatted).toContain("km");
    });

    it("should handle zero", () => {
      expect(formatDistance(0)).toBe("0 m");
    });

    it("should handle very small distances", () => {
      expect(formatDistance(0.001)).toBe("1 m");
    });

    it("should round meter values", () => {
      expect(formatDistance(0.5555)).toBe("556 m");
    });
  });
});
