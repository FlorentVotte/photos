"use client";

import { useState, FormEvent } from "react";

interface GalleryFormProps {
  onSubmit: (url: string, featured: boolean) => Promise<void>;
  loading?: boolean;
}

export default function GalleryForm({
  onSubmit,
  loading = false,
}: GalleryFormProps) {
  const [url, setUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || submitting) return;

    if (
      !url.includes("lightroom.adobe.com/shares/") &&
      !url.includes("adobe.ly/")
    ) {
      alert(
        "Please enter a valid Lightroom share URL (https://lightroom.adobe.com/shares/... or https://adobe.ly/...)"
      );
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-6">
        <input
          id="gallery-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://lightroom.adobe.com/shares/…"
          disabled={isDisabled}
          aria-label="Lightroom gallery URL"
          className="flex-1 border-b border-surface-border bg-transparent pb-2.5 font-sans text-sm text-foreground placeholder-text-muted/50 focus:border-foreground focus:outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isDisabled || !url.trim()}
          className="group/cta inline-flex items-center gap-3 font-sans text-label uppercase text-text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{submitting ? "Adding…" : "Add gallery"}</span>
          <span
            aria-hidden="true"
            className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
          />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="gallery-featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          disabled={isDisabled}
          className="h-3.5 w-3.5 accent-primary"
        />
        <label
          htmlFor="gallery-featured"
          className="font-sans text-xs text-text-muted"
        >
          Set as featured (shown on homepage)
        </label>
      </div>
    </form>
  );
}
