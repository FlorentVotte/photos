"use client";

import { SyncProgress } from "@/lib/sync-progress";
import SyncProgressBar from "./SyncProgressBar";

interface SyncControlsProps {
  onSync: () => void;
  progress: SyncProgress | null;
  disabled?: boolean;
}

export default function SyncControls({
  onSync,
  progress,
  disabled = false,
}: SyncControlsProps) {
  const isSyncing = progress?.status === "syncing";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            Sync albums
          </h2>
          <p className="font-sans text-sm text-text-muted">
            Download photos from all configured Lightroom galleries
          </p>
        </div>
        <button
          onClick={onSync}
          disabled={disabled || isSyncing}
          aria-busy={isSyncing}
          aria-describedby={isSyncing ? "sync-progress" : undefined}
          className="group/cta inline-flex items-center gap-3 self-start font-sans text-[11px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSyncing ? "Syncing…" : "Sync now"}</span>
          <span
            aria-hidden="true"
            className={`h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground ${
              isSyncing ? "animate-pulse" : ""
            }`}
          />
        </button>
      </div>

      {progress && (progress.status === "syncing" || progress.message) && (
        <div id="sync-progress">
          <SyncProgressBar progress={progress} />
        </div>
      )}
    </div>
  );
}
