"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";

interface Gallery {
  url: string;
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

export default function AdminPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: "idle" });
  const [loading, setLoading] = useState(true);

  // Fetch current galleries on load
  useEffect(() => {
    fetchGalleries();
  }, []);

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

  const removeGallery = async (url: string) => {
    if (!confirm("Are you sure you want to remove this gallery?")) return;

    try {
      const res = await fetch("/api/galleries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        fetchGalleries();
      }
    } catch (error) {
      console.error("Failed to remove gallery:", error);
    }
  };

  const toggleFeatured = async (url: string, featured: boolean) => {
    try {
      const res = await fetch("/api/galleries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, featured }),
      });

      if (res.ok) {
        fetchGalleries();
      }
    } catch (error) {
      console.error("Failed to update gallery:", error);
    }
  };

  const triggerSync = async () => {
    setSyncStatus({ status: "syncing", message: "Syncing albums..." });

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
                        <span className="text-white font-medium truncate">
                          {gallery.title || "Untitled Album"}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate">{gallery.url}</p>
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
                        onClick={() => toggleFeatured(gallery.url, !gallery.featured)}
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
                        onClick={() => removeGallery(gallery.url)}
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

          {/* Adobe API Connection */}
          <section className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Adobe Lightroom API</h2>
                <p className="text-sm text-text-muted">
                  Connect your Adobe account to sync photo titles and captions
                </p>
              </div>
              <a
                href="/api/auth/adobe"
                className="px-6 py-3 bg-[#FF0000] text-white font-semibold rounded-lg hover:bg-[#CC0000] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">link</span>
                Connect Adobe
              </a>
            </div>
            <p className="mt-4 text-xs text-text-muted/70">
              Requires ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in .env file.
              Get credentials from <a href="https://developer.adobe.com/console" target="_blank" rel="noopener" className="text-primary hover:underline">Adobe Developer Console</a>.
            </p>
          </section>

          {/* Help */}
          <section className="mt-8 p-6 bg-surface-dark/50 rounded-xl border border-surface-border/50">
            <h3 className="text-lg font-semibold text-white mb-3">How to add albums</h3>
            <ol className="list-decimal list-inside space-y-2 text-text-muted text-sm">
              <li>Open Lightroom CC on web or desktop</li>
              <li>Select the album you want to share</li>
              <li>Click "Share" and enable "Allow public access"</li>
              <li>Copy the share link (full URL or short adobe.ly link)</li>
              <li>Paste it above and click "Add Gallery"</li>
              <li>Click "Sync Now" to download the photos</li>
            </ol>
            <p className="mt-4 text-xs text-text-muted/70">
              Both formats work: <code className="bg-surface-border/50 px-1 rounded">https://lightroom.adobe.com/shares/...</code> and <code className="bg-surface-border/50 px-1 rounded">https://adobe.ly/...</code>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
