"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PhotoKeyboardNavProps {
  prevPhotoId?: string | null;
  nextPhotoId?: string | null;
}

export default function PhotoKeyboardNav({
  prevPhotoId,
  nextPhotoId,
}: PhotoKeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't navigate if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && prevPhotoId) {
        router.push(`/photo/${prevPhotoId}`);
      } else if (e.key === "ArrowRight" && nextPhotoId) {
        router.push(`/photo/${nextPhotoId}`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, prevPhotoId, nextPhotoId]);

  // This component doesn't render anything
  return null;
}
