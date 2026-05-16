"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[240px] p-12 text-center">
          <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
            Error
          </p>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-text-muted">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="group/cta mt-8 inline-flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
          >
            <span>Try again</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-20 text-center bg-background-dark">
      <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
        Error
      </p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md font-sans text-base leading-relaxed text-text-muted">
        We encountered an unexpected error. Please try again or contact support
        if the problem persists.
      </p>
      {error && process.env.NODE_ENV === "development" && (
        <pre className="mt-8 max-w-lg overflow-auto bg-surface-dark border border-surface-border p-4 text-left font-mono text-xs text-text-muted">
          {error.message}
        </pre>
      )}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {resetError && (
          <button
            onClick={resetError}
            className="group/cta inline-flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
          >
            <span>Try again</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="group/cta inline-flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors"
        >
          <span>Refresh page</span>
          <span
            aria-hidden="true"
            className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
          />
        </button>
      </div>
    </div>
  );
}
