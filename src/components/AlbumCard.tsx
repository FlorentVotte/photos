import Link from "next/link";
import type { Album } from "@/lib/types";

interface AlbumCardProps {
  album: Album;
  variant?: "default" | "large" | "portrait" | "square";
}

export default function AlbumCard({
  album,
  variant = "default",
}: AlbumCardProps) {
  const variantClasses = {
    default: "col-span-1 aspect-square",
    large: "col-span-1 lg:col-span-2 aspect-video md:aspect-auto md:h-auto md:min-h-[400px]",
    portrait: "col-span-1 aspect-[4/5] lg:aspect-auto",
    square: "col-span-1 aspect-square",
  };

  return (
    <Link
      href={`/album/${album.slug}`}
      className={`group relative overflow-hidden rounded-xl cursor-pointer ${variantClasses[variant]}`}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url("${album.coverImage}")` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          {/* Location Tag */}
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {album.location}
          </div>

          {/* Title */}
          <h3
            className={`text-white font-bold leading-tight mb-1 ${
              variant === "large" ? "text-3xl" : "text-xl md:text-2xl"
            }`}
          >
            {album.title}
          </h3>

          {/* Metadata */}
          <p className="text-gray-300 text-sm font-sans">
            {album.date} • {album.photoCount} Photos
          </p>

          {/* Description (only on large variant) */}
          {variant === "large" && album.description && (
            <p className="text-gray-400 text-sm font-sans mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
              {album.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
