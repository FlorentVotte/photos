"use client";

import type { Gallery } from "./GalleryListItem";
import type { AdobeStatus } from "./AdobeConnectionCard";

interface DashboardStatsProps {
  galleries: Gallery[];
  adobeStatus: AdobeStatus | null;
  lastSync: string | null;
  loading?: boolean;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  status?: "success" | "warning" | "error" | "neutral";
}

function StatCard({ icon, label, value, subtext, status = "neutral" }: StatCardProps) {
  const statusColors = {
    success: "text-green-400",
    warning: "text-yellow-400",
    error: "text-red-400",
    neutral: "text-primary",
  };

  return (
    <div className="bg-surface-dark rounded-xl p-4 border border-surface-border">
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined text-2xl ${statusColors[status]}`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {subtext && (
            <p className="text-xs text-text-muted truncate">{subtext}</p>
          )}
        </div>
      </div>
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
    if (!adobeStatus) return { status: "neutral" as const, text: "Loading..." };
    if (adobeStatus.connected) return { status: "success" as const, text: "Connected" };
    if (adobeStatus.configured) return { status: "warning" as const, text: "Disconnected" };
    return { status: "error" as const, text: "Not configured" };
  };

  const adobeInfo = getAdobeStatusInfo();

  if (loading) {
    return (
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        role="status"
        aria-busy="true"
        aria-label="Loading dashboard statistics"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-dark rounded-xl p-4 border border-surface-border animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-border rounded" />
              <div className="flex-1">
                <div className="h-3 w-16 bg-surface-border rounded mb-2" />
                <div className="h-6 w-12 bg-surface-border rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      role="region"
      aria-label="Dashboard statistics"
    >
      <StatCard
        icon="photo_library"
        label="Albums"
        value={galleries.length}
        subtext={featuredCount > 0 ? `${featuredCount} featured` : undefined}
        status="neutral"
      />
      <StatCard
        icon="image"
        label="Photos"
        value={totalPhotos.toLocaleString()}
        status="neutral"
      />
      <StatCard
        icon="sync"
        label="Last Sync"
        value={formatLastSync()}
        status="neutral"
      />
      {/* Adobe API card with reconnect button */}
      <div className="bg-surface-dark rounded-xl p-4 border border-surface-border">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-2xl ${
            adobeInfo.status === "success" ? "text-green-400" :
            adobeInfo.status === "warning" ? "text-yellow-400" :
            adobeInfo.status === "error" ? "text-red-400" : "text-primary"
          }`}>
            cloud
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted uppercase tracking-wider">Adobe API</p>
            <p className="text-xl font-bold text-foreground">{adobeInfo.text}</p>
          </div>
          <a
            href="/api/auth/adobe"
            className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-border"
            title={adobeStatus?.connected ? "Reconnect" : "Connect"}
          >
            <span className="material-symbols-outlined text-xl">
              {adobeStatus?.connected ? "refresh" : "link"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
