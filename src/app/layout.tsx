import type { Metadata } from "next";
import { Noto_Serif, Noto_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Travelogue - Photo Portfolio",
  description: "Capturing the fleeting moments between departures and arrivals. A visual journey through the world.",
  openGraph: {
    title: "Travelogue - Photo Portfolio",
    description: "Capturing the fleeting moments between departures and arrivals.",
    type: "website",
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
      </head>
      <body
        className={`${notoSerif.variable} ${notoSans.variable} bg-background-dark text-white font-display antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
