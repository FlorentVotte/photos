import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import V2AboutContent from "@/components/v2/V2AboutContent";
import { siteConfig } from "@/lib/data";
import { getGearStats, getJourneyStats } from "@/lib/synced-data";

export const dynamic = "force-dynamic";

export default async function V2AboutPage() {
  let gear: Awaited<ReturnType<typeof getGearStats>> = { cameras: [], lenses: [] };
  let journeyStats: Awaited<ReturnType<typeof getJourneyStats>> = {
    totalPhotos: 0,
    totalAlbums: 0,
    countries: [],
    cities: [],
    dateRange: null,
  };
  try {
    [gear, journeyStats] = await Promise.all([getGearStats(), getJourneyStats()]);
  } catch {
    // DB may not exist during build
  }

  return (
    <>
      <V2Header currentPath="/v2/about" />
      <main>
        <V2AboutContent
          photographerName={siteConfig.photographerName}
          gear={gear}
          journeyStats={journeyStats}
          socialLinks={siteConfig.socialLinks}
        />
      </main>
      <V2Footer />
    </>
  );
}
