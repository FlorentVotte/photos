"use client";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Optional multi-resolution sources for srcset generation. */
  sources?: { thumb?: string; medium?: string; full?: string };
  /** Sizes attribute for responsive image selection. */
  sizes?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "auto" | "high" | "low";
}

export default function ProtectedImage({
  src,
  alt,
  className = "",
  sources,
  sizes,
  loading = "lazy",
  fetchPriority,
}: ProtectedImageProps) {
  const srcSet = sources
    ? [
        sources.thumb ? `${sources.thumb} 400w` : null,
        sources.medium ? `${sources.medium} 1200w` : null,
        sources.full ? `${sources.full} 2400w` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={`select-none ${className}`}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      draggable={false}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
