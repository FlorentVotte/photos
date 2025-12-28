import type { Metadata } from "next";
import { getAlbums, getAllPhotos } from "@/lib/data";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import SearchClient from "./SearchClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

export const metadata: Metadata = {
  title: "Search | Regards Perdus",
  description: "Search the complete archive of photos, albums, and locations.",
};

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  // Fetch data on server
  const albums = await getAlbums();
  const photos = await getAllPhotos();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Search", url: `${SITE_URL}/search` },
        ]}
      />
      <SearchClient albums={albums} photos={photos} />
    </>
  );
}
