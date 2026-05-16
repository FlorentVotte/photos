import { notFound } from "next/navigation";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import V2AlbumContent from "@/components/v2/V2AlbumContent";
import { getAlbumBySlug, getChaptersByAlbum, getPhotosByAlbum, getAlbums } from "@/lib/data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function V2AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const chapters = await getChaptersByAlbum(slug);
  const photos = await getPhotosByAlbum(album.id);
  const albums = await getAlbums();
  const currentIndex = albums.findIndex((a) => a.id === album.id);
  const nextAlbum = albums[(currentIndex + 1) % albums.length];

  return (
    <>
      <V2Header currentPath="/v2/albums" />
      <main>
        <V2AlbumContent album={album} chapters={chapters} photos={photos} nextAlbum={nextAlbum} />
      </main>
      <V2Footer />
    </>
  );
}
