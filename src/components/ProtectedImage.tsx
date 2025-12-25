"use client";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

export default function ProtectedImage({
  src,
  alt,
  className = "",
  onLoad,
}: ProtectedImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={`select-none ${className}`}
      src={src}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onLoad={onLoad}
    />
  );
}
