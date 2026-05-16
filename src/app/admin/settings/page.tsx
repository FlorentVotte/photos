"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { THEME_PRESETS, ThemePresetKey, DEFAULT_THEME } from "@/lib/themes";
import { Breadcrumb, SkipLink } from "@/components/admin";

interface Settings {
  id: string;
  siteTitle: string;
  siteDescription?: string;
  aboutText?: string;
  theme: string;
}

export default function SettingsPage() {
  const [, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemePresetKey>(DEFAULT_THEME);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setSelectedTheme(data.settings.theme as ThemePresetKey);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async (theme: ThemePresetKey) => {
    setSaving(true);
    setMessage(null);
    const previousTheme = selectedTheme;
    setSelectedTheme(theme);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save theme");
      }

      setMessage({ type: "success", text: "Theme saved. Reloading…" });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to save theme:", error);
      setSelectedTheme(previousTheme);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save theme",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <SkipLink />
      <Header />

      <main id="main-content" className="flex-1 px-6 pt-16 pb-20 md:px-12 md:pt-20">
        <div className="mx-auto max-w-4xl">
          <Breadcrumb
            items={[
              { label: "Admin", href: "/admin" },
              { label: "Site settings" },
            ]}
          />
          <header className="mb-16 max-w-2xl">
            <p className="font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted">
              Settings
            </p>
            <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Site settings
            </h1>
            <p className="mt-6 font-sans text-base leading-relaxed text-text-muted">
              Customize the look and feel of your photobook.
            </p>
          </header>

          {message && (
            <p
              className={`mb-10 font-sans text-sm ${
                message.type === "success"
                  ? "text-green-400/90"
                  : "text-red-400/90"
              }`}
              role="status"
            >
              {message.text}
            </p>
          )}

          {loading ? (
            <p className="py-12 text-center font-sans text-[11px] uppercase tracking-[0.32em] text-text-muted animate-pulse">
              Loading settings
            </p>
          ) : (
            <section className="flex flex-col gap-8">
              <div className="flex flex-col gap-2 border-b border-surface-border pb-4">
                <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                  Theme
                </h2>
                <p className="font-sans text-sm text-text-muted">
                  Select a color theme. All visitors will see the selected
                  theme.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                  const isSelected = selectedTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => saveTheme(key as ThemePresetKey)}
                      disabled={saving}
                      className={`group relative flex flex-col gap-4 border-t pt-5 text-left transition-colors ${
                        isSelected
                          ? "border-foreground"
                          : "border-surface-border hover:border-foreground/40"
                      } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {/* Colour swatches */}
                      <div className="flex">
                        <div
                          className="h-10 flex-1"
                          style={{ backgroundColor: preset.colors.primary }}
                          title="Primary"
                        />
                        <div
                          className="h-10 flex-1"
                          style={{ backgroundColor: preset.colors.surface }}
                          title="Surface"
                        />
                        <div
                          className="h-10 flex-1"
                          style={{ backgroundColor: preset.colors.background }}
                          title="Background"
                        />
                      </div>

                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                          {preset.name}
                        </h3>
                        {isSelected && (
                          <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-foreground">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="font-sans text-xs leading-relaxed text-text-muted">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
