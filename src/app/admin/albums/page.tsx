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
        // Update local state
        setAlbums(albums.map((a) =>
          a.id === coverPickerAlbum.id ? { ...a, coverImage: photoPath } : a
        ));
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
        // Update local state
        setAlbums(albums.map((a) =>
          a.id === editingAlbum.id ? editingAlbum : a
        ));
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveAlbum(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <SkipLink />
      <Header />

      <main id="main-content" className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Breadcrumb
                items={[
                  { label: "Admin", href: "/admin" },
                  { label: "Album Metadata" },
                ]}
              />
              <h1 className="text-3xl font-bold text-foreground">Album Metadata</h1>
              <p className="text-text-muted mt-1">
                {reorderMode ? "Drag albums or use arrows to reorder" : "Override synced album information"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {reorderMode ? (
                <>
                  <button
                    onClick={() => {
                      setReorderMode(false);
                      setHasOrderChanges(false);
                      fetchAlbums(); // Reset order
                    }}
                    className="px-4 py-2 text-text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveOrder}
                    disabled={saving || !hasOrderChanges}
                    className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? "Saving..." : "Save Order"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setReorderMode(true)}
                  className="px-4 py-2 bg-surface-border text-foreground rounded-lg hover:bg-surface-border/80 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">swap_vert</span>
                  Reorder
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : (
            <div className="space-y-4">
              {albums.map((album, index) => (
                <div
                  key={album.id}
                  draggable={reorderMode}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-surface-dark rounded-xl p-6 border border-surface-border transition-all ${
                    reorderMode ? "cursor-grab active:cursor-grabbing" : ""
                  } ${draggedIndex === index ? "opacity-50 scale-[0.98]" : ""}`}
                >
                  {editingAlbum?.id === album.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`album-title-${album.id}`}
                            className="block text-xs text-text-muted mb-1 uppercase tracking-wider"
                          >
                            Title
                          </label>
                          <input
                            id={`album-title-${album.id}`}
                            type="text"
                            value={editingAlbum.title}
                            onChange={(e) => updateEditingAlbum({ title: e.target.value })}
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-foreground"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`album-subtitle-${album.id}`}
                            className="block text-xs text-text-muted mb-1 uppercase tracking-wider"
                          >
                            Subtitle
                          </label>
                          <input
                            id={`album-subtitle-${album.id}`}
                            type="text"
                            value={editingAlbum.subtitle || ""}
                            onChange={(e) => updateEditingAlbum({ subtitle: e.target.value })}
                            placeholder="Optional subtitle"
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-foreground placeholder-text-muted/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor={`album-location-${album.id}`}
                            className="block text-xs text-text-muted mb-1 uppercase tracking-wider"
                          >
                            Location
                          </label>
                          <input
                            id={`album-location-${album.id}`}
                            type="text"
                            value={editingAlbum.location || ""}
                            onChange={(e) => updateEditingAlbum({ location: e.target.value })}
                            placeholder="e.g., Rome, Italy"
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-foreground placeholder-text-muted/50"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`album-date-${album.id}`}
                            className="block text-xs text-text-muted mb-1 uppercase tracking-wider"
                          >
                            Date
                          </label>
                          <input
                            id={`album-date-${album.id}`}
                            type="text"
                            value={editingAlbum.date || ""}
                            onChange={(e) => updateEditingAlbum({ date: e.target.value })}
                            placeholder="e.g., September 2023"
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-foreground placeholder-text-muted/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`album-description-${album.id}`}
                          className="block text-xs text-text-muted mb-1 uppercase tracking-wider"
                        >
                          Description
                        </label>
                        <textarea
                          id={`album-description-${album.id}`}
                          value={editingAlbum.description || ""}
                          onChange={(e) => updateEditingAlbum({ description: e.target.value })}
                          placeholder="Write a description for this album..."
                          rows={3}
                          className="w-full px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-foreground placeholder-text-muted/50 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => setEditingAlbum(null)}
                          className="px-4 py-2 text-text-muted hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveAlbum}
                          disabled={saving}
                          className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start gap-4">
                      {reorderMode && (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => moveAlbum(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 text-text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                            aria-label={`Move ${album.title} up`}
                            title="Move up"
                          >
                            <span className="material-symbols-outlined">arrow_upward</span>
                          </button>
                          <span className="text-text-muted text-sm font-medium">{index + 1}</span>
                          <button
                            onClick={() => moveAlbum(index, index + 1)}
                            disabled={index === albums.length - 1}
                            className="p-1 text-text-muted hover:text-foreground disabled:opacity-30 transition-colors"
                            aria-label={`Move ${album.title} down`}
                            title="Move down"
                          >
                            <span className="material-symbols-outlined">arrow_downward</span>
                          </button>
                        </div>
                      )}
                      {/* Cover thumbnail */}
                      <button
                        onClick={() => !reorderMode && openCoverPicker(album)}
                        disabled={reorderMode}
                        className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-border group"
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
                            <span className="material-symbols-outlined text-2xl text-text-muted">image</span>
                          </div>
                        )}
                        {!reorderMode && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined text-foreground">photo_camera</span>
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{album.title}</h3>
                          {album.featured && (
                            <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        {album.subtitle && (
                          <p className="text-text-muted italic mb-2">{album.subtitle}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            {album.location || <span className="text-yellow-500">Missing</span>}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">calendar_month</span>
                            {album.date || <span className="text-yellow-500">Missing</span>}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">photo_camera</span>
                            {album.photoCount} photos
                          </span>
                        </div>
                        {album.description && (
                          <p className="mt-3 text-gray-400 text-sm line-clamp-2">
                            {album.description}
                          </p>
                        )}
                      </div>
                      {!reorderMode && (
                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/album/${album.slug}`}
                            className="p-2 text-text-muted hover:text-foreground transition-colors"
                            title="View album"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </Link>
                          <button
                            onClick={() => setEditingAlbum(album)}
                            className="p-2 text-text-muted hover:text-primary transition-colors"
                            title="Edit album"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cover Picker Modal */}
      {coverPickerAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-surface-dark rounded-xl border border-surface-border w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Select Cover Photo
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  Choose a cover for &quot;{coverPickerAlbum.title}&quot;
                </p>
              </div>
              <button
                onClick={() => {
                  setCoverPickerAlbum(null);
                  setAlbumPhotos([]);
                }}
                className="p-2 text-text-muted hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingPhotos ? (
                <div className="flex items-center justify-center py-12">
                  <span className="material-symbols-outlined text-4xl text-text-muted animate-spin">
                    sync
                  </span>
                </div>
              ) : albumPhotos.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  No photos found in this album
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {albumPhotos.map((photo) => {
                    const isCurrentCover = coverPickerAlbum.coverImage === photo.mediumPath;
                    return (
                      <button
                        key={photo.id}
                        onClick={() => selectCover(photo.mediumPath)}
                        disabled={saving}
                        className={`relative aspect-square rounded-lg overflow-hidden group transition-all ${
                          isCurrentCover
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-dark"
                            : "hover:ring-2 hover:ring-white/50"
                        }`}
                        title={photo.title || "Select as cover"}
                      >
                        <img
                          src={photo.thumbPath || photo.mediumPath}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrentCover && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">
                              check_circle
                            </span>
                          </div>
                        )}
                        {!isCurrentCover && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined text-foreground">
                              check
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
