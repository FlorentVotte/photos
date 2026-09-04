import Header from "@/components/Header";
import HomeExperience from "@/components/HomeExperience";
import Footer from "@/components/Footer";
import { WebsiteStructuredData } from "@/components/StructuredData";
import { getAlbums, getAllPhotos, getFeaturedAlbum } from "@/lib/data";
import { albumMarkers, sortMarkersByDate } from "@/lib/geo-utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

export default async function Home() {
  let featuredAlbum: Awaited<ReturnType<typeof getFeaturedAlbum>> = undefined;
  let albums: Awaited<ReturnType<typeof getAlbums>> = [];
  let photos: Awaited<ReturnType<typeof getAllPhotos>> = [];

  try {
    [featuredAlbum, albums, photos] = await Promise.all([
      getFeaturedAlbum(),
      getAlbums(),
      getAllPhotos(),
    ]);
  } catch {
    // Database may not exist during build
  }

  const recentAlbums = albums.filter((a) => a.id !== featuredAlbum?.id);

  // The globe plots one marker per album that has geotagged photos, oldest
  // first so the travel arcs read chronologically.
  const markers = sortMarkersByDate(albumMarkers(photos, albums));

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <WebsiteStructuredData
        name="Regards Perdus - Photo Portfolio"
        description="Capturing the fleeting moments between departures and arrivals. A visual journey through the world."
        url={SITE_URL}
      />
      <Header />

      <main>
        <HomeExperience
          featuredAlbum={featuredAlbum}
          recentAlbums={recentAlbums}
          markers={markers}
        />
      </main>

      <Footer />
    </div>
  );
}
