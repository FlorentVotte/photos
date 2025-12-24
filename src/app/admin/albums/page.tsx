"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";

interface Album {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  date?: string;
  photoCount: number;
  sortOrder?: number;
  featured: boolean;
  lastSynced?: string;
}

export default function AlbumsEditorPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [saving, setSaving] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);

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
      <Header />

      <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin" className="text-text-muted hover:text-primary text-sm mb-2 inline-block">
                &larr; Back to Admin
              </Link>
              <h1 className="text-3xl font-bold text-white">Album Metadata</h1>
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
                    className="px-4 py-2 text-text-muted hover:text-white transition-colors"
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
                  className="px-4 py-2 bg-surface-border text-white rounded-lg hover:bg-surface-border/80 transition-colors flex items-center gap-2"
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
                          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingAlbum.title}
                            onChange={(e) => updateEditingAlbum({ title: e.target.value })}
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={editingAlbum.subtitle || ""}
                            onChange={(e) => updateEditingAlbum({ subtitle: e.target.value })}
                            placeholder="Optional subtitle"
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-white placeholder-text-muted/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                            Location
                          </label>
                          <input
                            type="text"
                            value={editingAlbum.location || ""}
                            onChange={(e) => updateEditingAlbum({ location: e.target.value })}
                            placeholder="e.g., Rome, Italy"
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-white placeholder-text-muted/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                            Date
                          </label>
                          <input
                            type="text"
                            value={editingAlbum.date || ""}
                            onChange={(e) => updateEditingAlbum({ date: e.target.value })}
                            placeholder="e.g., September 2023"
                            className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-white placeholder-text-muted/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                          Description
                        </label>
                        <textarea
                          value={editingAlbum.description || ""}
                          onChange={(e) => updateEditingAlbum({ description: e.target.value })}
                          placeholder="Write a description for this album..."
                          rows={3}
                          className="w-full px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-white placeholder-text-muted/50 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => setEditingAlbum(null)}
                          className="px-4 py-2 text-text-muted hover:text-white transition-colors"
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
                    <div className="flex items-start justify-between">
                      {reorderMode && (
                        <div className="flex flex-col items-center mr-4 gap-1">
                          <button
                            onClick={() => moveAlbum(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 text-text-muted hover:text-white disabled:opacity-30 transition-colors"
                            title="Move up"
                          >
                            <span className="material-symbols-outlined">arrow_upward</span>
                          </button>
                          <span className="text-text-muted text-sm font-medium">{index + 1}</span>
                          <button
                            onClick={() => moveAlbum(index, index + 1)}
                            disabled={index === albums.length - 1}
                            className="p-1 text-text-muted hover:text-white disabled:opacity-30 transition-colors"
                            title="Move down"
                          >
                            <span className="material-symbols-outlined">arrow_downward</span>
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{album.title}</h3>
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
                            className="p-2 text-text-muted hover:text-white transition-colors"
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
    </div>
  );
}
