import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ProtectedImage from "@/components/ProtectedImage";
import PhotoLocationMap from "@/components/PhotoLocationMap";
import PhotoKeyboardNav from "@/components/PhotoKeyboardNav";
import SlideshowButton from "@/components/SlideshowButton";
import {
  getPhotoById,
  getPhotosByAlbum,
  getAlbums,
  getAllPhotos,
} from "@/lib/data";
import type { Metadata } from "next";

// Force dynamic rendering to pick up synced data
export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const photo = await getPhotoById(params.id);
  if (!photo) return { title: "Photo Not Found" };

  const description = photo.caption || `Photo from ${photo.metadata.location}`;
  return {
    title: `${photo.title} - Regards Perdus`,
    description,
    openGraph: {
      title: photo.title,
      description,
      images: [photo.src.full],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: photo.title,
      description,
      images: [photo.src.full],
    },
  };
}

export async function generateStaticParams() {
  try {
    const photos = await getAllPhotos();
    return photos.map((photo) => ({ id: photo.id }));
  } catch {
    // Database may not exist during build
    return [];
  }
}

export default async function PhotoPage({ params }: Props) {
  const photo = await getPhotoById(params.id);
  if (!photo) notFound();

  const albums = await getAlbums();
  const album = albums.find((a) => a.id === photo.albumId);
  const albumPhotos = await getPhotosByAlbum(photo.albumId);
  const currentIndex = albumPhotos.findIndex((p) => p.id === photo.id);
  const prevPhoto = currentIndex > 0 ? albumPhotos[currentIndex - 1] : null;
  const nextPhoto =
    currentIndex < albumPhotos.length - 1 ? albumPhotos[currentIndex + 1] : null;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#122118]">
      <Header />
      <PhotoKeyboardNav
        prevPhotoId={prevPhoto?.id}
        nextPhotoId={nextPhoto?.id}
      />

      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 px-4 md:px-10 lg:px-40">
          <div className="layout-content-container flex flex-col max-w-[1080px] flex-1">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 py-4 mb-2">
              <Link
                href="/"
                className="text-text-muted hover:text-primary transition-colors text-sm font-medium leading-normal"
              >
                Home
              </Link>
              <span className="material-symbols-outlined text-text-muted text-[14px]">
                chevron_right
              </span>
              {album && (
                <>
                  <Link
                    href={`/album/${album.slug}`}
                    className="text-text-muted hover:text-primary transition-colors text-sm font-medium leading-normal"
                  >
                    {album.title}
                  </Link>
                  <span className="material-symbols-outlined text-text-muted text-[14px]">
                    chevron_right
                  </span>
                </>
              )}
              <span className="text-white text-sm font-medium leading-normal">
                {photo.title}
              </span>
            </div>

            {/* Main Photo Stage */}
            <div className="relative group w-full bg-[#0a140f] rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-surface-border">
              {/* Navigation Overlays */}
              {prevPhoto && (
                <Link
                  href={`/photo/${prevPhoto.id}`}
                  className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
                >
                  <div className="size-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-white hover:text-black">
                      arrow_back
                    </span>
                  </div>
                </Link>
              )}
              {nextPhoto && (
                <Link
                  href={`/photo/${nextPhoto.id}`}
                  className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
                >
                  <div className="size-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-white hover:text-black">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              )}

              {/* The Image */}
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] flex items-center justify-center bg-[#0e1a13]">
                <ProtectedImage
                  alt={photo.title}
                  className="max-h-full max-w-full object-contain shadow-lg"
                  src={photo.src.full}
                />
              </div>

              {/* Mobile Nav Controls */}
              <div className="md:hidden absolute bottom-4 right-4 flex gap-2">
                {prevPhoto && (
                  <Link
                    href={`/photo/${prevPhoto.id}`}
                    className="size-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white border border-white/10"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </Link>
                )}
                {nextPhoto && (
                  <Link
                    href={`/photo/${nextPhoto.id}`}
                    className="size-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white border border-white/10"
                  >
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="mt-8 pb-20">
              {/* Title and Actions */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] font-display">
                    {photo.title}
                  </h1>
                  {photo.caption && (
                    <p className="text-text-muted text-base mt-3 leading-relaxed max-w-2xl">
                      {photo.caption}
                    </p>
                  )}
                </div>
                <SlideshowButton
                  photos={albumPhotos}
                  currentIndex={currentIndex}
                />
              </div>

              {/* Info Grid - Map and Metadata side by side on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Location Map or Location Info */}
                <div className="bg-surface-dark rounded-xl p-5 border border-surface-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-9 rounded-full bg-surface-border flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">location_on</span>
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-semibold">
                        {photo.metadata.city
                          ? `${photo.metadata.city}, ${photo.metadata.location}`
                          : photo.metadata.location}
                      </h3>
                      <p className="text-text-muted text-xs">{photo.metadata.date}</p>
                    </div>
                  </div>

                  {photo.metadata.latitude && photo.metadata.longitude ? (
                    <PhotoLocationMap
                      latitude={photo.metadata.latitude}
                      longitude={photo.metadata.longitude}
                      title={photo.title}
                    />
                  ) : (
                    <div className="h-[200px] bg-[#0e1a13] rounded-lg flex items-center justify-center">
                      <span className="text-text-muted text-sm">No GPS data</span>
                    </div>
                  )}
                </div>

                {/* Right: EXIF Data */}
                <div className="bg-surface-dark rounded-xl p-5 border border-surface-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-9 rounded-full bg-surface-border flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">camera</span>
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-semibold">
                        {photo.metadata.camera || "Camera"}
                      </h3>
                      <p className="text-text-muted text-xs">{photo.metadata.lens || "Unknown lens"}</p>
                    </div>
                  </div>

                  {/* EXIF Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photo.metadata.aperture && (
                      <div className="bg-[#0e1a13] rounded-lg p-3 text-center">
                        <span className="text-text-muted text-xs block mb-1">Aperture</span>
                        <span className="text-white text-sm font-medium">{photo.metadata.aperture}</span>
                      </div>
                    )}
                    {photo.metadata.shutterSpeed && (
                      <div className="bg-[#0e1a13] rounded-lg p-3 text-center">
                        <span className="text-text-muted text-xs block mb-1">Shutter</span>
                        <span className="text-white text-sm font-medium">{photo.metadata.shutterSpeed}</span>
                      </div>
                    )}
                    {photo.metadata.iso && (
                      <div className="bg-[#0e1a13] rounded-lg p-3 text-center">
                        <span className="text-text-muted text-xs block mb-1">ISO</span>
                        <span className="text-white text-sm font-medium">{photo.metadata.iso}</span>
                      </div>
                    )}
                    {photo.metadata.focalLength && (
                      <div className="bg-[#0e1a13] rounded-lg p-3 text-center">
                        <span className="text-text-muted text-xs block mb-1">Focal</span>
                        <span className="text-white text-sm font-medium">{photo.metadata.focalLength}</span>
                      </div>
                    )}
                  </div>

                  {/* Back to Album */}
                  {album && (
                    <div className="mt-5 pt-4 border-t border-[#254633]">
                      <Link
                        href={`/album/${album.slug}`}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-base">
                          arrow_back
                        </span>
                        Back to {album.title}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
