import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PhotoContent from "@/components/PhotoContent";
import {
  getPhotoById,
  getPhotosByAlbum,
  getAlbums,
  getAllPhotos,
} from "@/lib/data";
import type { Metadata } from "next";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const photo = await getPhotoById(params.id);
  if (!photo) return { title: "Photo Not Found" };

  const description = photo.caption || `Photo from ${photo.metadata.location}`;
  return {
    title: `${photo.title} - Regards Perdus`,
    description,
    openGraph: {
      title: photo.title,
      description,
      images: [photo.src.full],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: photo.title,
      description,
      images: [photo.src.full],
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
  const photo = await getPhotoById(params.id);
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
