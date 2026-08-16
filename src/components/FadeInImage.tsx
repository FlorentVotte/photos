"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";

interface FadeInImageProps extends Omit<ImageProps, "onLoad"> {
  /**
   * Classes for the wrapper that carries the fade. For `fill` images this
   * must establish a positioned box, e.g. "absolute inset-0".
   */
  wrapperClassName?: string;
}

/**
 * An image that fades in once decoded, instead of hard-cutting from the
 * placeholder surface.
 *
 * Two deliberate opt-outs, both of which matter more than the fade itself:
 *
 * - `priority` images never fade. LCP does not count an element until it is
 *   visible, so fading an above-the-fold photo donates the whole fade
 *   duration to the LCP measurement for no perceptual gain.
 * - Already-decoded images never fade. Without this, every back-navigation
 *   and repeat visit re-fades the entire grid from cache, which reads as the
 *   page being slow — the opposite of what the fade is for.
 */
export default function FadeInImage({
  wrapperClassName = "",
  priority,
  ...props
}: FadeInImageProps) {
  const [loaded, setLoaded] = useState(Boolean(priority));

  const skipFadeIfCached = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <span
      className={`transition-opacity duration-300 ease-out motion-reduce:duration-150 ${
        loaded ? "opacity-100" : "opacity-0"
      } ${wrapperClassName}`}
    >
      <Image
        {...props}
        priority={priority}
        ref={skipFadeIfCached}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}
