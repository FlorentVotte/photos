"use client";

import { useRef, useEffect, useState } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { Photo } from "@/lib/types";
import { MagazineLayout, formatMagazineDate } from "@/lib/magazine-utils";

interface MagazineSectionProps {
  photo: Photo;
  layout: MagazineLayout;
  narrative?: string;
  onClick: () => void;
  index: number;
}

export default function MagazineSection({
  photo,
  layout,
  narrative,
  onClick,
  index,
}: MagazineSectionProps) {
  const { locale, t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const displayDate = formatMagazineDate(photo.metadata.date, locale);
  const hasCaption = photo.caption || photo.description;
  const captionText = photo.caption || photo.description;

  // Metadata component
  const PhotoMetadata = ({ className = "" }: { className?: string }) => (
    <div className={`text-text-muted ${className}`}>
      {displayDate && (
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-base text-primary">
            calendar_month
          </span>
          <span className="text-sm">{displayDate}</span>
        </div>
      )}
      {photo.metadata.city && (
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-base text-primary">
            location_on
          </span>
          <span className="text-sm">
            {photo.metadata.city}
            {photo.metadata.location && `, ${photo.metadata.location}`}
          </span>
        </div>
      )}
      {photo.metadata.camera && (
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span className="material-symbols-outlined text-sm">
            photo_camera
          </span>
          <span>{photo.metadata.camera}</span>
        </div>
      )}
    </div>
  );

  // Caption/narrative component
  const Caption = ({ className = "" }: { className?: string }) => {
    const text = narrative || captionText;
    if (!text) return null;

    return (
      <p
        className={`text-lg md:text-xl leading-relaxed text-text-secondary ${className}`}
        style={{
          // Drop cap on first letter for narratives
          ...(narrative
            ? {}
            : {}),
        }}
      >
        {narrative ? (
          <span className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left first-letter:leading-none">
            {text}
          </span>
        ) : (
          <span className="italic">&ldquo;{text}&rdquo;</span>
        )}
      </p>
    );
  };

  // Image component with click handler
  const PhotoImage = ({ className = "" }: { className?: string }) => (
    <button
      onClick={onClick}
      className={`block overflow-hidden rounded-lg shadow-lg group cursor-pointer ${className}`}
      aria-label={`${t("magazine", "enterSlideshow")} - ${photo.title || `Photo ${index + 1}`}`}
    >
      <img
        src={photo.src.medium}
        alt={photo.title || photo.caption || ""}
        className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading={index < 3 ? "eager" : "lazy"}
      />
    </button>
  );

  // Different layouts
  const renderLayout = () => {
    switch (layout) {
      case "full":
        return (
          <div className="space-y-6">
            <PhotoImage className="w-full max-h-[80vh] object-contain" />
            <div className="max-w-3xl mx-auto px-4">
              <PhotoMetadata className="mb-4" />
              <Caption />
            </div>
          </div>
        );

      case "left":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <PhotoImage className="md:col-span-2" />
            <div className="space-y-4">
              <PhotoMetadata />
              <Caption />
            </div>
          </div>
        );

      case "right":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-4 md:order-1 order-2">
              <PhotoMetadata />
              <Caption />
            </div>
            <PhotoImage className="md:col-span-2 md:order-2 order-1" />
          </div>
        );

      case "center":
      default:
        return (
          <div className="max-w-4xl mx-auto text-center">
            <PhotoImage className="mx-auto" />
            <div className="mt-6 space-y-4">
              <PhotoMetadata className="flex flex-col items-center" />
              <Caption className="max-w-2xl mx-auto" />
            </div>
          </div>
        );
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`
        py-12 md:py-16 px-4 md:px-8 lg:px-12
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      {renderLayout()}
    </section>
  );
}
