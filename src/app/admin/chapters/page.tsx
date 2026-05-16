"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { Breadcrumb, SkipLink } from "@/components/admin";

interface Photo {
  id: string;
  title: string;
  src: { thumb: string; medium: string };
  albumId: string;
}

interface Chapter {
  id: string;
  title: string;
  titleFr?: string;
  narrative?: string;
  narrativeFr?: string;
  photoIds: string[];
  coverPhotoId?: string;
  featuredPhotoIds?: string[];
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
  const [draggedPhoto, setDraggedPhoto] = useState<{
    photoId: string;
    chapterIndex: number;
  } | null>(null);
  const [reorderMode, setReorderMode] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/albums")
      .then((res) => res.json())
      .then((data) => {
        const albumList = (data.albums || []).map(
          (a: { id: string; slug: string; title?: string }) => ({
            id: a.id,
            slug: a.slug,
            title: a.title || "Untitled",
          })
        );
        setAlbums(albumList);
        if (albumId) setSelectedAlbum(albumId);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [albumId]);

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
      titleFr: `Chapitre ${chapters.length + 1}`,
      narrative: "",
      narrativeFr: "",
      photoIds: [],
      coverPhotoId: undefined,
      featuredPhotoIds: [],
    };
    setChapters([...chapters, newChapter]);
  };

  const toggleFeaturedPhoto = (chapterIndex: number, photoId: string) => {
    const chapter = chapters[chapterIndex];
    const featuredPhotoIds = chapter.featuredPhotoIds || [];
    const newFeaturedIds = featuredPhotoIds.includes(photoId)
      ? featuredPhotoIds.filter((id) => id !== photoId)
      : [...featuredPhotoIds, photoId];
    updateChapter(chapterIndex, { featuredPhotoIds: newFeaturedIds });
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
    } catch {
      alert("Failed to save chapters");
    }
    setSaving(false);
  };

  const getUnassignedPhotos = () => {
    const assignedIds = new Set(chapters.flatMap((c) => c.photoIds));
    return photos.filter((p) => !assignedIds.has(p.id));
  };

  const handleDragStart = (chapterIndex: number, photoId: string) => {
    setDraggedPhoto({ photoId, chapterIndex });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (chapterIndex: number, targetPhotoId: string) => {
    if (!draggedPhoto || draggedPhoto.chapterIndex !== chapterIndex) {
      setDraggedPhoto(null);
      return;
    }

    const chapter = chapters[chapterIndex];
    const photoIds = [...chapter.photoIds];
    const fromIndex = photoIds.indexOf(draggedPhoto.photoId);
    const toIndex = photoIds.indexOf(targetPhotoId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      photoIds.splice(fromIndex, 1);
      photoIds.splice(toIndex, 0, draggedPhoto.photoId);
      updateChapter(chapterIndex, { photoIds });
    }
    setDraggedPhoto(null);
  };

  const movePhotoInChapter = (
    chapterIndex: number,
    photoIndex: number,
    direction: "up" | "down"
  ) => {
    const chapter = chapters[chapterIndex];
    const photoIds = [...chapter.photoIds];
    const newIndex = direction === "up" ? photoIndex - 1 : photoIndex + 1;

    if (newIndex < 0 || newIndex >= photoIds.length) return;

    [photoIds[photoIndex], photoIds[newIndex]] = [
      photoIds[newIndex],
      photoIds[photoIndex],
    ];
    updateChapter(chapterIndex, { photoIds });
  };

  const inputClass =
    "w-full border-b border-surface-border bg-transparent py-2 font-sans text-foreground placeholder-text-muted/40 focus:border-foreground focus:outline-none transition-colors";
  const labelClass =
    "block mb-2 font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted";

  return (
    <main id="main-content" className="flex-1 px-6 pt-16 pb-20 md:px-12 md:pt-20">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Chapter editor" },
          ]}
        />

        <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2 max-w-2xl">
            <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
              Admin
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Chapter editor
            </h1>
          </div>
          {selectedAlbum && (
            <button
              onClick={saveChapters}
              disabled={saving}
              className="group/cta inline-flex items-center gap-3 self-start font-sans text-[11px] uppercase tracking-[0.24em] text-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <span>{saving ? "Saving…" : "Save chapters"}</span>
              <span
                aria-hidden="true"
                className="h-px w-8 bg-foreground/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
              />
            </button>
          )}
        </header>

        {/* Album selector */}
        <div className="mb-12 flex flex-col gap-2 border-b border-surface-border pb-4">
          <label htmlFor="album-select" className={labelClass}>
            Select album
          </label>
          <select
            id="album-select"
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="w-full bg-transparent py-2 font-display text-xl text-foreground focus:outline-none"
          >
            <option value="">Choose an album…</option>
            {albums.map((album) => (
              <option
                key={album.id}
                value={album.id}
                className="bg-background-dark text-foreground"
              >
                {album.title}
              </option>
            ))}
          </select>
        </div>

        {selectedAlbum && !loading && (
          <>
            <div className="flex flex-col gap-16 mb-12">
              {chapters.map((chapter, index) => (
                <article
                  key={chapter.id}
                  className="flex flex-col gap-8 border-t border-surface-border pt-10"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                        Chapter {String(index + 1).padStart(2, "0")}
                      </p>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div>
                          <label className={labelClass}>English</label>
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) =>
                              updateChapter(index, { title: e.target.value })
                            }
                            placeholder="Chapter title"
                            className={`${inputClass} font-display text-xl font-semibold tracking-tight`}
                          />
                          <textarea
                            value={chapter.narrative || ""}
                            onChange={(e) =>
                              updateChapter(index, { narrative: e.target.value })
                            }
                            placeholder="Write a narrative for this chapter…"
                            rows={3}
                            className={`${inputClass} mt-3 resize-none text-text-muted`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Français</label>
                          <input
                            type="text"
                            value={chapter.titleFr || ""}
                            onChange={(e) =>
                              updateChapter(index, { titleFr: e.target.value })
                            }
                            placeholder="Titre du chapitre"
                            className={`${inputClass} font-display text-xl font-semibold tracking-tight`}
                          />
                          <textarea
                            value={chapter.narrativeFr || ""}
                            onChange={(e) =>
                              updateChapter(index, {
                                narrativeFr: e.target.value,
                              })
                            }
                            placeholder="Écrivez un récit pour ce chapitre…"
                            rows={3}
                            className={`${inputClass} mt-3 resize-none text-text-muted`}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeChapter(index)}
                      className="shrink-0 font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-red-400 transition-colors"
                      aria-label="Remove chapter"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Photos */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                        Photos · {chapter.photoIds.length}
                      </h4>
                      {chapter.photoIds.length > 1 && (
                        <button
                          onClick={() =>
                            setReorderMode(reorderMode === index ? null : index)
                          }
                          className={`font-sans text-[11px] uppercase tracking-[0.24em] transition-colors ${
                            reorderMode === index
                              ? "text-foreground"
                              : "text-text-muted hover:text-foreground"
                          }`}
                        >
                          {reorderMode === index ? "Done" : "Reorder"}
                        </button>
                      )}
                    </div>

                    {reorderMode === index ? (
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {chapter.photoIds.map((photoId, photoIndex) => {
                          const photo = photos.find((p) => p.id === photoId);
                          if (!photo) return null;
                          const isDragging = draggedPhoto?.photoId === photoId;
                          return (
                            <div
                              key={photoId}
                              draggable
                              onDragStart={() => handleDragStart(index, photoId)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(index, photoId)}
                              className={`relative aspect-square overflow-hidden outline outline-2 outline-offset-2 outline-foreground cursor-grab active:cursor-grabbing transition-all ${
                                isDragging ? "opacity-40" : ""
                              }`}
                            >
                              <img
                                src={photo.src.thumb}
                                alt={photo.title}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <span className="absolute top-1 left-1 bg-background-dark/80 px-1.5 py-0.5 font-sans text-[10px] tabular-nums text-foreground">
                                {String(photoIndex + 1).padStart(2, "0")}
                              </span>
                              <div className="absolute bottom-1 right-1 flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePhotoInChapter(index, photoIndex, "up");
                                  }}
                                  disabled={photoIndex === 0}
                                  className="bg-background-dark/80 px-1.5 py-0.5 font-sans text-xs text-foreground disabled:opacity-30"
                                  aria-label="Move left"
                                >
                                  ←
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePhotoInChapter(index, photoIndex, "down");
                                  }}
                                  disabled={photoIndex === chapter.photoIds.length - 1}
                                  className="bg-background-dark/80 px-1.5 py-0.5 font-sans text-xs text-foreground disabled:opacity-30"
                                  aria-label="Move right"
                                >
                                  →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {photos.map((photo) => {
                          const isSelected = chapter.photoIds.includes(photo.id);
                          const photoIndex = chapter.photoIds.indexOf(photo.id);
                          return (
                            <button
                              key={photo.id}
                              onClick={() => togglePhotoInChapter(index, photo.id)}
                              className={`relative aspect-square overflow-hidden transition-all ${
                                isSelected
                                  ? "outline outline-2 outline-offset-2 outline-foreground"
                                  : "opacity-40 hover:opacity-80"
                              }`}
                            >
                              <img
                                src={photo.src.thumb}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <span className="absolute top-1 left-1 bg-background-dark/80 px-1.5 py-0.5 font-sans text-[10px] tabular-nums text-foreground">
                                  {String(photoIndex + 1).padStart(2, "0")}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Cover photo */}
                  {chapter.photoIds.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-surface-border pt-6">
                      <h4 className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                        Cover photo
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
                              className={`relative w-20 h-20 shrink-0 overflow-hidden transition-all ${
                                isCover
                                  ? "outline outline-2 outline-offset-2 outline-foreground"
                                  : "opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={photo.src.thumb}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                              />
                              {isCover && (
                                <div className="absolute inset-0 bg-background-dark/40 flex items-center justify-center">
                                  <span className="font-sans text-[9px] uppercase tracking-[0.24em] text-foreground">
                                    Cover
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="font-sans text-xs text-text-muted/70">
                        {chapter.coverPhotoId
                          ? "Click again to remove cover photo"
                          : "Click a photo to set it as the chapter cover"}
                      </p>
                    </div>
                  )}

                  {/* Featured photos */}
                  {chapter.photoIds.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-surface-border pt-6">
                      <h4 className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                        Featured photos (large display)
                        {(chapter.featuredPhotoIds?.length || 0) > 0 && (
                          <span className="ml-3 text-foreground">
                            · {chapter.featuredPhotoIds?.length} selected
                          </span>
                        )}
                      </h4>
                      <p className="font-sans text-xs text-text-muted/70">
                        Select photos to display larger in the grid. They will
                        alternate left/right positioning.
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {chapter.photoIds.map((photoId) => {
                          const photo = photos.find((p) => p.id === photoId);
                          if (!photo) return null;
                          const featuredIndex = (
                            chapter.featuredPhotoIds || []
                          ).indexOf(photoId);
                          const isFeatured = featuredIndex !== -1;
                          return (
                            <button
                              key={photoId}
                              onClick={() => toggleFeaturedPhoto(index, photoId)}
                              className={`relative w-20 h-20 shrink-0 overflow-hidden transition-all ${
                                isFeatured
                                  ? "outline outline-2 outline-offset-2 outline-yellow-500/80"
                                  : "opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={photo.src.thumb}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                              />
                              {isFeatured && (
                                <span className="absolute top-1 left-1 bg-yellow-500/90 px-1.5 py-0.5 font-sans text-[10px] tabular-nums text-background-dark">
                                  ★ {featuredIndex + 1}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Add chapter */}
            <button
              onClick={addChapter}
              className="group/cta inline-flex w-full items-center justify-center gap-3 border-t border-b border-dashed border-surface-border py-6 font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <span>+ Add chapter</span>
            </button>

            {/* Unassigned photos */}
            {getUnassignedPhotos().length > 0 && (
              <section className="mt-16 flex flex-col gap-4 border-t border-surface-border pt-8">
                <div className="flex flex-col gap-1">
                  <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
                    Unassigned · {getUnassignedPhotos().length}
                  </p>
                  <p className="font-sans text-sm text-text-muted">
                    These photos are not in any chapter. Use the photo grid
                    above to add them.
                  </p>
                </div>
                <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                  {getUnassignedPhotos().map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square overflow-hidden opacity-50"
                    >
                      <img
                        src={photo.src.thumb}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {loading && selectedAlbum && (
          <p className="py-12 text-center font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted animate-pulse">
            Loading
          </p>
        )}
      </div>
    </main>
  );
}

export default function ChaptersEditorPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <SkipLink />
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted animate-pulse">
              Loading
            </p>
          </div>
        }
      >
        <ChaptersEditorContent />
      </Suspense>
    </div>
  );
}
