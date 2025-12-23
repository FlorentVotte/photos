import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AlbumContent from "@/components/AlbumContent";
import {
  getAlbumBySlug,
  getChaptersByAlbum,
  getPhotosByAlbum,
  getAlbums,
} from "@/lib/data";
import type { Metadata } from "next";

// Force dynamic rendering to pick up synced data
export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await getAlbumBySlug(params.slug);
  if (!album) return { title: "Album Not Found" };

  return {
    title: `${album.title} - Regards Perdus`,
    description: album.description,
    openGraph: {
      title: album.title,
      description: album.description,
      images: album.coverImage ? [album.coverImage] : [],
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
  const album = await getAlbumBySlug(params.slug);
  if (!album) notFound();

  const chapters = await getChaptersByAlbum(params.slug);
  const photos = await getPhotosByAlbum(album.id);
  const albums = await getAlbums();
  const currentIndex = albums.findIndex((a) => a.id === album.id);
  const nextAlbum = albums[(currentIndex + 1) % albums.length];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
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
