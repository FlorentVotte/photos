"use client";

import { SyncProgress, calculateOverallProgress, formatProgressMessage } from "@/lib/sync-progress";

interface SyncProgressBarProps {
  progress: SyncProgress;
}

export default function SyncProgressBar({ progress }: SyncProgressBarProps) {
  const percentage = calculateOverallProgress(progress);
  const message = formatProgressMessage(progress);

  const getStatusColor = () => {
    switch (progress.status) {
      case "completed":
        return {
          bg: "bg-green-900/30",
          border: "border-green-800",
          text: "text-green-400",
          bar: "bg-green-500",
        };
      case "error":
        return {
          bg: "bg-red-900/30",
          border: "border-red-800",
          text: "text-red-400",
          bar: "bg-red-500",
        };
      case "syncing":
        return {
          bg: "bg-blue-900/30",
          border: "border-blue-800",
          text: "text-blue-400",
          bar: "bg-primary",
        };
      default:
        return {
          bg: "bg-surface-dark",
          border: "border-surface-border",
          text: "text-text-muted",
          bar: "bg-primary",
        };
    }
  };

  const colors = getStatusColor();

  return (
    <div
      className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
      role="status"
      aria-live="polite"
      aria-busy={progress.status === "syncing"}
    >
      {/* Progress bar */}
      {progress.status === "syncing" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={colors.text}>
              {progress.currentGalleryName || "Initializing..."}
            </span>
            <span className={colors.text}>{Math.round(percentage)}%</span>
          </div>
          <div
            className="h-2 bg-background-dark rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Sync progress"
          >
            <div
              className={`h-full ${colors.bar} transition-all duration-300 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Status message */}
      <div className="flex items-center gap-2">
        {progress.status === "syncing" && (
          <span className="material-symbols-outlined animate-spin text-sm">
            sync
          </span>
        )}
        {progress.status === "completed" && (
          <span className="material-symbols-outlined text-sm text-green-400">
            check_circle
          </span>
        )}
        {progress.status === "error" && (
          <span className="material-symbols-outlined text-sm text-red-400">
            error
          </span>
        )}
        <span className={`text-sm ${colors.text}`}>{message}</span>
      </div>

      {/* Detailed progress for syncing */}
      {progress.status === "syncing" && progress.currentPhotoName && (
        <p className="mt-2 text-xs text-text-muted truncate">
          Processing: {progress.currentPhotoName}
        </p>
      )}
    </div>
  );
}
