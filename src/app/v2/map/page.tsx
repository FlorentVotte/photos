import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import V2MapContent from "@/components/v2/V2MapContent";
import { getAllPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function V2MapPage() {
  let photos: Awaited<ReturnType<typeof getAllPhotos>> = [];
  try {
    photos = await getAllPhotos();
  } catch {
    // DB may not exist
  }

  return (
    <>
      <V2Header currentPath="/v2/map" />
      <main>
        <V2MapContent photos={photos} />
      </main>
      <V2Footer />
    </>
  );
}
