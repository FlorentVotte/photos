"use client";

import type { Gallery } from "./GalleryListItem";
import type { AdobeStatus } from "./AdobeConnectionCard";

interface DashboardStatsProps {
  galleries: Gallery[];
  adobeStatus: AdobeStatus | null;
  lastSync: string | null;
  loading?: boolean;
}

interface StatProps {
  label: string;
  value: string | number;
  subtext?: string;
  state?: "success" | "warning" | "error" | "neutral";
}

function Stat({ label, value, subtext, state = "neutral" }: StatProps) {
  const stateClass = {
    success: "text-foreground",
    warning: "text-yellow-400/90",
    error: "text-red-400/90",
    neutral: "text-foreground",
  }[state];

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-sans text-label uppercase text-text-muted">
        {label}
      </span>
      <span className={`font-display text-2xl md:text-3xl font-semibold tabular-nums leading-none ${stateClass}`}>
        {value}
      </span>
      {subtext && (
        <span className="font-sans text-xs text-text-muted truncate">
          {subtext}
        </span>
      )}
    </div>
  );
}

export default function DashboardStats({
  galleries,
  adobeStatus,
  lastSync,
  loading = false,
}: DashboardStatsProps) {
  const totalPhotos = galleries.reduce((sum, g) => sum + (g.photoCount || 0), 0);
  const featuredCount = galleries.filter((g) => g.featured).length;

  const formatLastSync = () => {
    if (!lastSync) return "Never";
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getAdobeStatusInfo = () => {
    if (!adobeStatus) return { state: "neutral" as const, text: "Loading…" };
    if (adobeStatus.connected) return { state: "success" as const, text: "Connected" };
    if (adobeStatus.configured) return { state: "warning" as const, text: "Disconnected" };
    return { state: "error" as const, text: "Not configured" };
  };

  const adobeInfo = getAdobeStatusInfo();

  if (loading) {
    return (
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mb-12 border-y border-surface-border py-10"
        role="status"
        aria-busy="true"
        aria-label="Loading dashboard statistics"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-1.5 animate-pulse">
            <div className="h-3 w-20 bg-surface-border" />
            <div className="h-8 w-14 bg-surface-border" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mb-12 border-y border-surface-border py-10"
      role="region"
      aria-label="Dashboard statistics"
    >
      <Stat
        label="Albums"
        value={galleries.length}
        subtext={featuredCount > 0 ? `${featuredCount} featured` : undefined}
      />
      <Stat label="Photos" value={totalPhotos.toLocaleString()} />
      <Stat label="Last sync" value={formatLastSync()} />
      <div className="flex flex-col gap-1.5">
        <span className="font-sans text-label uppercase text-text-muted">
          Adobe API
        </span>
        <div className="flex items-baseline gap-3">
          <span
            className={`font-display text-2xl md:text-3xl font-semibold leading-none ${
              adobeInfo.state === "success"
                ? "text-foreground"
                : adobeInfo.state === "warning"
                ? "text-yellow-400/90"
                : adobeInfo.state === "error"
                ? "text-red-400/90"
                : "text-foreground"
            }`}
          >
            {adobeInfo.text}
          </span>
          <a
            href="/api/auth/adobe"
            className="font-sans text-label uppercase text-text-muted hover:text-foreground transition-colors"
            title={adobeStatus?.connected ? "Reconnect" : "Connect"}
          >
            {adobeStatus?.connected ? "Reconnect" : "Connect"}
          </a>
        </div>
      </div>
    </div>
  );
}
