import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";
import { siteConfig } from "@/lib/data";
import { getGearStats, getJourneyStats } from "@/lib/synced-data";
import type { Metadata } from "next";

// Force dynamic to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `About - ${siteConfig.siteName}`,
  description: `Learn more about ${siteConfig.photographerName} and their photography journey.`,
};

export default async function AboutPage() {
  const [gear, journeyStats] = await Promise.all([
    getGearStats(),
    getJourneyStats(),
  ]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <AboutContent
        photographerName={siteConfig.photographerName}
        photographerBio={siteConfig.photographerBio}
        gear={gear}
        journeyStats={journeyStats}
        socialLinks={siteConfig.socialLinks}
      />
      <Footer />
    </div>
  );
}
