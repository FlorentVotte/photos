import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapContent from "@/components/MapContent";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { getAllPhotos } from "@/lib/data";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

// Revalidate every hour to pick up synced data while allowing caching
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Photo Map - Regards Perdus",
  description: "Explore photos on an interactive map",
};

export default async function MapPage() {
  let photos: Awaited<ReturnType<typeof getAllPhotos>> = [];
  try {
    photos = await getAllPhotos();
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
      <MapContent photos={photos} />
      <Footer />
    </div>
  );
}
