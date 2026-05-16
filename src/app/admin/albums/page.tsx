"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { Breadcrumb, SkipLink } from "@/components/admin";

interface Album {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  date?: string;
  coverImage?: string;
  photoCount: number;
  sortOrder?: number;
  featured: boolean;
  lastSynced?: string;
}

interface AlbumPhoto {
  id: string;
  title: string;
  mediumPath: string;
  thumbPath: string;
}

export default function AlbumsEditorPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [saving, setSaving] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [coverPickerAlbum, setCoverPickerAlbum] = useState<Album | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const res = await fetch("/api/albums");
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCoverPicker = async (album: Album) => {
    setCoverPickerAlbum(album);
    setLoadingPhotos(true);
    try {
      const res = await fetch(`/api/albums/${album.id}/photos`);
      const data = await res.json();
      setAlbumPhotos(data.photos || []);
    } catch (error) {
      console.error("Failed to fetch album photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const selectCover = async (photoPath: string) => {
    if (!coverPickerAlbum) return;

    setSaving(true);
    try {
      const res = await fetch("/api/albums", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coverPickerAlbum.id,
          coverImage: photoPath,
        }),
      });

      if (res.ok) {
        setAlbums(
          albums.map((a) =>
            a.id === coverPickerAlbum.id ? { ...a, coverImage: photoPath } : a
          )
        );
        setCoverPickerAlbum(null);
        setAlbumPhotos([]);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update cover");
      }
    } catch (error) {
      console.error("Failed to update cover:", error);
      alert("Failed to update cover");
    } finally {
      setSaving(false);
    }
  };

  const saveAlbum = async () => {
    if (!editingAlbum) return;

    setSaving(true);
    try {
      const res = await fetch("/api/albums", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAlbum.id,
          title: editingAlbum.title,
          subtitle: editingAlbum.subtitle,
          description: editingAlbum.description,
          location: editingAlbum.location,
          date: editingAlbum.date,
        }),
      });

      if (res.ok) {
        setAlbums(
          albums.map((a) => (a.id === editingAlbum.id ? editingAlbum : a))
        );
        setEditingAlbum(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save album");
      }
    } catch (error) {
      console.error("Failed to save album:", error);
      alert("Failed to save album");
    } finally {
      setSaving(false);
    }
  };

  const updateEditingAlbum = (updates: Partial<Album>) => {
    if (editingAlbum) {
      setEditingAlbum({ ...editingAlbum, ...updates });
    }
  };

  const moveAlbum = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= albums.length) return;
    const newAlbums = [...albums];
    const [moved] = newAlbums.splice(fromIndex, 1);
    newAlbums.splice(toIndex, 0, moved);
    setAlbums(newAlbums);
    setHasOrderChanges(true);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveAlbum(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const saveOrder = async () => {
    setSaving(true);
    try {
      const albumOrder = albums.map((a) => a.id);
      const res = await fetch("/api/albums", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumOrder }),
      });

      if (res.ok) {
        setHasOrderChanges(false);
        setReorderMode(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save order");
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border-b border-surface-border bg-transparent py-2 font-sans text-sm text-foreground placeholder-text-muted/40 focus:border-foreground focus:outline-none transition-colors";
  const labelClass =
    "block mb-2 font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted";

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <SkipLink />
      <Header />

      <main id="main-content" className="flex-1 px-6 pt-16 pb-20 md:px-12 md:pt-20">
        <div className="mx-auto max-w-4xl">
          <Breadcrumb
            items={[
              { label: "Admin", href: "/admin" },
              { label: "Album metadata" },
            ]}
          />

          <header className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2 max-w-2xl">
              <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                Admin
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                Album metadata
              </h1>
              <p className="mt-2 font-sans text-base leading-relaxed text-text-muted">
                {reorderMode
                  ? "Drag albums or use arrows to reorder."
                  : "Override synced album information."}
              </p>
            </div>
            <div className="flex items-center gap-8 self-start">
              {reorderMode ? (
                <>
                  <button
                    onClick={() => {
                      setReorderMode(false);
                      setHasOrderChanges(false);
                      fetchAlbums();
                    }}
                    className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveOrder}
                    disabled={saving || !hasOrderChanges}
                    className="group/cta inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{saving ? "Saving…" : "Save order"}</span>
                    <span
                      aria-hidden="true"
                      className="h-px w-8 bg-foreground/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
                    />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setReorderMode(true)}
                  className="group/cta inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                >
                  <span>Reorder</span>
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
                  />
                </button>
              )}
            </div>
          </header>

          {loading ? (
            <p className="py-12 text-center font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted animate-pulse">
              Loading
            </p>
          ) : (
            <ul className="flex flex-col">
              {albums.map((album, index) => (
                <li
                  key={album.id}
                  draggable={reorderMode}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`border-b border-surface-border py-6 transition-opacity ${
                    reorderMode ? "cursor-grab active:cursor-grabbing" : ""
                  } ${draggedIndex === index ? "opacity-40" : ""}`}
                >
                  {editingAlbum?.id === album.id ? (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <label
                            htmlFor={`album-title-${album.id}`}
                            className={labelClass}
                          >
                            Title
                          </label>
                          <input
                            id={`album-title-${album.id}`}
                            type="text"
                            value={editingAlbum.title}
                            onChange={(e) =>
                              updateEditingAlbum({ title: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`album-subtitle-${album.id}`}
                            className={labelClass}
                          >
                            Subtitle
                          </label>
                          <input
                            id={`album-subtitle-${album.id}`}
                            type="text"
                            value={editingAlbum.subtitle || ""}
                            onChange={(e) =>
                              updateEditingAlbum({ subtitle: e.target.value })
                            }
                            placeholder="Optional subtitle"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`album-location-${album.id}`}
                            className={labelClass}
                          >
                            Location
                          </label>
                          <input
                            id={`album-location-${album.id}`}
                            type="text"
                            value={editingAlbum.location || ""}
                            onChange={(e) =>
                              updateEditingAlbum({ location: e.target.value })
                            }
                            placeholder="e.g. Rome, Italy"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`album-date-${album.id}`}
                            className={labelClass}
                          >
                            Date
                          </label>
                          <input
                            id={`album-date-${album.id}`}
                            type="text"
                            value={editingAlbum.date || ""}
                            onChange={(e) =>
                              updateEditingAlbum({ date: e.target.value })
                            }
                            placeholder="e.g. September 2023"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`album-description-${album.id}`}
                          className={labelClass}
                        >
                          Description
                        </label>
                        <textarea
                          id={`album-description-${album.id}`}
                          value={editingAlbum.description || ""}
                          onChange={(e) =>
                            updateEditingAlbum({ description: e.target.value })
                          }
                          placeholder="Write a description for this album…"
                          rows={3}
                          className="w-full border-b border-surface-border bg-transparent py-2 font-sans text-sm text-foreground placeholder-text-muted/40 focus:border-foreground focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-8">
                        <button
                          onClick={() => setEditingAlbum(null)}
                          className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveAlbum}
                          disabled={saving}
                          className="group/cta inline-flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.24em] text-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        >
                          <span>{saving ? "Saving…" : "Save changes"}</span>
                          <span
                            aria-hidden="true"
                            className="h-px w-8 bg-foreground/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
                          />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-5">
                      {reorderMode && (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => moveAlbum(index, index - 1)}
                            disabled={index === 0}
                            className="font-sans text-base text-text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                            aria-label={`Move ${album.title} up`}
                            title="Move up"
                          >
                            ↑
                          </button>
                          <span className="font-sans text-[11px] tabular-nums text-text-muted">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <button
                            onClick={() => moveAlbum(index, index + 1)}
                            disabled={index === albums.length - 1}
                            className="font-sans text-base text-text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                            aria-label={`Move ${album.title} down`}
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => !reorderMode && openCoverPicker(album)}
                        disabled={reorderMode}
                        className="group relative w-20 h-20 shrink-0 overflow-hidden bg-surface-border"
                        title="Change cover"
                      >
                        {album.coverImage ? (
                          <img
                            src={album.coverImage}
                            alt={`${album.title} cover`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-text-muted">
                              No cover
                            </span>
                          </div>
                        )}
                        {!reorderMode && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-foreground">
                              Change
                            </span>
                          </div>
                        )}
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                            {album.title}
                          </h3>
                          {album.featured && (
                            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-foreground/80">
                              Featured
                            </span>
                          )}
                        </div>
                        {album.subtitle && (
                          <p className="font-display italic text-text-muted">
                            {album.subtitle}
                          </p>
                        )}
                        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-text-muted">
                          {album.location || (
                            <span className="text-yellow-400/80">
                              Missing location
                            </span>
                          )}
                          <span className="mx-3 text-text-muted/40">·</span>
                          {album.date || (
                            <span className="text-yellow-400/80">
                              Missing date
                            </span>
                          )}
                          <span className="mx-3 text-text-muted/40">·</span>
                          {album.photoCount} photos
                        </p>
                        {album.description && (
                          <p className="mt-1 font-sans text-sm text-text-muted/80 line-clamp-2">
                            {album.description}
                          </p>
                        )}
                      </div>

                      {!reorderMode && (
                        <div className="flex shrink-0 items-center gap-6">
                          <Link
                            href={`/album/${album.slug}`}
                            className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                            title="View album"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setEditingAlbum(album)}
                            className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                            title="Edit album"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Cover Picker Modal */}
      {coverPickerAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-12">
          <div className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden border border-surface-border bg-background-dark">
            <header className="flex items-center justify-between gap-6 border-b border-surface-border px-8 py-6">
              <div className="flex flex-col gap-1">
                <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                  Cover
                </p>
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  Select cover photo
                </h2>
                <p className="mt-1 font-sans text-xs text-text-muted">
                  Choose a cover for &ldquo;{coverPickerAlbum.title}&rdquo;.
                </p>
              </div>
              <button
                onClick={() => {
                  setCoverPickerAlbum(null);
                  setAlbumPhotos([]);
                }}
                className="font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loadingPhotos ? (
                <p className="py-12 text-center font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted animate-pulse">
                  Loading photos
                </p>
              ) : albumPhotos.length === 0 ? (
                <p className="py-12 text-center font-sans text-sm text-text-muted">
                  No photos found in this album
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {albumPhotos.map((photo) => {
                    const isCurrentCover =
                      coverPickerAlbum.coverImage === photo.mediumPath;
                    return (
                      <button
                        key={photo.id}
                        onClick={() => selectCover(photo.mediumPath)}
                        disabled={saving}
                        className={`group relative aspect-square overflow-hidden transition-all ${
                          isCurrentCover
                            ? "outline outline-2 outline-offset-2 outline-foreground"
                            : ""
                        }`}
                        title={photo.title || "Select as cover"}
                      >
                        <img
                          src={photo.thumbPath || photo.mediumPath}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrentCover && (
                          <div className="absolute inset-0 bg-background-dark/50 flex items-center justify-center">
                            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-foreground">
                              Current
                            </span>
                          </div>
                        )}
                        {!isCurrentCover && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-foreground">
                              Select
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
