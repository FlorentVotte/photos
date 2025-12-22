import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AlbumCard from "@/components/AlbumCard";
import Footer from "@/components/Footer";
import { getAlbums, getFeaturedAlbum, siteConfig } from "@/lib/data";
import Image from "next/image";

// Force dynamic rendering to pick up synced data
export const dynamic = "force-dynamic";

export default function Home() {
  const featuredAlbum = getFeaturedAlbum();
  const albums = getAlbums();
  const recentAlbums = albums.filter((a) => a.id !== featuredAlbum?.id);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <Header />

      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-4 lg:px-8">
            {/* Hero Section */}
            {featuredAlbum && (
              <Hero
                title={featuredAlbum.title}
                subtitle={featuredAlbum.subtitle}
                description={featuredAlbum.description}
                backgroundImage={featuredAlbum.coverImage}
                tag="Featured Story"
                ctaText="View Album"
                ctaLink={`/album/${featuredAlbum.slug}`}
                showScrollHint={true}
              />
            )}

            {/* Quote Section */}
            <div className="py-8 md:py-16 px-4 md:px-20 text-center border-b border-surface-border mb-12">
              <span className="material-symbols-outlined text-4xl text-primary mb-4">
                camera
              </span>
              <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight max-w-3xl mx-auto italic">
                &ldquo;The world is a book and those who do not travel read only
                one page.&rdquo;
              </h2>
              <p className="mt-4 text-gray-500 font-sans">
                {siteConfig.tagline}
              </p>
            </div>

            {/* Albums Section */}
            <section id="albums">
              <div className="flex items-end justify-between px-4 pb-6 pt-2">
                <h2 className="text-3xl font-bold leading-tight tracking-tight">
                  Recent Albums
                </h2>
                <a
                  href="#"
                  className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:text-white transition-colors"
                >
                  View Archive{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_outward
                  </span>
                </a>
              </div>

              {/* Magazine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {recentAlbums.slice(0, 5).map((album, index) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    variant={
                      index === 0
                        ? "large"
                        : index === 1
                        ? "portrait"
                        : "square"
                    }
                  />
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
