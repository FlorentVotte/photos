"use client";

import { useEffect, useRef } from "react";

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
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle cached images that are already loaded
  useEffect(() => {
    if (imgRef.current?.complete && onLoad) {
      onLoad();
    }
  }, [src, onLoad]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      alt={alt}
      className={`select-none ${className}`}
      src={src}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onLoad={onLoad}
    />
  );
}
