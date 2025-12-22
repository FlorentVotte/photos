import { MetadataRoute } from "next";
import { albums, photos } from "@/lib/synced-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Album pages
  const albumPages: MetadataRoute.Sitemap = albums.map((album) => ({
    url: `${baseUrl}/album/${album.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Photo pages (limit to prevent huge sitemaps)
  const photoPages: MetadataRoute.Sitemap = photos.slice(0, 1000).map((photo) => ({
    url: `${baseUrl}/photo/${photo.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...albumPages, ...photoPages];
}
