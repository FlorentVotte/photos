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
      <div className="text-text-muted py-4" role="status" aria-busy="true">
        Loading galleries...
      </div>
    );
  }

  if (galleries.length === 0) {
    return (
      <div className="text-text-muted py-8 text-center">
        No galleries configured. Add your first Lightroom gallery above.
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Configured galleries">
      {galleries.map((gallery) => (
        <div key={gallery.id} role="listitem">
          <GalleryListItem
            gallery={gallery}
            onSync={onSync}
            onDelete={onDelete}
            onToggleFeatured={onToggleFeatured}
            syncing={syncingGalleryId === gallery.id}
            disabled={disabled || syncingGalleryId !== null}
          />
        </div>
      ))}
    </div>
  );
}
