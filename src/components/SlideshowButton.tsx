"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";

interface Photo {
  id: string;
  title: string;
  src: { thumb: string; medium: string; full: string };
  metadata: {
    date?: string;
    location?: string;
  };
}

interface SlideshowButtonProps {
  photos: Photo[];
  currentIndex: number;
}

export default function SlideshowButton({
  photos,
  currentIndex,
}: SlideshowButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(currentIndex);

  const handleOpen = () => {
    setPhotoIndex(currentIndex);
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-surface-border rounded-lg text-white hover:border-primary hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-xl">slideshow</span>
        <span className="text-sm font-medium">Slideshow</span>
      </button>

      <Lightbox
        photos={photos}
        currentIndex={photoIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={setPhotoIndex}
      />
    </>
  );
}
