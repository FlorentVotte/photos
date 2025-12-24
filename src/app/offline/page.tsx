"use client";

import Header from "@/components/Header";

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-text-muted mb-6 block">
            cloud_off
          </span>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            You're Offline
          </h1>
          <p className="text-text-muted mb-8">
            It looks like you're not connected to the internet. Some content may not be available until you're back online.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
        </div>
      </main>
    </div>
  );
}
