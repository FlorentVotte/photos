"use client";

import { useLocale } from "@/lib/LocaleContext";

export type ViewMode = "grid" | "magazine" | "slideshow";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export default function ViewToggle({
  currentView,
  onViewChange,
  className = "",
}: ViewToggleProps) {
  const { t } = useLocale();

  const views: { mode: ViewMode; icon: string; labelKey: string }[] = [
    { mode: "grid", icon: "grid_view", labelKey: "gridView" },
    { mode: "magazine", icon: "article", labelKey: "magazineView" },
    { mode: "slideshow", icon: "slideshow", labelKey: "slideshowView" },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-surface rounded-lg ${className}`}
      role="tablist"
      aria-label="View mode"
    >
      {views.map(({ mode, icon, labelKey }) => {
        const isActive = currentView === mode;
        return (
          <button
            key={mode}
            role="tab"
            aria-selected={isActive}
            aria-label={t("magazine", labelKey)}
            title={t("magazine", labelKey)}
            onClick={() => onViewChange(mode)}
            className={`
              p-2 rounded-md transition-all duration-200
              ${
                isActive
                  ? "bg-primary text-background shadow-sm"
                  : "text-text-muted hover:text-foreground hover:bg-surface-hover"
              }
            `}
          >
            <span className="material-symbols-outlined text-xl leading-none">
              {icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
