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
    <div className="flex items-center justify-between gap-4 border-b border-surface-border/60 py-5 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-base text-foreground truncate">
            {displayName}
          </span>
          {gallery.featured && (
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-foreground/80">
              Featured
            </span>
          )}
          {gallery.type === "private" && (
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-blue-400/80">
              Private
            </span>
          )}
        </div>
        <p className="truncate font-sans text-xs text-text-muted">
          {gallery.type === "private"
            ? `Lightroom Album · ${gallery.albumId?.slice(0, 8)}…`
            : gallery.url}
        </p>
        {gallery.photoCount !== undefined && (
          <p className="font-sans text-xs text-text-muted/70">
            {gallery.photoCount} photos
            {gallery.lastSynced && (
              <>
                {" "}
                · synced {new Date(gallery.lastSynced).toLocaleString()}
              </>
            )}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-6">
        <button
          onClick={() => onSync(gallery)}
          disabled={disabled || syncing}
          className={`font-sans text-[11px] uppercase tracking-[0.24em] transition-colors disabled:opacity-50 ${
            syncing
              ? "text-foreground animate-pulse"
              : "text-text-muted hover:text-foreground"
          }`}
          aria-label={`Sync ${displayName}`}
          title="Sync this album"
        >
          {syncing ? "Syncing…" : "Sync"}
        </button>
        <button
          onClick={() => onToggleFeatured(gallery, !gallery.featured)}
          disabled={disabled}
          className={`font-sans text-[11px] uppercase tracking-[0.24em] transition-colors disabled:opacity-50 ${
            gallery.featured
              ? "text-foreground"
              : "text-text-muted hover:text-foreground"
          }`}
          aria-label={
            gallery.featured
              ? `Remove ${displayName} from featured`
              : `Add ${displayName} to featured`
          }
          title={gallery.featured ? "Remove from featured" : "Set as featured"}
        >
          {gallery.featured ? "★ Featured" : "Feature"}
        </button>
        <button
          onClick={() => onDelete(gallery)}
          disabled={disabled}
          className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          aria-label={`Remove ${displayName}`}
          title="Remove gallery"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
