"use client";

import GalleryListItem, { Gallery } from "./GalleryListItem";

interface GalleryListProps {
  galleries: Gallery[];
  onSync: (gallery: Gallery) => void;
  onDelete: (gallery: Gallery) => void;
  onToggleFeatured: (gallery: Gallery, featured: boolean) => void;
  syncingGalleryId?: string | null;
  disabled?: boolean;
  loading?: boolean;
}

export default function GalleryList({
  galleries,
  onSync,
  onDelete,
  onToggleFeatured,
  syncingGalleryId = null,
  disabled = false,
  loading = false,
}: GalleryListProps) {
  if (loading) {
    return (
      <p
        className="py-6 font-sans text-sm text-text-muted"
        role="status"
        aria-busy="true"
      >
        Loading galleries…
      </p>
    );
  }

  if (galleries.length === 0) {
    return (
      <p className="py-8 text-center font-sans text-sm text-text-muted">
        No galleries configured. Add your first Lightroom gallery above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col" role="list" aria-label="Configured galleries">
      {galleries.map((gallery) => (
        <li key={gallery.id} role="listitem">
          <GalleryListItem
            gallery={gallery}
            onSync={onSync}
            onDelete={onDelete}
            onToggleFeatured={onToggleFeatured}
            syncing={syncingGalleryId === gallery.id}
            disabled={disabled || syncingGalleryId !== null}
          />
        </li>
      ))}
    </ul>
  );
}
