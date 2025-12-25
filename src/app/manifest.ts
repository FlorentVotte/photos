import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Regards Perdus - Photo Portfolio",
    short_name: "Regards Perdus",
    description: "Capturing the fleeting moments between departures and arrivals. A visual journey through the world.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d0d",
    theme_color: "#1dc964",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["photography", "travel", "art"],
    screenshots: [
      {
        src: "/screenshots/home.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Homepage",
      },
    ],
  };
}
