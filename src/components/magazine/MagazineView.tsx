"use client";

import { useLocale } from "@/lib/LocaleContext";
import { Album, Chapter, Photo } from "@/lib/types";
import {
  MagazineContent,
  organizeMagazineContent,
  getLayoutForIndex,
  getAbsolutePhotoIndex,
} from "@/lib/magazine-utils";
import MagazineSectionHeader from "./MagazineSectionHeader";
import MagazineSection from "./MagazineSection";

interface MagazineViewProps {
  album: Album;
  chapters: Chapter[];
  photos: Photo[];
  onEnterSlideshow: (startIndex: number) => void;
}

export default function MagazineView({
  album,
  chapters,
  photos,
  onEnterSlideshow,
}: MagazineViewProps) {
  const { locale } = useLocale();

  // Organize content into sections
  const content: MagazineContent = organizeMagazineContent(chapters, photos);

  // Handle flat layout (no chapters or dates)
  if (content.type === "flat") {
    return (
      <article className="magazine-view max-w-6xl mx-auto">
        {/* Album intro */}
        <header className="py-12 md:py-16 text-center px-4">
          {album.description && (
            <p className="text-xl md:text-2xl text-text-secondary italic max-w-3xl mx-auto leading-relaxed">
              &ldquo;{album.description}&rdquo;
            </p>
          )}
        </header>

        {/* All photos */}
        {content.allPhotos.map((photo, index) => (
          <MagazineSection
            key={photo.id}
            photo={photo}
            layout={getLayoutForIndex(index)}
            onClick={() => onEnterSlideshow(index)}
            index={index}
          />
        ))}
      </article>
    );
  }

  // Render sections (chapters or days)
  return (
    <article className="magazine-view max-w-6xl mx-auto">
      {/* Album intro */}
      <header className="py-12 md:py-16 text-center px-4">
        {album.description && (
          <p className="text-xl md:text-2xl text-text-secondary italic max-w-3xl mx-auto leading-relaxed">
            &ldquo;{album.description}&rdquo;
          </p>
        )}
      </header>

      {content.sections.map((section) => {
        const sectionPhotos =
          section.type === "chapter"
            ? section.chapter.photos
            : section.day.photos;

        // Get narrative for chapter sections
        const narrative =
          section.type === "chapter"
            ? locale === "fr" && section.chapter.narrativeFr
              ? section.chapter.narrativeFr
              : section.chapter.narrative
            : undefined;

        return (
          <section key={`section-${section.index}`}>
            {/* Section header */}
            <MagazineSectionHeader section={section} />

            {/* Section narrative (for chapters) - displayed before photos */}
            {narrative && (
              <div className="max-w-3xl mx-auto px-4 mb-12">
                <p className="text-lg md:text-xl leading-relaxed text-text-secondary first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                  {narrative}
                </p>
              </div>
            )}

            {/* Photos in this section */}
            {sectionPhotos.map((photo, photoIndex) => {
              const absoluteIndex = getAbsolutePhotoIndex(
                content,
                section.index,
                photoIndex
              );

              return (
                <MagazineSection
                  key={photo.id}
                  photo={photo}
                  layout={getLayoutForIndex(photoIndex)}
                  onClick={() => onEnterSlideshow(absoluteIndex)}
                  index={absoluteIndex}
                />
              );
            })}

            {/* Divider between sections */}
            {section.index < content.sections.length - 1 && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-surface-border" />
                  <span className="material-symbols-outlined text-surface-border">
                    more_horiz
                  </span>
                  <div className="h-px w-12 bg-surface-border" />
                </div>
              </div>
            )}
          </section>
        );
      })}
    </article>
  );
}
