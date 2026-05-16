import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./v2.css";

const ebGaramond = EB_Garamond({
  variable: "--v2-font-display-injected",
  subsets: ["latin"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--v2-font-sans-injected",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Regards Perdus — v2",
  description: "Cinematic redesign preview.",
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v2-root ${ebGaramond.variable} ${hankenGrotesk.variable}`}>
      {children}
    </div>
  );
}
