import type { Metadata, Viewport } from "next";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import { LocaleProvider } from "@/lib/LocaleContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1dc964",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu"),
  title: "Regards Perdus - Photo Portfolio",
  description: "Capturing the fleeting moments between departures and arrivals. A visual journey through the world.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Regards Perdus",
  },
  openGraph: {
    title: "Regards Perdus - Photo Portfolio",
    description: "Capturing the fleeting moments between departures and arrivals.",
    type: "website",
    siteName: "Regards Perdus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regards Perdus - Photo Portfolio",
    description: "Capturing the fleeting moments between departures and arrivals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${notoSerif.variable} ${notoSans.variable} bg-background-dark text-white font-display antialiased overflow-x-hidden`}
      >
        <LocaleProvider>{children}</LocaleProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
