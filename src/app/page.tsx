import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AlbumCard from "@/components/AlbumCard";
import Footer from "@/components/Footer";
import { getAlbums, getFeaturedAlbum, siteConfig } from "@/lib/data";
import Image from "next/image";

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

            {/* About / Newsletter Section */}
            <div className="mt-20 mb-12 bg-surface-dark rounded-2xl overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row">
                <div
                  className="w-full md:w-1/2 aspect-video md:aspect-auto min-h-[300px] bg-cover bg-center"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAQ_qTCfjrgJAxFo4HyWrBz7gLJfCi-8Dg1lfHXZrulqTrtpghrsbjFxPPb_S7KHP7AkYone8lAYCUwurrBvVUQrVYKUS2dRPcHpMJGIS86e4dErWXSc5bCTerqbWAb_M2LXUFxwWSexEdTd_enPg0AIVNiodmVAW3bCtRAJ_o6bmOYOwqAl_pBvc-sQW6cs8TCEw56jU_iDN8FyskEouy_hfFuj0Mw-PEb8NX9upGalvDpjq5CGL3R8SabAHS3QVoejgPC40QKnpk")`,
                  }}
                />
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-start">
                  <p className="text-primary font-bold uppercase tracking-widest text-xs mb-3">
                    About the Photographer
                  </p>
                  <h2 className="text-3xl font-bold mb-4">
                    Chasing Light & Shadow
                  </h2>
                  <p className="text-gray-300 font-sans mb-8 leading-relaxed">
                    {siteConfig.photographerBio}
                  </p>
                  <div className="flex flex-col w-full gap-3">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-background-dark border border-surface-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                        placeholder="Enter your email address"
                        type="email"
                      />
                      <button className="bg-primary hover:bg-opacity-90 text-background-dark font-bold px-6 py-3 rounded-lg text-sm transition-colors">
                        Join List
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Receive a weekly digest of new stories. No spam, ever.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
