import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";
import { siteConfig } from "@/lib/data";
import { getGearStats } from "@/lib/synced-data";
import type { Metadata } from "next";

// Revalidate every hour to pick up synced data while allowing caching
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `About - ${siteConfig.siteName}`,
  description: `Learn more about ${siteConfig.photographerName} and their photography journey.`,
};

export default async function AboutPage() {
  const gear = await getGearStats();
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <AboutContent
        photographerName={siteConfig.photographerName}
        photographerBio={siteConfig.photographerBio}
        gear={gear}
      />
      <Footer />
    </div>
  );
}
