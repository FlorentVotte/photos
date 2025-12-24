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
  const [settings, setSettings] = useState<Settings | null>(null);
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

      setMessage({ type: "success", text: "Theme saved! Reloading..." });
      // Reload the page to apply the new theme from server
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to save theme:", error);
      setSelectedTheme(previousTheme);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to save theme" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <SkipLink />
      <Header />

      <main id="main-content" className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "Admin", href: "/admin" },
                { label: "Site Settings" },
              ]}
            />
            <h1 className="text-3xl font-bold text-foreground mt-2">Site Settings</h1>
            <p className="text-text-muted mt-1">
              Customize the look and feel of your photobook
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-text-muted">
              <span className="material-symbols-outlined text-4xl animate-pulse">settings</span>
              <p className="mt-2">Loading settings...</p>
            </div>
          ) : (
            <section className="bg-surface-dark rounded-xl p-6 border border-surface-border">
              <h2 className="text-xl font-semibold text-foreground mb-2">Theme</h2>
              <p className="text-text-muted text-sm mb-6">
                Select a color theme for your site. All visitors will see the selected theme.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                  const isSelected = selectedTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => saveTheme(key as ThemePresetKey)}
                      disabled={saving}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-surface-border hover:border-primary/50"
                      } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {/* Color preview swatches */}
                      <div className="flex gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.primary }}
                          title="Primary color"
                        />
                        <div
                          className="w-8 h-8 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.background }}
                          title="Background"
                        />
                        <div
                          className="w-8 h-8 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.surface }}
                          title="Surface"
                        />
                      </div>

                      <h3 className="font-semibold text-foreground">{preset.name}</h3>
                      <p className="text-xs text-text-muted mt-1">{preset.description}</p>

                      {isSelected && (
                        <span className="absolute top-2 right-2 text-primary">
                          <span className="material-symbols-outlined">check_circle</span>
                        </span>
                      )}
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
