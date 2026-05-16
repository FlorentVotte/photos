import Link from "next/link";
import { getAlbums, getFeaturedAlbum } from "@/lib/data";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import V2HomeContent from "@/components/v2/V2HomeContent";

export const dynamic = "force-dynamic";

export default async function V2Home() {
  let featuredAlbum: Awaited<ReturnType<typeof getFeaturedAlbum>> = undefined;
  let albums: Awaited<ReturnType<typeof getAlbums>> = [];

  try {
    featuredAlbum = await getFeaturedAlbum();
    albums = await getAlbums();
  } catch {
    // DB may not exist during build
  }

  const recentAlbums = albums.filter((a) => a.id !== featuredAlbum?.id).slice(0, 5);

  return (
    <>
      <V2Header currentPath="/v2" />
      <main>
        <V2HomeContent featuredAlbum={featuredAlbum} recentAlbums={recentAlbums} />
      </main>
      <V2Footer />
    </>
  );
}
