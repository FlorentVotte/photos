"use client";

import Header from "@/components/Header";

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="font-sans text-eyebrow uppercase text-text-muted">
            Offline
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
            You&rsquo;re offline
          </h1>
          <p className="mt-6 font-sans text-base leading-relaxed text-text-muted">
            It looks like you&rsquo;re not connected to the internet. Some
            content may not be available until you&rsquo;re back online.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="group/cta mt-10 inline-flex items-center gap-3 font-sans text-label uppercase text-text-muted hover:text-foreground transition-colors"
          >
            <span>Try again</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </button>
        </div>
      </main>
    </div>
  );
}
