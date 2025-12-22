"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Handle both local and remote images
  const isExternal = src.startsWith("http");

  return (
    <div className={`relative overflow-hidden ${fill ? "absolute inset-0" : ""}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-surface-dark animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        // Disable right-click and drag
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        style={{ userSelect: "none" }}
        // Unoptimized for local files (already processed)
        unoptimized={!isExternal}
      />
    </div>
  );
}
