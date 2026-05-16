import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import V2AlbumsContent from "@/components/v2/V2AlbumsContent";
import { getAlbums } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function V2AlbumsPage() {
  let albums: Awaited<ReturnType<typeof getAlbums>> = [];
  try {
    albums = await getAlbums();
  } catch {
    // DB may not exist during build
  }

  return (
    <>
      <V2Header currentPath="/v2/albums" />
      <main>
        <V2AlbumsContent albums={albums} />
      </main>
      <V2Footer />
    </>
  );
}
