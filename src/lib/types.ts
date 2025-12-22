export interface Photo {
  id: string;
  title: string;
  description?: string;
  caption?: string;
  src: {
    thumb: string;
    medium: string;
    full: string;
    original?: string;  // Original URL from Lightroom
  };
  metadata: {
    date: string;
    location?: string;
    locationDetail?: string;
    camera?: string;
    lens?: string;
    aperture?: string;
    shutter?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
    width?: number;
    height?: number;
    latitude?: number;
    longitude?: number;
    gps?: {
      lat: number;
      lng: number;
    };
  };
  albumId: string;
  sortOrder?: number;
}

export interface Album {
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
  galleryUrl?: string;
  lastSynced?: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  narrative?: string;
  photos: Photo[];
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  photographerName: string;
  photographerBio: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    unsplash?: string;
  };
}
