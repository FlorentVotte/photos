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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="gallery-url"
          className="block text-sm text-text-muted mb-2"
        >
          Lightroom Gallery URL
        </label>
        <input
          id="gallery-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://lightroom.adobe.com/shares/... or https://adobe.ly/..."
          disabled={isDisabled}
          aria-describedby="gallery-url-hint"
          className="w-full px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        <p id="gallery-url-hint" className="sr-only">
          Enter a public Lightroom gallery share URL
        </p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="gallery-featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          disabled={isDisabled}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="gallery-featured" className="text-sm text-text-muted">
          Set as featured album (shown on homepage hero)
        </label>
      </div>
      <button
        type="submit"
        disabled={isDisabled || !url.trim()}
        className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Adding..." : "Add Gallery"}
      </button>
    </form>
  );
}
