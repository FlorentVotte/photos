import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapContent from "@/components/MapContent";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { getAlbums, getAllPhotos } from "@/lib/data";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo Map - Regards Perdus",
  description: "Explore the geography of the archive on an interactive world map.",
};

export default async function MapPage() {
  let photos: Awaited<ReturnType<typeof getAllPhotos>> = [];
  let albums: Awaited<ReturnType<typeof getAlbums>> = [];
  try {
    [photos, albums] = await Promise.all([getAllPhotos(), getAlbums()]);
  } catch {
    // Database may not exist during build
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Map", url: `${SITE_URL}/map` },
        ]}
      />
      <Header />
      <MapContent photos={photos} albums={albums} />
      <Footer />
    </div>
  );
}
