import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PhotoContent from "@/components/PhotoContent";
import { PhotoStructuredData } from "@/components/StructuredData";
import {
  getPhotoById,
  getPhotosByAlbum,
  getAlbums,
  getAllPhotos,
} from "@/lib/data";
import type { Metadata } from "next";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const photo = await getPhotoById(id);
  if (!photo) return { title: "Photo Not Found" };

  const description = photo.caption || photo.description || `Photo from ${photo.metadata.location || "Regards Perdus"}`;
  const canonicalUrl = `${SITE_URL}/photo/${id}`;
  const ogImageUrl = `${SITE_URL}/api/og/photo/${id}`;

  return {
    title: `${photo.title} - Regards Perdus`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: photo.title,
      description,
      url: canonicalUrl,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: photo.title,
      }],
      type: "article",
      siteName: "Regards Perdus",
    },
    twitter: {
      card: "summary_large_image",
      title: photo.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export async function generateStaticParams() {
  try {
    const photos = await getAllPhotos();
    return photos.map((photo) => ({ id: photo.id }));
  } catch {
    // Database may not exist during build
    return [];
  }
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params;
  const photo = await getPhotoById(id);
  if (!photo) notFound();

  const albums = await getAlbums();
  const album = albums.find((a) => a.id === photo.albumId);
  const albumPhotos = await getPhotosByAlbum(photo.albumId);
  const currentIndex = albumPhotos.findIndex((p) => p.id === photo.id);
  const prevPhoto = currentIndex > 0 ? albumPhotos[currentIndex - 1] : null;
  const nextPhoto =
    currentIndex < albumPhotos.length - 1 ? albumPhotos[currentIndex + 1] : null;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <PhotoStructuredData
        name={photo.title}
        description={photo.caption || photo.description}
        url={`${SITE_URL}/photo/${photo.id}`}
        imageUrl={`${SITE_URL}${photo.src.full}`}
        dateCreated={photo.metadata.date}
        author="Florent Votte"
        location={[photo.metadata.city, photo.metadata.location].filter(Boolean).join(", ")}
        camera={photo.metadata.camera}
        width={photo.metadata.width}
        height={photo.metadata.height}
      />
      <Header />
      <PhotoContent
        photo={photo}
        album={album}
        albumPhotos={albumPhotos}
        currentIndex={currentIndex}
        prevPhoto={prevPhoto}
        nextPhoto={nextPhoto}
      />
    </div>
  );
}
