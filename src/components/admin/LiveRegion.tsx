"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";

interface LiveRegionContextValue {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null);

export function useLiveRegion() {
  const context = useContext(LiveRegionContext);
  if (!context) {
    throw new Error("useLiveRegion must be used within a LiveRegionProvider");
  }
  return context;
}

interface LiveRegionProviderProps {
  children: ReactNode;
}

export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage("");
      // Small delay to ensure screen readers pick up the change
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  // Clear messages after they've been announced
  useEffect(() => {
    if (politeMessage) {
      const timer = setTimeout(() => setPoliteMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [politeMessage]);

  useEffect(() => {
    if (assertiveMessage) {
      const timer = setTimeout(() => setAssertiveMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [assertiveMessage]);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements - used for status updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      {/* Assertive announcements - used for errors and important alerts */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}

// Standalone component for simpler use cases
interface LiveRegionProps {
  message: string;
  priority?: "polite" | "assertive";
}

export function LiveRegion({ message, priority = "polite" }: LiveRegionProps) {
  return (
    <div
      role={priority === "assertive" ? "alert" : "status"}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
