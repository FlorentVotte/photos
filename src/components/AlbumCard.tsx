import Link from "next/link";
import type { CSSProperties, Ref } from "react";
import type { Album } from "@/lib/types";
import ProtectedImage from "./ProtectedImage";
import { coverSources, wideCoverSources } from "@/lib/photo-display";

interface AlbumCardProps {
  album: Album;
  variant?: "default" | "large" | "portrait" | "square";
  featuredLabel?: string;
  /** Lit up while this album is the one under the pointer on the home globe. */
  highlighted?: boolean;
  /** Forwarded so callers can observe the card itself — it is the grid item, so
      a wrapper would take over its column span and aspect ratio. */
  ref?: Ref<HTMLAnchorElement>;
  className?: string;
  style?: CSSProperties;
}

export default function AlbumCard({
  album,
  variant = "default",
  featuredLabel,
  highlighted = false,
  ref,
  className = "",
  style,
}: AlbumCardProps) {
  const variantClasses = {
    default: "col-span-1 aspect-square",
    large: "col-span-1 lg:col-span-2 aspect-video md:aspect-auto md:h-auto md:min-h-[400px]",
    portrait: "col-span-1 aspect-[4/5] lg:aspect-auto",
    square: "col-span-1 aspect-square",
  };

  const isLarge = variant === "large";
  // The thumb is a square crop, so only square cards may use it.
  const isSquare = variant === "default" || variant === "square";

  return (
    <Link
      ref={ref}
      href={`/album/${album.slug}`}
      style={style}
      className={`group relative overflow-hidden cursor-pointer ${variantClasses[variant]} ${className}`}
    >
      <ProtectedImage
        alt=""
        src={album.coverImage}
        sources={isSquare ? coverSources(album.coverImage) : wideCoverSources(album.coverImage)}
        sizes={
          isLarge
            ? "(min-width: 1024px) 66vw, 100vw"
            : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        }
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
      />

      {/* Stronger scrim for legibility on bright cover images */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/0" />

      {/* Marker link: fades in when the home globe points at this album. */}
      <div
        aria-hidden="true"
        className={`gh-card-glow pointer-events-none absolute inset-0 border border-primary transition-opacity duration-[250ms] ease-out ${
          highlighted ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 md:p-6 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
        {isLarge && featuredLabel && (
          <p className="mb-1 inline-flex w-fit items-center gap-2 font-sans text-[0.6875rem] uppercase tracking-[0.32em] text-primary">
            <span aria-hidden="true" className="h-px w-6 bg-primary" />
            {featuredLabel}
          </p>
        )}
        <h3
          className={`text-foreground font-display font-semibold leading-tight tracking-tight ${
            isLarge ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
          }`}
        >
          {album.title}
        </h3>
        <p className="font-sans text-label uppercase tracking-[0.22em] text-white/80">
          {album.location} <span className="text-white/40">·</span> {album.date}
        </p>
      </div>
    </Link>
  );
}
