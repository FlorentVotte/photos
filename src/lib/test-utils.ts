/**
 * Test utilities for API route and integration testing
 */

import { vi, expect } from "vitest";
import type { Photo, Album, Chapter } from "./types";

// Known GPS coordinates for testing
export const TEST_COORDINATES = {
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  berlin: { lat: 52.52, lng: 13.405 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  newYork: { lat: 40.7128, lng: -74.006 },
} as const;

// Valid session token for testing (64-char hex)
export const VALID_SESSION_TOKEN = "a".repeat(64);
export const INVALID_SESSION_TOKEN = "invalid-token";

/**
 * Create a mock Photo object for testing
 */
export function createMockPhoto(overrides: Partial<Photo> = {}): Photo {
  const id = overrides.id || `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const albumId = overrides.albumId || "album-1";

  return {
    id,
    albumId,
    title: overrides.title || "Test Photo",
    description: overrides.description,
    caption: overrides.caption,
    src: {
      thumb: `/photos/${id}/thumb.jpg`,
      medium: `/photos/${id}/medium.jpg`,
      full: `/photos/${id}/full.jpg`,
      ...overrides.src,
    },
    metadata: {
      date: "2024-01-15",
      location: "France",
      city: "Paris",
      camera: "Sony A7IV",
      lens: "24-70mm f/2.8",
      aperture: "f/2.8",
      shutter: "1/250",
      iso: "100",
      focalLength: "50mm",
      width: 4000,
      height: 3000,
      latitude: TEST_COORDINATES.paris.lat,
      longitude: TEST_COORDINATES.paris.lng,
      ...overrides.metadata,
    },
    ...overrides,
  };
}

/**
 * Create a mock Album object for testing
 */
export function createMockAlbum(overrides: Partial<Album> = {}): Album {
  const id = overrides.id || `album-${Date.now()}`;

  return {
    id,
    slug: overrides.slug || `test-album-${id}`,
    title: overrides.title || "Test Album",
    subtitle: overrides.subtitle,
    description: overrides.description || "A test album",
    location: overrides.location || "Paris, France",
    date: overrides.date || "January 2024",
    coverImage: overrides.coverImage || `/photos/${id}/cover.jpg`,
    photoCount: overrides.photoCount || 10,
    featured: overrides.featured || false,
    ...overrides,
  };
}

/**
 * Create a mock Chapter object for testing
 */
export function createMockChapter(overrides: Partial<Chapter> = {}): Chapter {
  const id = overrides.id || `chapter-${Date.now()}`;

  return {
    id,
    title: overrides.title || "Test Chapter",
    titleFr: overrides.titleFr,
    narrative: overrides.narrative || "Chapter narrative text",
    narrativeFr: overrides.narrativeFr,
    photos: overrides.photos || [],
    coverPhotoId: overrides.coverPhotoId,
    coverPhoto: overrides.coverPhoto,
    ...overrides,
  };
}

/**
 * Create an array of mock photos with sequential data
 */
export function createMockPhotoArray(
  count: number,
  baseOverrides: Partial<Photo> = {}
): Photo[] {
  return Array.from({ length: count }, (_, i) =>
    createMockPhoto({
      id: `photo-${i + 1}`,
      title: `Photo ${i + 1}`,
      metadata: {
        date: `2024-01-${String(i + 1).padStart(2, "0")}`,
        ...baseOverrides.metadata,
      },
      ...baseOverrides,
    })
  );
}

/**
 * Create a mock Prisma result for album queries
 */
export function createPrismaAlbum(overrides: Record<string, unknown> = {}) {
  return {
    id: "album-1",
    slug: "test-album",
    title: "Test Album",
    subtitle: null,
    description: null,
    location: "Paris, France",
    date: "January 2024",
    coverImage: "/photos/cover.jpg",
    photoCount: 10,
    sortOrder: 0,
    featured: false,
    galleryUrl: null,
    lastSynced: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    galleryId: null,
    ...overrides,
  };
}

/**
 * Create a mock Prisma result for photo queries
 */
export function createPrismaPhoto(overrides: Record<string, unknown> = {}) {
  return {
    id: "photo-1",
    albumId: "album-1",
    title: "Test Photo",
    caption: null,
    fullPath: "/photos/full.jpg",
    mediumPath: "/photos/medium.jpg",
    thumbPath: "/photos/thumb.jpg",
    originalUrl: null,
    width: 4000,
    height: 3000,
    date: "2024-01-15",
    location: "Paris, France",
    city: "Paris",
    camera: "Sony A7IV",
    lens: "24-70mm f/2.8",
    aperture: "f/2.8",
    shutter: "1/250",
    shutterSpeed: "1/250",
    iso: "100",
    focalLength: "50mm",
    latitude: 48.8566,
    longitude: 2.3522,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock the Next.js cookies function
 */
export function mockCookies(cookieValues: Record<string, string> = {}) {
  return {
    get: vi.fn((name: string) => {
      const value = cookieValues[name];
      return value ? { name, value } : undefined;
    }),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn((name: string) => name in cookieValues),
    getAll: vi.fn(() =>
      Object.entries(cookieValues).map(([name, value]) => ({ name, value }))
    ),
  };
}

/**
 * Create authenticated cookies mock
 */
export function mockAuthenticatedCookies() {
  return mockCookies({ admin_auth: VALID_SESSION_TOKEN });
}

/**
 * Create unauthenticated cookies mock
 */
export function mockUnauthenticatedCookies() {
  return mockCookies({});
}

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random hex string of specified length
 */
export function randomHex(length: number): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Assert that a response has the expected status and optional body properties
 */
export async function assertResponse(
  response: Response,
  expectedStatus: number,
  expectedBodyProps?: Record<string, unknown>
) {
  expect(response.status).toBe(expectedStatus);

  if (expectedBodyProps) {
    const body = await response.json();
    Object.entries(expectedBodyProps).forEach(([key, value]) => {
      expect(body[key]).toEqual(value);
    });
  }
}
