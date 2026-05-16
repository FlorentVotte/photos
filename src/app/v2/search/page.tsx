import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import V2SearchClient from "@/components/v2/V2SearchClient";
import { getAlbums, getAllPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function V2SearchPage() {
  let albums: Awaited<ReturnType<typeof getAlbums>> = [];
  let photos: Awaited<ReturnType<typeof getAllPhotos>> = [];
  try {
    [albums, photos] = await Promise.all([getAlbums(), getAllPhotos()]);
  } catch {
    // DB may not exist
  }

  return (
    <>
      <V2Header currentPath="/v2/search" />
      <main>
        <V2SearchClient albums={albums} photos={photos} />
      </main>
      <V2Footer />
    </>
  );
}
