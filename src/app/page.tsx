import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeContent from "@/components/HomeContent";
import Footer from "@/components/Footer";
import { WebsiteStructuredData } from "@/components/StructuredData";
import { getAlbums, getFeaturedAlbum } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu";

// Force dynamic to always fetch fresh data
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

  const heroKicker = featuredAlbum
    ? [featuredAlbum.location, featuredAlbum.date].filter(Boolean).join(" — ")
    : undefined;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <WebsiteStructuredData
        name="Regards Perdus - Photo Portfolio"
        description="Capturing the fleeting moments between departures and arrivals. A visual journey through the world."
        url={SITE_URL}
      />
      <Header />

      {featuredAlbum && (
        <Hero
          title={featuredAlbum.title}
          subtitle={featuredAlbum.subtitle}
          description={featuredAlbum.description}
          backgroundImage={featuredAlbum.coverImage}
          kicker={heroKicker}
          ctaLink={`/album/${featuredAlbum.slug}`}
        />
      )}

      <div className="flex flex-1 justify-center">
        <div className="flex w-full max-w-[1200px] flex-col px-4 lg:px-8">
          <HomeContent recentAlbums={recentAlbums} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
