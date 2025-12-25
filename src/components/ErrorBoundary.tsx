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

/**
 * React Error Boundary component for catching and handling errors in child components.
 * Use this to wrap components that might throw errors to prevent the entire app from crashing.
 */
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
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">
            error
          </span>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-text-muted mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component for use in error boundaries.
 */
export function ErrorFallback({
  error,
  resetError,
}: {
  error?: Error;
  resetError?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-background-dark">
      <span className="material-symbols-outlined text-6xl text-red-500 mb-6">
        error_outline
      </span>
      <h1 className="text-2xl font-bold text-foreground mb-3">
        Oops! Something went wrong
      </h1>
      <p className="text-text-muted mb-6 max-w-md">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      {error && process.env.NODE_ENV === "development" && (
        <pre className="text-xs text-red-400 bg-red-500/10 p-4 rounded-lg mb-6 max-w-lg overflow-auto">
          {error.message}
        </pre>
      )}
      <div className="flex gap-4">
        {resetError && (
          <button
            onClick={resetError}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 border border-surface-border text-foreground rounded-lg hover:bg-surface-dark transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
