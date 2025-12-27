import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AlbumContent from "@/components/AlbumContent";
import { ImageGalleryStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";
import {
  getAlbumBySlug,
  getChaptersByAlbum,
  getPhotosByAlbum,
  getAlbums,
} from "@/lib/data";
import type { Metadata } from "next";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Album Not Found" };

  const description = album.description ||
    `${album.title} - ${album.photoCount} photos from ${album.location}. ${album.date}.`;

  const canonicalUrl = `${SITE_URL}/album/${slug}`;
  const ogImageUrl = `${SITE_URL}/api/og/album/${slug}`;

  return {
    title: `${album.title} | ${album.location} - Regards Perdus`,
    description,
    keywords: [album.title, album.location, "photography", "travel", "photo album"].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${album.title} | ${album.location}`,
      description,
      type: "article",
      url: canonicalUrl,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: album.title,
      }],
      publishedTime: album.date,
      siteName: "Regards Perdus",
    },
    twitter: {
      card: "summary_large_image",
      title: album.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export async function generateStaticParams() {
  try {
    const albums = await getAlbums();
    return albums.map((album) => ({ slug: album.slug }));
  } catch {
    // Database may not exist during build
    return [];
  }
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const chapters = await getChaptersByAlbum(slug);
  const photos = await getPhotosByAlbum(album.id);
  const albums = await getAlbums();
  const currentIndex = albums.findIndex((a) => a.id === album.id);
  const nextAlbum = albums[(currentIndex + 1) % albums.length];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <ImageGalleryStructuredData
        name={album.title}
        description={album.description || `Photo album from ${album.location}`}
        url={`${SITE_URL}/album/${album.slug}`}
        images={photos.slice(0, 10).map((p) => ({
          url: `${SITE_URL}${p.src.full}`,
          name: p.title,
          description: p.caption,
        }))}
        datePublished={album.date}
        author="Florent Votte"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Albums", url: `${SITE_URL}/albums` },
          { name: album.title, url: `${SITE_URL}/album/${album.slug}` },
        ]}
      />

      <Header />

      <AlbumContent
        album={album}
        chapters={chapters}
        photos={photos}
        nextAlbum={nextAlbum}
      />

      <Footer />
    </div>
  );
}
