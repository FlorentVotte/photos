"use client";

import { useState, FormEvent } from "react";

interface GalleryFormProps {
  onSubmit: (url: string, featured: boolean) => Promise<void>;
  loading?: boolean;
}

export default function GalleryForm({ onSubmit, loading = false }: GalleryFormProps) {
  const [url, setUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || submitting) return;

    // Validate URL format
    if (!url.includes("lightroom.adobe.com/shares/") && !url.includes("adobe.ly/")) {
      alert("Please enter a valid Lightroom share URL (https://lightroom.adobe.com/shares/... or https://adobe.ly/...)");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(url.trim(), featured);
      setUrl("");
      setFeatured(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          id="gallery-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://lightroom.adobe.com/shares/..."
          disabled={isDisabled}
          aria-label="Lightroom gallery URL"
          className="flex-1 px-4 py-2.5 bg-background-dark border border-surface-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50 text-sm"
        />
        <button
          type="submit"
          disabled={isDisabled || !url.trim()}
          className="px-5 py-2.5 bg-surface-border text-foreground font-medium rounded-lg hover:bg-surface-border/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="gallery-featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          disabled={isDisabled}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="gallery-featured" className="text-xs text-text-muted">
          Set as featured (shown on homepage)
        </label>
      </div>
    </form>
  );
}
