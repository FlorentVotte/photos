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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Sync Albums
          </h2>
          <p className="text-sm text-text-muted">
            Download photos from all configured Lightroom galleries
          </p>
        </div>
        <button
          onClick={onSync}
          disabled={disabled || isSyncing}
          aria-busy={isSyncing}
          aria-describedby={isSyncing ? "sync-progress" : undefined}
          className={`px-6 py-3 font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            isSyncing
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-primary text-black hover:bg-primary/90"
          }`}
        >
          {isSyncing ? (
            <>
              <span className="material-symbols-outlined animate-spin">
                sync
              </span>
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

      {progress && (progress.status === "syncing" || progress.message) && (
        <div id="sync-progress">
          <SyncProgressBar progress={progress} />
        </div>
      )}
    </div>
  );
}
