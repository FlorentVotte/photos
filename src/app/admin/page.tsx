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

        <main id="main-content" className="flex-1 py-6 md:py-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Album Manager
              </h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-text-muted hover:text-foreground transition-colors flex items-center gap-2"
                aria-label="Logout from admin"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Logout
              </button>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats
              galleries={galleries}
              adobeStatus={adobeStatus}
              lastSync={lastSync}
              loading={loading}
            />

            {/* Add New Album */}
            <AdminSection
              title="Add New Album"
              className="mb-6"
            >
              <div className="space-y-4">
                {/* Browse Lightroom Albums - Primary option */}
                {adobeStatus?.connected ? (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={fetchLightroomAlbums}
                      disabled={loadingAlbums}
                      className="flex-1 px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      aria-label="Browse your Lightroom albums"
                    >
                      {loadingAlbums ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">sync</span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">photo_library</span>
                          Browse Lightroom Albums
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-surface-dark rounded-lg border border-surface-border">
                    <span className="material-symbols-outlined text-text-muted">link_off</span>
                    <span className="text-sm text-text-muted flex-1">
                      Connect Adobe to browse private albums
                    </span>
                    <a
                      href="/api/auth/adobe"
                      className="px-4 py-2 bg-[#FF0000] text-white text-sm font-semibold rounded-lg hover:bg-[#CC0000] transition-colors"
                    >
                      Connect
                    </a>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-surface-border" />
                  <span className="text-xs text-text-muted uppercase">or add by URL</span>
                  <div className="flex-1 h-px bg-surface-border" />
                </div>

                {/* Public URL form */}
                <GalleryForm onSubmit={addGallery} loading={loading} />
              </div>
            </AdminSection>

            {/* Sync Controls */}
            <AdminSection className="mb-6">
              <SyncControls
                onSync={() => triggerSync()}
                progress={syncProgress}
                disabled={loading || galleries.length === 0}
              />
            </AdminSection>

            {/* Gallery List */}
            <AdminSection
              title={`Configured Galleries (${galleries.length})`}
              className="mb-6"
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

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <AdminLinkCard
                title="Album Metadata"
                description="Edit titles, locations, dates"
                href="/admin/albums"
                icon="edit_note"
              />
              <AdminLinkCard
                title="Album Chapters"
                description="Organize photos with narratives"
                href="/admin/chapters"
                icon="auto_stories"
              />
              <AdminLinkCard
                title="Site Settings"
                description="Customize theme and colors"
                href="/admin/settings"
                icon="palette"
              />
            </div>
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
