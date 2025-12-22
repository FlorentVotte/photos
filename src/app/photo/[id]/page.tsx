import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ProtectedImage from "@/components/ProtectedImage";
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
    title: `${photo.title} - Travelogue`,
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
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-20">
              {/* Narrative Column */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] font-display">
                    {photo.title}
                  </h1>
                  {photo.description && (
                    <p className="text-text-muted text-lg mt-4 leading-relaxed font-light italic opacity-90">
                      {photo.description}
                    </p>
                  )}
                </div>

              </div>

              {/* Technical & Location Sidebar */}
              <div className="lg:col-span-5 bg-surface-dark rounded-xl p-6 border border-surface-border h-fit">
                {/* Location */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#366349]">
                  <div className="size-10 rounded-full bg-surface-border flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <h3 className="text-white text-base font-bold">
                      {photo.metadata.location}
                    </h3>
                    {photo.metadata.locationDetail && (
                      <p className="text-text-muted text-sm">
                        {photo.metadata.locationDetail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#5c8a6f] text-xs font-bold uppercase tracking-wider">
                      Date
                    </span>
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-[16px] text-text-muted">
                        calendar_today
                      </span>
                      <span className="text-sm">{photo.metadata.date}</span>
                    </div>
                  </div>

                  {photo.metadata.camera && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[#5c8a6f] text-xs font-bold uppercase tracking-wider">
                        Camera
                      </span>
                      <div className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-[16px] text-text-muted">
                          photo_camera
                        </span>
                        <span className="text-sm">{photo.metadata.camera}</span>
                      </div>
                    </div>
                  )}

                  {photo.metadata.lens && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[#5c8a6f] text-xs font-bold uppercase tracking-wider">
                        Lens
                      </span>
                      <div className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-[16px] text-text-muted">
                          lens
                        </span>
                        <span className="text-sm">{photo.metadata.lens}</span>
                      </div>
                    </div>
                  )}

                  {(photo.metadata.aperture || photo.metadata.shutter) && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[#5c8a6f] text-xs font-bold uppercase tracking-wider">
                        Settings
                      </span>
                      <div className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-[16px] text-text-muted">
                          tune
                        </span>
                        <span className="text-sm">
                          {photo.metadata.aperture} • {photo.metadata.shutter}
                        </span>
                      </div>
                    </div>
                  )}

                  {photo.metadata.iso && (
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-[#5c8a6f] text-xs font-bold uppercase tracking-wider">
                        ISO
                      </span>
                      <div className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-[16px] text-text-muted">
                          iso
                        </span>
                        <span className="text-sm">{photo.metadata.iso}</span>
                        <div className="h-1 w-24 bg-surface-border rounded-full ml-2 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min(
                                (parseInt(photo.metadata.iso) / 6400) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back to Album */}
                {album && (
                  <div className="mt-8 pt-6 border-t border-[#366349]">
                    <Link
                      href={`/album/${album.slug}`}
                      className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">
                        arrow_back
                      </span>
                      <span className="text-sm">Back to {album.title}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
