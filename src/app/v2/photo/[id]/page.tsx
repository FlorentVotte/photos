import { notFound } from "next/navigation";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import V2PhotoContent from "@/components/v2/V2PhotoContent";
import { getPhotoById, getPhotosByAlbum, getAlbums } from "@/lib/data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function V2PhotoPage({ params }: Props) {
  const { id } = await params;
  const photo = await getPhotoById(id);
  if (!photo) notFound();

  const albums = await getAlbums();
  const album = albums.find((a) => a.id === photo.albumId);
  const albumPhotos = await getPhotosByAlbum(photo.albumId);
  const currentIndex = albumPhotos.findIndex((p) => p.id === photo.id);
  const prevPhoto = currentIndex > 0 ? albumPhotos[currentIndex - 1] : null;
  const nextPhoto = currentIndex < albumPhotos.length - 1 ? albumPhotos[currentIndex + 1] : null;

  return (
    <>
      <V2Header />
      <main>
        <V2PhotoContent photo={photo} album={album} prevPhoto={prevPhoto} nextPhoto={nextPhoto} />
      </main>
      <V2Footer />
    </>
  );
}
