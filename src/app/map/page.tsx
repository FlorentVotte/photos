import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoMap from "@/components/PhotoMap";
import { getAllPhotos } from "@/lib/data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

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
      <Header />

      <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Photo Map</h1>
            <p className="text-text-muted">
              Explore photos from around the world
            </p>
          </div>

          <PhotoMap photos={photos} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
