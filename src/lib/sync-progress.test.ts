import { describe, it, expect } from "vitest";
import {
  createInitialProgress,
  formatProgressMessage,
  calculateOverallProgress,
  type SyncProgress,
} from "./sync-progress";

describe("sync-progress", () => {
  describe("createInitialProgress", () => {
    it("should return initial progress state", () => {
      const progress = createInitialProgress();

      expect(progress.status).toBe("idle");
      expect(progress.phase).toBe("initializing");
      expect(progress.totalGalleries).toBe(0);
      expect(progress.currentGalleryIndex).toBe(0);
      expect(progress.currentGalleryName).toBe("");
      expect(progress.totalPhotos).toBe(0);
      expect(progress.currentPhotoIndex).toBe(0);
      expect(progress.currentPhotoName).toBe("");
      expect(progress.message).toBe("");
      expect(progress.startedAt).toBeNull();
      expect(progress.completedAt).toBeNull();
    });

    it("should not include error property by default", () => {
      const progress = createInitialProgress();
      expect(progress.error).toBeUndefined();
    });

    it("should return a new object each time", () => {
      const progress1 = createInitialProgress();
      const progress2 = createInitialProgress();
      expect(progress1).not.toBe(progress2);
    });
  });

  describe("formatProgressMessage", () => {
    it('should return "Ready to sync" for idle status', () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "idle",
      };
      expect(formatProgressMessage(progress)).toBe("Ready to sync");
    });

    it('should return "Sync completed successfully" for completed status', () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "completed",
      };
      expect(formatProgressMessage(progress)).toBe("Sync completed successfully");
    });

    it("should return error message for error status", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "error",
        error: "Connection failed",
      };
      expect(formatProgressMessage(progress)).toBe("Connection failed");
    });

    it('should return "Sync failed" when error status has no error message', () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "error",
      };
      expect(formatProgressMessage(progress)).toBe("Sync failed");
    });

    it("should show gallery progress when syncing", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 3,
        currentGalleryIndex: 1,
        totalPhotos: 0,
      };
      expect(formatProgressMessage(progress)).toBe("Album 2/3");
    });

    it("should show photo progress when syncing", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 0,
        totalPhotos: 50,
        currentPhotoIndex: 24,
      };
      expect(formatProgressMessage(progress)).toBe("Photo 25/50");
    });

    it("should show both gallery and photo progress", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 3,
        currentGalleryIndex: 1,
        totalPhotos: 50,
        currentPhotoIndex: 24,
      };
      expect(formatProgressMessage(progress)).toBe("Album 2/3 - Photo 25/50");
    });

    it("should return message when no gallery or photo progress", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        message: "Initializing connection...",
      };
      expect(formatProgressMessage(progress)).toBe("Initializing connection...");
    });

    it("should use 1-based indexing for display", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 2,
        currentGalleryIndex: 0, // 0-indexed internally
        totalPhotos: 10,
        currentPhotoIndex: 0, // 0-indexed internally
      };
      expect(formatProgressMessage(progress)).toBe("Album 1/2 - Photo 1/10");
    });
  });

  describe("calculateOverallProgress", () => {
    it("should return 0 for idle status", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "idle",
      };
      expect(calculateOverallProgress(progress)).toBe(0);
    });

    it("should return 100 for completed status", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "completed",
      };
      expect(calculateOverallProgress(progress)).toBe(100);
    });

    it("should return 0 for error status", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "error",
        error: "Something went wrong",
      };
      expect(calculateOverallProgress(progress)).toBe(0);
    });

    it("should return 0 when no galleries", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 0,
      };
      expect(calculateOverallProgress(progress)).toBe(0);
    });

    it("should calculate progress based on completed galleries", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 4,
        currentGalleryIndex: 2, // 2 galleries completed
        totalPhotos: 0,
      };
      // 2/4 = 50%
      expect(calculateOverallProgress(progress)).toBe(50);
    });

    it("should include current gallery photo progress", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 2,
        currentGalleryIndex: 0, // On first gallery
        totalPhotos: 10,
        currentPhotoIndex: 5, // 50% through first gallery
      };
      // Gallery weight = 50% each
      // First gallery 50% done = 25% total
      expect(calculateOverallProgress(progress)).toBe(25);
    });

    it("should combine completed galleries and current progress", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 4,
        currentGalleryIndex: 2, // 2 galleries completed (50%)
        totalPhotos: 10,
        currentPhotoIndex: 5, // 50% through current gallery
      };
      // 2 completed = 50%
      // Current gallery at 50% = 12.5%
      // Total = 62.5%
      expect(calculateOverallProgress(progress)).toBeCloseTo(62.5, 1);
    });

    it("should never exceed 99 during syncing", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 1,
        currentGalleryIndex: 0,
        totalPhotos: 100,
        currentPhotoIndex: 99, // Almost done
      };
      expect(calculateOverallProgress(progress)).toBeLessThanOrEqual(99);
    });

    it("should cap at 99 even with completed calculation", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 1,
        currentGalleryIndex: 0,
        totalPhotos: 1,
        currentPhotoIndex: 1, // Would be 100% without cap
      };
      expect(calculateOverallProgress(progress)).toBe(99);
    });

    it("should handle single gallery with no photos", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 1,
        currentGalleryIndex: 0,
        totalPhotos: 0,
      };
      expect(calculateOverallProgress(progress)).toBe(0);
    });

    it("should calculate correct progress for many galleries", () => {
      const progress: SyncProgress = {
        ...createInitialProgress(),
        status: "syncing",
        totalGalleries: 10,
        currentGalleryIndex: 5, // 5 completed
        totalPhotos: 20,
        currentPhotoIndex: 10, // 50% of current
      };
      // 5/10 = 50%
      // Current 50% of 10% = 5%
      // Total = 55%
      expect(calculateOverallProgress(progress)).toBe(55);
    });
  });
});
