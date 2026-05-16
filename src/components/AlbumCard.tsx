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
      className={`group relative overflow-hidden cursor-pointer ${variantClasses[variant]}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        style={{ backgroundImage: `url("${album.coverImage}")` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 md:p-6">
        <h3
          className={`text-foreground font-display font-semibold leading-tight tracking-tight ${
            variant === "large" ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
          }`}
        >
          {album.title}
        </h3>
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/70">
          {album.location} <span className="text-white/40">·</span> {album.date}
        </p>
      </div>
    </Link>
  );
}
