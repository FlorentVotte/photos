import { useState, useEffect, useCallback } from "react";

interface UseSlideshowOptions {
  /** Whether the slideshow is active */
  isActive: boolean;
  /** Interval between slides in milliseconds */
  interval: number;
  /** Callback to advance to next slide */
  onNext: () => void;
}

interface UseSlideshowReturn {
  /** Whether slideshow is currently playing */
  isPlaying: boolean;
  /** Toggle play/pause state */
  togglePlay: () => void;
  /** Set playing state directly */
  setIsPlaying: (playing: boolean) => void;
}

/**
 * Manages slideshow auto-advance functionality
 */
export function useSlideshow({
  isActive,
  interval,
  onNext,
}: UseSlideshowOptions): UseSlideshowReturn {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Auto-advance when playing
  useEffect(() => {
    if (!isActive || !isPlaying) return;

    const timer = setInterval(onNext, interval);
    return () => clearInterval(timer);
  }, [isActive, isPlaying, onNext, interval]);

  // Reset playing state when slideshow becomes inactive
  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false);
    }
  }, [isActive]);

  return {
    isPlaying,
    togglePlay,
    setIsPlaying,
  };
}
