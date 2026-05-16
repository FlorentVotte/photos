"use client";

import { useEffect } from "react";
import FocusTrap from "./FocusTrap";

export interface LightroomAlbum {
  id: string;
  name: string;
  created: string;
  updated: string;
  assetCount: number;
}

interface AlbumPickerModalProps {
  open: boolean;
  onClose: () => void;
  albums: LightroomAlbum[];
  existingAlbumIds: string[];
  onAdd: (album: LightroomAlbum, featured?: boolean) => Promise<void>;
  onRefresh: () => void;
  loading?: boolean;
}

export default function AlbumPickerModal({
  open,
  onClose,
  albums,
  existingAlbumIds,
  onAdd,
  onRefresh,
  loading = false,
}: AlbumPickerModalProps) {
  const titleId = "album-picker-title";

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <FocusTrap active={open} onEscape={onClose} initialFocus="close">
        <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden border border-surface-border bg-background-dark">
          <header className="flex items-center justify-between gap-6 border-b border-surface-border px-8 py-6">
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                Lightroom
              </p>
              <h2
                id={titleId}
                className="font-display text-xl font-semibold tracking-tight text-foreground"
              >
                Select albums to sync
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="Refresh album list"
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button
                onClick={onClose}
                className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
          </header>

          <div
            className="max-h-[60vh] overflow-y-auto px-8 py-2"
            role="list"
            aria-label="Available Lightroom albums"
          >
            {albums.length === 0 ? (
              <p className="py-12 text-center font-sans text-sm text-text-muted">
                {loading
                  ? "Loading albums…"
                  : "No albums found in your Lightroom catalog"}
              </p>
            ) : (
              <ul className="flex flex-col">
                {albums.map((album) => {
                  const isAdded = existingAlbumIds.includes(album.id);
                  return (
                    <li
                      key={album.id}
                      role="listitem"
                      className="flex items-center justify-between gap-4 border-b border-surface-border/60 py-4 last:border-b-0"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-baseline gap-3">
                          <span className="font-display text-base text-foreground truncate">
                            {album.name}
                          </span>
                          {isAdded && (
                            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-text-muted shrink-0">
                              Added
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-text-muted">
                          {album.assetCount} photos · updated{" "}
                          {new Date(album.updated).toLocaleDateString()}
                        </p>
                      </div>
                      {!isAdded && (
                        <button
                          onClick={() => onAdd(album)}
                          className="group/cta inline-flex shrink-0 items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                          aria-label={`Add ${album.name} to galleries`}
                        >
                          <span>Add</span>
                          <span
                            aria-hidden="true"
                            className="h-px w-6 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-10 group-hover/cta:bg-foreground"
                          />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className="border-t border-surface-border px-8 py-5">
            <button
              onClick={onClose}
              className="group/cta inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
            >
              <span>Done</span>
              <span
                aria-hidden="true"
                className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
              />
            </button>
          </footer>
        </div>
      </FocusTrap>
    </div>
  );
}
