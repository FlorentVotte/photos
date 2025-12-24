import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AlbumsContent from "@/components/AlbumsContent";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { getAlbums } from "@/lib/synced-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

export const metadata: Metadata = {
  title: "Albums | Regards Perdus",
  description: "Browse all photo albums and travel stories from around the world.",
  openGraph: {
    title: "Albums | Regards Perdus",
    description: "Browse all photo albums and travel stories from around the world.",
  },
};

// Revalidate every hour to pick up synced data while allowing caching
export const revalidate = 3600;

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Albums", url: `${SITE_URL}/albums` },
        ]}
      />
      <Header />
      <AlbumsContent albums={albums} />
      <Footer />
    </div>
  );
}
