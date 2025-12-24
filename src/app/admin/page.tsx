"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";

interface Gallery {
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

interface SyncStatus {
  status: "idle" | "syncing" | "success" | "error";
  message?: string;
  lastSync?: string;
}

interface AdobeStatus {
  configured: boolean;
  connected: boolean;
  expiresAt: string | null;
  updatedAt: string | null;
}

interface LightroomAlbum {
  id: string;
  name: string;
  created: string;
  updated: string;
  assetCount: number;
}

export default function AdminPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: "idle" });
  const [loading, setLoading] = useState(true);
  const [adobeStatus, setAdobeStatus] = useState<AdobeStatus | null>(null);
  const [lightroomAlbums, setLightroomAlbums] = useState<LightroomAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [syncingGalleryId, setSyncingGalleryId] = useState<string | null>(null);

  // Fetch current galleries and Adobe status on load
  useEffect(() => {
    fetchGalleries();
    fetchAdobeStatus();
  }, []);

  const fetchAdobeStatus = async () => {
    try {
      const res = await fetch("/api/auth/adobe/status");
      const data = await res.json();
      setAdobeStatus(data);
    } catch (error) {
      console.error("Failed to fetch Adobe status:", error);
    }
  };

  const fetchLightroomAlbums = async () => {
    setLoadingAlbums(true);
    try {
      // Add cache-busting parameter to force fresh data
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
        // Don't close the picker so user can add more
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add album");
      }
    } catch (error) {
      console.error("Failed to add album:", error);
      alert("Failed to add album");
    }
  };

  const fetchGalleries = async () => {
    try {
      const res = await fetch("/api/galleries");
      const data = await res.json();
      setGalleries(data.galleries || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
      setLoading(false);
    }
  };

  const addGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    // Validate URL format (accept both full URLs and adobe.ly short links)
    if (!newUrl.includes("lightroom.adobe.com/shares/") && !newUrl.includes("adobe.ly/")) {
      alert("Please enter a valid Lightroom share URL (https://lightroom.adobe.com/shares/... or https://adobe.ly/...)");
      return;
    }

    try {
      const res = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim(), featured: isFeatured }),
      });

      if (res.ok) {
        setNewUrl("");
        setIsFeatured(false);
        fetchGalleries();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to add gallery");
      }
    } catch (error) {
      console.error("Failed to add gallery:", error);
      alert("Failed to add gallery");
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

  const triggerSync = async () => {
    setSyncStatus({ status: "syncing", message: "Syncing all albums..." });

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setSyncStatus({
          status: "success",
          message: `Synced ${data.albums} albums with ${data.photos} photos`,
          lastSync: new Date().toISOString(),
        });
        fetchGalleries();
      } else {
        setSyncStatus({
          status: "error",
          message: data.error || "Sync failed",
        });
      }
    } catch (error) {
      setSyncStatus({
        status: "error",
        message: "Failed to connect to sync service",
      });
    }
  };

  const syncGallery = async (gallery: Gallery) => {
    setSyncingGalleryId(gallery.id);
    setSyncStatus({ status: "syncing", message: `Syncing ${gallery.title || gallery.albumName || "album"}...` });

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryId: gallery.id }),
      });
      const data = await res.json();

      if (res.ok) {
        setSyncStatus({
          status: "success",
          message: `Successfully synced ${gallery.title || gallery.albumName || "album"}`,
          lastSync: new Date().toISOString(),
        });
        fetchGalleries();
      } else {
        setSyncStatus({
          status: "error",
          message: data.error || "Sync failed",
        });
      }
    } catch (error) {
      setSyncStatus({
        status: "error",
        message: "Failed to connect to sync service",
      });
    } finally {
      setSyncingGalleryId(null);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      <main className="flex-1 py-6 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Album Manager</h1>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>

          {/* Add New Gallery */}
          <section className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Album</h2>
            <form onSubmit={addGallery} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-2">
                  Lightroom Gallery URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://lightroom.adobe.com/shares/... or https://adobe.ly/..."
                  className="w-full px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="featured" className="text-sm text-text-muted">
                  Set as featured album (shown on homepage hero)
                </label>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Gallery
              </button>
            </form>
          </section>

          {/* Sync Controls */}
          <section className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Sync Albums</h2>
                <p className="text-sm text-text-muted">
                  Download photos from all configured Lightroom galleries
                </p>
              </div>
              <button
                onClick={triggerSync}
                disabled={syncStatus.status === "syncing"}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  syncStatus.status === "syncing"
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-primary text-black hover:bg-primary/90"
                }`}
              >
                {syncStatus.status === "syncing" ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">sync</span>
                    Sync Now
                  </>
                )}
              </button>
            </div>
            {syncStatus.message && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm ${
                  syncStatus.status === "success"
                    ? "bg-green-900/30 text-green-400 border border-green-800"
                    : syncStatus.status === "error"
                    ? "bg-red-900/30 text-red-400 border border-red-800"
                    : "bg-blue-900/30 text-blue-400 border border-blue-800"
                }`}
              >
                {syncStatus.message}
              </div>
            )}
          </section>

          {/* Gallery List */}
          <section className="bg-surface-dark rounded-xl p-6 border border-surface-border">
            <h2 className="text-xl font-semibold text-white mb-4">
              Configured Galleries ({galleries.length})
            </h2>

            {loading ? (
              <div className="text-text-muted">Loading...</div>
            ) : galleries.length === 0 ? (
              <div className="text-text-muted py-8 text-center">
                No galleries configured. Add your first Lightroom gallery above.
              </div>
            ) : (
              <div className="space-y-3">
                {galleries.map((gallery, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-background-dark rounded-lg border border-surface-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {gallery.featured && (
                          <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">
                            Featured
                          </span>
                        )}
                        {gallery.type === "private" && (
                          <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 border border-blue-800 rounded">
                            Private
                          </span>
                        )}
                        <span className="text-white font-medium truncate">
                          {gallery.title || gallery.albumName || "Untitled Album"}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate">
                        {gallery.type === "private"
                          ? `Lightroom Album: ${gallery.albumId?.slice(0, 8)}...`
                          : gallery.url}
                      </p>
                      {gallery.photoCount !== undefined && (
                        <p className="text-xs text-text-muted mt-1">
                          {gallery.photoCount} photos
                          {gallery.lastSynced && (
                            <> • Last synced: {new Date(gallery.lastSynced).toLocaleString()}</>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => syncGallery(gallery)}
                        disabled={syncingGalleryId !== null || syncStatus.status === "syncing"}
                        className={`p-2 rounded-lg transition-colors ${
                          syncingGalleryId === gallery.id
                            ? "text-primary"
                            : "text-text-muted hover:text-primary hover:bg-primary/10"
                        } disabled:opacity-50`}
                        title="Sync this album"
                      >
                        <span className={`material-symbols-outlined ${syncingGalleryId === gallery.id ? "animate-spin" : ""}`}>
                          sync
                        </span>
                      </button>
                      <button
                        onClick={() => toggleFeatured(gallery, !gallery.featured)}
                        className={`p-2 rounded-lg transition-colors ${
                          gallery.featured
                            ? "text-primary hover:bg-primary/10"
                            : "text-text-muted hover:bg-surface-border"
                        }`}
                        title={gallery.featured ? "Remove from featured" : "Set as featured"}
                      >
                        <span className="material-symbols-outlined">
                          {gallery.featured ? "star" : "star_outline"}
                        </span>
                      </button>
                      <button
                        onClick={() => removeGallery(gallery)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove gallery"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Album Metadata Editor Link */}
          <section className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Album Metadata</h2>
                <p className="text-sm text-text-muted">
                  Override album titles, locations, dates, and descriptions
                </p>
              </div>
              <a
                href="/admin/albums"
                className="px-6 py-3 bg-surface-border text-white font-semibold rounded-lg hover:bg-surface-border/80 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">edit_note</span>
                Edit Metadata
              </a>
            </div>
          </section>

          {/* Chapter Editor Link */}
          <section className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Album Chapters</h2>
                <p className="text-sm text-text-muted">
                  Organize photos into chapters with narrative text
                </p>
              </div>
              <a
                href="/admin/chapters"
                className="px-6 py-3 bg-surface-border text-white font-semibold rounded-lg hover:bg-surface-border/80 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">auto_stories</span>
                Edit Chapters
              </a>
            </div>
          </section>

          {/* Site Settings Link */}
          <section className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Site Settings</h2>
                <p className="text-sm text-text-muted">
                  Customize theme, colors, and appearance
                </p>
              </div>
              <a
                href="/admin/settings"
                className="px-6 py-3 bg-surface-border text-white font-semibold rounded-lg hover:bg-surface-border/80 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">palette</span>
                Site Settings
              </a>
            </div>
          </section>

          {/* Adobe API Connection */}
          <section className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                  Adobe Lightroom API
                  {adobeStatus && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        adobeStatus.connected
                          ? "bg-green-900/30 text-green-400 border border-green-800"
                          : adobeStatus.configured
                          ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                          : "bg-red-900/30 text-red-400 border border-red-800"
                      }`}
                    >
                      {adobeStatus.connected
                        ? "Connected"
                        : adobeStatus.configured
                        ? "Not connected"
                        : "Not configured"}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-text-muted">
                  {adobeStatus?.connected
                    ? "Your Adobe account is connected"
                    : "Connect your Adobe account to sync photo titles and captions"}
                </p>
                {adobeStatus?.connected && adobeStatus.updatedAt && (
                  <p className="text-xs text-text-muted mt-1">
                    Connected on: {new Date(adobeStatus.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <a
                href="/api/auth/adobe"
                className={`px-6 py-3 font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  adobeStatus?.connected
                    ? "bg-surface-border text-white hover:bg-surface-border/80"
                    : "bg-[#FF0000] text-white hover:bg-[#CC0000]"
                }`}
              >
                <span className="material-symbols-outlined">
                  {adobeStatus?.connected ? "refresh" : "link"}
                </span>
                {adobeStatus?.connected ? "Reconnect" : "Connect Adobe"}
              </a>
            </div>
            {!adobeStatus?.configured && (
              <p className="mt-4 text-xs text-text-muted/70">
                Requires ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in .env file.
                Get credentials from <a href="https://developer.adobe.com/console" target="_blank" rel="noopener" className="text-primary hover:underline">Adobe Developer Console</a>.
              </p>
            )}

            {/* Browse Albums Button - shown when connected */}
            {adobeStatus?.connected && (
              <div className="mt-4 pt-4 border-t border-surface-border">
                <button
                  onClick={fetchLightroomAlbums}
                  disabled={loadingAlbums}
                  className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingAlbums ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      Loading albums...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">photo_library</span>
                      Browse Lightroom Albums
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-text-muted">
                  Add albums directly from your Lightroom catalog (no public sharing needed)
                </p>
              </div>
            )}
          </section>

          {/* Album Picker Modal */}
          {showAlbumPicker && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-surface-dark rounded-xl border border-surface-border max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-surface-border flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Select Albums to Sync
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchLightroomAlbums}
                      disabled={loadingAlbums}
                      className="p-2 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                      title="Refresh album list"
                    >
                      <span className={`material-symbols-outlined ${loadingAlbums ? "animate-spin" : ""}`}>
                        refresh
                      </span>
                    </button>
                    <button
                      onClick={() => setShowAlbumPicker(false)}
                      className="p-2 text-text-muted hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {lightroomAlbums.length === 0 ? (
                    <p className="text-text-muted text-center py-8">
                      No albums found in your Lightroom catalog
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {lightroomAlbums.map((album) => {
                        const isAdded = galleries.some(
                          (g) => g.albumId === album.id
                        );
                        return (
                          <div
                            key={album.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              isAdded
                                ? "bg-primary/10 border-primary/30"
                                : "bg-background-dark border-surface-border"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">
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
                                onClick={() => addPrivateAlbum(album)}
                                className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
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
                <div className="p-6 border-t border-surface-border flex justify-end">
                  <button
                    onClick={() => setShowAlbumPicker(false)}
                    className="px-6 py-2 bg-surface-border text-white font-semibold rounded-lg hover:bg-surface-border/80 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Help */}
          <section className="mt-8 p-6 bg-surface-dark/50 rounded-xl border border-surface-border/50">
            <h3 className="text-lg font-semibold text-white mb-3">How to add albums</h3>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-primary mb-2">Option 1: Private Albums (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-1 text-text-muted text-sm">
                <li>Connect your Adobe account above</li>
                <li>Click "Browse Lightroom Albums"</li>
                <li>Select the albums you want to sync</li>
                <li>Click "Sync Now" to download the photos</li>
              </ol>
              <p className="mt-2 text-xs text-text-muted/70">
                This method gives you full metadata including titles and captions.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-muted mb-2">Option 2: Public Share Links</h4>
              <ol className="list-decimal list-inside space-y-1 text-text-muted text-sm">
                <li>Open Lightroom CC and select an album</li>
                <li>Click "Share" and enable "Allow public access"</li>
                <li>Copy the share link and paste it above</li>
                <li>Click "Sync Now" to download the photos</li>
              </ol>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
