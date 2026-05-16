"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import {
  AdminSection,
  AdminLinkCard,
  AlbumPickerModal,
  DashboardStats,
  GalleryForm,
  GalleryList,
  LiveRegionProvider,
  SkipLink,
  SyncControls,
} from "@/components/admin";
import type { Gallery, AdobeStatus, LightroomAlbum } from "@/components/admin";
import type { SyncProgress } from "@/lib/sync-progress";
import { createInitialProgress } from "@/lib/sync-progress";

export default function AdminPage() {
  // State
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [adobeStatus, setAdobeStatus] = useState<AdobeStatus | null>(null);
  const [lightroomAlbums, setLightroomAlbums] = useState<LightroomAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [syncingGalleryId, setSyncingGalleryId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Ref for EventSource cleanup
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchGalleries();
    fetchAdobeStatus();
    fetchSyncStatus();

    return () => {
      // Cleanup EventSource on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch("/api/galleries");
      const data = await res.json();
      setGalleries(data.galleries || []);
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdobeStatus = async () => {
    try {
      const res = await fetch("/api/auth/adobe/status");
      const data = await res.json();
      setAdobeStatus(data);
    } catch (error) {
      console.error("Failed to fetch Adobe status:", error);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      setLastSync(data.lastUpdated);
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
    }
  };

  const fetchLightroomAlbums = async () => {
    setLoadingAlbums(true);
    try {
      const res = await fetch(`/api/adobe/albums?t=${Date.now()}`);
      const data = await res.json();
      if (data.albums) {
        setLightroomAlbums(data.albums);
        setShowAlbumPicker(true);
      } else {
        alert(data.error || "Failed to fetch albums");
      }
    } catch (error) {
      console.error("Failed to fetch Lightroom albums:", error);
      alert("Failed to fetch albums from Adobe");
    } finally {
      setLoadingAlbums(false);
    }
  };

  // Gallery actions
  const addGallery = async (url: string, featured: boolean) => {
    const res = await fetch("/api/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, featured }),
    });

    if (res.ok) {
      fetchGalleries();
    } else {
      const error = await res.json();
      alert(error.message || "Failed to add gallery");
    }
  };

  const addPrivateAlbum = async (album: LightroomAlbum, featured: boolean = false) => {
    try {
      const res = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "private",
          albumId: album.id,
          albumName: album.name,
          featured,
        }),
      });

      if (res.ok) {
        fetchGalleries();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add album");
      }
    } catch (error) {
      console.error("Failed to add album:", error);
      alert("Failed to add album");
    }
  };

  const removeGallery = async (gallery: Gallery) => {
    if (!confirm("Are you sure you want to remove this gallery?")) return;

    try {
      const res = await fetch("/api/galleries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          gallery.type === "private"
            ? { albumId: gallery.albumId }
            : { url: gallery.url }
        ),
      });

      if (res.ok) {
        fetchGalleries();
      }
    } catch (error) {
      console.error("Failed to remove gallery:", error);
    }
  };

  const toggleFeatured = async (gallery: Gallery, featured: boolean) => {
    try {
      const res = await fetch("/api/galleries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          gallery.type === "private"
            ? { albumId: gallery.albumId, featured }
            : { url: gallery.url, featured }
        ),
      });

      if (res.ok) {
        fetchGalleries();
      }
    } catch (error) {
      console.error("Failed to update gallery:", error);
    }
  };

  // Sync with SSE progress streaming
  const triggerSync = useCallback(async (galleryId?: string) => {
    // Close any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (galleryId) {
      setSyncingGalleryId(galleryId);
    }

    setSyncProgress({
      ...createInitialProgress(),
      status: "syncing",
      message: "Starting sync...",
    });

    try {
      // Use fetch with POST to start the SSE stream
      const response = await fetch("/api/sync/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: galleryId ? JSON.stringify({ galleryId }) : "{}",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Sync failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Read the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const progress = JSON.parse(line.slice(6)) as SyncProgress;
              setSyncProgress(progress);

              if (progress.status === "completed" || progress.status === "error") {
                fetchGalleries();
                fetchSyncStatus();
              }
            } catch {
              // Invalid JSON, skip
            }
          }
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncProgress({
        ...createInitialProgress(),
        status: "error",
        message: error instanceof Error ? error.message : "Sync failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSyncingGalleryId(null);
    }
  }, []);

  const syncGallery = useCallback(
    (gallery: Gallery) => {
      triggerSync(gallery.id);
    },
    [triggerSync]
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <LiveRegionProvider>
      <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
        <SkipLink />
        <Header />

        <main id="main-content" className="flex-1 px-6 pt-16 pb-20 md:px-12 md:pt-20">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-2">
                <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
                  Admin
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                  Album Manager
                </h1>
              </div>
              <button
                onClick={handleLogout}
                className="group/cta inline-flex items-center gap-3 self-start font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
                aria-label="Logout from admin"
              >
                <span>Logout</span>
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
                />
              </button>
            </header>

            {/* Dashboard Stats */}
            <DashboardStats
              galleries={galleries}
              adobeStatus={adobeStatus}
              lastSync={lastSync}
              loading={loading}
            />

            {/* Add New Album */}
            <div className="mb-16">
              <AdminSection title="Add new album">
                <div className="flex flex-col gap-6">
                  {/* Browse Lightroom — primary option */}
                  {adobeStatus?.connected ? (
                    <button
                      onClick={fetchLightroomAlbums}
                      disabled={loadingAlbums}
                      className="group/cta inline-flex items-center gap-3 self-start font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors disabled:opacity-50"
                      aria-label="Browse your Lightroom albums"
                    >
                      <span>
                        {loadingAlbums ? "Loading…" : "Browse Lightroom"}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground ${
                          loadingAlbums ? "animate-pulse" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 border-t border-b border-surface-border py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-sans text-sm text-text-muted">
                        Connect Adobe to browse private albums
                      </p>
                      <a
                        href="/api/auth/adobe"
                        className="group/cta inline-flex shrink-0 items-center gap-3 font-sans text-[12px] uppercase tracking-[0.24em] text-foreground hover:text-foreground transition-colors"
                      >
                        <span>Connect</span>
                        <span
                          aria-hidden="true"
                          className="h-px w-8 bg-foreground/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
                        />
                      </a>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-6 py-2">
                    <div className="h-px flex-1 bg-surface-border" />
                    <span className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
                      or add by URL
                    </span>
                    <div className="h-px flex-1 bg-surface-border" />
                  </div>

                  {/* Public URL form */}
                  <GalleryForm onSubmit={addGallery} loading={loading} />
                </div>
              </AdminSection>
            </div>

            {/* Quick links */}
            <div className="mb-16">
              <p className="mb-2 font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
                More
              </p>
              <div className="flex flex-col">
                <AdminLinkCard
                  title="Album metadata"
                  description="Edit titles, locations, dates"
                  href="/admin/albums"
                  icon="edit_note"
                />
                <AdminLinkCard
                  title="Album chapters"
                  description="Organize photos with narratives"
                  href="/admin/chapters"
                  icon="auto_stories"
                />
                <AdminLinkCard
                  title="Site settings"
                  description="Customize theme and colors"
                  href="/admin/settings"
                  icon="palette"
                />
              </div>
            </div>

            {/* Sync Controls */}
            <div className="mb-16">
              <SyncControls
                onSync={() => triggerSync()}
                progress={syncProgress}
                disabled={loading || galleries.length === 0}
              />
            </div>

            {/* Gallery List */}
            <AdminSection
              title={`Configured galleries (${galleries.length})`}
            >
              <GalleryList
                galleries={galleries}
                onSync={syncGallery}
                onDelete={removeGallery}
                onToggleFeatured={toggleFeatured}
                syncingGalleryId={syncingGalleryId}
                disabled={syncProgress?.status === "syncing"}
                loading={loading}
              />
            </AdminSection>
          </div>
        </main>

        {/* Album Picker Modal */}
        <AlbumPickerModal
          open={showAlbumPicker}
          onClose={() => setShowAlbumPicker(false)}
          albums={lightroomAlbums}
          existingAlbumIds={galleries.map((g) => g.albumId).filter(Boolean) as string[]}
          onAdd={addPrivateAlbum}
          onRefresh={fetchLightroomAlbums}
          loading={loadingAlbums}
        />
      </div>
    </LiveRegionProvider>
  );
}
