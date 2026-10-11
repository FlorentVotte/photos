"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  animate,
  type PanInfo,
} from "motion/react";
import { useLocale } from "@/lib/LocaleContext";
import { cleanLocationParts } from "@/lib/transformers";
import {
  useBodyScrollLock,
  useLightboxKeyboard,
  useModalFocus,
  usePinchZoom,
  useSlideshow,
} from "@/hooks";
import { resolveProjectedSwipe } from "@/lib/gesture-utils";
import { formatPhotoAccessibleLabel } from "@/lib/photo-display";

/**
 * Apple's "move" spring: critically damped, response 0.4. No overshoot,
 * because nothing here was thrown — it's the default for UI that just needs
 * to get somewhere gracefully.
 */
const SETTLE = { type: "spring", bounce: 0, duration: 0.4 } as const;

/**
 * Apple's "drawer" spring. A little overshoot, earned only because the
 * gesture that triggered it carried momentum.
 */
const THROW = { type: "spring", bounce: 0.2, duration: 0.4 } as const;

/**
 * Exits beat entrances. A spring's settle tail runs well past its perceptual
 * duration, which is right for something arriving and too slow for something
 * being dismissed — so dismissal uses a short tween instead.
 */
const DISMISS = { duration: 0.2, ease: "easeIn" } as const;

/** Fraction of the frame a projected flick must cross to change photo. */
const COMMIT_FRACTION = 0.25;

interface Photo {
  id: string;
  src: { full: string; medium: string };
  title?: string;
  metadata?: {
    date?: string;
    location?: string;
  };
}

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  slideshowEnabled?: boolean;
  slideshowInterval?: number;
}

