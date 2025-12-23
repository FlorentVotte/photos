"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

interface Photo {
  id: string;
  title: string;
  src: { thumb: string; medium: string };
  albumId: string;
}

interface Chapter {
  id: string;
  title: string;
  narrative?: string;
  photoIds: string[];
  coverPhotoId?: string;
}

interface Album {
  id: string;
  slug: string;
  title: string;
}

function ChaptersEditorContent() {
  const searchParams = useSearchParams();
  const albumId = searchParams.get("album");

  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>(albumId || "");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load albums list
  useEffect(() => {
    fetch("/api/galleries")
      .then((res) => res.json())
      .then((data) => {
        const albumList = data.galleries.map((g: any) => ({
          id: g.url.split("/").pop(),
          slug: g.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "",
          title: g.title || "Untitled",
        }));
        setAlbums(albumList);
        if (albumId) setSelectedAlbum(albumId);
        setLoading(false);
      });
  }, [albumId]);

  // Load chapters and photos when album changes
  useEffect(() => {
    if (!selectedAlbum) return;

    setLoading(true);
    fetch(`/api/chapters?albumId=${selectedAlbum}`)
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.photos || []);
        setChapters(data.chapters || []);
        setLoading(false);
      });
  }, [selectedAlbum]);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${chapters.length + 1}`,
      narrative: "",
      photoIds: [],
      coverPhotoId: undefined,
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (index: number, updates: Partial<Chapter>) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], ...updates };
    setChapters(updated);
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const togglePhotoInChapter = (chapterIndex: number, photoId: string) => {
    const chapter = chapters[chapterIndex];
    const photoIds = chapter.photoIds.includes(photoId)
      ? chapter.photoIds.filter((id) => id !== photoId)
      : [...chapter.photoIds, photoId];
    updateChapter(chapterIndex, { photoIds });
  };

  const saveChapters = async () => {
    setSaving(true);
    try {
      await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId: selectedAlbum, chapters }),
      });
      alert("Chapters saved!");
    } catch (error) {
      alert("Failed to save chapters");
    }
    setSaving(false);
  };

  const getUnassignedPhotos = () => {
    const assignedIds = new Set(chapters.flatMap((c) => c.photoIds));
    return photos.filter((p) => !assignedIds.has(p.id));
  };

  return (
    <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-text-muted hover:text-primary text-sm mb-2 inline-block">
              &larr; Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-white">Chapter Editor</h1>
          </div>
          {selectedAlbum && (
            <button
              onClick={saveChapters}
              disabled={saving}
              className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Chapters"}
            </button>
          )}
        </div>

        {/* Album Selector */}
        <div className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
          <label className="block text-sm text-text-muted mb-2">Select Album</label>
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="w-full px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-white"
          >
            <option value="">Choose an album...</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>

        {selectedAlbum && !loading && (
          <>
            {/* Chapters List */}
            <div className="space-y-6 mb-8">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="bg-surface-dark rounded-xl p-6 border border-surface-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => updateChapter(index, { title: e.target.value })}
                        placeholder="Chapter title"
                        className="w-full px-4 py-2 bg-background-dark border border-surface-border rounded-lg text-white text-xl font-bold mb-3"
                      />
                      <textarea
                        value={chapter.narrative || ""}
                        onChange={(e) => updateChapter(index, { narrative: e.target.value })}
                        placeholder="Write a narrative for this chapter..."
                        rows={3}
                        className="w-full px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-text-muted resize-none"
                      />
                    </div>
                    <button
                      onClick={() => removeChapter(index)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                  {/* Chapter Photos */}
                  <div className="mt-4">
                    <h4 className="text-sm text-text-muted mb-3">
                      Photos in this chapter ({chapter.photoIds.length})
                    </h4>
                    <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                      {photos.map((photo) => {
                        const isSelected = chapter.photoIds.includes(photo.id);
                        return (
                          <button
                            key={photo.id}
                            onClick={() => togglePhotoInChapter(index, photo.id)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-transparent opacity-40 hover:opacity-70"
                            }`}
                          >
                            <img
                              src={photo.src.thumb}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cover Photo Selector */}
                  {chapter.photoIds.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-surface-border">
                      <h4 className="text-sm text-text-muted mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">photo_library</span>
                        Cover Photo
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {chapter.photoIds.map((photoId) => {
                          const photo = photos.find((p) => p.id === photoId);
                          if (!photo) return null;
                          const isCover = chapter.coverPhotoId === photoId;
                          return (
                            <button
                              key={photoId}
                              onClick={() =>
                                updateChapter(index, {
                                  coverPhotoId: isCover ? undefined : photoId,
                                })
                              }
                              className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                                isCover
                                  ? "border-primary ring-2 ring-primary/30"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={photo.src.thumb}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                              />
                              {isCover && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-white text-lg drop-shadow-md">
                                    check_circle
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-text-muted/70 mt-2">
                        {chapter.coverPhotoId
                          ? "Click again to remove cover photo"
                          : "Click a photo to set it as the chapter cover"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Chapter Button */}
            <button
              onClick={addChapter}
              className="w-full py-4 border-2 border-dashed border-surface-border rounded-xl text-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Chapter
            </button>

            {/* Unassigned Photos */}
            {getUnassignedPhotos().length > 0 && (
              <div className="mt-8 p-6 bg-surface-dark/50 rounded-xl border border-surface-border/50">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Unassigned Photos ({getUnassignedPhotos().length})
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  These photos are not in any chapter. Click a photo above to add it to a chapter.
                </p>
                <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                  {getUnassignedPhotos().map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-lg overflow-hidden opacity-50"
                    >
                      <img
                        src={photo.src.thumb}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {loading && selectedAlbum && (
          <div className="text-center py-12 text-text-muted">Loading...</div>
        )}
      </div>
    </main>
  );
}

export default function ChaptersEditorPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-muted">Loading...</div>
        </div>
      }>
        <ChaptersEditorContent />
      </Suspense>
    </div>
  );
}
