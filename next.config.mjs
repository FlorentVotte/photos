/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
    // Local images are optimized by default
    unoptimized: false,
  },
};

export default nextConfig;
