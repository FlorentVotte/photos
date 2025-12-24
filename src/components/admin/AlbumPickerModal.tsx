"use client";

import { useEffect, useRef } from "react";
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

  // Prevent body scroll when modal is open
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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <FocusTrap active={open} onEscape={onClose} initialFocus="close">
        <div className="bg-surface-dark rounded-xl border border-surface-border max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-surface-border flex items-center justify-between">
            <h2 id={titleId} className="text-xl font-semibold text-foreground">
              Select Albums to Sync
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                aria-label="Refresh album list"
                title="Refresh album list"
              >
                <span
                  className={`material-symbols-outlined ${loading ? "animate-spin" : ""}`}
                >
                  refresh
                </span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Album list */}
          <div
            className="p-6 overflow-y-auto max-h-[60vh]"
            role="list"
            aria-label="Available Lightroom albums"
          >
            {albums.length === 0 ? (
              <p className="text-text-muted text-center py-8">
                {loading
                  ? "Loading albums..."
                  : "No albums found in your Lightroom catalog"}
              </p>
            ) : (
              <div className="space-y-3">
                {albums.map((album) => {
                  const isAdded = existingAlbumIds.includes(album.id);
                  return (
                    <div
                      key={album.id}
                      role="listitem"
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isAdded
                          ? "bg-primary/10 border-primary/30"
                          : "bg-background-dark border-surface-border"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-foreground font-medium">
                            {album.name}
                          </span>
                          {isAdded && (
                            <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
                              Added
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">
                          {album.assetCount} photos • Updated{" "}
                          {new Date(album.updated).toLocaleDateString()}
                        </p>
                      </div>
                      {!isAdded && (
                        <button
                          onClick={() => onAdd(album)}
                          className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                          aria-label={`Add ${album.name} to galleries`}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-surface-border flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-surface-border text-foreground font-semibold rounded-lg hover:bg-surface-border/80 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
