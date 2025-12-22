export interface SyncAlbum {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  location: string;
  date: string;
  coverImage: string;
  photoCount: number;
  featured?: boolean;
  galleryUrl: string;
  lastSynced: string;
}

export interface SyncPhoto {
  id: string;
  title: string;
  description?: string;
  src: {
    thumb: string;
    medium: string;
    full: string;
    original: string; // Original URL from Lightroom
  };
  metadata: {
    date: string;
    location?: string;
    locationDetail?: string;
    camera?: string;
    lens?: string;
    aperture?: string;
    shutter?: string;
    iso?: string;
    width?: number;
    height?: number;
    gps?: {
      lat: number;
      lng: number;
    };
  };
  albumId: string;
  sortOrder: number;
}

export interface SyncChapter {
  id: string;
  title: string;
  narrative?: string;
  photoIds: string[];
}

export interface SyncManifest {
  lastUpdated: string;
  albums: SyncAlbum[];
  photos: SyncPhoto[];
  chapters: Record<string, SyncChapter[]>; // albumId -> chapters
}

export interface LightroomGalleryData {
  title: string;
  description?: string;
  photos: LightroomPhoto[];
}

export interface LightroomPhoto {
  id: string;
  title?: string;
  caption?: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  captureDate?: string;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
  };
  location?: {
    name?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}
