/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Turbopack is the default builder as of Next 16. It watches the module graph
  // rather than the whole tree, so the dev watch-ignore list the old webpack
  // config carried (photos, test-results, .next) is no longer needed.
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "photos.adobe.io",
      },
    ],
    // Enable modern image formats
    formats: ["image/avif", "image/webp"],
    // Local images are optimized by default
    unoptimized: false,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Admin pages must not be stored by browsers or shared caches.
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
