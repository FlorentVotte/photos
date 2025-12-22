import { getAlbums, getAllPhotos } from "@/lib/data";
import SearchClient from "./SearchClient";

// Force dynamic rendering to pick up synced data
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  // Fetch data on server
  const albums = await getAlbums();
  const photos = await getAllPhotos();

  return <SearchClient albums={albums} photos={photos} />;
}
