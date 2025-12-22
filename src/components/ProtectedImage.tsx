"use client";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProtectedImage({
  src,
  alt,
  className = "",
}: ProtectedImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={`select-none ${className}`}
      src={src}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
