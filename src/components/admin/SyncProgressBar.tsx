"use client";

import {
  SyncProgress,
  calculateOverallProgress,
  formatProgressMessage,
} from "@/lib/sync-progress";

interface SyncProgressBarProps {
  progress: SyncProgress;
}

export default function SyncProgressBar({ progress }: SyncProgressBarProps) {
  const percentage = calculateOverallProgress(progress);
  const message = formatProgressMessage(progress);

  const statusColor =
    progress.status === "completed"
      ? "text-green-400/90"
      : progress.status === "error"
      ? "text-red-400/90"
      : "text-text-muted";

  return (
    <div
      className="border-t border-b border-surface-border bg-surface-dark/40 p-5"
      role="status"
      aria-live="polite"
      aria-busy={progress.status === "syncing"}
    >
      {progress.status === "syncing" && (
        <div className="mb-3">
          <div className="mb-2 flex items-baseline justify-between gap-4 font-sans text-[11px] uppercase tracking-[0.24em]">
            <span className="text-text-muted truncate">
              {progress.currentGalleryName || "Initializing…"}
            </span>
            <span className="text-foreground tabular-nums">
              {Math.round(percentage)}%
            </span>
          </div>
          <div
            className="h-px w-full bg-surface-border overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Sync progress"
          >
            <div
              className="h-full bg-foreground transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      <p className={`font-sans text-sm ${statusColor}`}>
        {progress.status === "syncing" && (
          <span aria-hidden="true" className="mr-2 animate-pulse">
            ●
          </span>
        )}
        {message}
      </p>

      {progress.status === "syncing" && progress.currentPhotoName && (
        <p className="mt-1 truncate font-sans text-xs text-text-muted/70">
          Processing: {progress.currentPhotoName}
        </p>
      )}
    </div>
  );
}
