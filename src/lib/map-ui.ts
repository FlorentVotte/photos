/** Theme colour fallbacks, mirroring the default preset's tokens. */
export const THEME_COLOR_FALLBACKS = {
  primary: "#6c9bb5",
  surface: "#1a1a2e",
  textPrimary: "#ffffff",
  textMuted: "#94a3b8",
} as const;

/** Pick a CSS variable's value, falling back when it is empty or unset. */
export function resolveColor(raw: string | null | undefined, fallback: string): string {
  const value = raw?.trim();
  return value ? value : fallback;
}

/** Read a CSS custom property from :root (client only; falls back on the server). */
export function readThemeColor(variable: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return resolveColor(
    getComputedStyle(document.documentElement).getPropertyValue(variable),
    fallback,
  );
}

export interface GlobeTouchConfig {
  /** Value for the canvas's CSS touch-action; null keeps the controls' own. */
  touchAction: "pan-y" | null;
  /** Freeze the polar angle so a touch drag only spins the globe sideways. */
  lockPolar: boolean;
  enableZoom: boolean;
}

/**
 * OrbitControls sets touch-action: none, which swallows vertical swipes on a
 * full-width canvas. On coarse pointers, hand vertical panning back to the
 * page, restrict rotation to horizontal and drop pinch zoom.
 */
export function globeTouchConfig({ coarsePointer }: { coarsePointer: boolean }): GlobeTouchConfig {
  return coarsePointer
    ? { touchAction: "pan-y", lockPolar: true, enableZoom: false }
    : { touchAction: null, lockPolar: false, enableZoom: true };
}

/** Wrap a visual marker in a transparent 44px hit area, keeping it centred. */
export function touchTargetHtml(inner: string): string {
  return `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center">${inner}</div>`;
}
