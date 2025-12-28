import type { Metadata, Viewport } from "next";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import { LocaleProvider } from "@/lib/LocaleContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import prisma from "@/lib/db";
import { DEFAULT_THEME, ThemePresetKey } from "@/lib/themes";
import { generateThemeCSSVars, getThemeMetaColor } from "@/lib/theme-utils";
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

// Fetch theme from database
async function getTheme(): Promise<ThemePresetKey> {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
      select: { theme: true },
    });
    return (settings?.theme as ThemePresetKey) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export async function generateViewport(): Promise<Viewport> {
  const theme = await getTheme();
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: getThemeMetaColor(theme),
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://photos.votte.eu"),
  title: "Regards Perdus - Travel Photography",
  description: "Capturing the fleeting moments between departures and arrivals. A visual journey through the world.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Regards Perdus",
  },
  openGraph: {
    title: "Regards Perdus - Travel Photography",
    description: "Capturing the fleeting moments between departures and arrivals.",
    type: "website",
    siteName: "Regards Perdus",
    images: [{
      url: "/api/og",
      width: 1200,
      height: 630,
      alt: "Regards Perdus - Travel Photography",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Regards Perdus - Travel Photography",
    description: "Capturing the fleeting moments between departures and arrivals.",
    images: ["/api/og"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  const initialCSSVars = generateThemeCSSVars(theme);

  return (
    <html lang="en" className="dark">
      <head>
        {/* Inject theme CSS variables inline for SSR - prevents flash */}
        <style dangerouslySetInnerHTML={{
          __html: `:root { ${initialCSSVars} }`
        }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${notoSerif.variable} ${notoSans.variable} bg-background-dark text-foreground font-display antialiased overflow-x-hidden`}
      >
        <ThemeProvider initialTheme={theme}>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
