import Header from "@/components/Header";
import HomeContent from "@/components/HomeContent";
import Footer from "@/components/Footer";
import { getAlbums, getFeaturedAlbum, siteConfig } from "@/lib/data";

// Force dynamic rendering to pick up synced data
export const dynamic = "force-dynamic";

export default async function Home() {
  let featuredAlbum: Awaited<ReturnType<typeof getFeaturedAlbum>> = undefined;
  let albums: Awaited<ReturnType<typeof getAlbums>> = [];

  try {
    featuredAlbum = await getFeaturedAlbum();
    albums = await getAlbums();
  } catch {
    // Database may not exist during build
  }

  const recentAlbums = albums.filter((a) => a.id !== featuredAlbum?.id);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <Header />

      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-4 lg:px-8">
            <HomeContent
              featuredAlbum={featuredAlbum}
              recentAlbums={recentAlbums}
              tagline={siteConfig.tagline}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