export default function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  slideshowInterval = 4000,
}: LightboxProps) {
  const { t, locale } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const dragRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // The live horizontal offset. Motion writes to this 1:1 during a drag, and
  // we animate it home afterwards — so drag and animation share one value and
  // there is no seam between them.
  const x = useMotionValue(0);

  const currentPhoto = photos[currentIndex];
  const location = cleanLocationParts(currentPhoto?.metadata?.location).join(", ");

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  }, [currentIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1);
    }
  }, [currentIndex, photos.length, onNavigate]);

  useBodyScrollLock(isOpen);

  useModalFocus({
    isOpen,
    containerRef: lightboxRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  const { isPlaying, togglePlay } = useSlideshow({
    isActive: isOpen,
    interval: slideshowInterval,
    onNext: goNext,
  });

  const {
    scale,
    position,
    isZoomed,
    isGesturing,
    shouldAnimate,
    transformOrigin,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = usePinchZoom({ resetKey: currentIndex, sizeRef: imageRef });

  const handleViewDetails = useCallback(() => {
    if (photos[currentIndex]) {
      // The shortcut intentionally keeps the browser-navigation behavior of
      // the pre-existing lightbox control.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/photo/${photos[currentIndex].id}`;
    }
  }, [photos, currentIndex]);

  useLightboxKeyboard({
    isActive: isOpen,
    onNext: goNext,
    onPrev: goPrev,
    onClose,
    onToggleSlideshow: togglePlay,
    onViewDetails: handleViewDetails,
  });

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const width = dragRef.current?.offsetWidth ?? window.innerWidth;
      const resolution = resolveProjectedSwipe({
        offset: info.offset.x,
        velocity: info.velocity.x,
        commitDistance: width * COMMIT_FRACTION,
      });

      if (resolution === "none") {
        // Hand the finger's exact release velocity to the spring, so the
        // photo keeps moving at the speed it was let go at.
        animate(x, 0, { ...THROW, velocity: info.velocity.x });
        return;
      }

      // Committing: the photo underneath is swapped and drops to opacity 0
      // (see the load crossfade below), so resetting the offset is invisible.
      x.set(0);
      if (resolution === "next") goNext();
      else goPrev();
    },
    [x, goNext, goPrev]
  );

  useEffect(() => {
    // Loading must reset before the new image can be announced or displayed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
  }, [currentIndex]);

  // A pinch owns both fingers; letting the drag recogniser run at the same
  // time would be two gesture systems fighting over one element.
  const photoPosition = t("lightbox", "position")
    .replace("{current}", String(currentIndex + 1))
    .replace("{total}", String(photos.length));
  const imageAlt = currentPhoto
    ? formatPhotoAccessibleLabel(
        { title: currentPhoto.title ?? "" },
        null,
        currentIndex,
        locale
      )
    : "";

  const canDrag = !isZoomed && !isGesturing;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && currentPhoto && (
          <motion.div
            key="lightbox"
            ref={lightboxRef}
            className="fixed inset-0 z-[100] bg-black/97 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: DISMISS }}
            transition={SETTLE}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={currentPhoto.title || t("lightbox", "dialogLabel")}
            tabIndex={-1}
          >
            {/* Top controls */}
            <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-10 flex items-center gap-2 sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:left-[max(1.5rem,env(safe-area-inset-left))] sm:gap-5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="inline-flex size-11 items-center justify-center font-sans text-eyebrow uppercase text-white/60 hover:text-white transition-colors sm:size-auto"
              >
                <span aria-hidden="true" className="sm:hidden">{isPlaying ? "❚❚" : "▶"}</span>
                <span className="sr-only sm:hidden">
                  {isPlaying ? t("lightbox", "pause") : t("lightbox", "play")}
                </span>
                <span className="hidden sm:inline">
                  <span aria-hidden="true">{isPlaying ? "❚❚ " : "▶ "}</span>
                  {isPlaying ? t("lightbox", "pause") : t("photo", "slideshow")}
                </span>
              </button>
            </div>

            <div
              aria-hidden="true"
              className="absolute top-[max(1.25rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-10 font-sans text-xs uppercase text-white/60 tabular-nums sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:text-eyebrow"
            >
              {String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </div>

            {/* Announces slide changes; silenced during autoplay. */}
            <div
              role="status"
              aria-live={isPlaying ? "off" : "polite"}
              aria-atomic="true"
              className="sr-only"
            >
              {photoPosition}
            </div>

            <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-10 flex items-center gap-1 sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:gap-5">
              <Link
                href={`/photo/${currentPhoto.id}`}
                className="inline-flex size-11 items-center justify-center font-sans text-eyebrow uppercase text-white/60 hover:text-white transition-colors sm:size-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <span aria-hidden="true" className="material-symbols-outlined sm:hidden">info</span>
                <span className="sr-only sm:not-sr-only">{t("lightbox", "viewDetails")}</span>
              </Link>
              <button
                ref={closeButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="inline-flex size-11 items-center justify-center font-sans text-eyebrow uppercase text-white/60 hover:text-white transition-colors sm:size-auto"
              >
                <span aria-hidden="true" className="material-symbols-outlined sm:hidden">close</span>
                <span className="sr-only sm:not-sr-only">{t("lightbox", "close")}</span>
              </button>
            </div>

            {/* Nav controls — minimal chevrons. Deliberately un-animated:
                these are hammered during browsing and via the arrow keys. */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-[max(0.5rem,env(safe-area-inset-left))] top-1/2 z-10 size-11 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-3xl font-thin sm:left-[max(1.5rem,env(safe-area-inset-left))]"
              aria-label={t("lightbox", "previous")}
            >
              ←
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-[max(0.5rem,env(safe-area-inset-right))] top-1/2 z-10 size-11 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-3xl font-thin sm:right-[max(1.5rem,env(safe-area-inset-right))]"
              aria-label={t("lightbox", "next")}
            >
              →
            </button>

            {/* Image */}
            <motion.div
              ref={dragRef}
              className="relative max-w-[92vw] max-h-[85dvh] [@media(max-height:500px)]:max-h-[72dvh] flex items-center justify-center touch-none"
              style={{ x }}
              drag={canDrag ? "x" : false}
              dragDirectionLock
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97, transition: DISMISS }}
              transition={SETTLE}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              {isLoading && (
                <p className="absolute inset-0 flex items-center justify-center font-sans text-eyebrow uppercase text-white/70 animate-pulse">
                  {t("lightbox", "loading")}
                </p>
              )}
              <motion.img
                ref={imageRef}
                src={currentPhoto.src.full}
                alt={imageAlt}
                className="max-w-full max-h-[85dvh] [@media(max-height:500px)]:max-h-[72dvh] object-contain select-none"
                style={{ transformOrigin }}
                animate={{
                  scale,
                  x: position.x,
                  y: position.y,
                  opacity: isLoading ? 0 : 1,
                }}
                transition={{
                  // No transition while fingers drive the transform — a
                  // spring there would lag behind the pinch.
                  default: shouldAnimate ? SETTLE : { duration: 0 },
                  opacity: { duration: 0.3, ease: "easeOut" },
                }}
                onLoad={() => setIsLoading(false)}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            </motion.div>

            {/* Photo caption */}
            <div className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-10 text-center">
              {currentPhoto.title && (
                <p className="font-display text-base text-white mb-1">
                  {currentPhoto.title}
                </p>
              )}
              {(currentPhoto.metadata?.date || location) && (
                <p className="font-sans text-eyebrow uppercase text-white/50">
                  {currentPhoto.metadata?.date}
                  {currentPhoto.metadata?.date && location && (
                      <span className="mx-3 text-white/30">·</span>
                  )}
                  {location}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
