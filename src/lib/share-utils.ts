/**
 * Share utilities for social media platforms
 */

export type SharePlatform = "twitter" | "facebook" | "linkedin" | "pinterest" | "whatsapp" | "copy";

export interface ShareParams {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Get the share URL for a specific platform
 */
export function getShareUrl(platform: SharePlatform, params: ShareParams): string {
  const encodedUrl = encodeURIComponent(params.url);
  const encodedTitle = encodeURIComponent(params.title);
  const encodedDesc = encodeURIComponent(params.description || "");

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case "pinterest":
      const encodedImage = encodeURIComponent(params.imageUrl || "");
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`;

    case "whatsapp":
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

    default:
      return params.url;
  }
}

/**
 * Platform display configuration
 */
export interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
}

export const platformConfigs: Record<SharePlatform, PlatformConfig> = {
  twitter: {
    name: "X (Twitter)",
    icon: "󰕄", // We'll use SVG instead
    color: "bg-black",
    hoverColor: "hover:bg-gray-800",
  },
  facebook: {
    name: "Facebook",
    icon: "󰈌",
    color: "bg-[#1877F2]",
    hoverColor: "hover:bg-[#166FE5]",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "󰌻",
    color: "bg-[#0A66C2]",
    hoverColor: "hover:bg-[#004182]",
  },
  pinterest: {
    name: "Pinterest",
    icon: "󰐀",
    color: "bg-[#E60023]",
    hoverColor: "hover:bg-[#AD081B]",
  },
  whatsapp: {
    name: "WhatsApp",
    icon: "󰖣",
    color: "bg-[#25D366]",
    hoverColor: "hover:bg-[#128C7E]",
  },
  copy: {
    name: "Copy Link",
    icon: "link",
    color: "bg-surface",
    hoverColor: "hover:bg-surface-hover",
  },
};

/**
 * Check if Web Share API is available
 */
export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

/**
 * Open share popup window
 */
export function openShareWindow(url: string, name: string = "share"): void {
  const width = 600;
  const height = 400;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},location=no,menubar=no,toolbar=no`
  );
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
