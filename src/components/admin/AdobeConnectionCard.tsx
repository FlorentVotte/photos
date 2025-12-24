"use client";

export interface AdobeStatus {
  configured: boolean;
  connected: boolean;
  expiresAt: string | null;
  updatedAt: string | null;
}

interface AdobeConnectionCardProps {
  status: AdobeStatus | null;
  onBrowseAlbums: () => void;
  browsingAlbums?: boolean;
}

export default function AdobeConnectionCard({
  status,
  onBrowseAlbums,
  browsingAlbums = false,
}: AdobeConnectionCardProps) {
  const getStatusBadge = () => {
    if (!status) return null;

    if (status.connected) {
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-green-900/30 text-green-400 border border-green-800">
          Connected
        </span>
      );
    }
    if (status.configured) {
      return (
        <span className="px-2 py-0.5 text-xs rounded bg-yellow-900/30 text-yellow-400 border border-yellow-800">
          Not connected
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs rounded bg-red-900/30 text-red-400 border border-red-800">
        Not configured
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
            Adobe Lightroom API
            {getStatusBadge()}
          </h2>
          <p className="text-sm text-text-muted">
            {status?.connected
              ? "Your Adobe account is connected"
              : "Connect your Adobe account to sync photo titles and captions"}
          </p>
          {status?.connected && status.updatedAt && (
            <p className="text-xs text-text-muted mt-1">
              Connected on: {new Date(status.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <a
          href="/api/auth/adobe"
          className={`px-6 py-3 font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            status?.connected
              ? "bg-surface-border text-foreground hover:bg-surface-border/80"
              : "bg-[#FF0000] text-foreground hover:bg-[#CC0000]"
          }`}
          aria-label={
            status?.connected
              ? "Reconnect Adobe account"
              : "Connect Adobe account"
          }
        >
          <span className="material-symbols-outlined">
            {status?.connected ? "refresh" : "link"}
          </span>
          {status?.connected ? "Reconnect" : "Connect Adobe"}
        </a>
      </div>

      {/* Configuration hint */}
      {status && !status.configured && (
        <p className="text-xs text-text-muted/70">
          Requires ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in .env file. Get
          credentials from{" "}
          <a
            href="https://developer.adobe.com/console"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Adobe Developer Console
          </a>
          .
        </p>
      )}

      {/* Browse albums when connected */}
      {status?.connected && (
        <div className="pt-4 border-t border-surface-border">
          <button
            onClick={onBrowseAlbums}
            disabled={browsingAlbums}
            className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            aria-label="Browse your Lightroom albums"
          >
            {browsingAlbums ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  sync
                </span>
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
            Add albums directly from your Lightroom catalog (no public sharing
            needed)
          </p>
        </div>
      )}
    </div>
  );
}
