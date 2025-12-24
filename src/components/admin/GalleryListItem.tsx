"use client";

export interface Gallery {
  id: string;
  url?: string;
  albumId?: string;
  albumName?: string;
  type?: "public" | "private";
  featured: boolean;
  title?: string;
  photoCount?: number;
  lastSynced?: string;
}

interface GalleryListItemProps {
  gallery: Gallery;
  onSync: (gallery: Gallery) => void;
  onDelete: (gallery: Gallery) => void;
  onToggleFeatured: (gallery: Gallery, featured: boolean) => void;
  syncing?: boolean;
  disabled?: boolean;
}

export default function GalleryListItem({
  gallery,
  onSync,
  onDelete,
  onToggleFeatured,
  syncing = false,
  disabled = false,
}: GalleryListItemProps) {
  const displayName = gallery.title || gallery.albumName || "Untitled Album";

  return (
    <div className="flex items-center justify-between p-4 bg-background-dark rounded-lg border border-surface-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {gallery.featured && (
            <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
              Featured
            </span>
          )}
          {gallery.type === "private" && (
            <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 border border-blue-800 rounded">
              Private
            </span>
          )}
          <span className="text-foreground font-medium truncate">
            {displayName}
          </span>
        </div>
        <p className="text-xs text-text-muted truncate">
          {gallery.type === "private"
            ? `Lightroom Album: ${gallery.albumId?.slice(0, 8)}...`
            : gallery.url}
        </p>
        {gallery.photoCount !== undefined && (
          <p className="text-xs text-text-muted mt-1">
            {gallery.photoCount} photos
            {gallery.lastSynced && (
              <> • Last synced: {new Date(gallery.lastSynced).toLocaleString()}</>
            )}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => onSync(gallery)}
          disabled={disabled || syncing}
          className={`p-2 rounded-lg transition-colors ${
            syncing
              ? "text-primary"
              : "text-text-muted hover:text-primary hover:bg-primary/10"
          } disabled:opacity-50`}
          aria-label={`Sync ${displayName}`}
          title="Sync this album"
        >
          <span
            className={`material-symbols-outlined ${syncing ? "animate-spin" : ""}`}
          >
            sync
          </span>
        </button>
        <button
          onClick={() => onToggleFeatured(gallery, !gallery.featured)}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors ${
            gallery.featured
              ? "text-primary hover:bg-primary/10"
              : "text-text-muted hover:bg-surface-border"
          } disabled:opacity-50`}
          aria-label={
            gallery.featured
              ? `Remove ${displayName} from featured`
              : `Add ${displayName} to featured`
          }
          title={gallery.featured ? "Remove from featured" : "Set as featured"}
        >
          <span className="material-symbols-outlined">
            {gallery.featured ? "star" : "star_outline"}
          </span>
        </button>
        <button
          onClick={() => onDelete(gallery)}
          disabled={disabled}
          className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          aria-label={`Remove ${displayName}`}
          title="Remove gallery"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}
