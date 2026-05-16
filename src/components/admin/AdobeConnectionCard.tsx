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
  const getStatusLabel = () => {
    if (!status) return null;
    if (status.connected) return "Connected";
    if (status.configured) return "Not connected";
    return "Not configured";
  };

  const getStatusColor = () => {
    if (!status) return "text-text-muted";
    if (status.connected) return "text-green-400/90";
    if (status.configured) return "text-yellow-400/90";
    return "text-red-400/90";
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-4">
            <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
              Adobe Lightroom API
            </h2>
            <span className={`font-sans text-[11px] uppercase tracking-[0.24em] ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>
          <p className="font-sans text-sm text-text-muted">
            {status?.connected
              ? "Your Adobe account is connected"
              : "Connect your Adobe account to sync photo titles and captions"}
          </p>
          {status?.connected && status.updatedAt && (
            <p className="font-sans text-xs text-text-muted/70">
              Connected on {new Date(status.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
        {status?.connected ? (
          <a
            href="/api/auth/adobe"
            className="group/cta inline-flex items-center gap-3 self-start font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
            aria-label="Reconnect Adobe account"
          >
            <span>Reconnect</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </a>
        ) : (
          <a
            href="/api/auth/adobe"
            className="group/cta inline-flex items-center gap-3 self-start font-sans text-[11px] uppercase tracking-[0.24em] text-foreground hover:text-foreground transition-colors"
            aria-label="Connect Adobe account"
          >
            <span>Connect Adobe</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-foreground/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </a>
        )}
      </div>

      {status && !status.configured && (
        <p className="font-sans text-xs text-text-muted/70 leading-relaxed">
          Requires ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in .env file. Get
          credentials from{" "}
          <a
            href="https://developer.adobe.com/console"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Adobe Developer Console
          </a>
          .
        </p>
      )}

      {status?.connected && (
        <div className="flex flex-col gap-3 border-t border-surface-border pt-6">
          <button
            onClick={onBrowseAlbums}
            disabled={browsingAlbums}
            className="group/cta inline-flex items-center gap-3 self-start font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Browse your Lightroom albums"
          >
            <span>
              {browsingAlbums ? "Loading albums…" : "Browse Lightroom albums"}
            </span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </button>
          <p className="font-sans text-xs text-text-muted/70">
            Add albums directly from your Lightroom catalog (no public sharing
            needed)
          </p>
        </div>
      )}
    </div>
  );
}
